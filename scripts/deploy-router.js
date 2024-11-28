const hre = require("hardhat");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
  console.log("开始部署 UniswapV2Router02...");

  // Sepolia 测试网上的地址
  const FACTORY_ADDRESS = "0x4603870b4e0825956842a823cDdDa35426b9Ca01";
  const WETH_ADDRESS = "0x86268F605DA130ea51E51cbD90215cE4f6e2A4C4";

  // 获取合约工厂
  const UniswapV2Router02 = await hre.ethers.getContractFactory("UniswapV2Router02");
  
  // 部署合约
  const router = await UniswapV2Router02.deploy(
    FACTORY_ADDRESS,
    WETH_ADDRESS
  );

  // 等待合约部署完成
  console.log("等待合约部署...");
  await router.waitForDeployment();

  // 获取合约地址
  const routerAddress = await router.getAddress();
  console.log(`UniswapV2Router02 已部署到地址: ${routerAddress}`);
  console.log("Factory 地址:", FACTORY_ADDRESS);
  console.log("WETH 地址:", WETH_ADDRESS);

  // 等待几个区块确认
  console.log("等待区块确认...");
  const deployTx = router.deploymentTransaction();
  await deployTx.wait(5);

  // 保存部署信息到文件
  const deploymentInfo = {
    network: hre.network.name,
    router: routerAddress,
    factory: FACTORY_ADDRESS,
    weth: WETH_ADDRESS,
    timestamp: new Date().toISOString(),
    deploymentTxHash: deployTx.hash
  };

  // 创建 deployments 目录（如果不存在）
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)){
    fs.mkdirSync(deploymentsDir);
  }

  // 将部署信息写入文件
  const filePath = path.join(deploymentsDir, `${hre.network.name}-deployments.json`);
  fs.writeFileSync(
    filePath,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`部署信息已保存到: ${filePath}`);

  // 验证合约
  console.log("开始验证合约...");
  try {
    await hre.run("verify:verify", {
      address: routerAddress,
      constructorArguments: [
        FACTORY_ADDRESS,
        WETH_ADDRESS
      ],
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