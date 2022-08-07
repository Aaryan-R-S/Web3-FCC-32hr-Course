// SPDX-License-Identifier: MIT

/* Pragma */
pragma solidity ^0.8.7;

/* Imports */
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

/* Errors */
error WinETH__UpkeepNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 winETHState);
error WinETH__SendMoreToEnterWinETH();
error WinETH__TransferFailed();
error WinETH__WinETHNotOpen();

/* Interfaces */

/* Libraries */

/* Contracts */
/** @title WinETH - Win Ethereum
 *  @author Aaryan Raj Saxena
 *  @notice This contract is a sample automated lottery system which chooses a winner randomly from the participating players, charging entrance fee of 0.1 ETH, and transfers all the amount collected to the winner.
 *  @dev This implements the Chainlink VRF Version 2 and Keeper Compatible Interface
 */
contract WinETH is VRFConsumerBaseV2, KeeperCompatibleInterface {
    /* Type Declarations */
    enum WinETHState {
        OPEN,
        CALCULATING
    }

    /* State variables */
    // Chainlink VRF Variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;
    // Lottery Variables
    address payable[] private s_players;
    uint256 private immutable i_entranceFee;
    address private s_recentWinner;
    uint256 private immutable i_interval;
    uint256 private s_lastTimeStamp;
    WinETHState private s_winETHState;

    /* Events */
    event WinETHEnter(address indexed player);
    event RequestedWinETHWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed player);

    /* Modifiers */

    /* Functions: Constructor -> Receive -> Fallback -> External -> Public ->  Internal -> Private -> View -> Pure */
    constructor(
        address vrfCoordinatorV2,
        bytes32 gasLane, // keyHash
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint256 entranceFee,
        uint256 interval
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        i_entranceFee = entranceFee;
        i_interval = interval;
        s_lastTimeStamp = block.timestamp;
        s_winETHState = WinETHState.OPEN;
    }

    function enterWinETH() public payable {
        // require(msg.value >= i_entranceFee, "Not enough ETH sent");
        if (msg.value < i_entranceFee) {
            revert WinETH__SendMoreToEnterWinETH();
        }
        // require(s_winETHState == WinETHState.OPEN, "WinETH is not open");
        if (s_winETHState != WinETHState.OPEN) {
            revert WinETH__WinETHNotOpen();
        }
        s_players.push(payable(msg.sender));
        // Emit an event when we update a dynamic array or mapping
        // Named events with the function name reversed
        emit WinETHEnter(msg.sender);
    }

    /**
     * @dev This is the function that the Chainlink Keeper nodes call
     * they look for `upkeepNeeded` to return True.
     * the following should be true for this to return true:
     * 1. The time interval has passed between WinETH runs.
     * 2. The lottery is open.
     * 3. The contract has ETH.
     * 4. Implicity, your subscription is funded with LINK.
     * 5. There is atleast one player
     */
    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        bool isOpen = (WinETHState.OPEN == s_winETHState);
        bool timePassed = ((block.timestamp - s_lastTimeStamp) > i_interval);
        bool hasPlayers = s_players.length > 0;
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers);
        return (upkeepNeeded, "0x0"); // can we comment this out?
    }

    /**
     * @dev Once `checkUpkeep` is returning `true`, this function is called
     * and it kicks off a Chainlink VRF call to get a random winner.
     */
    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        //We highly recommend revalidating the upkeep in the performUpkeep function
        (bool upkeepNeeded, ) = checkUpkeep("");
        // require(upkeepNeeded, "Upkeep not needed");
        if (!upkeepNeeded) {
            revert WinETH__UpkeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_winETHState)
            );
        }
        s_winETHState = WinETHState.CALCULATING;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        // Quiz... is this redundant?
        emit RequestedWinETHWinner(requestId);
    }


    /**
     * @dev This is the function that Chainlink VRF node
     * calls to send the money to the random winner.
     */
    function fulfillRandomWords(
        uint256, /* requestId */
        uint256[] memory randomWords
    ) internal override {
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable recentWinner = s_players[indexOfWinner];
        s_recentWinner = recentWinner;
        s_players = new address payable[](0);
        s_winETHState = WinETHState.OPEN;
        s_lastTimeStamp = block.timestamp;
        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        // require(success, "Transfer failed");
        if (!success) {
            revert WinETH__TransferFailed();
        }
        emit WinnerPicked(recentWinner);
    }

    // Getters [Note that getter for constant variables is `pure` not `view` (read the number only not variable)]
    function getNumWords() public pure returns (uint256) {
        return NUM_WORDS;
    }

    function getRequestConfirmations() public pure returns (uint256) {
        return REQUEST_CONFIRMATIONS;
    }

    function getWinETHState() public view returns (WinETHState) {
        return s_winETHState;
    }

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getNumberOfPlayers() public view returns (uint256) {
        return s_players.length;
    }

    function getLastTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }
}
