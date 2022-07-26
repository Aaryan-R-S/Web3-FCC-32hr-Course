import json
import os
from dotenv import load_dotenv
from solcx import compile_standard, install_solc
install_solc('0.6.0')
from web3 import Web3

load_dotenv()

with open("./SimpleStorage.sol", "r") as file:
    simple_storage_file = file.read()
    # print(simple_storage_file)


# Compile the Solidity code
compiled_sol = compile_standard(
    {
        "language": "Solidity",
        "sources": {"SimpleStorage.sol": {"content": simple_storage_file}},
        "settings":{
            "outputSelection":{
                "*":{
                    "*":["abi", "metadata", "evm.bytecode", "evm.sourceMap"]
                }
            }
        }
    },
    solc_version = "0.6.0",
)

# print(compiled_sol)
# with open("compiled_code.json", "w") as file:
#     json.dump(compiled_sol, file)


# Get bytecode
bytecode = compiled_sol["contracts"]["SimpleStorage.sol"]["SimpleStorage"]["evm"]["bytecode"]["object"]
# print(bytecode)

# Get ABI
abi = compiled_sol["contracts"]["SimpleStorage.sol"]["SimpleStorage"]["abi"]
# print(abi)

# Connect to Ganache
# w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))
# Connect to Rinkeby
w3 = Web3(Web3.HTTPProvider("https://rinkeby.infura.io/v3/4722dcbb3d284e368e5001189c22d63d"))
# chain_id = 1337
chain_id = 4
my_address = "0xEcC946f4F2138269482f312BEA7cC435604343C2"
private_key = os.getenv("PRIVATE_KEY")
# print(private_key)

# Create contract in python
SimpleStorage = w3.eth.contract(abi=abi, bytecode=bytecode)
# print(SimpleStorage)

# Get the latest transaction
nonce = w3.eth.getTransactionCount(my_address)
# print(nonce)    # this nonce has nothing to do with nonce in block but it is number of transactions carried out 

# 1. Build a transaction ---------------------------------
print("Deploying Contract...")
transaction = SimpleStorage.constructor().buildTransaction(
    {"gasPrice": w3.eth.gas_price, "chainId":w3.eth.chain_id, "from":my_address, "nonce": nonce}
)
# print(transaction)

# 2. Sign a transaction ----------------------------------
signed_txn = w3.eth.account.sign_transaction(transaction, private_key=private_key)
# print(signed_txn)

# 3. Send a transaction ----------------------------------
txn_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
# print(txn_hash)
txn_receipt = w3.eth.wait_for_transaction_receipt(txn_hash)
print("Contract Deployed!")

# Working with contract that we always need
# Contract Address
# Contract ABI
simple_storage = w3.eth.contract(address=txn_receipt.contractAddress, abi=abi)

# Call - Simulate making a call without making state change
# Transact - Make a state change

# print(simple_storage.functions.show().call())
# print(simple_storage.functions.store(15).call())
# print(simple_storage.functions.show().call())  # no change in value of favorite_int

print(simple_storage.functions.show().call())
print("Updating Contract...")
store_transactions = simple_storage.functions.store(15).buildTransaction(
    {"gasPrice": w3.eth.gas_price, "chainId":w3.eth.chain_id, "from":my_address, "nonce": nonce+1}
)
signed_store_txn = w3.eth.account.signTransaction(store_transactions, private_key=private_key)
store_txn_hash = w3.eth.send_raw_transaction(signed_store_txn.rawTransaction)
# print(txn_hash)
store_txn_receipt = w3.eth.wait_for_transaction_receipt(store_txn_hash)
print("Contract Updated!")
print(simple_storage.functions.show().call())  # this will change the value of favorite_int

