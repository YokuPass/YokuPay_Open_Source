// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.7.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol";

contract Purchase_OpenTheta_NFT {

    function buyNFT(address NFTcontract, uint marketID, uint NFTid, uint price, address customer) public payable {
        openThetaContract(0xbB5f35D40132A0478f6aa91e79962e9F752167EA).createMarketSale{value:price}(NFTcontract, marketID);
        ERC721 token = ERC721(NFTcontract);
        token.transferFrom(address(this), customer, NFTid);
    }
}

interface openThetaContract {
    function createMarketSale(address value, uint256 value2) external payable;
}