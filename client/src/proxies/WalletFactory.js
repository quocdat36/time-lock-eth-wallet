// client/src/proxies/WalletFactory.js
// import Provider from './Provider'; // Không cần Provider nữa
import WalletFactoryContractInfo from '../contracts/TimeLockWalletFactory.json';

// console.log("[WalletFactory.js] Loaded WalletFactoryContract JSON:", WalletFactoryContractInfo);

const createWalletFactoryInstance = (web3, networkId) => {
  console.log("[WalletFactory.js] createWalletFactoryInstance called with web3:", web3 ? 'Exists' : 'Missing', "networkId:", networkId);

  if (!web3) {
    console.error("[WalletFactory.js] ERROR: Web3 instance is required.");
    return { methods: {}, _address: null, error: "Web3 instance missing" };
  }
  if (!WalletFactoryContractInfo || !WalletFactoryContractInfo.networks || !WalletFactoryContractInfo.abi) {
    console.error("[WalletFactory.js] ERROR: WalletFactoryContract JSON data is invalid or missing (networks/abi).");
    return { methods: {}, _address: null, error: "ABI or network data missing" };
  }

  const deployedNetwork = WalletFactoryContractInfo.networks[networkId];
  console.log("[WalletFactory.js] Selected deployment network data for key '" + networkId + "':", deployedNetwork);

  if (!deployedNetwork || !deployedNetwork.address) {
    console.error("[WalletFactory.js] ERROR: WalletFactoryContract not deployed on network key '" + networkId + "' or address is missing.");
    return { methods: {}, _address: null, error: "Deployment not found on network or address missing" };
  }

  try {
    const instance = new web3.eth.Contract(
      WalletFactoryContractInfo.abi,
      deployedNetwork.address,
    );
    console.log("[WalletFactory.js] WalletFactoryContract instance created at address:", instance._address);
    return instance;
  } catch (e) {
    console.error("[WalletFactory.js] ERROR creating WalletFactoryContract instance:", e);
    return { methods: {}, _address: null, error: "Contract instantiation failed" };
  }
};

export default createWalletFactoryInstance;