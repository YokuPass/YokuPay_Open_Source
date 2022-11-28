const { Requester, Validator } = require("@chainlink/external-adapter");
const abi_YokuPay = require("../assets/abi.json").abi;
const abiDecoder = require("abi-decoder");
const axios = require("axios");
const Web3 = require("web3");
require("dotenv").config();

const { pool } = require("../assets/Database");

let jobRunID = 200;

const checkWallet = async (input, callback) => {
  try {
    console.log("Start check, with TransactionHash: ", input.data.txh);
    console.log(input.data);

    const cryptoResponse = await axios.get(
      `https://min-api.cryptocompare.com/data/price?fsym=TFUEL&tsyms=ETH&api_key={1c4ac91e6cfe6b26fdb17cd046918a29aff4d7957c32f1c1df6109ad68ad2e1c}`
    );
    console.log(cryptoResponse.data.ETH);
    const adaeth = toNumberString(cryptoResponse.data.ETH * 10 ** 18);

    const nftData = await getNFTData(input.data.txh);
    console.log(nftData);

    if (nftData.data === "none") {
      console.log("Keine Daten vorhanden");
      try {
        const deleteJob = await pool.query(
          `DELETE FROM opentheta_joblist WHERE transactionhash='${input.data.txh}';`
        );
      } catch (error) {
        console.log(error);
      }
      const result = Web3.utils.asciiToHex(
        "0x" + input.data.user + "4" + adaeth
      );
      console.log("Result: ", "0x" + input.data.user + "4" + adaeth);
      const response = { data: { result: result }, status: 200 };
      callback(jobRunID, Requester.success(jobRunID, response));
      return;
    }
    console.log(
      nftData.data.EthereumAddress === "0x" + input.data.user,
      nftData.contract === process.env.NFT_CONTRACT,
      nftData.data.NFTcontract !== undefined,
      nftData.data.MarketID !== undefined,
      nftData.data.ThetaAddress !== undefined,
      nftData.data.TokenID !== undefined,
      nftData.data.EthereumAddress !== undefined,
      nftData.data.Timestamp !== undefined
    );
    if (
      nftData.data.EthereumAddress === "0x" + input.data.user &&
      nftData.contract === process.env.NFT_CONTRACT &&
      nftData.data.NFTcontract !== undefined &&
      nftData.data.MarketID !== undefined &&
      nftData.data.ThetaAddress !== undefined &&
      nftData.data.TokenID !== undefined &&
      nftData.data.EthereumAddress !== undefined &&
      nftData.data.Timestamp !== undefined
    ) {
      console.log("Alle Daten Korrect");

      const walletData = await checkWalletAPI(
        nftData.data.ThetaAddress,
        nftData.data.TokenID,
        nftData.data.NFTcontract
      );
      console.log(walletData);

      if (walletData.status === 200) {
        const user = nftData.data.EthereumAddress;

        if (walletData.walletStatus) {
          const deleteJob = await pool.query(
            `DELETE FROM opentheta_joblist WHERE transactionhash='${input.data.txh}';`
          );
          console.log(user + "2" + adaeth);
          const result = Web3.utils.asciiToHex(user + "2" + adaeth);
          const response = { data: { result: result }, status: 200 };
          console.log("Is inside");
          callback(jobRunID, Requester.success(jobRunID, response));
          // return
        } else {
          const checkTime = await pool.query(
            `SELECT * FROM opentheta_joblist WHERE transactionhash='${input.data.txh}';`
          );
          const currentTime = Math.floor(new Date().getTime() / 1000.0);
          
          // ____________________________________________________
          // *** for Unit Tests ***
            const timeRemove = currentTime + 100
          // *** for Production ***
          // const timeRemove = checkTime.rows[0].first + 86400;
          // ____________________________________________________

          if (timeRemove <= currentTime) {
            const deleteJob = await pool.query(
              `DELETE FROM opentheta_joblist WHERE transactionhash='${input.data.txh}';`
            );
            console.log(user + "3" + adaeth);
            const result = Web3.utils.asciiToHex(user + "3" + adaeth);
            console.log("Time expired");
            const response = { data: { result: result }, status: 200 };
            callback(jobRunID, Requester.success(jobRunID, response));
          } else {
            const deleteJob = await pool.query(
              `UPDATE opentheta_joblist
              SET execute = ${currentTime + 3600}, process= ${false}
              WHERE transactionhash='${input.data.txh}';`
            );
            console.log("Not inside");
            console.log(user + "1" + adaeth);
            const result = Web3.utils.asciiToHex(user + "1" + adaeth);
            const response = { data: { result: result }, status: 200 };
            callback(jobRunID, Requester.success(jobRunID, response));
          }
        }
      } else {
        const currentTime = Math.floor(new Date().getTime() / 1000.0);
        const deleteJob = await pool.query(
          `UPDATE opentheta_joblist
        SET execute = ${currentTime + 3600}, process= ${false}
        WHERE transactionhash='${input.data.txh}';`
        );
        console.log("Not inside");
        console.log(user + "1" + adaeth);
        const result = Web3.utils.asciiToHex(user + "1" + adaeth);
        const response = { data: { result: result }, status: 200 };
        callback(jobRunID, Requester.success(jobRunID, response));
      }
    } else {
      console.log("Daten stimmen nicht überein");
      try {
        const deleteJob = await pool.query(
          `DELETE FROM opentheta_joblist WHERE transactionhash='${input.data.txh}';`
        );
      } catch (error) {
        console.log(error);
      }
      const result = Web3.utils.asciiToHex(
        "0x" + input.data.user + "4" + adaeth
      );
      console.log("Result: ", "0x" + input.data.user + "4" + adaeth);
      const response = { data: { result: result }, status: 200 };
      callback(jobRunID, Requester.success(jobRunID, response));
    }
  } catch (error) {
    console.log(error);
    callback(400, Requester.errored(jobRunID, error));
  }
};

