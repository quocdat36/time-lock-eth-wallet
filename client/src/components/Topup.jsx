// client/src/components/Topup.jsx
import React, { Component } from 'react';
// import Web3 from 'web3'; // << XÓA: Sẽ dùng this.props.web3

// << XÓA CÁC IMPORT PROXY TRỰC TIẾP NÀY >>
// import WalletFactory from '../proxies/WalletFactory';
// import Wallet from '../proxies/Wallet';
// import tokenInstanceProxy from '../proxies/Token';

import renderNotification from '../utils/notification-handler';

// console.log("[Topup.jsx] Các import proxy đã bị xóa hoặc không nên được sử dụng trực tiếp ở đây nữa.");

class Topup extends Component {
  constructor(props) { // Nhận props
    super(props);
    this.state = {
      receiver: '', // Địa chỉ beneficiary để lọc ví
      wallets: [], // Danh sách <option> cho select
      selectedWalletAddress: null, // Địa chỉ ví được chọn để topup
      etherToTopup: '0',
      tokenToTopup: '0',
    };
    console.log("[Topup.jsx] Props received in constructor:", this.props);
    // << KHÔNG KHỞI TẠO WEB3 Ở ĐÂY NỮA >>
  }

  // Nếu receiver trong state thay đổi (do người dùng nhập), gọi updateWalletsList
  // Hoặc nếu các props web3/factory sẵn sàng sau lần render đầu
  async componentDidUpdate(prevProps, prevState) {
    const { web3, accounts, walletFactoryInstance } = this.props;
    const { receiver } = this.state;

    if (prevState.receiver !== receiver && receiver && web3 && accounts && accounts.length > 0 && walletFactoryInstance) {
      console.log("[Topup.jsx] Receiver changed or props became ready, calling updateWalletsList for:", receiver);
      if (web3.utils.isAddress(receiver.trim())) {
        await this.updateWalletsList(receiver.trim());
      } else if (receiver.trim() === "") {
        this.setState({ wallets: [], selectedWalletAddress: null });
      }
    } else if (
        (!prevProps.web3 && web3) ||
        (!prevProps.accounts && accounts && accounts.length > 0) ||
        (!prevProps.walletFactoryInstance && walletFactoryInstance)
    ) {
        // Nếu props chính vừa sẵn sàng và đã có receiver, thử cập nhật
        if (receiver && web3 && accounts && accounts.length > 0 && walletFactoryInstance && web3.utils.isAddress(receiver.trim())) {
            console.log("[Topup.jsx] Core props became ready, re-calling updateWalletsList for:", receiver);
            await this.updateWalletsList(receiver.trim());
        }
    }
  }


  onTopUpWallet = async (e) => {
    e.preventDefault();
    const { web3, accounts, tokenInstance, createWalletInstance } = this.props; // Lấy từ props
    const { selectedWalletAddress, etherToTopup, tokenToTopup } = this.state;

    console.log("[Topup.jsx] onTopUpWallet initiated. State:", this.state, "Props:", this.props);

    if (!web3 || !accounts || accounts.length === 0) {
      renderNotification('danger', 'Error', 'Web3 or account not available. Please connect MetaMask.');
      return;
    }
    if (!selectedWalletAddress) {
      renderNotification('danger', 'Error', 'Please select a wallet to top up.');
      return;
    }
    if (!tokenInstance || !tokenInstance._address) {
      renderNotification('danger', 'Error', 'Token instance not ready.');
      return;
    }
     if (typeof createWalletInstance !== 'function') {
      renderNotification('danger', 'Error', 'createWalletInstance function not available.');
      return;
    }


    const sender = accounts[0];

    try {
      const walletInstance = createWalletInstance(web3, selectedWalletAddress); // Dùng hàm và web3 từ props
      console.log("[Topup.jsx] walletInstance for top up:", walletInstance);

      if (!walletInstance || !walletInstance.methods || walletInstance.error) {
        console.error("[Topup.jsx] Failed to get a valid walletInstance for top up.", walletInstance?.error);
        renderNotification('danger', 'Error', 'Invalid wallet instance for top up.');
        return;
      }

      const etherAmount = parseFloat(etherToTopup);
      const tokenAmount = parseFloat(tokenToTopup);

      if (etherAmount > 0) {
        console.log(`[Topup.jsx] Attempting to top up ${etherAmount} ETH to ${selectedWalletAddress}`);
        if (typeof walletInstance.methods.depositEther !== 'function') {
            renderNotification('danger', 'Error', 'depositEther method not found on wallet instance.');
            return;
        }
        await walletInstance.methods.depositEther().send({
          from: sender,
          gas: 670000, // Cân nhắc ước tính gas
          value: web3.utils.toWei(etherToTopup.toString(), 'ether')
        });
        renderNotification('success', 'Success', `${etherAmount} ETH locked successfully into ${selectedWalletAddress}!`);
      }

      if (tokenAmount > 0) {
        console.log(`[Topup.jsx] Attempting to top up ${tokenAmount} ASH to ${selectedWalletAddress}`);
        if (typeof tokenInstance.methods.transfer !== 'function') {
            renderNotification('danger', 'Error', 'transfer method not found on token instance.');
            return;
        }
        // Cách này chuyển token trực tiếp vào địa chỉ ví clone.
        // Xem xét lại nếu TimeLockWallet có hàm depositTokens() riêng (yêu cầu approve trước).
        await tokenInstance.methods.transfer(selectedWalletAddress, web3.utils.toWei(tokenToTopup.toString(), 'ether')).send({ from: sender, gas: 670000 });
        renderNotification('success', 'Success', `${tokenAmount} ASH Token transferred to ${selectedWalletAddress}!`);
      }

      if (etherAmount <= 0 && tokenAmount <= 0) {
        renderNotification('info', 'Info', 'Please enter an amount for Ether or ASH Token.');
      }

    } catch (err) {
      console.error('[Topup.jsx] Error in onTopUpWallet:', err.message, err);
      renderNotification('danger', 'Error', `Top up failed: ${err.message.split('\n')[0] || err.message}`);
    }
  }

