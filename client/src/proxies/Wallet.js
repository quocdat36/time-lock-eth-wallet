// client/src/proxies/Wallet.js
import Provider from './Provider';
import TimeLockWalletInfo from '../contracts/TimeLockWallet.json'; 

console.log("[Wallet.js] Loaded TimeLockWalletInfo JSON:", TimeLockWalletInfo); // OK
const provider = new Provider();
console.log("[Wallet.js] Provider instance created"); // OK

const Wallet = (contractAddress) => {
  const web3 = provider.web3;

  if (!web3) {
    console.error("[Wallet.js] Web3 instance from Provider is missing.");
    return { methods: {}, error: "Web3 provider missing" };
  }

  if (!TimeLockWalletInfo || !TimeLockWalletInfo.abi) {
    console.error("[Wallet.js] TimeLockWallet ABI is missing or invalid from JSON.");
    return { methods: {}, error: "ABI missing or invalid" };
  }

  if (!contractAddress) {
    console.error("[Wallet.js] Attempted to create Wallet instance without a contractAddress.");
    return { methods: {}, error: "Contract address missing" };
  }

  try {
    // Sử dụng TimeLockWalletInfo.abi
    const walletInstance = new web3.eth.Contract(TimeLockWalletInfo.abi, contractAddress);
    // console.log("[Wallet.js] Wallet instance created for address:", contractAddress);
    return walletInstance;
  } catch (e) {
    console.error("[Wallet.js] ERROR creating Wallet contract instance for address " + contractAddress + ":", e);
    return { methods: {}, error: "Contract instantiation failed for Wallet" };
  }
};

console.log("[Wallet.js] Exporting Wallet function:", typeof Wallet === 'function' ? 'Function defined' : 'Wallet is NOT a function');
export default Wallet;