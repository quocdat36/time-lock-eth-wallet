// client/src/proxies/Wallet.js
// import Provider from './Provider'; // Không cần Provider nữa
import TimeLockWalletInfo from '../contracts/TimeLockWallet.json';

// console.log("[Wallet.js] Loaded TimeLockWalletInfo JSON:", TimeLockWalletInfo);

// Hàm này sẽ được gọi từ các component con với web3 instance và địa chỉ ví clone
const createWalletInstance = (web3, contractAddress) => {
  // console.log("[Wallet.js] createWalletInstance called with web3:", web3 ? 'Exists' : 'Missing', "contractAddress:", contractAddress);

  if (!web3) {
    console.error("[Wallet.js] Web3 instance from Provider is missing.");
    return { methods: {}, error: "Web3 provider missing" };
  }
  if (!TimeLockWalletInfo || !TimeLockWalletInfo.abi) {
    console.error("[Wallet.js] TimeLockWallet ABI is missing or invalid from JSON.");
    return { methods: {}, error: "ABI missing or invalid" };
  }
  if (!contractAddress || !web3.utils.isAddress(contractAddress)) { // Kiểm tra địa chỉ hợp lệ
    console.error("[Wallet.js] Attempted to create Wallet instance without a valid contractAddress:", contractAddress);
    return { methods: {}, error: "Invalid or missing contract address" };
  }

  try {
    const walletInstance = new web3.eth.Contract(TimeLockWalletInfo.abi, contractAddress);
    // console.log("[Wallet.js] Wallet instance created for address:", contractAddress);
    return walletInstance;
  } catch (e) {
    console.error("[Wallet.js] ERROR creating Wallet contract instance for address " + contractAddress + ":", e);
    return { methods: {}, error: "Contract instantiation failed for Wallet" };
  }
};

export default createWalletInstance; // Export hàm