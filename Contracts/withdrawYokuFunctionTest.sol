// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.7.0;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract withdrawYokuFunctionTest  {
    
    uint public payBack;
    uint public priceIncrease;
    uint public collateral;
    uint public balWithoutCollateral;
    string public status1;

    struct UserData {
        address userAdress;
        uint balance;
        uint time;
        uint exchangeRateDeposit;
        string receipts;
    }

    mapping(address => UserData) private userMap;

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

    function withdrawYoku(address userwallet, uint stateResponse, uint exchangeRateWithdraw) public  {

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
                    status1 = "backCollateralPercentage";

                } else {
                    // the currency increased by over 2%, so we keep the complete collateral
                    status1 = "keepCollateral";
                }
                    } else {
                    // the currency did not increase, so the user receives the whole collateral back
                    status1 = "backCollateralComplete";
                }
            
        } else if (stateResponse == 3){ //send back to user
            status1 = "sendBackToUser";
        }
    }

    // Utilities

    function isExists(address key) private view returns (bool) {

        if(userMap[key].time != 0){
            return true;
        } 
        return false;
    }

}