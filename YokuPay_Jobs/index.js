require("dotenv").config();
const express = require("express");
const privateKey_1 = process.env.OTHERKEY2;
const privateKey = process.env.DB_FUNNY;
const expressApp = express();
const port = 4000;
const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const CronJob = require("cron").CronJob;
const jwt = require("jsonwebtoken");

const abi_JPG_YokuPay = require("./assets/jpg_abi.json").abi;
const abi_OpenTheta_YokuPay = require("./assets/openTheta_abi.json").abi;
// const abi_Algorand_YokuPay = require("").abi;

var cors = require("cors");

const { pool } = require("./assets/Database");
const getCurrentTimestamp = require("./functions/getCurrentTime");

expressApp.use(cors());
expressApp.use(express.json());
expressApp.use(
  express.urlencoded({
    extended: true,
  })
);

// ***************** Polygon *****************

const externalProvider_1 = new HDWalletProvider(
  privateKey_1, // Mein Privat Key
  process.env.POLY_URL
);

var web3_1 = new Web3(externalProvider_1);

var contract_721_1 = new web3_1.eth.Contract(
  abi_JPG_YokuPay,
  process.env.POLY_CA_JPG //Contract Address
);

var contract_721_2 = new web3_1.eth.Contract(
  abi_OpenTheta_YokuPay,
  process.env.POLY_CA_OT //Contract Address
);
// ----------------- Edit -------------------------------
var contract_721_3 = new web3_1.eth.Contract(
  abi_OpenTheta_YokuPay,
  process.env.POLY_CA_OT //Contract Address
);

// ***************** Ethereum *****************
// ***************** BSC *****************

expressApp.post("/yokupay/jpg/checkUTXO", async function (req, res) {
  const securityCheck = await checkToken(req);
  if (securityCheck === true) {
    const transactionHash = req.body.transactionHash;
    const assetID = req.body.nftID;
    const user = req.body.ethereumAddress;
    if (
      transactionHash !== undefined &&
      assetID !== undefined &&
      transactionHash.length >= 66 &&
      user.length >= 42
    ) {
      const execute = Math.floor(new Date().getTime() / 1000.0) + 60;
      const frist = Math.floor(new Date().getTime() / 1000.0);
      try {
        const getLinkDatabase = await pool.query(
          `INSERT INTO jpg_joblist (transactionhash, assetid, created, execute, process, first, usertxh) VALUES ('${transactionHash}', '${assetID}', '${getCurrentTimestamp()}', ${execute}, ${false}, ${frist}, '${user}')`
        );
        res.status(200).send({
          data: {
            message: "job inserted successful",
            body: getLinkDatabase,
          },
          status: 200,
        });
      } catch (error) {
        console.log(error);
        res.status(400).send({ status: "error", body: error });
      }
    } else {
      // error response 400
      const errorResponse = {
        message: "Invalide Input",
      };

      res.status(400).send(errorResponse);
    }
  } else {
    // unauthorized response 401
    const unauthorizedResponse = {
      message: "Unauthorized",
    };
    res.status(401).send(unauthorizedResponse);
  }
});

expressApp.post("/yokupay/opentheta/checkUTXO", async function (req, res) {
  const securityCheck = await checkToken(req);
  if (securityCheck === true) {
    const transactionHash = req.body.transactionHash;
    const marketID = req.body.nftID;
    const user = req.body.ethereumAddress;
    console.log(
      req.body.transactionHash,
      req.body.nftID,
      req.body.ethereumAddress
    );
    if (
      transactionHash !== undefined &&
      marketID !== undefined &&
      transactionHash.length >= 66 &&
      user.length >= 42
    ) {
      const execute = Math.floor(new Date().getTime() / 1000.0) + 10;
      const frist = Math.floor(new Date().getTime() / 1000.0);
      try {
        const getLinkDatabase = await pool.query(
          `INSERT INTO opentheta_joblist (transactionhash, marketid, created, execute, process, first, usertxh) VALUES ('${transactionHash}', '${marketID}', '${getCurrentTimestamp()}', ${execute}, ${false}, ${frist}, '${user}')`
        );
        res.status(200).send({
          data: {
            message: "job inserted successful",
            body: getLinkDatabase,
          },
          status: 200,
        });
      } catch (error) {
        console.log(error);
        res.status(400).send({ status: "error", body: error });
      }
    } else {
      // error response 400
      const errorResponse = {
        message: "Invalide Input",
      };

      res.status(400).send(errorResponse);
    }
  } else {
    // unauthorized response 401
    const unauthorizedResponse = {
      message: "Unauthorized",
    };
    res.status(401).send(unauthorizedResponse);
  }
});

