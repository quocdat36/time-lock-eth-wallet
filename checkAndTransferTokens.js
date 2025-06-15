// checkAndTransferTokens.js
const AshToken = artifacts.require("AshToken"); // Lấy artifact

module.exports = async function(callback) { // Hàm mà truffle exec sẽ gọi
  try {
    console.log("--- Script Execution Started ---");

    console.log("Fetching deployed AshToken contract...");
    const token = await AshToken.deployed();
    if (!token || !token.address) {
        console.error("Failed to get deployed AshToken instance.");
        callback(new Error("AshToken not deployed or not found"));
        return;
    }
    console.log("AshToken instance found at:", token.address);

    console.log("Fetching accounts...");
    const accounts = await web3.eth.getAccounts();
    if (!accounts || accounts.length === 0) {
      console.error("No accounts found. Ensure Ganache is running and accessible, and a network is configured.");
      callback(new Error("No accounts found"));
      return;
    }
    const deployerAccount = accounts[0]; // Tài khoản mặc định deploy contract
    const metamaskUserAccount = "0xff92383a55abd3493da20bee6f7b3456da4ef4fd"; // ĐỊA CHỈ METAMASK CỦA BẠN

    console.log(`Deployer Account: ${deployerAccount}`);
    console.log(`MetaMask User Account: ${metamaskUserAccount}`);

    console.log("Checking deployer's ASH balance...");
    const deployerBalanceWei = await token.balanceOf(deployerAccount);
    const deployerBalanceEth = web3.utils.fromWei(deployerBalanceWei.toString(), 'ether');
    console.log(`Deployer (${deployerAccount}) ASH balance: ${deployerBalanceEth} ASH`);

    console.log("Checking MetaMask user's ASH balance...");
    const metamaskBalanceWei = await token.balanceOf(metamaskUserAccount);
    const metamaskBalanceEth = web3.utils.fromWei(metamaskBalanceWei.toString(), 'ether');
    console.log(`MetaMask User (${metamaskUserAccount}) ASH balance: ${metamaskBalanceEth} ASH`);

    const amountToTransfer = "1000"; // Số lượng token muốn chuyển
    const currentMetamaskBalance = parseFloat(metamaskBalanceEth);
    const requiredTransferAmount = parseFloat(amountToTransfer);

    if (parseFloat(deployerBalanceEth) >= requiredTransferAmount && currentMetamaskBalance < requiredTransferAmount) {
      const amountToSendWei = web3.utils.toWei(amountToTransfer, "ether");
      console.log(`Attempting to send ${amountToTransfer} ASH from ${deployerAccount} to ${metamaskUserAccount}...`);

      const receipt = await token.transfer(metamaskUserAccount, amountToSendWei, { from: deployerAccount, gas: 100000 }); // Thêm gas limit nhỏ để chắc chắn
      console.log("Token transfer successful! Transaction hash:", receipt.tx);

      // Kiểm tra lại số dư sau khi chuyển
      const newMetamaskBalanceWei = await token.balanceOf(metamaskUserAccount);
      console.log(`NEW MetaMask User (${metamaskUserAccount}) ASH balance: ${web3.utils.fromWei(newMetamaskBalanceWei.toString(), 'ether')} ASH`);

      const newDeployerBalanceWei = await token.balanceOf(deployerAccount);
      console.log(`NEW Deployer (${deployerAccount}) ASH balance: ${web3.utils.fromWei(newDeployerBalanceWei.toString(), 'ether')} ASH`);

    } else if (currentMetamaskBalance >= requiredTransferAmount) {
        console.log(`MetaMask user (${metamaskUserAccount}) already has ${currentMetamaskBalance} ASH (>= ${requiredTransferAmount} ASH). No transfer needed.`);
    } else if (parseFloat(deployerBalanceEth) < requiredTransferAmount) {
        console.log(`Deployer (${deployerAccount}) has insufficient ASH balance (${deployerBalanceEth} ASH) to send ${requiredTransferAmount} ASH.`);
    } else {
        console.log("No token transfer condition met.");
    }

    console.log("--- Script Execution Finished Successfully ---");
    callback(); // Báo cho Truffle biết script đã hoàn thành không lỗi
  } catch (error) {
    console.error("--- Script Execution Failed ---");
    console.error("Error details:", error);
    callback(error); // Báo lỗi cho Truffle
  }
};