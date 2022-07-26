async function main() {
  console.log("Hi");
  // http://127.0.0.1:8545
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
