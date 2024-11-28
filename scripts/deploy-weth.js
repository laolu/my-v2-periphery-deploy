const hre = require("hardhat");
require('dotenv').config();

async function main() {
  console.log("开始部署 WETH9...");

  // 获取合约工厂
  const WETH9 = await hre.ethers.getContractFactory("WETH9");
  
  // 部署合约
  const weth = await WETH9.deploy();

  // 等待合约部署完成
  console.log("等待合约部署...");
  await weth.waitForDeployment();

  // 获取合约地址
  const wethAddress = await weth.getAddress();
  console.log(`WETH9 已部署到地址: ${wethAddress}`);

  // 等待几个区块确认
  console.log("等待区块确认...");
  const deployTx = weth.deploymentTransaction();
  await deployTx.wait(5);

  // 验证合约
  console.log("开始验证合约...");
  try {
    await hre.run("verify:verify", {
      address: wethAddress,
      constructorArguments: []
    });
    console.log("合约验证成功!");
  } catch (error) {
    console.log("合约验证失败:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 