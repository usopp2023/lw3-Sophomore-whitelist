//import hardhat 模块的中的 ethers
const { ethers } = require("hardhat");

//实例化合约
async function main(){
  const whitelistContract = await ethers.getContractFactory("Whitelist");
  //部署合约，10是最大白名单数量，构造函数中的参数
  const deployedWhitelistContract = await whitelistContract.deploy(10);

  //等待它部署完成，返回一个 promise
  await deployedWhitelistContract.deployed();

  //打印部署好的合约地址
  console.log("Whitelist Contract Address:",deployedWhitelistContract.address);



}

main()
  .then(()=>process.exit(0))
  .catch((error)=>{
    console.error(error);
    process.exit(1);
  });