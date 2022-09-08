require("dotenv").config();
const express = require("express");
const signerAddress = process.env.DB_SIGNER_ADRESS;
const privateKey = process.env.DB_FUNNY;
const pinataApiKey = process.env.PINLOL;
const pinataSecretApiKey = process.env.PIKOPIKO;
const expressApp = express();
const port = 6600;
const axios = require("axios");
const Web3 = require("web3");
const abi_metroNFT = require("./mintAssets/abi.json").abi;
const HDWalletProvider = require("@truffle/hdwallet-provider");
const jwt = require("jsonwebtoken");

var Tx = require("ethereumjs-tx");
var pkBuff = new Buffer(privateKey, "hex");
var cors = require("cors");
const { pool } = require("./function/Database");

const gernerateJWT = require("./function/genJWT").gernerateJWT;
const buyNFT = require("./function/openTheta_buyNFT").BuyNFT;

expressApp.use(cors());
expressApp.use(express.json());
expressApp.use(
  express.urlencoded({
    extended: true,
  })
);

expressApp.post("/yokupay/jpg/receiptNFT", async (req, res) => {
  const securityCheck = await checkToken(req);
  console.log(securityCheck);
  if (securityCheck === true) {
    const PolicyID = req.body.policyId;
    const AssetID = req.body.assetId;
    const CardanoAddress = req.body.cardanoAddress;
    const EthereumAddress = req.body.ethereumAddress;
    const Time = req.body.time;
    const CardanoStakeAddress = req.body.cardanoStakeAddress;
    const ExchangeRate = req.body.exchangeRate;
    const Amount = req.body.amount;
    if (
      PolicyID !== undefined &&
      AssetID !== undefined &&
      CardanoAddress !== undefined &&
      EthereumAddress !== undefined &&
      Time !== undefined &&
      CardanoStakeAddress !== undefined &&
      ExchangeRate !== undefined &&
      Amount !== undefined
    ) {
      const fun = (obj) => {
        res.send(obj);
      };

      main(
        {
          PolicyID,
          AssetID,
          CardanoAddress,
          CardanoStakeAddress,
          EthereumAddress,
          Time,
          ExchangeRate,
          Amount,
        },
        fun
      );
    } else {
      // error response 400
      const errorResponse = {
        message: "Invalide Input",
      };

      res.status(500).send(errorResponse);
    }
  } else {
    // unauthorized response 401
    const unauthorizedResponse = {
      message: "Unauthorized",
    };
    res.status(401).send(unauthorizedResponse);
  }
});

