import tokenInstance from '../proxies/Token'; // Đảm bảo dòng này có
import React, { Component } from 'react';
import Web3 from 'web3';
import WalletFactory from '../proxies/WalletFactory';
import Wallet from '../proxies/Wallet';
import renderNotification from '../utils/notification-handler';

console.log("[Create.jsx] Imported WalletFactory:", WalletFactory);
console.log("[Create.jsx] Imported tokenInstance:", tokenInstance);
console.log("[Create.jsx] Imported Wallet function:", Wallet);
console.log("[Create.jsx] Imported renderNotification:", renderNotification);

let web3;

class Claim extends Component {
  constructor() {
    super();
    this.state = {
      receiver: null,
      wallets: [],
      wallet: null,
      ether: 0,
      token: 0,
    };

    web3 = new Web3(window.ethereum);
  }

  async componentDidMount() {
    await this.updateWallets();
  }

  async onWithdrawEther(walletInstance, sender) {
    try {
      const result = await walletInstance.methods.releaseEther().send({ from: sender });
      await this.updateWallets();
      renderNotification('success', 'Success', `Ether deposited successfully!`);
    } catch (err) {
      renderNotification('danger', 'Error', err.message.split(' ').slice(8).join(' '));
    }
  }
  async onWithdrawToken(walletInstance, sender) {
    try {
      const result = await walletInstance.methods.releaseToken().send({ from: sender });
      await this.updateWallets();

      renderNotification('success', 'Success', `Token deposited successfully!`);
    } catch (err) {
      renderNotification('danger', 'Error', err.message.split(' ').slice(9).join(' '));
    }
  }

  async updateWallets() {
    try {
      const sender = await web3.eth.getCoinbase();
      const walletList = await WalletFactory.methods.getWalletList(sender).call({ from: sender });

      const renderData = await Promise.all(walletList.map(async wallet => {
        const walletInstance = Wallet(wallet);
        const walletDetails = await walletInstance.methods.getWalletDetails().call({ from: sender });
        const [beneficiary, creator, releaseTime, createdTime, etherAmount, tokenAmount] = Object.values(walletDetails);
        const eth = web3.utils.fromWei(etherAmount, 'ether');
        const ashToken = web3.utils.fromWei(tokenAmount, 'ether');
        const releaseDateTime = new Date(releaseTime * 1000).toLocaleString();
        const createdDateTime = new Date(createdTime * 1000).toLocaleString();

        return (
          <tr key={wallet}>
            <td className="center">{wallet}</td>
            <td className="center">{creator}</td>
            <td className="center">{createdDateTime}</td>
            <td className="center">{releaseDateTime}</td>
            <td className="center">{eth}</td>
            <td className="center">{ashToken}</td>

            <td className="center"><button type="submit" className="custom-btn login-btn" onClick={this.onWithdrawEther.bind(this, walletInstance, sender)}>Withdraw Ether</button></td>
            <td className="center"><button type="submit" className="custom-btn login-btn" onClick={this.onWithdrawToken.bind(this, walletInstance, sender)}>Withdraw Token</button></td>
          </tr>
        );
      }
      ));

      this.setState({ wallets: renderData });
      this.setState({ wallet: walletList[0] });
    } catch (e) {
      console.log('console err', e, e.reason);
    }
  }

  render() {
    return (

      <div className="container " className="col s12 m6 offset-m3 l4 offset-l4 z-depth-6 card-panel">

        <h4 className="center">Claim Funds</h4>

        <table id='requests' className="responsive-table striped" >
          <thead>
            <tr>
              <th key='wallet' className="center">Wallet</th>
              <th key='from' className="center">From</th>
              <th key='age' className="center">Created Time</th>
              <th key='unlockin' className="center">Release Time</th>
              <th key='ether' className="center">Ether</th>
              <th key='token' className="center">ASH Token</th>
              <th key='withdrawEther' className="center">Withdraw Ether</th>
              <th key='withdrawToken' className="center">Withdraw Token</th>
            </tr>
          </thead>
          <tbody className="striped highlight">
            {this.state.wallets}
          </tbody>
        </table>

      </div >

    )
  }
}

export default Claim;  