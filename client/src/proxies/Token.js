// client/src/proxies/Token.js
// import Provider from './Provider'; // Không cần Provider nữa nếu web3 được truyền vào
import AshTokenInfo from '../contracts/AshToken.json';

// console.log("[Token.js] Loaded AshToken JSON:", AshTokenInfo);

// Hàm này sẽ được gọi từ App.js với web3 instance và networkId đã được kết nối
const createTokenInstance = (web3, networkId) => {
  console.log("[Token.js] createTokenInstance called with web3:", web3 ? 'Exists' : 'Missing', "networkId:", networkId);

  if (!web3) {
    console.error("[Token.js] ERROR: Web3 instance is required.");
    return { methods: {}, _address: null, error: "Web3 instance missing" };
  }
  if (!AshTokenInfo || !AshTokenInfo.networks || !AshTokenInfo.abi) {
    console.error("[Token.js] ERROR: AshToken JSON data is invalid or missing (networks/abi).");
    return { methods: {}, _address: null, error: "ABI or network data missing" };
  }

  const deployedNetwork = AshTokenInfo.networks[networkId]; // Sử dụng networkId được truyền vào
  console.log("[Token.js] Selected deployment network data for key '" + networkId + "':", deployedNetwork);

  if (!deployedNetwork || !deployedNetwork.address) {
    console.error("[Token.js] ERROR: AshToken not deployed on selected network key '" + networkId + "' or address is missing.");
    return { methods: {}, _address: null, error: "Deployment not found on network or address missing" };
  }

  try {
    const instance = new web3.eth.Contract(
      AshTokenInfo.abi,
      deployedNetwork.address,
    );
    console.log("[Token.js] AshToken contract instance created at address:", instance._address);
    return instance;
  } catch (e) {
    console.error("[Token.js] ERROR creating AshToken contract instance:", e);
    return { methods: {}, _address: null, error: "Contract instantiation failed" };
  }
};

export default createTokenInstance;