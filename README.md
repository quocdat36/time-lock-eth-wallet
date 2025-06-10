# Time Locked Wallet Project

Dự án này triển khai một hệ thống ví khóa thời gian cho token ERC20, cho phép người dùng khóa token cho một người thụ hưởng cho đến một thời điểm nhất định trong tương lai. Dự án bao gồm các smart contract Solidity và một giao diện front-end React.

## Cấu trúc Dự án

-   `/contracts`: Chứa các smart contract Solidity (AshToken, TimeLockWallet, TimeLockWalletFactory, CloneFactory).
-   `/migrations`: Chứa các script để triển khai smart contract lên blockchain.
-   `/client`: Chứa ứng dụng front-end React.
-   `/build/contracts`: Chứa các file artifact (ABI, bytecode) sau khi biên dịch contract.
-   `truffle-config.js`: File cấu hình cho Truffle.
-   `package.json`: Quản lý dependencies cho phần smart contract (Truffle).
-   `client/package.json`: Quản lý dependencies cho phần front-end (React).

## Điều kiện tiên quyết

Trước khi bắt đầu, đảm bảo bạn đã cài đặt các phần mềm sau:

1.  **Node.js và npm:** Tải từ [nodejs.org](https://nodejs.org/). Nên sử dụng phiên bản LTS (ví dụ: v18.x, v20.x). Tránh các phiên bản Node.js quá mới (như v22+) nếu gặp vấn đề tương thích.
2.  **Git:** Tải từ [git-scm.com](https://git-scm.com/).
3.  **Truffle CLI:** Cài đặt toàn cục: `npm install -g truffle`
4.  **Ganache:**
    *   **Ganache UI (Khuyến nghị cho giao diện đồ họa):** Tải từ [trufflesuite.com/ganache/](https://trufflesuite.com/ganache/)
    *   Hoặc **Ganache CLI (Dòng lệnh):** `npm install -g ganache` (hoặc `ganache-cli` cho phiên bản cũ).
5.  **MetaMask:** Extension cho trình duyệt (Chrome, Firefox, Edge) từ [metamask.io](https://metamask.io/).

## Các bước Thiết lập và Chạy Dự án

### Phần 1: Thiết lập Smart Contracts (Back-end)

1.  **Clone Repository (Nếu cần):**
    ```bash
    git clone <URL_REPOSITORY_CUA_BAN>
    cd time-lock-eth-wallet
    ```

2.  **Cài đặt Dependencies cho Smart Contracts:**
    Trong thư mục gốc của dự án (`time-lock-eth-wallet`):
    ```bash
    npm install
    npm uninstall @openzeppelin/contracts # Đảm bảo gỡ bản cũ nếu có
    npm install @openzeppelin/contracts@3.4.2 # Hoặc phiên bản 3.x.x phù hợp với Solidity 0.6.x
    ```
    *Lưu ý: Nếu `npm audit` báo lỗi sau khi cài đặt, KHÔNG chạy `npm audit fix --force` vì nó có thể cập nhật OpenZeppelin lên phiên bản không tương thích.*

3.  **Cấu hình Truffle (`truffle-config.js`):**
    Đảm bảo file `truffle-config.js` được cấu hình đúng, đặc biệt là:
    *   `networks.development.port`: (ví dụ: `8545`)
    *   `compilers.solc.version`: (ví dụ: `^0.6.0`)
    *   `compilers.solc.settings.evmVersion`: (ví dụ: `petersburg`)

4.  **Khởi chạy Ganache:**
    *   **Ganache UI:** Mở ứng dụng, tạo/mở workspace, vào Settings -> Server và đặt **PORT NUMBER** thành giá trị đã cấu hình trong `truffle-config.js` (ví dụ: `8545`).
    *   **Ganache CLI:** Mở một terminal mới và chạy `ganache --port 8545` (thay `8545` bằng port của bạn). Để terminal này chạy.

5.  **Biên dịch Smart Contracts:**
    Trong terminal ở thư mục gốc dự án:
    ```bash
    truffle compile
    ```
    *Kiểm tra output, chỉ nên có cảnh báo SPDX.*

6.  **Chuẩn bị Migration Scripts:**
    *   Đảm bảo các file script trong thư mục `/migrations` được sắp xếp đúng thứ tự (ví dụ: `1_initial_migration.js`, `2_deploy_contracts.js`, `3_deploy_factory.js`).
    *   Trong `contracts/TimeLockWalletFactory.sol`, đảm bảo biến `masterContract` được khai báo là `public`: `address public masterContract;`. Nếu sửa, chạy lại `truffle compile`.

7.  **Triển khai Smart Contracts:**
    ```bash
    truffle migrate --network development --reset
    ```
    *Theo dõi output để đảm bảo tất cả các contract được triển khai thành công và ghi lại các địa chỉ contract nếu cần.*

### Phần 2: Thiết lập Giao diện Front-end (React)

1.  **Điều hướng vào thư mục `client`:**
    Từ thư mục gốc dự án:
    ```bash
    cd client
    ```

2.  **Cài đặt Dependencies cho Front-end:**
    ```bash
    npm install
    npm install process # Để khắc phục lỗi "process is not defined"
    npm install --save-dev cross-env # Để đặt NODE_OPTIONS dễ dàng (tùy chọn)
    ```

3.  **Sao chép Contract Artifacts (ABI):**
    *   Tạo thư mục `client/src/contracts` (hoặc `client/src/abis`).
    *   Sao chép các file JSON artifact cần thiết từ thư mục `/build/contracts` (của dự án gốc) vào thư mục `client/src/contracts/` vừa tạo. Các file quan trọng:
        *   `AshToken.json`
        *   `TimeLockWallet.json`
        *   `TimeLockWalletFactory.json`

4.  **Cập nhật Đường dẫn Import Artifact trong Code Front-end:**
    *   Kiểm tra các file JavaScript trong `client/src/` (đặc biệt là trong `proxies/`) đang import các file ABI.
    *   Đảm bảo đường dẫn import trỏ đúng đến vị trí mới của các file JSON (ví dụ: `import AshTokenABI from '../contracts/AshToken.json';`).
    *   **Đặc biệt kiểm tra `client/src/proxies/Wallet.js`:** Đảm bảo nó import ABI của `TimeLockWallet` từ `../contracts/TimeLockWallet.json` chứ không phải từ `../constants`.

5.  **Xử lý lỗi `process is not defined`:**
    Mở file `client/src/index.js`. Thêm các dòng sau vào **ĐẦU TIÊN** của file, trước tất cả các `import` khác:
    ```javascript
    import process from 'process';
    window.process = process;

    // Các import khác (React, ReactDOM, App, ...) phải nằm SAU các dòng trên
    import React from 'react';
    // ...
    ```
    Đảm bảo tất cả các câu lệnh `import` khác nằm sau 2 dòng trên, và code thực thi (`window.process = process;`) nằm sau tất cả các `import`.

6.  **Cấu hình `NODE_OPTIONS` cho `npm start` (Khắc phục lỗi OpenSSL với Node.js mới):**
    Sửa file `client/package.json`. Trong phần `"scripts"`, thay đổi dòng `"start"`:
    ```json
    "scripts": {
      "start": "cross-env NODE_OPTIONS=--openssl-legacy-provider react-scripts start",
      // ... các script khác
    }
    ```

7.  **Chạy Server Phát triển Front-end:**
    Trong terminal (đang ở thư mục `client`):
    ```bash
    npm start
    ```
    *Ứng dụng sẽ mở trong trình duyệt, thường ở `http://localhost:3000`.*

### Phần 3: Cấu hình MetaMask và Tương tác

1.  **Cài đặt và Mở MetaMask.**
2.  **Kết nối MetaMask với Mạng Ganache Cục bộ:**
    *   Thêm mạng mới trong MetaMask:
        *   Network Name: `Ganache` (hoặc tên tùy chọn)
        *   New RPC URL: `http://127.0.0.1:8545` (hoặc port Ganache của bạn)
        *   Chain ID: Phải khớp với Chain ID của Ganache đang chạy (xem output của `truffle migrate`, ví dụ: `2025`, hoặc `5777` cho Ganache UI mặc định, `1337` cho Ganache CLI mặc định).
        *   Currency Symbol: `ETH`
    *   Chọn mạng Ganache này trong MetaMask.

3.  **Import Tài khoản từ Ganache vào MetaMask:**
    *   Lấy Private Key của một tài khoản từ Ganache (tài khoản có ETH ảo).
    *   Trong MetaMask, chọn "Import Account" và dán Private Key vào.
    *   Đảm bảo tài khoản này được chọn trong MetaMask và có hiển thị số dư ETH ảo.

4.  **Import `AshToken` vào MetaMask:**
    *   Lấy địa chỉ contract của `AshToken` đã triển khai (từ output `truffle migrate`).
    *   Trong MetaMask, vào "Assets" -> "Import tokens", dán địa chỉ contract `AshToken`. MetaMask sẽ tự điền Symbol và Decimals.

5.  **Tương tác với Ứng dụng:**
    *   Làm mới trang web front-end (`http://localhost:3000`).
    *   Kết nối ví MetaMask với ứng dụng nếu được yêu cầu.
    *   Thử các chức năng: Create Wallet, Topup Wallet, Claim Funds.
    *   Xác nhận các giao dịch trong MetaMask (đảm bảo bạn đang ở mạng Ganache và phí gas hợp lý).

## Gỡ lỗi

*   **Console Trình duyệt (F12):** Luôn kiểm tra tab "Console" để tìm lỗi JavaScript phía client.
*   **Terminal `npm start`:** Xem output build của front-end.
*   **Terminal `truffle migrate`:** Xem output triển khai contract.
*   **Vấn đề Web3 Provider trong Front-end:**
    *   Các file trong `client/src/proxies/` (ví dụ: `Provider.js`, `Token.js`, `WalletFactory.js`) sử dụng một `HttpProvider` riêng. Điều này chỉ cho phép đọc dữ liệu, không ký được giao dịch.
    *   Để khắc phục triệt để và cho phép ký giao dịch từ các proxy này, cần tái cấu trúc để chúng sử dụng instance Web3 được kết nối qua MetaMask (ví dụ, khởi tạo ở `App.js` và truyền xuống qua props hoặc Context API). Các ví dụ sửa đổi đã được thảo luận trong quá trình gỡ lỗi. Hiện tại, các component (`Create.jsx`, `Topup.jsx`, `Claim.jsx`) có thể đang tự khởi tạo Web3 từ `window.ethereum` cho các thao tác gửi giao dịch, nhưng các proxy được import có thể không dùng chung instance đó.