// client/src/proxies/WalletFactory.js
import Provider from './Provider';
import WalletFactoryContract from '../contracts/TimeLockWalletFactory.json'; // Đảm bảo đường dẫn này đúng

console.log("[WalletFactory.js] Loaded WalletFactoryContract JSON:", WalletFactoryContract);

const provider = new Provider();

class WalletFactory {
  constructor() {
    const web3 = provider.web3;
    console.log("[WalletFactory.js] Web3 instance from Provider:", web3 ? 'Exists' : 'Missing');

    if (!WalletFactoryContract || !WalletFactoryContract.networks || !WalletFactoryContract.abi) {
      console.error("[WalletFactory.js] ERROR: WalletFactoryContract JSON data is invalid or missing (networks/abi).");
      this.instance = { methods: {}, _address: null, error: "ABI or network data missing" };
      return;
    }

    const networkIdsInJson = Object.keys(WalletFactoryContract.networks);
    console.log("[WalletFactory.js] Available network IDs in WalletFactoryContract.json:", networkIdsInJson);

    // Cố gắng tìm Network ID phù hợp. CẬP NHẬT MẢNG NÀY VỚI ID GANACHE CỦA BẠN
    const knownGanacheIds = ["2025", "5777", "1337"]; // Ví dụ: 2025 từ output migrate trước
    let deploymentKey;

    for (const id of knownGanacheIds) {
      if (WalletFactoryContract.networks[id]) {
        deploymentKey = id;
        console.log("[WalletFactory.js] Found known Ganache ID in WalletFactoryContract.json:", deploymentKey);
        break;
      }
    }

    if (!deploymentKey && networkIdsInJson.length > 0) {
      deploymentKey = networkIdsInJson[0]; // Fallback to the first key
      console.warn("[WalletFactory.js] Could not find a known Ganache network ID in WalletFactoryContract.json, falling back to first available key:", deploymentKey);
    } else if (!deploymentKey) {
      console.error("[WalletFactory.js] ERROR: No deployment networks found in WalletFactoryContract.json.");
      this.instance = { methods: {}, _address: null, error: "No deployment networks in JSON" };
      return;
    }

    const deployedNetwork = WalletFactoryContract.networks[deploymentKey];
    console.log("[WalletFactory.js] Selected deployment network data for key '" + deploymentKey + "':", deployedNetwork);

    if (!deployedNetwork || !deployedNetwork.address) {
      console.error("[WalletFactory.js] ERROR: WalletFactoryContract not deployed on selected network key '" + deploymentKey + "' or address is missing.");
      this.instance = { methods: {}, _address: null, error: "Deployment not found on network or address missing" };
      return;
    }

    try {
      this.instance = new web3.eth.Contract(
        WalletFactoryContract.abi,
        deployedNetwork.address,
      );
      console.log("[WalletFactory.js] WalletFactoryContract instance created at address:", this.instance._address);
    } catch (e) {
      console.error("[WalletFactory.js] ERROR creating WalletFactoryContract instance:", e);
      this.instance = { methods: {}, _address: null, error: "Contract instantiation failed" };
    }
  }

  getInstance = () => this.instance;
}

let factoryInstanceExport;
try {
  const walletFactory = new WalletFactory();
  Object.freeze(walletFactory); // Not strictly necessary
  factoryInstanceExport = walletFactory.getInstance();
  console.log("[WalletFactory.js] Exporting WalletFactory instance:", factoryInstanceExport && factoryInstanceExport._address ? factoryInstanceExport._address : factoryInstanceExport);
} catch (e) {
  console.error("[WalletFactory.js] Critical error during WalletFactory class instantiation for export:", e);
  factoryInstanceExport = { methods: {}, _address: null, error: "Critical initialization failed" };
}

export default factoryInstanceExport;