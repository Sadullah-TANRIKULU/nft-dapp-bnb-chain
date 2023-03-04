// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const fs = require('fs');

async function main() {

  const Pattikka = await hre.ethers.getContractFactory("Pattikka");
  const pattikka = await Pattikka.deploy();

  await pattikka.deployed();

  console.log(`Pattikka address, ${pattikka.address}`);
  let config = `module.exports = {
    pattikkaaddress: "${pattikka.address}"
  }`
  let data = JSON.stringify(config);
  fs.writeFileSync('config.js', JSON.parse(data));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});
