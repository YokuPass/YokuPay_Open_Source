const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
require("dotenv").config();

const contractABI = require("../mintAssets/opentThetaABI.json").abi;

const externalProvider = new HDWalletProvider(
  process.env.DB_FUNNY, // Mein Privat Key
  "https://eth-rpc-api.thetatoken.org/rpc"
);

var web3 = new Web3(externalProvider);

var contract_721 = new web3.eth.Contract(
  contractABI,
  "0xbb5f35d40132a0478f6aa91e79962e9f752167ea" //Contract Address 
);

async function BuyNFT(nftContract, marketID, value) {
  try {
    console.log(nftContract, marketID, value)
    const contractCall = await contract_721.methods
      .createMarketSale(nftContract, Number(marketID))
      .send({
        from: "0x7e1BBDDe3cB26F406800868f10105592d507bD07",
        value,
      });
    console.log(contractCall);
    return contractCall;
  } catch (error) {
    console.log(error);
    return(error)
  }
}

module.exports.BuyNFT = BuyNFT;