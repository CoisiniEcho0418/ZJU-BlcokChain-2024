import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners(); // 获取第一个账户
  const BuyMyRoom = await ethers.getContractFactory("BuyMyRoom");
  const buyMyRoom = await BuyMyRoom.deploy();
  await buyMyRoom.deployed();

  console.log(`BuyMyRoom deployed to ${buyMyRoom.address}`);
  console.log(`Contract manager is: ${deployer.address}`); // 输出manager地址
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});