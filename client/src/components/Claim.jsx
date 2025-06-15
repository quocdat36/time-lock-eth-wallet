// client/src/components/Claim.jsx
import React, { Component } from 'react';
// import Web3 from 'web3'; // << XÓA: Sẽ dùng this.props.web3

// << XÓA CÁC IMPORT PROXY TRỰC TIẾP NÀY >>
// import WalletFactory from '../proxies/WalletFactory';
// import Wallet from '../proxies/Wallet';
// import tokenInstance from '../proxies/Token'; // Claim.jsx có vẻ không cần tokenInstance trực tiếp

import renderNotification from '../utils/notification-handler';

// console.log("[Claim.jsx] Các import proxy đã bị xóa hoặc không nên được sử dụng trực tiếp ở đây nữa.");

class Claim extends Component {
  constructor(props) { // Nhận props
    super(props);
    this.state = {
      // receiver: null, // Không cần receiver trong state của Claim nếu chỉ hiển thị ví của người dùng hiện tại
      walletsData: [], // Sẽ lưu trữ dữ liệu thô của các ví
      renderedWallets: [], // Sẽ lưu trữ các hàng JSX của bảng
      // wallet: null, // Không cần thiết nếu chỉ hiển thị danh sách
      // ether: 0, // Không cần thiết
      // token: 0, // Không cần thiết
    };
    console.log("[Claim.jsx] Props received in constructor:", this.props);
    // << KHÔNG KHỞI TẠO WEB3 Ở ĐÂY NỮA >>
  }

  // Gọi updateWallets khi component mount và khi props (ví dụ: accounts) thay đổi
  async componentDidMount() {
    console.log("[Claim.jsx] ComponentDidMount, calling updateWallets if props are ready.");
    if (this.props.web3 && this.props.accounts && this.props.accounts.length > 0) {
      await this.updateWallets();
    }
  }

  async componentDidUpdate(prevProps) {
    // Nếu tài khoản thay đổi (ví dụ người dùng đổi tài khoản trong MetaMask), tải lại danh sách ví
    if (this.props.accounts && prevProps.accounts !== this.props.accounts && this.props.accounts.length > 0) {
      console.log("[Claim.jsx] Accounts prop changed, calling updateWallets.");
      await this.updateWallets();
    }
     // Nếu web3 hoặc walletFactoryInstance vừa được khởi tạo
     if ((this.props.web3 && !prevProps.web3) || (this.props.walletFactoryInstance && !prevProps.walletFactoryInstance)) {
        if (this.props.web3 && this.props.accounts && this.props.accounts.length > 0 && this.props.walletFactoryInstance) {
            console.log("[Claim.jsx] Web3/Factory ready after initial mount, calling updateWallets.");
            await this.updateWallets();
        }
    }
  }


  onWithdrawEther = async (walletAddress) => { // Nhận walletAddress thay vì walletInstance
    const { web3, accounts, createWalletInstance } = this.props;
    console.log(`[Claim.jsx] onWithdrawEther called for wallet: ${walletAddress}`);

    if (!web3 || !accounts || accounts.length === 0 || !createWalletInstance) {
      renderNotification('danger', 'Error', 'Application not ready or wallet not connected.');
      return;
    }
    const sender = accounts[0]; // Người thụ hưởng chính là người đang kết nối ví

    try {
      const walletInstance = createWalletInstance(web3, walletAddress);
      if (!walletInstance || typeof walletInstance.methods.releaseEther !== 'function') {
        renderNotification('danger', 'Error', 'Invalid wallet instance for withdrawing Ether.');
        return;
      }

      console.log(`[Claim.jsx] Sending releaseEther transaction from ${sender} for wallet ${walletAddress}`);
      await walletInstance.methods.releaseEther().send({ from: sender });
      renderNotification('success', 'Success', `Ether withdrawal initiated for wallet ${walletAddress}!`);
      await this.updateWallets(); // Cập nhật lại danh sách sau khi rút
    } catch (err) {
      console.error('[Claim.jsx] Error in onWithdrawEther:', err.message, err);
      renderNotification('danger', 'Error', `Ether withdrawal failed: ${err.message.split('\n')[0] || err.message}`);
    }
  }

