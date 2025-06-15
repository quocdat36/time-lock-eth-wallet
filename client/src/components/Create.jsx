// client/src/components/Create.jsx
import React, { Component } from 'react';

import renderNotification from '../utils/notification-handler';

class Create extends Component {
  constructor(props) { // Nhận props
    super(props);
    this.state = {
      receiver: '',
      unlockDate: '',
      ether: '0',
      token: '0',
    };
    console.log("[Create.jsx] Props received in constructor:", this.props);
  }

  onCreateWallet = async (e) => {
    e.preventDefault();
    // Lấy từ props do App.js truyền xuống
    const { web3, accounts, tokenInstance, walletFactoryInstance, createWalletInstance } = this.props;

    console.log("[Create.jsx] onCreateWallet initiated.");
    console.log("[Create.jsx] Props in onCreateWallet - web3:", web3 ? 'Exists':'No', "accounts:", accounts, "tokenInstance:", tokenInstance?._address, "walletFactoryInstance:", walletFactoryInstance?._address);

    if (!web3 || !accounts || accounts.length === 0) {
      renderNotification('danger', 'Error', 'Web3 or account not available. Please connect MetaMask via App.');
      console.error("[Create.jsx] Web3 or account not available.");
      return;
    }
    // Kiểm tra các instance từ props
    if (!walletFactoryInstance || typeof walletFactoryInstance.methods.createNewWallet !== 'function') {
        renderNotification('danger', 'Error', 'WalletFactory (from props) not ready or method missing.');
        console.error("[Create.jsx] WalletFactory instance (from props) not ready", walletFactoryInstance);
        return;
    }
    if (!tokenInstance || !tokenInstance._address) {
        renderNotification('danger', 'Error', 'Token instance (from props) not ready.');
        console.error("[Create.jsx] Token instance (from props) not ready", tokenInstance);
        return;
    }
    if (typeof createWalletInstance !== 'function') {
        renderNotification('danger', 'Error', 'createWalletInstance function (from props) not available.');
        console.error("[Create.jsx] createWalletInstance (from props) is not a function", createWalletInstance);
        return;
    }

    try {
      const sender = accounts[0]; // Dùng tài khoản đầu tiên từ props
      const { receiver, unlockDate, token, ether } = this.state;

      if (!receiver || !unlockDate) {
        renderNotification('danger', 'Error', 'Beneficiary address and unlock date are required.');
        return;
      }
      if (!web3.utils.isAddress(receiver)) {
        renderNotification('danger', 'Error', 'Invalid Beneficiary address.');
        return;
      }

      const releaseTimestamp = new Date(unlockDate).getTime() / 1000;
      if (isNaN(releaseTimestamp) || releaseTimestamp <= Date.now() / 1000) {
        renderNotification('danger', 'Error', 'Invalid or past unlock date.');
        return;
      }

      console.log(`[Create.jsx] Calling walletFactoryInstance.createNewWallet with token: ${tokenInstance._address}, receiver: ${receiver}, releaseTimestamp: ${releaseTimestamp}`);

      // Giao dịch 1: Tạo ví
      const result = await walletFactoryInstance.methods.createNewWallet( // << SỬ DỤNG walletFactoryInstance TỪ PROPS
        tokenInstance._address, // << SỬ DỤNG tokenInstance TỪ PROPS
        receiver,
        releaseTimestamp
      ).send({
        from: sender,
        gas: 6700000, // Cân nhắc giảm gas
      });

      const walletAddress = result.events.Created.returnValues['wallet'];
      renderNotification('success', 'Success', `Wallet Created Successfully! Address: ${walletAddress}`);
      console.log("[Create.jsx] New wallet created at address:", walletAddress);

      // Giao dịch 2: Gửi Ether
      if (ether && parseFloat(ether) > 0) {
        console.log(`[Create.jsx] Attempting to deposit ${ether} ETH into new wallet ${walletAddress}`);
        const walletInstance = createWalletInstance(web3, walletAddress); // << SỬ DỤNG createWalletInstance và web3 TỪ PROPS
        console.log("[Create.jsx] walletInstance for depositing Ether:", walletInstance);
        if (walletInstance && typeof walletInstance.methods.depositEther === 'function' && !walletInstance.error) {
          await walletInstance.methods.depositEther().send({
            from: sender,
            gas: 670000,
            value: web3.utils.toWei(ether.toString(), 'ether')
          });
          renderNotification('success', 'Success', `${ether} ETH locked successfully in ${walletAddress}!`);
        } else {
          console.error("[Create.jsx] Failed to get walletInstance for Ether deposit or it had an error:", walletInstance);
          renderNotification('danger', 'Error', 'Could not deposit Ether into the new wallet.');
        }
      }

      // Giao dịch 3: Gửi Token
      if (token && parseFloat(token) > 0) {
      // Lấy tokenInstance từ props
      const currentTokenInstance = this.props.tokenInstance; // Sử dụng props
      const currentWeb3 = this.props.web3;             // Sử dụng props

      if (currentTokenInstance && typeof currentTokenInstance.methods.balanceOf === 'function' && typeof currentTokenInstance.methods.transfer === 'function' && !currentTokenInstance.error) {
        try {
          const senderAshBalanceWei = await currentTokenInstance.methods.balanceOf(sender).call();
          const senderAshBalanceEth = currentWeb3.utils.fromWei(senderAshBalanceWei, 'ether');
          console.log(`[Create.jsx] Sender (${sender}) ASH balance: ${senderAshBalanceEth} ASH`);
          console.log(`[Create.jsx] Attempting to transfer ${token} ASH to new wallet ${walletAddress}`);

          const amountToSendWei = currentWeb3.utils.toWei(token.toString(), 'ether');

          if (parseFloat(senderAshBalanceEth) < parseFloat(token)) {
            renderNotification('danger', 'Error', `Insufficient ASH token balance. You have ${senderAshBalanceEth} ASH.`);
            console.error(`[Create.jsx] Sender has insufficient ASH balance. Has: ${senderAshBalanceEth}, Needs: ${token}`);
            return; // Dừng nếu không đủ token
          }

          await currentTokenInstance.methods.transfer(walletAddress, amountToSendWei).send({ 
            from: sender,
            // gas: 670000 // Thử bỏ gas limit để MetaMask tự ước tính
          });
          renderNotification('success', 'Success', `${token} ASH Token transferred to ${walletAddress}!`);
        } catch (tokenTransferError) {
            console.error('[Create.jsx] Error during token transfer:', tokenTransferError);
            renderNotification('danger', 'Error', `Token transfer failed: ${tokenTransferError.message.split('\n')[0] || tokenTransferError.message}`);
        }
      } else {
        console.error("[Create.jsx] tokenInstance (from props) is not valid for token transfer or method missing:", currentTokenInstance);
        renderNotification('danger', 'Error', 'Could not transfer ASH Token to the new wallet due to invalid token instance.');
      }
    }

    } catch (err) {
      console.error('[Create.jsx] Error in onCreateWallet:', err.message, err);
      renderNotification('danger', 'Error', `Wallet creation failed: ${err.message.split('\n')[0] || err.message}`); // Hiển thị dòng lỗi đầu tiên
    }
  }

