require("dotenv").config();
const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const axios = require("axios");
const abiDecoder = require("abi-decoder");
const cron = require("node-cron");
const qs = require("qs");

const { pool } = require("./assets/Database");

// Open Theta

const CONTRACT_ADDRESS_PURCHASE_OPENTHETA =
  "0x9533898D2FCD45AE6d95a5E87c2f78a53B792099";
const CONTRACT_ADDRESS_PROCESSING_OPENTHETA =
  "0x23296F6BE5c63FCcfd24EA264649CDDb258Cf5e0";

// JPG

const CONTRACT_ADDRESS_PROCESSING_JPG =
  "0x33335c6B40656014B4C5441f102fa1206d61cC60";

// ABIs
const abi_receipt_matic = require("./assets/abi_receiptNFT.json").abi;
const abi_prcoessing = require("./assets/abi_processing.json").abi;
const abi_purchaseOpenTheta =
  require("./assets/abi_purchaseOpenTheta.json").abi;

// External Provider
const externalProviderTFUEL = new HDWalletProvider(
  "30737366b2478cd4a76649a8b794ea9000ac8bf87772ae5fa04ed2334524a80e", // Privat Key
  "https://eth-rpc-api.thetatoken.org/rpc"
);

// Web3 instances
const web3_matic_wss = new Web3(
  "wss://polygon-mainnet.g.alchemy.com/v2/FdvE6of10vCn30kXrch1EAQ2uQEBYl7O"
);
const processingContractOpenTheta = new web3_matic_wss.eth.Contract(
  abi_prcoessing,
  CONTRACT_ADDRESS_PROCESSING_OPENTHETA
);

const processingContractJPG = new web3_matic_wss.eth.Contract(
  abi_prcoessing,
  CONTRACT_ADDRESS_PROCESSING_JPG
);

const web3_tfuel = new Web3(externalProviderTFUEL);
const purchaseContractOpenTheta = new web3_tfuel.eth.Contract(
  abi_purchaseOpenTheta,
  CONTRACT_ADDRESS_PURCHASE_OPENTHETA
);
const myAccount = web3_tfuel.eth.accounts.privateKeyToAccount(
  "30737366b2478cd4a76649a8b794ea9000ac8bf87772ae5fa04ed2334524a80e"
);
console.log(myAccount.address);

var restartOT = true;
var restartJPG = true;

let options = {
  filter: {
    value: [],
  },
  fromBlock: 0,
};

cron.schedule("*/10 * * * * *", function () {
  purchaseOpenTheta();
  purchaseJPG();
});

// Listener
processingContractOpenTheta.events
  .DepositSuccess(options)
  .on("data", async function (event) {
    console.log("Event:", event.returnValues.txhash);
    const ReceiptHash = event.returnValues.txhash;
    const DepositValue = event.returnValues.depositValue;

    const time = Math.floor(new Date().getTime() / 1000.0);

    if (restartOT) {
      const getEvents = await pool.query(`SELECT * FROM opentheta_purchase`);
      var allEvents = [];
      var setFinish = false;
      if (getEvents.rows.length > 0 || getEvents.rows.length === undefined) {
        for (let index = 0; index < getEvents.rows.length; index++) {
          allEvents.push(getEvents.rows[index].txh);
          if (index === getEvents.rows.length) {
            restartOT = false;
            setFinish = true;
          }
        }
      }

      if (allEvents.includes(ReceiptHash)) {
        console.log(" OT Is allready inside");
      } else {
        if (DepositValue > 300000) {
          await pool.query(
            `INSERT INTO opentheta_purchase (tx_add, txh, executed, process) VALUES ('${time}', '${ReceiptHash}', '${false}', '${false}')`
          );
        } else {
          console.log(
            "error the person sent us too little funds -- do nothing"
          );
        }
      }
    } else {
      if (DepositValue > 300000) {
        await pool.query(
          `INSERT INTO opentheta_purchase (tx_add, txh, executed, process) VALUES ('${time}', '${ReceiptHash}', '${false}', '${false}')`
        );
      } else {
        console.log("error the person sent us too little funds -- do nothing");
      }
    }
  })
  .on("error", function (error, receipt) {
    console.log("Error:", error, receipt);
  });

processingContractJPG.events
  .DepositSuccess(options)
  .on("data", async function (event) {
    console.log("Event:", event);
    const ReceiptHash = event.returnValues.txhash;
    const DepositValue = event.returnValues.depositValue;

    const time = Math.floor(new Date().getTime() / 1000.0);

    if (restartJPG) {
      const getEvents = await pool.query(`SELECT * FROM jpg_purchase`);
      var allEvents = [];
      var setFinish = false;
      if (getEvents.rows.length > 0 || getEvents.rows.length === undefined) {
        for (let index = 0; index < getEvents.rows.length; index++) {
          allEvents.push(getEvents.rows[index].txh);
          if (index === getEvents.rows.length) {
            restartJPG = false;
            setFinish = true;
          }
        }
      }

      if (allEvents.includes(ReceiptHash)) {
        console.log(" JPG Is allready inside");
      } else {
        if (DepositValue > 300000) {
          await pool.query(
            `INSERT INTO jpg_purchase (tx_add, txh, executed, process) VALUES ('${time}', '${ReceiptHash}', '${false}', '${false}')`
          );
        } else {
          console.log(
            "error the person sent us too little funds -- do nothing"
          );
        }
      }
    } else {
      if (DepositValue > 300000) {
        await pool.query(
          `INSERT INTO jpg_purchase (tx_add, txh, executed, process) VALUES ('${time}', '${ReceiptHash}', '${false}', '${false}')`
        );
      } else {
        console.log("error the person sent us too little funds -- do nothing");
      }
    }
  })
  .on("error", function (error, receipt) {
    console.log("Error:", error, receipt);
  });