expressApp.post("/yokupay/algorand/checkUTXO", async function (req, res) {
  const securityCheck = await checkToken(req);
  if (securityCheck === true) {
    const transactionHash = req.body.transactionHash;
    const nftId = req.body.nftID;
    const user = req.body.ethereumAddress;
    console.log(
      req.body.transactionHash,
      req.body.nftID,
      req.body.ethereumAddress
    );
    if (
      transactionHash !== undefined &&
      nftId !== undefined &&
      transactionHash.length >= 66 &&
      user.length >= 42
    ) {
      const execute = Math.floor(new Date().getTime() / 1000.0) + 10;
      const frist = Math.floor(new Date().getTime() / 1000.0);
      try {
        const getLinkDatabase = await pool.query(
          `INSERT INTO algorand_joblist (transactionhash, marketid, created, execute, process, first, usertxh) VALUES ('${transactionHash}', '${marketID}', '${getCurrentTimestamp()}', ${execute}, ${false}, ${frist}, '${user}')`
        );
        res.status(200).send({
          data: {
            message: "job inserted successful",
            body: getLinkDatabase,
          },
          status: 200,
        });
      } catch (error) {
        console.log(error);
        res.status(400).send({ status: "error", body: error });
      }
    } else {
      // error response 400
      const errorResponse = {
        message: "Invalide Input",
      };

      res.status(400).send(errorResponse);
    }
  } else {
    // unauthorized response 401
    const unauthorizedResponse = {
      message: "Unauthorized",
    };
    res.status(401).send(unauthorizedResponse);
  }
});

expressApp.get("/online", function (req, res) {
  res.send({ status: "online" });
});

expressApp.get("/online", function (req, res) {
  const obj = {
    status: "online",
  };
  res.send(JSON.stringify(obj));
});

expressApp.listen(port, () => {
  console.log(`Listening on Port ${port}`);
  jpg_job.start();
  opentheta_job.start();
});

const jpg_job = new CronJob("1 * * * * *", async function () {
  const execute = Math.floor(new Date().getTime() / 1000.0);
  try {
    const checkTime = await pool.query(
      `SELECT * FROM jpg_joblist WHERE execute<=${execute} and process=${false}`
    );
    if (checkTime.rows.length > 0 || checkTime.rows.length === undefined) {
      for (let index = 0; index < checkTime.rows.length; index++) {
        var currentUser = checkTime.rows[index].usertxh;
        currentUser = Web3.utils.toChecksumAddress(currentUser);

        const deleteJob = await pool.query(
          `UPDATE jpg_joblist
          SET process= ${true}
          WHERE usertxh='${currentUser}';`
        );

        console.log("Contract Call started");
        const nonce = await web3_1.eth.getTransactionCount(
          process.env.POLY_PAY_ADR
        );
        const resGasMethod = await contract_721_2.methods
          .requestBytes(currentUser)
          .estimateGas({ from: process.env.POLY_PAY_ADR });
        var gasPrice = await web3_1.eth.getGasPrice(); // estimate the gas price

        console.log(currentUser);

        const contractCall = await contract_721_1.methods
          .requestBytes(currentUser)
          .send({
            from: process.env.POLY_PAY_ADR,
            nonce: nonce,
            gasPrice: gasPrice,
            gas: resGasMethod,
          })
          .then(async (contractTxHash) => {
            console.log("Kein Error");
            console.log(contractTxHash);
            if (contractTxHash.status === true) {
              const deleteJob = await pool.query(
                `UPDATE jpg_joblist
                SET process= ${true}
                WHERE transactionhash='${currentUser}';`
              );
            }
          })
          .catch(async (err) => {
            console.error("Error: ", err);
            const deleteJob = await pool.query(
              `UPDATE opentheta_joblist
              SET process= ${false}
              WHERE usertxh='${currentUser}';`
            );
          });
      }
    } else {
      console.log("Currently No JPG Job");
    }
  } catch (error) {
    console.log(error);
  }
});

