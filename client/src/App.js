// client/src/App.js
import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Web3 from 'web3';

import Create from "./components/Create";
import Topup from "./components/Topup";
import Claim from "./components/Claim";

// Các file proxy bây giờ export hàm tạo instance
import createTokenInstanceFromProxy from './proxies/Token';
import createWalletFactoryInstanceFromProxy from './proxies/WalletFactory';
import createWalletInstanceFromProxy from './proxies/Wallet'; // Wallet.js cũng export hàm

console.log("[App.js] Imported Create:", typeof Create);
console.log("[App.js] Imported Topup:", typeof Topup);
console.log("[App.js] Imported Claim:", typeof Claim);

class App extends Component {
  constructor() {
    super();
    console.log("[App.js] App Constructor called");
    this.state = {
      web3: null,
      accounts: [],
      networkId: null,
      tokenInstance: null,
      walletFactoryInstance: null,
      // createWalletInstance function sẽ được truyền trực tiếp
      appReady: false, // Cờ để chỉ render khi web3 và contracts sẵn sàng
    };
  }

  componentDidMount() {
    console.log("[App.js] App ComponentDidMount called");
    this.initializeWeb3AndContracts();
  }

  initializeWeb3AndContracts = async () => {
    try {
      let web3Instance;
      let accs = [];
      let netId;

      if (typeof window.ethereum !== 'undefined') {
        console.log("[App.js] MetaMask (window.ethereum) is available!");
        web3Instance = new Web3(window.ethereum);
        try {
          accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
          console.log("[App.js] Accounts accessed via MetaMask:", accs);
          if (accs.length === 0) {
            toast.error("No accounts found. Please ensure an account is selected in MetaMask.");
            this.setState({ appReady: false }); // Không sẵn sàng nếu không có tài khoản
            return;
          }
          netId = await web3Instance.eth.net.getId();
          console.log("[App.js] Network ID from MetaMask:", netId);
        } catch (error) {
          console.error("[App.js] User denied account access or error:", error);
          toast.error("MetaMask access denied. Please connect and refresh.");
          this.setState({ appReady: false });
          return; // Dừng nếu không có quyền truy cập
        }
      } else {
        console.warn("[App.js] No Ethereum provider (MetaMask) detected. Application functionality will be limited.");
        toast.info("No Ethereum wallet detected. Please install MetaMask.");
        this.setState({ appReady: false });
        return; // Dừng nếu không có provider
      }

      // Khởi tạo contract instances SAU KHI web3 và networkId đã sẵn sàng
      console.log("[App.js] Initializing contract instances with networkId:", netId);
      const token = createTokenInstanceFromProxy(web3Instance, netId.toString());
      const factory = createWalletFactoryInstanceFromProxy(web3Instance, netId.toString());

      let contractsInitializedCorrectly = true;
      if (token && token._address) {
        console.log("[App.js] AshToken instance initialized:", token._address);
      } else {
        console.error("[App.js] Failed to initialize AshToken instance. Check proxy and ABI/address for network:", netId, token);
        toast.error("Failed to initialize Token Contract. Check console.");
        contractsInitializedCorrectly = false;
      }
      if (factory && factory._address) {
        console.log("[App.js] WalletFactory instance initialized:", factory._address);
      } else {
        console.error("[App.js] Failed to initialize WalletFactory instance. Check proxy and ABI/address for network:", netId, factory);
        toast.error("Failed to initialize Factory Contract. Check console.");
        contractsInitializedCorrectly = false;
      }

      if (contractsInitializedCorrectly) {
        this.setState({
          web3: web3Instance,
          accounts: accs,
          networkId: netId,
          tokenInstance: token,
          walletFactoryInstance: factory,
          appReady: true, // Ứng dụng sẵn sàng để render các component chính
        });
      } else {
        this.setState({ web3: web3Instance, accounts: accs, networkId: netId, appReady: false });
      }

    } catch (error) {
      console.error("[App.js] Error initializing Web3 and Contracts:", error);
      toast.error("Critical error initializing application. Check console.");
      this.setState({ appReady: false });
    }
  }

  render() {
    console.log("[App.js] App Render method called. App ready:", this.state.appReady, "Web3:", this.state.web3 ? "Yes":"No");

    if (!this.state.appReady) {
      return (
        <div>
          <ToastContainer position="top-center" autoClose={5000} theme="colored" />
          <div className="container center" style={{ paddingTop: "50px" }}>
            <h4>Loading Application or Connection Failed...</h4>
            <p>Please ensure MetaMask is installed, connected, and on the correct network (Ganache at localhost:8545).</p>
            <p>If you've just connected or changed accounts, please refresh the page.</p>
            {/* Nút thử kết nối lại có thể hữu ích */}
            <button onClick={this.initializeWeb3AndContracts} className="btn">Retry Connection</button>
          </div>
        </div>
      );
    }

    const { web3, accounts, tokenInstance, walletFactoryInstance } = this.state;

    return (
      <Router>
        <div>
          <ToastContainer position="top-center" autoClose={3500} theme="colored" />
          <nav style={{ padding: '0px 30px 0px 30px' }}>
            <div className="nav-wrapper">
              <Link to="/" className="brand-logo left">Time Locked Wallet</Link>
              <ul className="right hide-on-med-and-down">
                <li> <Link to="/create">Create Wallet</Link> </li>
                <li> <Link to="/topup">Topup Wallet</Link></li>
                <li> <Link to="/claim">Claim Funds</Link></li>
                {accounts && accounts.length > 0 && (
                  <li style={{ marginLeft: '20px', color: '#FFF', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '5px' }}>🟢</span>
                    {accounts[0].substring(0, 6)}...{accounts[0].substring(accounts[0].length - 4)}
                  </li>
                )}
              </ul>
            </div>
          </nav>

          <Switch>
            <Route
              path="/create"
              render={(props) => (
                <Create
                  {...props}
                  web3={web3}
                  accounts={accounts}
                  tokenInstance={tokenInstance}
                  walletFactoryInstance={walletFactoryInstance}
                  createWalletInstance={createWalletInstanceFromProxy} // Truyền hàm tạo Wallet instance
                />
              )}
            />
            <Route
              path="/topup"
              render={(props) => (
                <Topup
                  {...props}
                  web3={web3}
                  accounts={accounts}
                  tokenInstance={tokenInstance}
                  walletFactoryInstance={walletFactoryInstance}
                  createWalletInstance={createWalletInstanceFromProxy}
                />
              )}
            />
            <Route
              path="/claim"
              render={(props) => (
                <Claim
                  {...props}
                  web3={web3}
                  accounts={accounts}
                  walletFactoryInstance={walletFactoryInstance}
                  createWalletInstance={createWalletInstanceFromProxy}
                />
              )}
            />
            <Route
              exact
              path="/"
              render={(props) => (
                <Create // Trang chủ mặc định là Create
                  {...props}
                  web3={web3}
                  accounts={accounts}
                  tokenInstance={tokenInstance}
                  walletFactoryInstance={walletFactoryInstance}
                  createWalletInstance={createWalletInstanceFromProxy}
                />
              )}
            />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;