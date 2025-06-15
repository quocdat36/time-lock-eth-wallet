# Time Locked Wallet - Ví Khóa Thời Gian (ETH & ERC20)

Dự án này triển khai một hệ thống "Ví Khóa Thời Gian" trên blockchain Ethereum. Nó cho phép người dùng tạo ra các ví có khả năng giữ Ether và token ERC20 (cụ thể là AshToken trong ví dụ này), và chỉ cho phép người thụ hưởng được chỉ định rút tài sản sau một thời điểm nhất định trong tương lai.

Dự án bao gồm:
*   **Smart Contracts (Solidity):** Được viết bằng Solidity và sử dụng Truffle Suite để biên dịch, triển khai và kiểm thử.
    *   `AshToken.sol`: Một token ERC20 đơn giản để làm ví dụ.
    *   `TimeLockWallet.sol`: Contract mẫu (implementation) cho các ví khóa thời gian.
    *   `TimeLockWalletFactory.sol`: Factory contract để tạo ra các bản sao (clone) của `TimeLockWallet` một cách tiết kiệm gas, sử dụng EIP-1167 (thông qua `CloneFactory.sol`).
    *   `CloneFactory.sol`: Thư viện để tạo minimal proxy contract.
*   **Giao diện Người dùng (Front-end):** Được xây dựng bằng React (sử dụng Create React App, có thể đã được tùy chỉnh bằng `craco`) để tương tác với các smart contract.

## Các Chức Năng Chính

*   **Tạo Ví Khóa Thời Gian (Create Wallet):**
    *   Chỉ định người thụ hưởng (beneficiary).
    *   Đặt thời gian mở khóa (release time) trong tương lai.
    *   Gửi kèm Ether và/hoặc AshToken vào ví (các giao dịch này xảy ra sau khi ví được tạo).
*   **Nạp Thêm vào Ví (Topup Wallet):**
    *   Nạp thêm Ether hoặc AshToken vào một ví khóa thời gian đã tồn tại.
*   **Rút Tiền/Token (Claim Funds):**
    *   Chỉ người thụ hưởng mới có thể rút.
    *   Chỉ có thể rút sau khi thời gian mở khóa đã đến.
    *   Rút riêng Ether và AshToken.

## Yêu Cầu Hệ Thống

