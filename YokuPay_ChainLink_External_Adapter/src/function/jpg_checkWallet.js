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
      `https://min-api.cryptocompare.com/data/price?fsym=ADA&tsyms=MATIC&api_key={1c4ac91e6cfe6b26fdb17cd046918a29aff4d7957c32f1c1df6109ad68ad2e1c}`
    );
    console.log(cryptoResponse.data.ETH);
    const adaeth = toNumberString(cryptoResponse.data.ETH * 10 ** 18);

    const nftData = await getNFTData(input.data.txh);
    console.log(nftData);

    if (nftData.data === "none") {
      console.log("Keine Daten vorhanden");
      try {
        const deleteJob = await pool.query(
          `DELETE FROM yokupay_joblist WHERE transactionhash='${input.data.txh}';`
        );
      } catch (error) {
        console.log(error);
      }
      const result = Web3.utils.asciiToHex("0x" + input.data.user + "4" + adaeth);
      const response = { data: { result: result }, status: 200 };
      callback(jobRunID, Requester.success(jobRunID, response));
      return;
    }
    console.log(
      nftData.data.EthereumAddress === "0x" + input.data.user,
      nftData.contract === process.env.NFT_CONTRACT,
      nftData.data.PolicyID !== undefined,
      nftData.data.AssetID !== undefined,
      nftData.data.CardanoAddress !== undefined,
      nftData.data.CardanoStakeAddress !== undefined,
      nftData.data.EthereumAddress !== undefined,
      nftData.data.Time !== undefined
    )
    if (
      nftData.data.EthereumAddress === "0x" + input.data.user &&
      nftData.contract === process.env.NFT_CONTRACT &&
      nftData.data.PolicyID !== undefined &&
      nftData.data.AssetID !== undefined &&
      nftData.data.CardanoAddress !== undefined &&
      nftData.data.CardanoStakeAddress !== undefined &&
      nftData.data.EthereumAddress !== undefined &&
      nftData.data.Time !== undefined
    ) {
      console.log("Alle Daten Korrect");
      const cliResponse = await axios.get(
        `http://23.88.50.29:6001/cardanoNode/checkUTXO?addr=${nftData.data.CardanoAddress}`
      );
      console.log(cliResponse.data);
      const data = cliResponse.data;
      if (data.status === 200) {
        const string = cliResponse.data.body;
        const myArray = string.split(" ");
        cleanArray = myArray.filter((item) => item);

        const PolicyID = nftData.data.PolicyID;
        const AssetID = nftData.data.AssetID;
        const output = [
          AssetID.slice(0, PolicyID.length),
          ".",
          AssetID.slice(PolicyID.length),
        ].join("");

        const user = nftData.data.EthereumAddress;

        for (let index = 0; index < cleanArray.length; index++) {
          const element = cleanArray[index];
          if (element === output) {
            const deleteJob = await pool.query(
              `DELETE FROM yokupay_joblist WHERE transactionhash='${input.data.txh}';`
            );
            const result = Web3.utils.asciiToHex(user + "2" + adaeth);
            const response = { data: { result: result }, status: 200 };
            console.log("Is inside");
            callback(jobRunID, Requester.success(jobRunID, response));
            // return
          } else if (index == cleanArray.length - 1 && element !== output) {
            const checkTime = await pool.query(
              `SELECT * FROM yokupay_joblist WHERE transactionhash='${input.data.txh}';`
            );
            const currentTime = Math.floor(new Date().getTime() / 1000.0);
            const timeRemove = checkTime.rows[0].first + 86400;
            if (timeRemove <= currentTime) {
              const deleteJob = await pool.query(
                `DELETE FROM yokupay_joblist WHERE transactionhash='${input.data.txh}';`
              );
              const result = Web3.utils.asciiToHex(user + "3" + adaeth);
              console.log("Time expired");
              const response = { data: { result: result }, status: 200 };
              callback(jobRunID, Requester.success(jobRunID, response));
            } else {
              const deleteJob = await pool.query(
                `UPDATE yokupay_joblist
            SET execute = ${currentTime + 3600}, process= ${false}
            WHERE transactionhash='${input.data.txh}';`
              );
              console.log("Not inside");
              const result = Web3.utils.asciiToHex(user + "1" + adaeth);
              const response = { data: { result: result }, status: 200 };
              callback(jobRunID, Requester.success(jobRunID, response));
            }
          }
        }
      } else {
        const currentTime = Math.floor(new Date().getTime() / 1000.0);
        const deleteJob = await pool.query(
          `UPDATE yokupay_joblist
      SET execute = ${currentTime + 3600}, process= ${false}
      WHERE transactionhash='${input.data.txh}';`
        );
        console.log("Not inside");
        const result = Web3.utils.asciiToHex(user + "1" + adaeth);
        const response = { data: { result: result }, status: 200 };
        callback(jobRunID, Requester.success(jobRunID, response));
      }
    } else {
      console.log("Daten stimmen nicht überein");
      try {
        const deleteJob = await pool.query(
          `DELETE FROM yokupay_joblist WHERE transactionhash='${input.data.txh}';`
        );
      } catch (error) {
        console.log(error);
      }
      const result = Web3.utils.asciiToHex("0x" + input.data.user + "4" + adaeth);
      console.log("Result: ", "0x" + input.data.user + "4" + adaeth)
      const response = { data: { result: result }, status: 200 };
      callback(jobRunID, Requester.success(jobRunID, response));
    }
  } catch (error) {
    console.log(error);
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

function toNumberString(num) {
  if (Number.isInteger(num)) {
    return num;
  } else {
    return num.toString();
  }
}

module.exports.checkWallet = checkWallet;

// curl -X POST -H "content-type:application/json" "http://localhost:6500/payment/jpg/checkwallet/1" --data '{ "id": 1, "data": {"txh":"0x3cace78c6ce2c9dc7e3cf4d0835a27a3be1b2e14555caf6508e5224c87e54181", "user": "7e1BBDDe3cB26F406800868f10105592d507bD07"}}'
// curl -X POST -H "content-type:application/json" "http://localhost:6500/payment/opentheta/checkwallet" --data '{ "id": 1, "data": {"txh":"0x0260821fcb496b2388bf306880c3cf59ef3c39a0bcc55fb345ad945c3ae581c6", "amount": 6000000000000000000, "rate": 61000000000000000}}'

// 0x30783765316262646465336362323666343036383030383638663130313035353932643530376264303731343336343030303030303030303030

// 433900000000000
// 433900000000000