expressApp.post("/yokupay/opentheta/receiptNFT", async (req, res) => {
  const securityCheck = await checkToken(req);
  console.log(securityCheck);
  if (securityCheck === true) {
    const NFTcontract = req.body.NFTcontract;
    const MarketID = req.body.MarketID;
    const ThetaAddress = req.body.ThetaAddress;
    const TokenID = req.body.TokenID;
    const EthereumAddress = req.body.EthereumAddress;
    const Timestamp = req.body.Timestamp;
    const ExchangeRate = req.body.ExchangeRate;
    const Amount = req.body.Amount;
    console.log({
      NFTcontract,
      MarketID,
      ThetaAddress,
      TokenID,
      EthereumAddress,
      Timestamp,
      ExchangeRate,
      Amount,
    });
    if (
      NFTcontract !== undefined &&
      MarketID !== undefined &&
      ThetaAddress !== undefined &&
      TokenID !== undefined &&
      EthereumAddress !== undefined &&
      Timestamp !== undefined &&
      ExchangeRate !== undefined &&
      Amount !== undefined
    ) {
      const fun = (obj) => {
        res.send(obj);
      };

      main(
        {
          NFTcontract,
          MarketID,
          ThetaAddress,
          TokenID,
          EthereumAddress,
          Timestamp,
          ExchangeRate,
          Amount,
        },
        fun
      );
    } else {
      // error response 400
      const errorResponse = {
        message: "Invalide Input",
      };

      res.status(500).send(errorResponse);
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
  const obj = {
    status: "online",
  };
  res.send(JSON.stringify(obj));
});

expressApp.post("/yokupay/jwt", async (req, res) => {
  const data = {
    nftcontract: req.body.NFTcontract,
    marketid: req.body.MarketID,
    tokenid: req.body.TokenID,
    name: req.body.Name,
    wei: req.body.Wei,
    endpoint: req.body.Endpoint,
    storeid: req.body.StoreID,
    orderid: req.body.OrderID,
  };

  console.log(data);

  gernerateJWT(data).then(async (token) => {
    try {
      const addOrder = await pool.query(
        `INSERT INTO open_orders (order_id, token) VALUES ('${req.body.OrderID}', '${token}')`
      );

      if (addOrder) {
        res.send({ token });
      }
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  });
});

expressApp.post("/yokupay/jpg/fees", async (req, res) => {
  // res.send(req.body.lovelace);
  console.log(req.body.lovelace);
  const securityCheck = await checkToken(req);
  console.log(securityCheck);
  if (securityCheck === true) {
    if (req.body.lovelace > 0 || req.body.lovelace !== undefined) {
      const price = req.body.lovelace;
      const priceNumber = parseFloat(price);
      const ADAamount = priceNumber / 1000000;

      //get current ADA-ETh price
      const conversion = await getCurrentADAETHprice();
      const ETH_first = toNumberString(ADAamount * conversion);

      //get USD price
      const ETH_USD = await getCurrentETHUSDprice();
      const USD_number_lang = parseFloat(ETH_USD);
      const USD_number = USD_number_lang.toFixed(2);

      // Fees
      const paymentprocess_prozent = ETH_first * 1.01 * 1.006;
      const paymentprocess = paymentprocess_prozent + 0.0055 + 0.0028 + 0.0044;
      const finalETH = (paymentprocess * 1.02).toFixed(5);
      const collateral_fee = (paymentprocess * 0.02).toFixed(5);
      const yokupay_fee = (ETH_first * 0.01).toFixed(5);

      // Fees in percent

      const percent = paymentprocess - ETH_first;
      const percent_2 = percent.toFixed(5);
      const percent_1 = ETH_first / 100;
      const percent_final = (percent / percent_1).toFixed(2);

      // Set Values
      const ETH = toNumberString(finalETH);
      const collateral_fee_1 = toNumberString(collateral_fee);
      const yokupay_fee_1 = toNumberString(yokupay_fee);
      const process_fee_1 = toNumberString(percent_2);

      const Dollar = (USD_number * ETH).toFixed(2);
      const collateral_fee_dollar = (USD_number * collateral_fee_1).toFixed(2);
      const yokupay_fee_dollar = (USD_number * yokupay_fee_1).toFixed(2);
      const process_fee_dollar = (USD_number * process_fee_1).toFixed(2);

      const dollarFees = (USD_number * percent).toFixed(2);

      // Success 200
      const responseJSON = {
        data: {
          prices: {
            ada_price: ADAamount,
            ethereum_price: finalETH,
            usd_price: Dollar,
          },
          fees: {
            eth: {
              process_fee: percent_2,
              yokupay_fee,
              collateral_fee,
            },
            dollar: {
              process_fee: process_fee_dollar,
              yokupay_fee: yokupay_fee_dollar,
              collateral_fee: collateral_fee_dollar,
            },
          },
          percent: {
            process_fee: percent_final,
            yokupay_fee: 1.0,
            collateral_fee: 2.0,
          },
          exchange: {
            ada_eth: conversion,
            usd_eth: USD_number,
          },
        },
        status: 200,
      };

      res.status(200).send(responseJSON);
    } else {
      // error response 400
      const errorResponse = {
        message: "Invalide Input",
      };

      res.status(500).send(errorResponse);
    }
  } else {
    // unauthorized response 401
    const unauthorizedResponse = {
      message: "Unauthorized",
    };
    res.status(401).send(unauthorizedResponse);
  }
});

expressApp.get("/security/bearertoken", async (req, res) => {
  const username = req.body.username;
  const role = req.body.role;

  const newToken = getToken(username, role);
  res.status(200).send({ token: newToken });
});

expressApp.post("/yokupay/opentheta/buyNFT", async (req, res) => {
  const securityCheck = await checkToken(req);
  if (securityCheck) {
    if (
      req.body.nftContract !== undefined &&
      req.body.marketID !== undefined &&
      req.body.value !== undefined
    ) {
      const nftContract = req.body.nftContract;
      const marketID = req.body.marketID;
      const value = req.body.value;
      
      const contractCall = await buyNFT(nftContract, marketID, value);
      console.log(contractCall.code)
      if (contractCall.code.length > 0) {
        res.status(200).send({ data: contractCall, status: 200 });
      } else {
        const errorResponse = {
          message: "Execution Error",
        };

        res.status(500).send(errorResponse);
      }
    } else {
      // error response 400
      const errorResponse = {
        message: "Invalide Input",
      };

      res.status(500).send(errorResponse);
    }
  } else {
    // unauthorized response 401
    const unauthorizedResponse = {
      message: "Unauthorized",
    };
    res.status(401).send(unauthorizedResponse);
  }
});

expressApp.post("/database/jwt", async (req, res) => {
  const securityCheck = await checkToken(req);
  if (securityCheck) {
    const orderID = req.body.orderID;

    try {
      const getJWT = await pool.query(
        `SELECT * FROM open_orders WHERE order_id='${orderID}' `
      );

      if (getJWT) {
        res.status(200).send({ token: getJWT.rows[0].token });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Can't find order" });
    }
  } else {
    res.status(401).send({ message: "Unauthorized" });
  }
});

expressApp.post("/database/closed_orders", async (req, res) => {
  const securityCheck = await checkToken(req);
  if (securityCheck) {
    const {
      orderID,
      token,
      receiptTxH,
      contractTxH,
      ethAddress,
      nativeAddress,
      closedAt,
      closedAtUnix,
    } = req.body;

    try {
      const insert = await pool.query(
        `INSERT INTO closed_orders 
          (order_id, token, receipt_txh, contract_txh, eth_address, native_address, closed_at, closed_at_unix) 
          VALUES 
          ('${orderID}', '${token}', '${receiptTxH}', '${contractTxH}', '${ethAddress}', '${nativeAddress}', '${closedAt}', '${closedAtUnix}')`
      );

      if (insert) {
        res.status(200).send(insert);
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Can't find order" });
    }
  } else {
    res.status(401).send({ message: "Unauthorized" });
  }
});

expressApp.listen(port, () => {
  connectWallet();
});

const connectWallet = async () => {
  const externalProvider = new HDWalletProvider(
    privateKey,
    "https://polygon-rpc.com/"
  );
  web3 = new Web3(externalProvider);

  contract_721 = new web3.eth.Contract(
    abi_metroNFT,
    "0x85a3836E8A6B3DABc531Ed97F4CBa1bF5ddF4782"
  );

  console.log("✅ Wallet Connected");
  console.log(`NFT deployment now running on caddy:${port}`);
};

const main = async (JSONobject, fun) => {
  console.log("NFT mint start");
  try {
    let ipfsHash = "";
    ipfsHash = await pinJSONToIPFS(JSONobject);
    console.log("✅ JSON data uploaded to IPFS");

    submitNFT(ipfsHash, fun)
      .then(() => {
        return;
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log("Error Uploading files on IPFS", err);
  }
};

const submitNFT = async (ipfsHash, fun) => {
  // let nonce = (await abi_metroNFT.methods.getNonce(signerAddress).call()) + 1;
  const nonce = await web3.eth.getTransactionCount(signerAddress, "pending");
  const functionAbi = await contract_721.methods
    .mint(signerAddress, ipfsHash.data.IpfsHash)
    .encodeABI();

  var txData = {
    chainId: 137,
    nonce: web3.utils.toHex(nonce),
    gasPrice: "0x2E90EDD000",
    from: signerAddress,
    to: "0x85a3836E8A6B3DABc531Ed97F4CBa1bF5ddF4782",
    value: "0x0",
    gas: "0xF4240",
    data: functionAbi,
  };

  sendRawTransaction(txData, fun);
};

const sendRawTransaction = (txData, fun) =>
  // get the number of transactions sent so far so we can create a fresh nonce
  web3.eth
    .getTransactionCount(signerAddress)
    .then((txCount) => {
      const newNonce = web3.utils.toHex(txCount);
      const transaction = new Tx(
        { ...txData, nonce: newNonce },
        { chain: "mainnet" }
      );
      transaction.sign(pkBuff);
      const serializedTx = transaction.serialize().toString("hex");
      web3.eth
        .sendSignedTransaction("0x" + serializedTx)
        .on("transactionHash", (txHash) => {
          const date = new Date();
          const transactionHash = txHash;
          console.log("✅ NFT Minted at: " + transactionHash);
          const obj = {
            data: {
              message: "receipt NFT created",
              transactionHash: transactionHash,
            },
            status: 200,
          };
          fun(obj);
          return;
        })
        .on("error", (e) => {
          console.log(e.message);
        });
    })
    .catch((err) => {
      console.log(err);
    });

const pinJSONToIPFS = async (JSONBody) => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  return axios
    .post(url, JSONBody, {
      headers: {
        "Content-Type": `application/json; charset=utf-8`,
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
      },
    })
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.error(error);
    });
};

const getCurrentADAETHprice = async () => {
  const cryptoResponse = await axios.get(
    `https://min-api.cryptocompare.com/data/price?fsym=ADA&tsyms=ETH&api_key={${process.env.CRYPTOCOMPARE}}`
  );
  const number = parseFloat(cryptoResponse.data.ETH);
  return number;
};

const getCurrentETHUSDprice = async () => {
  const cryptoResponse = await axios.get(
    `https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key={${process.env.CRYPTOCOMPARE}}`
  );
  const number = parseFloat(cryptoResponse.data.USD);
  return number;
};

function toNumberString(num) {
  if (Number.isInteger(num)) {
    return num + ".0";
  } else {
    return num.toString();
  }
}

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
    jwt.verify(token, process.env.YOKU_TOKEN_SECRET, (err, decoded) => {
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

function getToken(username, role) {
  let token = jwt.sign({ user: username, role }, process.env.YOKU_TOKEN_SECRET);
  return token;
}