*   [Node.js](https://nodejs.org/) (phiên bản 18.x hoặc 20.x LTS được khuyến nghị. Node v22 có thể yêu cầu `NODE_OPTIONS=--openssl-legacy-provider` cho một số công cụ)
*   [npm](https://www.npmjs.com/) (thường đi kèm với Node.js)
*   [Truffle Suite](https://www.trufflesuite.com/truffle) (cài đặt toàn cục): `npm install -g truffle`
*   [Ganache](https://www.trufflesuite.com/ganache) (GUI hoặc CLI) cho blockchain cục bộ.
*   [MetaMask](https://metamask.io/) extension cho trình duyệt.

## Cài đặt và Chạy Dự Án

**1. Clone Repository:**
   ```bash
   git clone https://github.com/ten_cua_ban/time-lock-eth-wallet.git # << THAY BẰNG URL REPO CỦA BẠN
   cd time-lock-eth-wallet


2. Thiết lập Phần Smart Contracts (Back-end):

Điều hướng vào thư mục gốc của dự án.

Cài đặt dependencies:
bash npm install # Cài đặt phiên bản OpenZeppelin Contracts tương thích với Solidity 0.6.x npm install @openzeppelin/contracts@3.4.2 --save
Lưu ý: Nếu npm audit báo lỗi, KHÔNG chạy npm audit fix --force vì nó có thể cập nhật các package lên phiên bản không tương thích.

Cấu hình Ganache:
* Mở Ganache (GUI hoặc CLI).
* Đảm bảo nó đang chạy ở Port 8545.
* Đặt Network ID / Chain ID thành 1337 (hoặc một giá trị nhất quán bạn chọn).
* (Nếu dùng Ganache UI, sau khi thay đổi cài đặt, hãy khởi động lại Workspace).
* (Nếu dùng Ganache CLI, chạy: ganache --port 8545 --networkId 1337)

Cấu hình Truffle:
Mở truffle-config.js và đảm bảo phần networks.development khớp với cài đặt Ganache của bạn:
javascript development: { host: "127.0.0.1", port: 8545, network_id: "1337", // Nên khớp với Ganache và MetaMask },
Và phần compilers.solc.version là ^0.6.0.

Biên dịch Smart Contracts:
bash truffle compile

Triển khai Smart Contracts lên Ganache:
bash truffle migrate --network development --reset

3. Thiết lập Phần Giao diện Người dùng (Front-end):

Điều hướng vào thư mục client:
bash cd client

Cài đặt dependencies:
bash npm install # Các polyfill và thư viện notification (ví dụ react-toastify) đã có trong package.json # Nếu bạn dùng craco, đảm bảo @craco/craco và các polyfill liên quan đã được cài.

Sao chép Artifacts (QUAN TRỌNG):
Sau mỗi lần chạy truffle migrate thành công, các file JSON artifact trong thư mục build/contracts/ (ở thư mục gốc dự án) sẽ được cập nhật. Bạn cần sao chép các file sau vào thư mục client/src/contracts/:
* AshToken.json
* TimeLockWallet.json
* TimeLockWalletFactory.json
Xóa các file cũ trong client/src/contracts/ trước khi sao chép file mới để đảm bảo.

Chạy Server Phát triển Front-end:
```bash
# Đối với Windows PowerShell (nếu dùng Node.js > 17)
$env:NODE_OPTIONS="--openssl-legacy-provider"
npm start

# Hoặc nếu bạn đã sửa package.json để dùng craco và cross-env:
  # npm start
  ```
  Ứng dụng sẽ thường mở ở `http://localhost:3000`.
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
IGNORE_WHEN_COPYING_END

4. Cấu hình MetaMask:

Cài đặt MetaMask extension.

Thêm mạng Ganache cục bộ:
* Network Name: Ganache 1337 (ví dụ)
* New RPC URL: http://127.0.0.1:8545
* Chain ID: 1337 (Phải khớp với Ganache và truffle-config.js nếu bạn đặt cụ thể)
* Currency Symbol: ETH

Kết nối MetaMask với mạng Ganache này.

Import một tài khoản từ Ganache vào MetaMask (sử dụng private key). Đây sẽ là tài khoản bạn dùng để tương tác với dApp.

Import AshToken vào danh sách token của MetaMask:
1. Trong MetaMask, vào tab "Assets".
2. Nhấp "Import tokens".
3. Dán địa chỉ của AshToken đã triển khai (lấy từ output của truffle migrate hoặc từ file client/src/contracts/AshToken.json phần networks.<your_network_id>.address).
4. MetaMask sẽ tự động điền "Token Symbol" (ASH) và "Token Decimal". Nhấp "Add Custom Token".

Luồng Sử dụng Cơ bản

Mở trình duyệt và truy cập http://localhost:3000.

Kết nối ví MetaMask với ứng dụng khi được yêu cầu. Đảm bảo bạn đang ở đúng mạng đã cấu hình.

Sử dụng trang "Create Wallet" để tạo một ví khóa thời gian mới.

Sử dụng trang "Topup Wallet" để nạp thêm Ether/AshToken.

Sử dụng trang "Claim Funds" để xem và rút tài sản (sau khi thời gian mở khóa đến - bạn có thể cần tua nhanh thời gian trên Ganache để test).

Để Chuyển Token Ban Đầu cho Tài khoản Test (Ví dụ: MetaMask)

Tài khoản triển khai AshToken (thường là accounts[0] trong Ganache) sẽ nhận 10000 ASH ban đầu. Nếu tài khoản MetaMask bạn dùng để tương tác khác với tài khoản này, bạn cần chuyển ASH sang.

Cách 1: Sử dụng Script checkAndTransferTokens.js (Khuyến nghị)

Chỉnh sửa địa chỉ metamaskUserAccount trong file checkAndTransferTokens.js thành địa chỉ MetaMask của bạn.

Từ thư mục gốc dự án, chạy:

truffle exec ./checkAndTransferTokens.js --network development
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Bash
IGNORE_WHEN_COPYING_END

Script sẽ kiểm tra và chuyển 1000 ASH nếu cần.

Cách 2: Sử dụng Truffle Console

truffle console --network development
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Bash
IGNORE_WHEN_COPYING_END

Bên trong console:

let token = await AshToken.deployed();
let accounts = await web3.eth.getAccounts();
let deployerAccount = accounts[0];
let yourMetaMaskAccount = "ĐỊA_CHỈ_METAMASK_CỦA_BẠN";
let amount = web3.utils.toWei("1000", "ether"); // Gửi 1000 ASH

await token.transfer(yourMetaMaskAccount, amount, { from: deployerAccount });
console.log("Transferred 1000 ASH to", yourMetaMaskAccount);
(await token.balanceOf(yourMetaMaskAccount)).toString();
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
JavaScript
IGNORE_WHEN_COPYING_END
Tua Nhanh Thời Gian trên Ganache (Để Test Chức Năng Claim)

Sử dụng Truffle Console:

// Trong Truffle Console
// Ví dụ tua nhanh 1 ngày (86400 giây)
let secondsToIncrease = 86400; // Thay đổi số giây nếu cần
await web3.currentProvider.send({ jsonrpc: "2.0", method: "evm_increaseTime", params: [secondsToIncrease], id: new Date().getTime() }, () => {});
await web3.currentProvider.send({ jsonrpc: "2.0", method: "evm_mine", params: [], id: new Date().getTime() }, () => {});
console.log(`Time on Ganache increased by ${secondsToIncrease} seconds.`);
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
JavaScript
IGNORE_WHEN_COPYING_END

Sau đó, tải lại trang "Claim Funds" trên front-end.

Cấu trúc Thư mục (Sơ lược)
time-lock-eth-wallet/
├── build/                    # Artifacts sau khi compile (Truffle)
├── client/                   # Code Front-end (React)
│   ├── public/
│   ├── src/
│   │   ├── components/       # Các React components (Create, Topup, Claim)
│   │   ├── contracts/        # Bản sao của các ABI JSON từ build/contracts
│   │   ├── proxies/          # Các file khởi tạo contract instance cho front-end
│   │   ├── utils/            # Các hàm tiện ích (ví dụ: notification)
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── craco.config.js       # (Nếu bạn đã cài đặt và sử dụng craco)
├── contracts/                # Smart Contracts (.sol)
├── migrations/               # Script triển khai (Truffle)
├── node_modules/             # Dependencies của Truffle project
├── test/                     # (Nên có thư mục test cho smart contracts)
├── checkAndTransferTokens.js # Script ví dụ cho truffle exec
├── package.json              # Cho Truffle project
├── truffle-config.js
└── README.md
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
IGNORE_WHEN_COPYING_END
Đóng góp

Nếu bạn muốn đóng góp, vui lòng fork repository và tạo một Pull Request.

Giấy phép

MIT (Hoặc giấy phép bạn chọn - tạo file LICENSE nếu chưa có)

**Lưu ý khi sử dụng file README này:**

*   **Thay thế `<URL_REPOSITORY_CUA_BAN>`** bằng URL GitHub thực tế của bạn.
*   **Đảm bảo các đường dẫn và tên file** (ví dụ: `client/src/contracts/`, `checkAndTransferTokens.js`) khớp với cấu trúc dự án của bạn.
*   **Phiên bản:** Các hướng dẫn về phiên bản (Node, OpenZeppelin, React) là gợi ý dựa trên quá trình gỡ lỗi của chúng ta. Nếu bạn dùng phiên bản khác, có thể cần điều chỉnh.
*   **CRCO:** Tôi đã thêm ghi chú về `craco.config.js`. Nếu bạn không dùng `craco`, hãy bỏ qua phần đó.
*   **LICENSE:** Hãy tạo một file `LICENSE` (ví dụ: MIT License) nếu bạn muốn công khai mã nguồn.

Hy vọng file README này sẽ hữu ích!
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
IGNORE_WHEN_COPYING_END
