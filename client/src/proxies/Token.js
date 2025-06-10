// client/src/proxies/Token.js
import Provider from './Provider';
import AshToken from '../contracts/AshToken.json'; // Đảm bảo đường dẫn này đúng

console.log("[Token.js] Loaded AshToken JSON:", AshToken);

const provider = new Provider();

class Token {
  constructor() {
    const web3 = provider.web3;
    console.log("[Token.js] Web3 instance from Provider:", web3 ? 'Exists' : 'Missing');

    if (!AshToken || !AshToken.networks || !AshToken.abi) {
      console.error("[Token.js] ERROR: AshToken JSON data is invalid or missing (networks/abi).");
      this.instance = { methods: {}, _address: null, error: "ABI or network data missing" };
      return;
    }

    const networkIdsInJson = Object.keys(AshToken.networks);
    console.log("[Token.js] Available network IDs in AshToken.json:", networkIdsInJson);

    // Cố gắng tìm Network ID phù hợp. CẬP NHẬT MẢNG NÀY VỚI ID GANACHE CỦA BẠN
    const knownGanacheIds = ["2025", "5777", "1337"]; // Ví dụ: 2025 từ output migrate trước
    let deploymentKey;

    for (const id of knownGanacheIds) {
      if (AshToken.networks[id]) {
        deploymentKey = id;
        console.log("[Token.js] Found known Ganache ID in AshToken.json:", deploymentKey);
        break;
      }
    }

    if (!deploymentKey && networkIdsInJson.length > 0) {
      deploymentKey = networkIdsInJson[0]; // Fallback to the first key if no known ID found
      console.warn("[Token.js] Could not find a known Ganache network ID in AshToken.json, falling back to first available key:", deploymentKey);
    } else if (!deploymentKey) {
      console.error("[Token.js] ERROR: No deployment networks found in AshToken.json.");
      this.instance = { methods: {}, _address: null, error: "No deployment networks in JSON" };
      return;
    }

    const deployedNetwork = AshToken.networks[deploymentKey];
    console.log("[Token.js] Selected deployment network data for key '" + deploymentKey + "':", deployedNetwork);

    if (!deployedNetwork || !deployedNetwork.address) {
      console.error("[Token.js] ERROR: AshToken not deployed on selected network key '" + deploymentKey + "' or address is missing.");
      this.instance = { methods: {}, _address: null, error: "Deployment not found on network or address missing" };
      return;
    }

    try {
      this.instance = new web3.eth.Contract(
        AshToken.abi,
        deployedNetwork.address,
      );
      console.log("[Token.js] AshToken contract instance created at address:", this.instance._address);
    } catch (e) {
      console.error("[Token.js] ERROR creating AshToken contract instance:", e);
      this.instance = { methods: {}, _address: null, error: "Contract instantiation failed" };
    }
  }

  getInstance = () => this.instance;
}

let tokenInstanceExport;
try {
  const token = new Token();
  Object.freeze(token); // Not strictly necessary if getInstance always returns the same instance
  tokenInstanceExport = token.getInstance();
  console.log("[Token.js] Exporting AshToken instance:", tokenInstanceExport && tokenInstanceExport._address ? tokenInstanceExport._address : tokenInstanceExport);
} catch (e) {
  console.error("[Token.js] Critical error during Token class instantiation for export:", e);
  tokenInstanceExport = { methods: {}, _address: null, error: "Critical initialization failed" };
}

export default tokenInstanceExport;