// Functions
async function purchaseOpenTheta() {
  try {
    const getEvents = await pool.query(
      `SELECT * FROM opentheta_purchase WHERE executed=${false} and process=${false} ORDER BY tx_add ASC`
    );
    if (getEvents.rows.length > 0 || getEvents.rows.length === undefined) {
      for (let index = 0; index < getEvents.rows.length; index++) {
        const currentTxH = getEvents.rows[index].txh;

        await pool.query(
          `UPDATE opentheta_purchase
        SET process= ${true}
        WHERE txh='${currentTxH}';`
        );
      }
      for (let index = 0; index < getEvents.rows.length; index++) {
        const currentTxH = getEvents.rows[index].txh;

        const dataHash = await getNFTData(currentTxH);
        console.log(dataHash.data);

        const NFTContract = dataHash.data.NFTcontract;
        const marketID = dataHash.data.MarketID;
        const NFTid = dataHash.data.TokenID;
        const price = dataHash.data.Amount;
        const user = dataHash.data.ThetaAddress;

        try {
          await purchaseContractOpenTheta.methods
            .buyNFT(NFTContract, marketID, NFTid, user)
            .send({
              from: "0x26Bc9a6b8e9140d0d4c44BD6f3369162aEe68703",
              value: price,
            })
            .then(async (res) => {
              console.log(res.transactionHash);
              await pool.query(
                `UPDATE opentheta_purchase
                SET executed= ${true}
                WHERE txh='${currentTxH}';`
              );
            });
          sendToJobs(currentTxH, marketID, user, "opentheta");
        } catch (error) {
          console.log(error);
          await pool.query(
            `UPDATE opentheta_purchase
            SET process= ${false}
            WHERE txh='${currentTxH}';`
          );
        }
      }
    } else {
      console.log("No OpenTheta Purchase available");
    }
  } catch (error) {
    console.log(error);
  }
}

async function purchaseJPG() {
  try {
    const getEvents = await pool.query(
      `SELECT * FROM jpg_purchase WHERE executed=${false} and process=${false} ORDER BY tx_add ASC`
    );
    if (getEvents.rows.length > 0 || getEvents.rows.length === undefined) {
      for (let index = 0; index < getEvents.rows.length; index++) {
        const currentTxH = getEvents.rows[index].txh;

        await pool.query(
          `UPDATE jpg_purchase
        SET process= ${true}
        WHERE txh='${currentTxH}';`
        );

      }
      for (let index = 0; index < getEvents.rows.length; index++) {
        const currentTxH = getEvents.rows[index].txh;

        const dataHash = await getNFTData(currentTxH);
        console.log(dataHash.data);

        const AssetID = dataHash.data.assetId;
        const EthereumAddress = dataHash.data.ethereumAddress;
        const outputAddress = dataHash.data.cardanoAddress;

        var data = qs.stringify({
          assetID: AssetID,
          outputAddress
        });
//          ************************* EDIT **************************
        var config = {
          method: "post",
          url: `http://23.88.50.29:4479/internal/jpg/nft/purchase`,
          headers: {
            Authorization: process.env.REACT_APP_BEAR,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          data: data,
        };
        axios(config)
          .then(() => sendToJobs(currentTxH, AssetID, EthereumAddress, "jpg"))
          .catch(async (err) => {
            console.log(err)
            await pool.query(
              `UPDATE jpg_purchase
              SET process= ${false}
              WHERE txh='${currentTxH}';`
            );
          });
      }
    } else {
      console.log("No JPG Purchase available");
    }
  } catch (error) {
    console.log(error);
  }
}

async function getNFTData(hash) {
  abiDecoder.addABI(abi_receipt_matic);
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
    return { data: responseIPFS.data, contract: contractUsed };
  } catch (error) {
    console.log(error);
    return { data: "none" };
  }
}

async function sendToJobs(billingNFT, marketID, payAddress, database) {
  var data = qs.stringify({
    transactionHash: billingNFT,
    marketID,
    ethereumAddress: payAddress,
  });

  var config = {
    method: "post",
    url: `https://job.yokupass.com/yokupay/${database}/checkUTXO`,
    headers: {
      Authorization: process.env.REACT_APP_BEAR,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: data,
  };
  axios(config)
    .then(() => console.log("Job instertet successful"))
    .catch((err) => console.log(err));
}

// purchaseOpenTheta("");