async function getNFTData(hash) {
  abiDecoder.addABI(abi_YokuPay);
  try {
    var web3 = new Web3("https://polygon-rpc.com/");

    const responseSecond = await web3.eth.getTransaction(hash);

    const inputData = responseSecond.input;
    const contractUsed = responseSecond.to;

    const testData = inputData;
    const inputDecodeFull = abiDecoder.decodeMethod(testData);

    const ipfsLink =
      inputDecodeFull.params[inputDecodeFull.params.length - 1].value;

    const responseIPFS = await axios.get(
      "https://gateway.ipfs.io/ipfs/" + ipfsLink
    );

    return { data: responseIPFS.data, contract: contractUsed };
  } catch (error) {
    console.log(error);
    return { data: "none" };
  }
}

async function checkWalletAPI(ThetaAddress, TokenID, NFTcontract) {
  const url = `https://api.opentheta.io/my?collection=${ThetaAddress}&sort=recent-transfer&page=0`; // get all NFTs of account
  const response = await axios.get(url);
  const result = response.data.results;

  if (result.length === 0) {
    console.log("Keine results");
    return { status: 400, walletStatus: false };
  }

  for (let i = 0; i < result.length; i++) {
    const tokenID = result[i].tokenID;
    const contractAddress = result[i].address;

    if (tokenID === TokenID && contractAddress === NFTcontract) {
      console.log(tokenID, contractAddress);
      return { status: 200, walletStatus: true };
    } else if (
      (tokenID !== TokenID || contractAddress !== NFTcontract) &&
      i === result.length - 1
    ) {
      console.log("Letzte aber nichts", i);
      return { status: 200, walletStatus: false };
    }
  }
}

function toNumberString(num) {
  if (Number.isInteger(num)) {
    return num;
  } else {
    return num.toString();
  }
}

module.exports.checkWallet = checkWallet;

