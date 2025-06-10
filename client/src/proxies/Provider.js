// client/src/proxies/Provider.js
import Web3 from 'web3';

class Provider {
  constructor() {
    // Dòng cũ:
    // this.web3 = new Web3(new Web3.providers.HttpProvider('http://0.0.0.0:8545'));

    // Dòng mới (ưu tiên MetaMask nếu có, nếu không thì kết nối tới Ganache qua localhost):
    if (typeof window.ethereum !== 'undefined') {
      console.log('[Provider.js] Using window.ethereum (MetaMask)');
      this.web3 = new Web3(window.ethereum);
    } else if (typeof window.web3 !== 'undefined') {
      console.log('[Provider.js] Using legacy window.web3');
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      console.log('[Provider.js] Falling back to HttpProvider localhost:8545');
      this.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545')); // Hoặc 'http://localhost:8545'
    }
  }
}

export default Provider;