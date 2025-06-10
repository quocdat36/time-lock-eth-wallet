const AshToken = artifacts.require("AshToken");
const TimeLockWallet = artifacts.require("TimeLockWallet"); // Master/Implementation contract

module.exports = async function (deployer, network, accounts) {
  // Deploy AshToken
  await deployer.deploy(AshToken, { from: accounts[0] });
  const ashTokenInstance = await AshToken.deployed();
  console.log("AshToken deployed at:", ashTokenInstance.address);

  // Deploy the master TimeLockWallet (implementation)
  // Nó không cần tham số constructor vì sẽ được khởi tạo qua init() bởi factory
  await deployer.deploy(TimeLockWallet, { from: accounts[0] });
  const timeLockWalletMasterInstance = await TimeLockWallet.deployed();
  console.log("Master TimeLockWallet (implementation) deployed at:", timeLockWalletMasterInstance.address);
};