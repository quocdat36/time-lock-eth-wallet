
# Time Locked Wallet - Ví Khóa Thời Gian (ETH & ERC20)

Dự án này triển khai một hệ thống **Ví Khóa Thời Gian** trên blockchain Ethereum. Nó cho phép người dùng tạo ra các ví có khả năng giữ Ether và token ERC20 (cụ thể là **AshToken** trong ví dụ này), và chỉ cho phép người thụ hưởng được chỉ định rút tài sản sau một thời điểm nhất định trong tương lai.

---

## 🧱 Thành phần dự án

### 1. Smart Contracts (Solidity)

Viết bằng Solidity và sử dụng Truffle Suite:

- `AshToken.sol`: Token ERC20 đơn giản làm ví dụ.
- `TimeLockWallet.sol`: Contract ví khóa thời gian.
- `TimeLockWalletFactory.sol`: Tạo bản sao `TimeLockWallet` tiết kiệm gas theo chuẩn EIP-1167, dùng `CloneFactory.sol`.
- `CloneFactory.sol`: Thư viện hỗ trợ clone contract.

### 2. Giao diện Người dùng (Front-end)

Xây dựng bằng React (Create React App, có thể dùng Craco).

---

## ⚙️ Các chức năng chính

- **Tạo ví khóa thời gian**: 
  - Chỉ định người thụ hưởng
  - Cài đặt thời gian mở khóa
  - Gửi Ether và/hoặc AshToken
- **Nạp thêm vào ví**: Gửi thêm ETH hoặc ASH token
- **Rút tiền/token**:
  - Chỉ người thụ hưởng mới rút được
  - Chỉ có thể rút sau thời gian mở khóa

---

## 💻 Yêu cầu hệ thống

- Node.js (v18.x hoặc 20.x LTS khuyến nghị)
- npm
- Truffle: `npm install -g truffle`
- Ganache (CLI hoặc GUI)
- MetaMask (trình duyệt)

---

## 🚀 Cài đặt và chạy dự án

### 1. Clone Repository

```bash
git clone https://github.com/quocdat36/time-lock-eth-wallet.git  
cd time-lock-eth-wallet
```

### 2. Thiết lập Smart Contracts

```bash
npm install
npm install @openzeppelin/contracts@3.4.2 --save
```

**Cấu hình Ganache**:

- Port: `8545`
- Network ID / Chain ID: `1337`

**Cấu hình `truffle-config.js`**:

```javascript
development: {
  host: "127.0.0.1",
  port: 8545,
  network_id: "1337"
},
compilers: {
  solc: {
    version: "^0.6.0"
  }
}
```

**Biên dịch và triển khai contract**:

```bash
truffle compile
truffle migrate --network development --reset
```

---

### 3. Thiết lập Front-end

```bash
cd client
npm install
```

**Sao chép Artifacts:**

Từ `build/contracts/` vào `client/src/contracts/`:

- AshToken.json
- TimeLockWallet.json
- TimeLockWalletFactory.json

> Hãy xóa các file cũ trước khi sao chép mới.

**Chạy front-end**:

```bash
# Nếu dùng Node.js > 17:
$env:NODE_OPTIONS="--openssl-legacy-provider"
npm start
```

Ứng dụng sẽ mở tại: [http://localhost:3000](http://localhost:3000)

---

## 🦊 Cấu hình MetaMask

- Thêm mạng Ganache:
  - RPC: `http://127.0.0.1:8545`
  - Chain ID: `1337`
- Import tài khoản Ganache (bằng private key)
- Thêm AshToken:
  - Lấy địa chỉ từ `AshToken.json` → `networks.<network_id>.address`
  - Token Symbol: `ASH`
  - Token Decimal: `18`

---

## 🔄 Luồng sử dụng cơ bản

1. Truy cập `http://localhost:3000`
2. Kết nối MetaMask
3. Tạo ví tại tab `Create Wallet`
4. Nạp thêm ở tab `Topup Wallet`
5. Rút tiền ở tab `Claim Funds` (sau khi thời gian mở khóa tới)

---

## 💰 Chuyển token ban đầu

### Cách 1: Dùng script (Khuyến nghị)

Chỉnh sửa `checkAndTransferTokens.js`:

```bash
truffle exec ./checkAndTransferTokens.js --network development
```

### Cách 2: Dùng Truffle Console

```bash
truffle console --network development
```

```javascript
let token = await AshToken.deployed();
let accounts = await web3.eth.getAccounts();
let deployer = accounts[0];
let yourMetaMask = "ĐỊA_CHỈ_METAMASK_CỦA_BẠN";
let amount = web3.utils.toWei("1000", "ether");
await token.transfer(yourMetaMask, amount, { from: deployer });
```

---

## ⏩ Tua nhanh thời gian trên Ganache

Trong `Truffle Console`:

```javascript
let seconds = 86400; // 1 ngày
await web3.currentProvider.send({
  jsonrpc: "2.0",
  method: "evm_increaseTime",
  params: [seconds],
  id: new Date().getTime()
}, () => {});
await web3.currentProvider.send({
  jsonrpc: "2.0",
  method: "evm_mine",
  params: [],
  id: new Date().getTime()
}, () => {});
```

Sau đó, reload lại trang `Claim Funds`.

---

## 📁 Cấu trúc thư mục

```
time-lock-eth-wallet/
├── build/                    # Artifacts từ Truffle
├── client/                   # React App
│   ├── public/
│   ├── src/
│   │   ├── components/       # Các trang/tính năng
│   │   ├── contracts/        # ABI JSON
│   │   ├── proxies/          # Contract instance
│   │   ├── utils/            # Hàm phụ trợ
│   │   ├── App.js
│   │   └── index.js
│   └── craco.config.js       # Nếu dùng craco
├── contracts/                # Smart Contracts
├── migrations/               # Script deploy
├── node_modules/
├── test/
├── checkAndTransferTokens.js
├── package.json
├── truffle-config.js
└── README.md
```

---

## 🤝 Đóng góp

Fork repository và tạo Pull Request nếu bạn muốn đóng góp.

---

## 📄 Giấy phép

MIT (hoặc giấy phép khác nếu bạn chọn). Hãy tạo file `LICENSE` nếu chưa có.

---

## 📌 Lưu ý
- Nếu bạn **không dùng craco**, hãy bỏ qua phần liên quan.
- Nếu bạn dùng Node 22: cần `NODE_OPTIONS=--openssl-legacy-provider`.

---

**Chúc bạn triển khai thành công! 🚀**