  updateWalletsList = async (receiverAddress) => {
    const { web3, accounts, walletFactoryInstance } = this.props;
    console.log("[Topup.jsx] updateWalletsList called for receiver:", receiverAddress);

    if (!web3 || !accounts || accounts.length === 0 || !walletFactoryInstance || typeof walletFactoryInstance.methods.getWalletList !== 'function') {
      console.warn("[Topup.jsx] updateWalletsList: Prerequisites not met (web3, accounts, or factory).");
      this.setState({ wallets: [], selectedWalletAddress: null });
      return;
    }

    const sender = accounts[0];

    try {
      console.log(`[Topup.jsx] Calling walletFactoryInstance.getWalletList for receiver: ${receiverAddress}, from sender: ${sender}`);
      const walletAddressList = await walletFactoryInstance.methods.getWalletList(receiverAddress).call({ from: sender });
      console.log("[Topup.jsx] Received walletAddressList from contract:", walletAddressList);

      if (!Array.isArray(walletAddressList)) {
        console.error("[Topup.jsx] walletAddressList received is not an array:", walletAddressList);
        this.setState({ wallets: [], selectedWalletAddress: null });
        return;
      }

      const renderData = walletAddressList.map((addr) => (
        <option key={addr} value={addr} >{addr}</option>
      ));
      console.log("[Topup.jsx] Rendered <option> data for select:", renderData);

      this.setState({
        wallets: renderData,
        selectedWalletAddress: walletAddressList.length > 0 ? walletAddressList[0] : null
      });

    } catch (err) {
      console.error('[Topup.jsx] Error in updateWalletsList:', err.message, err);
      renderNotification('danger', 'Error', `Failed to fetch wallet list: ${err.message.split('\n')[0] || err.message}`);
      this.setState({ wallets: [], selectedWalletAddress: null });
    }
  }

  receiverChangeHandler = async (e) => {
    const newReceiverValue = e.target.value;
    console.log("[Topup.jsx] receiverChangeHandler - new value:", newReceiverValue);
    this.setState({ receiver: newReceiverValue }); // Cập nhật state ngay lập tức

    // Gọi updateWalletsList trong componentDidUpdate dựa trên sự thay đổi của state.receiver
  }

  inputChangedHandler = (e) => {
    const state = { ...this.state };
    state[e.target.name] = e.target.value;
    this.setState(state);
  }

  selectHandler = (e) => {
    console.log("[Topup.jsx] selectHandler - new wallet selected:", e.target.value);
    this.setState({ selectedWalletAddress: e.target.value });
  }

  render() {
    if (!this.props.web3 || !this.props.accounts || this.props.accounts.length === 0 || !this.props.walletFactoryInstance || !this.props.tokenInstance) {
      return (
        <div className="container center" style={{paddingTop: "50px"}}>
          <h4>Connecting to Wallet and Smart Contracts...</h4>
          <p>Please ensure MetaMask is connected and on the correct network. Refresh if this message persists.</p>
        </div>
      );
    }

    return (
      <div className="container center" >
        <div className="row">
          <div className="container" >
            <div className="container">
              <h5 style={{ padding: "30px 0px 0px 10px" }}>Topup Wallet</h5>
              <form className="" onSubmit={this.onTopUpWallet}>
                <label className="left">Beneficiary Address</label>
                <input
                  id="receiver"
                  placeholder="Beneficiary Address (e.g., 0x...)"
                  type="text"
                  className="validate"
                  name="receiver"
                  value={this.state.receiver}
                  onChange={this.receiverChangeHandler}
                /><br /><br />

                <label className="left">Wallet Address</label>
                <select
                  className="browser-default"
                  value={this.state.selectedWalletAddress || ""}
                  onChange={this.selectHandler}
                  disabled={this.state.wallets.length === 0 && !this.state.receiver}
                >
                  <option value="" disabled>
                    {this.state.receiver ? (this.state.wallets.length === 0 ? "No wallets found" : "Select wallet") : "Enter Beneficiary Address first"}
                  </option>
                  {this.state.wallets}
                </select><br /><br />

                <label className="left">Ether Amount</label>
                <input
                  id="etherToTopup" // Đổi tên để khớp state
                  placeholder="Ether Amount (e.g., 0.1)"
                  type="number"
                  step="any"
                  className="input-control"
                  name="etherToTopup" // Đổi tên để khớp state
                  value={this.state.etherToTopup}
                  onChange={this.inputChangedHandler}
                /><br /><br />

                <label className="left">ASH Token</label>
                <input
                  id="tokenToTopup" // Đổi tên để khớp state
                  placeholder="ASH Token Amount (e.g., 100)"
                  type="number"
                  step="any"
                  className="input-control"
                  name="tokenToTopup" // Đổi tên để khớp state
                  value={this.state.tokenToTopup}
                  onChange={this.inputChangedHandler}
                /><br /><br />

                <button type="submit" className="custom-btn login-btn">Topup Wallet</button>
              </form>
            </div >
          </div>
        </div >
      </div >
    )
  }
}

export default Topup;