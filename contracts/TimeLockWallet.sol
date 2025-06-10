pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TimeLockWallet {
    using SafeERC20 for IERC20;

    // ERC20 basic token contract being held
    IERC20 private _token;

    // beneficiary of tokens after they are released
    address private _beneficiary;

    // timestamp when token release is enabled
    uint256 private _releaseTime;

    address private _creator;

    uint256 private _createdTime;

    modifier onlyOwner {
        require(msg.sender == _beneficiary);
        _;
    }

    function init(
        IERC20 token_,
        address beneficiary_,
        address creator_,
        uint256 createdTime_,
        uint256 releaseTime_
    ) external {
        // solhint-disable-next-line not-rely-on-time
        require(
            releaseTime_ > block.timestamp,
            "TokenTimelock: release time is before current time"
        );
        _token = token_;
        _beneficiary = beneficiary_;
        _creator = creator_;
        _createdTime = createdTime_;
        _releaseTime = releaseTime_;
    }

    /**
     * @return the token being held.
     */
    function token() public view virtual returns (IERC20) {
        return _token;
    }

    /**
     * @return the beneficiary of the tokens.
     */
    function beneficiary() public view virtual returns (address) {
        return _beneficiary;
    }

    function creator() public view virtual returns (address) {
        return _creator;
    }

    function createdTime() public view virtual returns (uint256) {
        return _createdTime;
    }

    /**
     * @return the time when the tokens are released.
     */
    function releaseTime() public view virtual returns (uint256) {
        return _releaseTime;
    }

    
    // ==================================================
    // ===== BẠN SẼ THÊM HÀM MỚI VÀO ĐÂY (HOẶC GẦN ĐÂY) =====
    // ==================================================
    /**
     * @notice Allows an external account (e.g., the creator or any approved address)
     * to deposit ERC20 tokens into this timelock wallet.
     * The caller must have approved this contract to spend tokens on their behalf.
     * @param amount The amount of tokens to deposit.
     */
    function depositTokens(uint256 amount) external {
        require(address(_token) != address(0), "TimeLockWallet: token not set"); // Đảm bảo token đã được init
        require(amount > 0, "TimeLockWallet: amount must be greater than zero");
        // Người gọi (msg.sender) phải approve cho contract này (address(this)) được quyền rút 'amount' token từ họ.
        // Hàm token() trả về instance IERC20 của _token.
        require(token().allowance(msg.sender, address(this)) >= amount, "TimeLockWallet: Token allowance too low");
        token().safeTransferFrom(msg.sender, address(this), amount);
    }
    // ==================================================
    // ==================================================

    /**
     * @notice Transfers tokens held by timelock to beneficiary.
     */
    function releaseToken() public virtual onlyOwner {
        // solhint-disable-next-line not-rely-on-time
        require(
            block.timestamp >= releaseTime(),
            "TokenTimelock: current time is before release time"
        );

        uint256 amount = token().balanceOf(address(this));
        require(amount > 0, "TokenTimelock: no tokens to release");

        token().safeTransfer(beneficiary(), amount);
    }

    function depositEther() public payable {}

    function getEtherBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function releaseEther() public onlyOwner {
        // solhint-disable-next-line not-rely-on-time
        require(
            block.timestamp >= releaseTime(),
            "Current time is before release time"
        );

        uint256 amount = address(this).balance;
        require(amount > 0, "No Ethers to release");

        payable(msg.sender).transfer(amount);
    }

    function getWalletDetails()
        public
        view
        returns (
            address,
            address,
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        return (
            _beneficiary,
            _creator,
            _releaseTime,
            _createdTime,
            address(this).balance,
            token().balanceOf(address(this))
        );
    }
}
