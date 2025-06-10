const TimeLockWalletFactory = artifacts.require("TimeLockWalletFactory");
const TimeLockWallet = artifacts.require("TimeLockWallet"); // Để lấy địa chỉ master đã deploy

module.exports = async function (deployer, network, accounts) {
  // Lấy địa chỉ của TimeLockWallet master/implementation đã được deploy ở bước trước
  const timeLockWalletMasterInstance = await TimeLockWallet.deployed();

  // Deploy TimeLockWalletFactory, truyền vào địa chỉ của master contract
  await deployer.deploy(TimeLockWalletFactory, timeLockWalletMasterInstance.address, { from: accounts[0] });
  const timeLockWalletFactoryInstance = await TimeLockWalletFactory.deployed();
  console.log("TimeLockWalletFactory deployed at:", timeLockWalletFactoryInstance.address);
  console.log("TimeLockWalletFactory is using master contract at:", await timeLockWalletFactoryInstance.masterContract());
};