const opentheta_job = new CronJob("1 * * * * *", async function () {
  const execute = Math.floor(new Date().getTime() / 1000.0);
  try {
    const checkTime = await pool.query(
      `SELECT * FROM opentheta_joblist WHERE execute<=${execute} and process=${false}`
    );
    if (checkTime.rows.length > 0 || checkTime.rows.length === undefined) {
      for (let index = 0; index < checkTime.rows.length; index++) {
        var currentUser = checkTime.rows[index].usertxh;
        currentUser = Web3.utils.toChecksumAddress(currentUser);

        const deleteJob = await pool.query(
          `UPDATE opentheta_joblist
          SET process= ${true}
          WHERE usertxh='${currentUser}';`
        );

        console.log("Contract Call started");
        const nonce = await web3_1.eth.getTransactionCount(
          process.env.POLY_PAY_ADR
        );

        const resGasMethod = await contract_721_2.methods
          .requestBytes(currentUser)
          .estimateGas({ from: process.env.POLY_PAY_ADR });
        var gasPrice = await web3_1.eth.getGasPrice(); // estimate the gas price

        console.log(currentUser);
        contract_721_2.methods
          .requestBytes(currentUser)
          .send({
            from: process.env.POLY_PAY_ADR,
            nonce: nonce,
            gasPrice: gasPrice,
            gas: resGasMethod,
          })
          .then(async (contractTxHash) => {
            console.log("Kein Error");
            console.log(contractTxHash);
            if (contractTxHash.status === true) {
              const deleteJob = await pool.query(
                `UPDATE opentheta_joblist
                SET process= ${true}
                WHERE transactionhash='${currentUser}';`
              );
            }
          })
          .catch(async (err) => {
            console.error("Error: ", err);
            const deleteJob = await pool.query(
              `UPDATE opentheta_joblist
              SET process= ${false}
              WHERE usertxh='${currentUser}';`
            );
          });
      }
    } else {
      console.log("Currently No OpenTheta Job");
    }
  } catch (error) {
    console.log(error);
  }
});

const algorand_job = new CronJob("1 * * * * *", async function () {
  const execute = Math.floor(new Date().getTime() / 1000.0);
  try {
    const checkTime = await pool.query(
      `SELECT * FROM algorand_joblist WHERE execute<=${execute} and process=${false}`
    );
    if (checkTime.rows.length > 0 || checkTime.rows.length === undefined) {
      for (let index = 0; index < checkTime.rows.length; index++) {
        var currentUser = checkTime.rows[index].usertxh;
        currentUser = Web3.utils.toChecksumAddress(currentUser);

        const deleteJob = await pool.query(
          `UPDATE algorand_joblist
          SET process= ${true}
          WHERE usertxh='${currentUser}';`
        );

        console.log("Contract Call started");
        const nonce = await web3_1.eth.getTransactionCount(
          process.env.POLY_PAY_ADR
        );

        const resGasMethod = await contract_721_3.methods
          .requestBytes(currentUser)
          .estimateGas({ from: process.env.POLY_PAY_ADR });
        var gasPrice = await web3_1.eth.getGasPrice(); // estimate the gas price

        console.log(currentUser);
        contract_721_3.methods
          .requestBytes(currentUser)
          .send({
            from: process.env.POLY_PAY_ADR,
            nonce: nonce,
            gasPrice: gasPrice,
            gas: resGasMethod,
          })
          .then(async (contractTxHash) => {
            console.log("Kein Error");
            console.log(contractTxHash);
            if (contractTxHash.status === true) {
              const deleteJob = await pool.query(
                `UPDATE algorand_joblist
                SET process= ${true}
                WHERE transactionhash='${currentUser}';`
              );
            }
          })
          .catch(async (err) => {
            console.error("Error: ", err);
            const deleteJob = await pool.query(
              `UPDATE algorand_joblist
              SET process= ${false}
              WHERE usertxh='${currentUser}';`
            );
          });
      }
    } else {
      console.log("Currently No OpenTheta Job");
    }
  } catch (error) {
    console.log(error);
  }
});

function checkToken(req) {
  let token = req.headers["x-access-token"] || req.headers["authorization"];
  var valide = false;

  if (token === undefined) {
    valide = false;
    return;
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  } else {
    valide = false;
    token = false;
  }

  if (token) {
    jwt.verify(token, "thisIsMySecret", (err, decoded) => {
      if (err) {
        console.log(err);
        valide = false;
      } else {
        console.log("Is valide token");
        valide = true;
      }
    });
  } else {
    console.log("Not valide Token");
    valide = false;
  }
  return valide;
}
