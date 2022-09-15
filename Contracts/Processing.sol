// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.7.0;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract Processing is ChainlinkClient, ConfirmedOwner {
    
    using Chainlink for Chainlink.Request;
    
    address private oracle;
    bytes32 private jobId;
    bytes32 private jobIdExhange;
    uint256 private feeCardano;

    bytes private data;
    string private responseString;

    uint private payBack;
    uint private priceIncrease;
    uint private collateral;
    uint private balWithoutCollateral;

    struct UserData {
        address userAdress;
        uint balance;
        uint time;
        uint exchangeRateDeposit;
        string receipts;
    }

    mapping(address => UserData) private userMap;

    event RequestFulfilled(bytes32 indexed requestId, bytes indexed data);
    
    bool internal locked;

    constructor() ConfirmedOwner(msg.sender) {
        //Cardano
        setChainlinkToken(0x01BE23585060835E02B77ef475b0Cc51aA1e0709);
        setChainlinkOracle(0x74470250698C9385EEE071b96A87cc3320fDcbb2);
        jobId = "c53ea629d9d146de99badc2102b42c16";
        feeCardano = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
    }

    // Functions for Cardano Oracle

    /**
     * @notice Request variable bytes from the oracle
     */
    function requestBytes(address _user) public {

        require(userMap[_user].balance != 0, "The user must have a positive balance");

        Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfillBytes.selector);
        req.add("txh", userMap[_user].receipts);
        req.add("user", toAsciiString(_user));
            
        sendChainlinkRequest(req, feeCardano);
    }

    /**
     * @notice Fulfillment function for variable bytes
     * @dev This is called by the oracle. recordChainlinkFulfillment must be used.
     */
    function fulfillBytes(bytes32 requestId, bytes memory bytesData) public recordChainlinkFulfillment(requestId) {
        emit RequestFulfilled(requestId, bytesData);
        data = bytesData;
        responseString = string(data); //Contains the user address and the status of the NFT -- needs to be split

        withdrawYoku(parseAddr(getSlice(1, 42, responseString)), stringToUint(getSlice(43, 43, responseString)), stringToUint(getSlice(44, getStringLength(responseString), responseString)));
    }

    // function the user can deposit to

    function deposit(string memory _fromCall, uint _exchangeRate) public payable {

        require(!isExists(msg.sender), "Please wait until the last process is completed, before starting another");
        require(msg.value > 0, "The transaction value cant be zero");

        userMap[msg.sender].balance += msg.value;
        userMap[msg.sender].time = block.timestamp;
        userMap[msg.sender].receipts = _fromCall;
        userMap[msg.sender].exchangeRateDeposit = _exchangeRate;
        userMap[msg.sender].userAdress = msg.sender;
    }

    // function processes and handles the response of the chainlink external adapters

    function withdrawYoku(address userwallet, uint stateResponse, uint exchangeRateWithdraw) private  {

        uint bal = userMap[userwallet].balance;
        require(bal > 0, "the user has no balance, something went wrong");

        if (stateResponse == 2) { //successful
            //calculating the remaining collateral that gets sent back to the customer
            if (exchangeRateWithdraw > userMap[userwallet].exchangeRateDeposit) {  // if true, the currency of the marketplace got more expensive, and we need to keep some of the collateral
                
                balWithoutCollateral = (userMap[userwallet].balance * 100) / 102;
                collateral = userMap[userwallet].balance - balWithoutCollateral;

                //calculating the price increase of the currency
                priceIncrease = ((exchangeRateWithdraw * 100) - (userMap[userwallet].exchangeRateDeposit * 100)) / (exchangeRateWithdraw / 100);

                if (priceIncrease < 200) { //the price increase is under 2%, we need to calculate how much of the collateral can be sent back
                    
                    payBack = collateral - ((priceIncrease * collateral) / 200);

                    if (sendEther(payable(userwallet), payBack)){
                        userMap[userwallet].balance = userMap[userwallet].balance - payBack;
                        if (sendEther(payable(0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB), userMap[userwallet].balance)){
                            delete userMap[userwallet];
                        }
                    }
                } else {
                    // the currency increased by over 2%, so we keep the complete collateral
                    if (sendEther(payable(0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB), userMap[userwallet].balance)){
                        delete userMap[userwallet];
                    } 
                }
                    } else {
                    // the currency did not increase, so the user receives the whole collateral back
                    if (sendEther(payable(userwallet), collateral)){
                        userMap[userwallet].balance = userMap[userwallet].balance - collateral;
                        if(sendEther(payable(0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB), userMap[userwallet].balance)){
                            delete userMap[userwallet];
                        } 
                    }
                }
            
        } else if (stateResponse == 3){ //send back to user
            if (sendEther(payable(userwallet), userMap[userwallet].balance)){
                delete userMap[userwallet];
            }
        }
    }

    // Function for users to withdraw their funds, if they did not receive their funds or NFT automatically for some reason

    function withdraw() public noReentrant {

        require(userMap[msg.sender].time < block.timestamp - 24 hours, "You can only withdraw your funds after 24h. Please be patient or contact the support.");

        uint bal = userMap[msg.sender].balance;
        require(bal > 0);
        if (sendEther(payable(msg.sender), userMap[msg.sender].balance)){
            delete userMap[msg.sender];
        }
        
    }

    // Utilities

    function sendEther(address payable _addr, uint _value) private returns (bool) {
        // _to can't be zero address
        // no error message provided
        // If you do not provide a string argument to require, 
        // it will revert with empty error data
        require(_addr != address(0x00), "Must be a valid address");
        
        _addr.transfer(_value);
        return true;
    }

    function isExists(address key) private view returns (bool) {

        if(userMap[key].time != 0){
            return true;
        } 
        return false;
    }

    modifier noReentrant() {
        require(!locked, "This function is locked, until the current process is complete");
            locked = true;
            _;
            locked = false;
    }

    function stringToUint(string memory s) internal pure returns (uint result) {
        bytes memory b = bytes(s);
        uint i;
        result = 0;
        for (i = 0; i < b.length; i++) {
            uint c = uint(uint8(b[i]));
            if (c >= 48 && c <= 57) {
                result = result * 10 + (c - 48);
            }
        }
    }

    function toAsciiString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint(uint160(x)) / (2**(8*(19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2*i] = char(hi);
            s[2*i+1] = char(lo);            
        }
        return string(s);
    }

    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }

    function getSlice(uint256 begin, uint256 end, string memory text) internal pure returns (string memory) {
        bytes memory a = new bytes(end-begin+1);
        for(uint i=0;i<=end-begin;i++){
            a[i] = bytes(text)[i+begin-1];
        }
        return string(a);    
    }

    function parseAddr(string memory _a) internal pure returns (address _parsedAddress) {
        bytes memory tmp = bytes(_a);
        uint160 iaddr = 0;
        uint160 b1;
        uint160 b2;
        for (uint i = 2; i < 2 + 2 * 20; i += 2) {
            iaddr *= 256;
            b1 = uint160(uint8(tmp[i]));
            b2 = uint160(uint8(tmp[i + 1]));
            if ((b1 >= 97) && (b1 <= 102)) {
                b1 -= 87;
            } else if ((b1 >= 65) && (b1 <= 70)) {
                b1 -= 55;
            } else if ((b1 >= 48) && (b1 <= 57)) {
                b1 -= 48;
            }
            if ((b2 >= 97) && (b2 <= 102)) {
                b2 -= 87;
            } else if ((b2 >= 65) && (b2 <= 70)) {
                b2 -= 55;
            } else if ((b2 >= 48) && (b2 <= 57)) {
                b2 -= 48;
            }
            iaddr += (b1 * 16 + b2);
        }
        return address(iaddr);
    }

    function getStringLength(string memory b) internal pure returns ( uint256) {
        return bytes(b).length;
    }
}