  onWithdrawToken = async (walletAddress) => { // Nhận walletAddress
    const { web3, accounts, createWalletInstance } = this.props;
    console.log(`[Claim.jsx] onWithdrawToken called for wallet: ${walletAddress}`);

    if (!web3 || !accounts || accounts.length === 0 || !createWalletInstance) {
      renderNotification('danger', 'Error', 'Application not ready or wallet not connected.');
      return;
    }
    const sender = accounts[0];

    try {
      const walletInstance = createWalletInstance(web3, walletAddress);
      if (!walletInstance || typeof walletInstance.methods.releaseToken !== 'function') {
        renderNotification('danger', 'Error', 'Invalid wallet instance for withdrawing Token.');
        return;
      }

      console.log(`[Claim.jsx] Sending releaseToken transaction from ${sender} for wallet ${walletAddress}`);
      await walletInstance.methods.releaseToken().send({ from: sender });
      renderNotification('success', 'Success', `Token withdrawal initiated for wallet ${walletAddress}!`);
      await this.updateWallets();
    } catch (err) {
      console.error('[Claim.jsx] Error in onWithdrawToken:', err.message, err);
      renderNotification('danger', 'Error', `Token withdrawal failed: ${err.message.split('\n')[0] || err.message}`);
    }
  }

  updateWallets = async () => {
    const { web3, accounts, walletFactoryInstance, createWalletInstance } = this.props;
    console.log("[Claim.jsx] updateWallets called.");

    if (!web3 || !accounts || accounts.length === 0 || !walletFactoryInstance || !createWalletInstance) {
      console.warn("[Claim.jsx] updateWallets: Prerequisites not met (web3, accounts, factory, or createWalletInstance).");
      this.setState({ renderedWallets: [], walletsData: [] });
      return;
    }

    const sender = accounts[0]; // Người dùng hiện tại (beneficiary cần kiểm tra)

    try {
      console.log(`[Claim.jsx] Calling walletFactoryInstance.getWalletList for beneficiary: ${sender}`);
      if (typeof walletFactoryInstance.methods.getWalletList !== 'function') {
        console.error("[Claim.jsx] walletFactoryInstance.methods.getWalletList is not a function");
        return;
      }
      const walletAddressList = await walletFactoryInstance.methods.getWalletList(sender).call({ from: sender });
      console.log("[Claim.jsx] Received walletAddressList from contract:", walletAddressList);

      if (!Array.isArray(walletAddressList)) {
        console.error("[Claim.jsx] walletAddressList is not an array:", walletAddressList);
        this.setState({ renderedWallets: [], walletsData: [] });
        return;
      }
      if (walletAddressList.length === 0) {
        console.log("[Claim.jsx] No wallets found for this beneficiary:", sender);
        this.setState({ renderedWallets: [], walletsData: [] });
        return;
      }

      const walletsDetailsPromises = walletAddressList.map(async (walletAddr) => {
        if (!walletAddr || !web3.utils.isAddress(walletAddr)) {
            console.warn("[Claim.jsx] Invalid wallet address in list:", walletAddr);
            return null; // Bỏ qua địa chỉ không hợp lệ
        }
        const walletInstance = createWalletInstance(web3, walletAddr);
        if (!walletInstance || typeof walletInstance.methods.getWalletDetails !== 'function') {
            console.error("[Claim.jsx] Could not create walletInstance or getWalletDetails is missing for address:", walletAddr);
            return null;
        }
        try {
            const details = await walletInstance.methods.getWalletDetails().call({ from: sender });
            return { address: walletAddr, ...details };
        } catch (detailsError) {
            console.error(`[Claim.jsx] Error fetching details for wallet ${walletAddr}:`, detailsError);
            return { address: walletAddr, error: true }; // Đánh dấu ví bị lỗi
        }
      });

      const resolvedWalletsData = (await Promise.all(walletsDetailsPromises)).filter(Boolean); // Lọc bỏ các giá trị null
      console.log("[Claim.jsx] Resolved wallets data:", resolvedWalletsData);

      const renderData = resolvedWalletsData.map(walletData => {
        if (walletData.error) {
            return (
                <tr key={walletData.address}>
                    <td className="center">{walletData.address}</td>
                    <td colSpan="7" className="center red-text">Error fetching details</td>
                </tr>
            );
        }
        // Destructure với giá trị mặc định hoặc kiểm tra
        const { '0': beneficiary, '1': creator, '2': releaseTime, '3': createdTime, '4': etherAmount, '5': tokenAmount } = walletData;

        const eth = web3.utils.fromWei(etherAmount ? etherAmount.toString() : '0', 'ether');
        const ashToken = web3.utils.fromWei(tokenAmount ? tokenAmount.toString() : '0', 'ether'); // Giả sử token cũng 18 decimals
        const releaseDateTime = releaseTime ? new Date(Number(releaseTime) * 1000).toLocaleString() : "N/A";
        const createdDateTime = createdTime ? new Date(Number(createdTime) * 1000).toLocaleString() : "N/A";

        // Kiểm tra xem người dùng hiện tại có phải là beneficiary của ví này không
        // Mặc dù getWalletList đã lọc, nhưng để chắc chắn hơn khi render nút
        const isBeneficiary = beneficiary && sender && beneficiary.toLowerCase() === sender.toLowerCase();
        const canWithdraw = releaseTime ? (Date.now() / 1000) >= Number(releaseTime) : false;

        return (
          <tr key={walletData.address}>
            <td className="center">{walletData.address}</td>
            <td className="center">{creator || "N/A"}</td>
            <td className="center">{createdDateTime}</td>
            <td className="center">{releaseDateTime}</td>
            <td className="center">{eth}</td>
            <td className="center">{ashToken}</td>
            <td className="center">
              <button
                type="button" // Quan trọng: đổi type="submit" thành "button" nếu không nằm trong form
                className="custom-btn login-btn"
                onClick={() => this.onWithdrawEther(walletData.address)}
                disabled={!isBeneficiary || !canWithdraw} // Vô hiệu hóa nếu không phải beneficiary hoặc chưa đến hạn
              >
                Withdraw Ether
              </button>
            </td>
            <td className="center">
              <button
                type="button"
                className="custom-btn login-btn"
                onClick={() => this.onWithdrawToken(walletData.address)}
                disabled={!isBeneficiary || !canWithdraw}
              >
                Withdraw Token
              </button>
            </td>
          </tr>
        );
      });

      this.setState({ renderedWallets: renderData, walletsData: resolvedWalletsData });
    } catch (e) {
      console.error('[Claim.jsx] Error in updateWallets (outer try-catch):', e.message, e);
      renderNotification('danger', 'Error', 'Could not update wallet list. ' + (e.message || ''));
      this.setState({ renderedWallets: [], walletsData: [] });
    }
  }

