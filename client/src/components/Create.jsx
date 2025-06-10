import React, { Component } from 'react';
import Web3 from 'web3';
import WalletFactory from '../proxies/WalletFactory';
import tokenInstance from '../proxies/Token';
import Wallet from '../proxies/Wallet';
import renderNotification from '../utils/notification-handler';

console.log("[Create.jsx] Imported WalletFactory:", WalletFactory);
console.log("[Create.jsx] Imported tokenInstance:", tokenInstance);
console.log("[Create.jsx] Imported Wallet function:", Wallet);
console.log("[Create.jsx] Imported renderNotification:", renderNotification);

let web3;

class Create extends Component {
  constructor() {
    super();
    this.state = {
      receiver: null,
      unlockDate: null,
      ether: 0,
      token: 0,
    }

    web3 = new Web3(window.ethereum);
  }

  onCreateWallet = async (e) => {
    try {
      e.preventDefault();
      const sender = await web3.eth.getCoinbase();
      const { receiver, unlockDate, token, ether } = this.state;
      console.log('console wallefactory', tokenInstance);
      const result = await WalletFactory.methods.createNewWallet(tokenInstance._address, receiver, new Date(unlockDate).getTime() / 1000).send({
        from: sender,
        gas: 6700000,
      });

      renderNotification('success', 'Success', `Wallet Created Successfully! ${result.events.Created.returnValues['wallet']}`);

      const walletAddress = result.events.Created.returnValues['wallet'];
      console.log("[Create.jsx] walletAddress for Wallet function:", walletAddress);
      if (ether) {
        const walletInstance = Wallet(walletAddress);
        console.log("[Create.jsx] walletInstance created:", walletInstance);
        if (walletInstance && !walletInstance.error) { // Kiểm tra xem có lỗi từ Wallet.js không
            await walletInstance.methods.depositEther().send({ from: sender, gas: 670000, value: web3.utils.toWei(ether, 'ether') });
            // ...
        } else {
            console.error("[Create.jsx] Failed to get walletInstance or it had an error:", walletInstance);
        }
        renderNotification('success', 'Success', `Ether locked successfully!`);
      }

      if (token) {
        await tokenInstance.methods.transfer(walletAddress, web3.utils.toWei(token, 'ether')).send({ from: sender, gas: 670000 });
        renderNotification('success', 'Success', `Token locked successfully!`);
      }
    } catch (err) {
      renderNotification('danger', 'Error', err.message);
      console.log('console err', err);
    }
  }

  inputChangedHandler = (e) => {
    const state = this.state;
    state[e.target.name] = e.target.value;
    this.setState(state);
  }

  render() {
    return (
      <div className="container center" >

        <div className="row">
          <div className="container ">
            <div className="container ">
              <h5 style={{ padding: "30px 0px 0px 10px" }}>Create Wallet</h5>
              <form className="" onSubmit={this.onCreateWallet}>
                <label className="left">Beneficiary Address</label><input id="receiver" class="validate" placeholder="Beneficiary" type="text" className="validate" name="receiver" onChange={this.inputChangedHandler} /><br /><br />
                <label className="left">Ether Amount</label><input id="ether" className="validate" placeholder="Ether Amount" type="text" className="input-control" name="ether" onChange={this.inputChangedHandler} /><br /><br />
                <label className="left">ASH Token</label><input id="token" placeholder="ASH Token Amount" type="text" className="input-control" name="token" onChange={this.inputChangedHandler} /><br /><br />
                <label className="left">Release Time</label><input id="unlock" placeholder="Unlock Time" type="text" className="input-control" name="unlockDate" type="datetime-local" onChange={this.inputChangedHandler}></input><br /><br />

                <button type="submit" className="custom-btn login-btn">Create Wallet</button>
              </form>
            </div>
          </div>
        </div>

      </div >

    )
  }
}




export default Create;