  inputChangedHandler = (e) => {
    const state = { ...this.state };
    state[e.target.name] = e.target.value;
    this.setState(state);
  }

  render() {
    if (!this.props.web3 || !this.props.accounts || this.props.accounts.length === 0 || !this.props.tokenInstance || !this.props.walletFactoryInstance) {
      return (
        <div className="container center" style={{paddingTop: "50px"}}>
          <h4>Connecting to Wallet and Smart Contracts...</h4>
          <p>Please ensure MetaMask is connected and on the correct network. Refresh the page if this message persists.</p>
        </div>
      );
    }
    return (
      <div className="container center" >
        <div className="row">
          <div className="container ">
            <div className="container ">
              <h5 style={{ padding: "30px 0px 0px 10px" }}>Create Wallet</h5>
              <form className="" onSubmit={this.onCreateWallet}>
                <label className="left">Beneficiary Address</label>
                <input
                  id="receiver"
                  placeholder="Beneficiary Address (e.g., 0x...)"
                  type="text"
                  className="validate"
                  name="receiver"
                  value={this.state.receiver}
                  onChange={this.inputChangedHandler}
                /><br /><br />
                <label className="left">Ether Amount</label>
                <input
                  id="ether"
                  placeholder="Ether Amount (e.g., 0.1)"
                  type="number"
                  step="any"
                  className="input-control"
                  name="ether"
                  value={this.state.ether}
                  onChange={this.inputChangedHandler}
                /><br /><br />
                <label className="left">ASH Token</label>
                <input
                  id="token"
                  placeholder="ASH Token Amount (e.g., 100)"
                  type="number"
                  step="any"
                  className="input-control"
                  name="token"
                  value={this.state.token}
                  onChange={this.inputChangedHandler}
                /><br /><br />
                <label className="left">Release Time</label>
                <input
                  id="unlock"
                  placeholder="Unlock Time"
                  className="input-control"
                  name="unlockDate"
                  type="datetime-local"
                  value={this.state.unlockDate}
                  onChange={this.inputChangedHandler}
                ></input><br /><br />
                <button type="submit" className="custom-btn login-btn">Create Wallet</button>
              </form>
            </div>
          </div>
        </div>
      </div >
    );
  }
}
export default Create;