  render() {
    // console.log("[Claim.jsx] Rendering with state:", this.state);
    if (!this.props.web3 || !this.props.accounts || this.props.accounts.length === 0 || !this.props.walletFactoryInstance) {
        return (
          <div className="container center" style={{paddingTop: "50px"}}>
            <h4>Connecting to Wallet and Smart Contracts...</h4>
            <p>Please ensure MetaMask is connected and on the correct network. Refresh if this message persists.</p>
          </div>
        );
      }

    return (
      <div className="container"> {/* Bỏ bớt các class không cần thiết ở đây */}
        <h4 className="center" style={{ marginTop: '30px', marginBottom: '30px' }}>Claim Funds</h4>
        {this.state.renderedWallets.length > 0 ? (
          <table id='requests' className="responsive-table striped highlight"> {/* Thêm highlight */}
            <thead>
              <tr>
                <th className="center">Wallet Address</th>
                <th className="center">Creator</th>
                <th className="center">Created Time</th>
                <th className="center">Release Time</th>
                <th className="center">Ether Held</th>
                <th className="center">ASH Token Held</th>
                <th className="center">Withdraw Ether</th>
                <th className="center">Withdraw Token</th>
              </tr>
            </thead>
            <tbody className="striped highlight">
              {this.state.renderedWallets}
            </tbody>
          </table>
        ) : (
          <p className="center">No time-locked wallets found for your account (as beneficiary) or still loading.</p>
        )}
      </div >
    )
  }
}

export default Claim;