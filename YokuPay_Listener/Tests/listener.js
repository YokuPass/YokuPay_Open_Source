// get events
const Web3 = require("web3");
const fs = require("fs");
const axios = require("axios");
const abiDecoder = require("abi-decoder");
const abi_YokuPay = require("./metro.json").abi;
const thetaAbi = require("./theta.json").abi;
const cron = require("node-cron");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const qs = require("qs");
require("dotenv").config();

const web3 = new Web3(
  "wss://polygon-mainnet.g.alchemy.com/v2/pxakFjcPKrjKpsfwu3Cxq6RShQhbbBj6"
);

cron.schedule("*/1 * * * * *", function () {
  callBuy();
});

var jsonFile = "processing.json";
var parsed = JSON.parse(fs.readFileSync(jsonFile));
const ABI = parsed.abi;

const CONTRACT_ADDRESS = "0x23296F6BE5c63FCcfd24EA264649CDDb258Cf5e0";
const myContract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

const externalProvider = new HDWalletProvider(
  "30737366b2478cd4a76649a8b794ea9000ac8bf87772ae5fa04ed2334524a80e", // Mein Privat Key
  "https://eth-rpc-api.thetatoken.org/rpc"
);

var theta3 = new Web3(externalProvider);

var contract_721 = new theta3.eth.Contract(
  thetaAbi,
  "0x9533898D2FCD45AE6d95a5E87c2f78a53B792099" //Contract Address // Alter Contract: 0x3A79784B405a181830E2C01e2d5173b8daC4001b
);

const myAccount = theta3.eth.accounts.privateKeyToAccount(
  "30737366b2478cd4a76649a8b794ea9000ac8bf87772ae5fa04ed2334524a80e"
);

var depositArray = [];

let options = {
  filter: {
    value: [],
  },
  fromBlock: 0,
};

myContract.events.DepositSuccess(options).on("data", (event) => {
  console.log(event);
  const ReceiptHash = event.returnValues.txhash;
  const DepositValue = event.returnValues.depositValue;

  if (DepositValue > 300000) {
    depositArray.push(ReceiptHash);
  } else {
    console.log("error the person sent us too little funds -- do nothing");
  }
});

async function callBuy() {
  if (depositArray.length != 0) {
    const encodedTxh = depositArray[0];
    console.log(depositArray);

    try {
      const dataHash = await getNFTData(encodedTxh);
      const NFTContract = dataHash.data.NFTcontract;
      const marketID = dataHash.data.MarketID;
      const NFTid = dataHash.data.TokenID;
      const price = dataHash.data.Amount;
      const user = dataHash.data.ThetaAddress;

      const contract2 = await contract_721.methods
        .buyNFT(NFTContract, marketID, NFTid, user)
        .send({
          from: "0x26Bc9a6b8e9140d0d4c44BD6f3369162aEe68703",
          value: price,
        });
      console.log("buying theta nft");
      // if fine, give to processing server the ok
      sendToJobs(encodedTxh, marketID, user);
      depositArray.shift();

    } catch (error) {
      console.log(error);
      depositArray.shift();
    }
  } else {
    console.log("no new deposits");
  }
}

async function sendToJobs(billingNFT, marketID, payAddress) {
  var data = qs.stringify({
    transactionHash: billingNFT,
    marketID,
    ethereumAddress: payAddress,
  });

  console.log("Steve Jobs basbbbbbyyy");

  var config = {
    method: "post",
    url: "https://job.yokupass.com/yokupay/opentheta/checkUTXO",
    headers: {
      Authorization: process.env.REACT_APP_BEAR,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: data,
  };
  axios(config);
}

async function getNFTData(hash) {
  abiDecoder.addABI(abi_YokuPay);
  try {
    var pol3 = new Web3("https://polygon-rpc.com/");

    const responseSecond = await pol3.eth.getTransaction(hash);

    const inputData = responseSecond.input;
    const contractUsed = responseSecond.to;

    const testData = inputData;
    const inputDecodeFull = abiDecoder.decodeMethod(testData);

    const ipfsLink =
      inputDecodeFull.params[inputDecodeFull.params.length - 1].value;

    const responseIPFS = await axios.get(
      "https://gateway.ipfs.io/ipfs/" + ipfsLink
    );
    // console.log(responseIPFS.data);
    return { data: responseIPFS.data, contract: contractUsed };
  } catch (error) {
    console.log(error);
    return { data: "none" };
  }
}


