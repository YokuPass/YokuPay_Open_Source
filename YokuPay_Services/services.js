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

let web3 = [];

expressApp.use(cors());
expressApp.use(express.json());
expressApp.use(
  express.urlencoded({
    extended: true,
  })
);

// mint JPG.store receipt NFT
expressApp.post("/yokupay/jpg/receiptNFT", async (req, res) => {
  const securityCheck = await checkToken(req);
  console.log(securityCheck);
  if (securityCheck === true) {
    // necessary inputs
    const AssetID = req.body.assetId;
    const CardanoAddress = req.body.cardanoAddress;
    const EthereumAddress = req.body.ethereumAddress;
    const Time = req.body.time;
    const CardanoStakeAddress = req.body.cardanoStakeAddress;
    const ExchangeRate = req.body.exchangeRate;
    const Amount = req.body.amount;
    if (
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
      // mint process
      main(
        {
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
      // error response 400 (invalide input)
      const errorResponse = {
        message: "Invalide Input",
      };

      res.status(500).send(errorResponse);
    }
  } else {
    // unauthorized response 401 (unauthorized)
    const unauthorizedResponse = {
      message: "Unauthorized",
    };
    res.status(401).send(unauthorizedResponse);
  }
});

// mint OpenTheta receipt NFT
expressApp.post("/yokupay/opentheta/receiptNFT", async (req, res) => {
  const securityCheck = await checkToken(req);
  console.log(securityCheck);
  if (securityCheck === true) {
    // necessary inputs
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

      // mint process      
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
      // error response 400 (invalide input)
      const errorResponse = {
        message: "Invalide Input",
      };

      res.status(500).send(errorResponse);
    }
  } else {
    // unauthorized response 401 (unauthorized)
    const unauthorizedResponse = {
      message: "Unauthorized",
    };
    res.status(401).send(unauthorizedResponse);
  }
});

// mint Algorand receipt NFT
expressApp.post("/yokupay/algorand/receiptNFT", async (req, res) => {
  const securityCheck = await checkToken(req);
  console.log(securityCheck);
  if (securityCheck === true) {
    // necessary inputs
    const nftId = req.body.assetId;
    const AlgorandAddress = req.body.cardanoAddress;
    const EthereumAddress = req.body.ethereumAddress;
    const Time = req.body.time;
    const ExchangeRate = req.body.exchangeRate;
    const Amount = req.body.amount;
    if (
      nftId !== undefined &&
      AlgorandAddress !== undefined &&
      EthereumAddress !== undefined &&
      Time !== undefined &&
      ExchangeRate !== undefined &&
      Amount !== undefined
    ) {
      const fun = (obj) => {
        res.send(obj);
      };
      // mint process
      main(
        {
          nftId,
          AlgorandAddress,
          EthereumAddress,
          Time,
          ExchangeRate,
          Amount,
        },
        fun
      );
    } else {
      // error response 400 (invalide input)
      const errorResponse = {
        message: "Invalide Input",
      };

      res.status(500).send(errorResponse);
    }
  } else {
    // unauthorized response 401 (unauthorized)
    const unauthorizedResponse = {
      message: "Unauthorized",
    };
    res.status(401).send(unauthorizedResponse);
  }
});

// get server status
expressApp.get("/online", function (req, res) {
  const obj = {
    status: "online",
  };
  res.send(JSON.stringify(obj));
});

// generate JSON Web Token for our Website (OpenTheta)
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
    url: req.body.url,
  };

  console.log(data);

  gernerateJWT(data).then(async (token) => {
    console.log(token);
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

// generate JSON Web Token for our Website (JPG.store)
expressApp.post("/yokupay/jpg/jwt", async (req, res) => {
  const data = {
    assetid: req.body.AssetID,
    name: req.body.Name,
    wei: req.body.Wei,
    endpoint: req.body.Endpoint,
    storeid: req.body.StoreID,
    orderid: req.body.OrderID,
    url: req.body.url,
  };

  console.log(data);

  gernerateJWT(data).then(async (token) => {
    console.log(token);
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

// caluculate fees for the YokuPay process
expressApp.post("/yokupay/fees", async (req, res) => {
  // res.send(req.body.lovelace);
  console.log(req.body.price);
  console.log(req.body.from);
  console.log(req.body.to);
  const securityCheck = await checkToken(req);
  console.log(securityCheck);
  if (securityCheck === true) {
    if (
      req.body.price > 0 ||
      req.body.from !== undefined ||
      req.body.to !== undefined
    ) {
      const price = Number(req.body.price);
      const fees = await getFees(price, req.body.from, req.body.to);

      if (fees !== {}) {
        res.status(200).send(fees);
      } else {
        const errorResponse = {
          message: "Invalide Input",
        };

        res.status(500).send(errorResponse);
      }
    } else {
      // error response 500 (invalide input)
      const errorResponse = {
        message: "Invalide Input",
      };

      res.status(500).send(errorResponse);
    }
  } else {
    // unauthorized response 401 (unauthorized)
    const unauthorizedResponse = {
      message: "Unauthorized",
    };
    res.status(401).send(unauthorizedResponse);
  }
});

// purchase OpenTheta NFTs
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
      console.log(contractCall.code);
      if (contractCall.code.length > 0) {
        res.status(200).send({ data: contractCall, status: 200 });
      } else {
        const errorResponse = {
          message: "Execution Error",
        };

        res.status(500).send(errorResponse);
      }
    } else {
      // error response 400 (invalide input)
      const errorResponse = {
        message: "Invalide Input",
      };

      res.status(500).send(errorResponse);
    }
  } else {
    // unauthorized response 401 (unauthorized)
    const unauthorizedResponse = {
      message: "Unauthorized",
    };
    res.status(401).send(unauthorizedResponse);
  }
});

// Get JSON Web Token with the order ID
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
      // error response 500 (cant find order)
      res.status(500).send({ message: "Can't find order" });
    }
  } else {
    // unauthorized response 401 (unauthorized)
    res.status(401).send({ message: "Unauthorized" });
  }
});

// close finished orders
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
      // error response 500 (cant find order)
      res.status(500).send({ message: "Can't find order" });
    }
  } else {
    // unauthorized response 401 (unauthorized)
    res.status(401).send({ message: "Unauthorized" });
  }
});

expressApp.listen(port, () => {
  connectWallet();
});

// connect payable wallet to mint NFT
const connectWallet = async () => {
  const externalProvider = new HDWalletProvider(
    privateKey,
    "https://polygon-rpc.com/"
  );
  web3 = new Web3(externalProvider);

  contract_721 = new web3.eth.Contract(
    abi_metroNFT, // Contract ABI receipt NFT
    "0x4C86eC73d17c44D59905a914fDb2fdb72e5138DC" // Contract Address
  );
  console.log("✅ Wallet Connected");
  console.log(`NFT deployment now running on caddy:${port}`);
};

const main = async (JSONobject, fun) => {
  console.log("NFT mint start");
  // upload NFT data to IPFS 
  try {
    let ipfsHash = "";
    ipfsHash = await pinJSONToIPFS(JSONobject);
    console.log("✅ JSON data uploaded to IPFS");

    // create Transaction
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

// mint NFT and create Transaction
const submitNFT = async (ipfsHash, fun) => {
  // let nonce = (await abi_metroNFT.methods.getNonce(signerAddress).call()) + 1;
  const nonce = await web3.eth.getTransactionCount(signerAddress, "pending");
  const functionAbi = await contract_721.methods
    .safeMint(signerAddress, ipfsHash.data.IpfsHash)
    .encodeABI();

  var txData = {
    chainId: 137,
    nonce: web3.utils.toHex(nonce),
    gasPrice: "0x2E90EDD000",
    from: signerAddress,
    to: "0x4C86eC73d17c44D59905a914fDb2fdb72e5138DC",
    value: "0x0",
    gas: "0xF4240",
    data: functionAbi,
  };

  // submit Transaction
  sendRawTransaction(txData, fun);
};

// submit the NFT transaction to the BlockChain
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

// upload JSON data to the IPFS
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

// function to validate JSON Web Tokens
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

// Fees calculations
async function getFees(originalPrice, FromCryptoCurrency, ToCryptoCurrency) {
  FromCryptoCurrency = FromCryptoCurrency.toUpperCase();
  ToCryptoCurrency = ToCryptoCurrency.toUpperCase();
  // Get Convertion
  let polygonValue = await convertCrypto(
    originalPrice,
    FromCryptoCurrency,
    ToCryptoCurrency
  ); //this is how much the NFT costs in matic

  // Calc Fees
  let polyGas = await web3.eth.estimateGas({});
  const totalGasPolygon = polyGas * 7;
  const binanceFees = polygonValue * 0.021;

  // All Fees in Matic
  const processingFeesMatic = await roundUp(totalGasPolygon + binanceFees);
  const yokuFeeMatic = await roundUp(polygonValue / 100);
  const collateralMatic = await roundUp(polygonValue / 50);

  //Total Price in Matic & Dollar
  const totalPriceMatic = await roundUp(
    polygonValue + processingFeesMatic + yokuFeeMatic + collateralMatic
  );
  const totalPriceUSD = (
    await convertUSD(totalPriceMatic, ToCryptoCurrency)
  ).toFixed(2);

  //Fees in USD
  const process_fee_dollar = (
    await convertUSD(processingFeesMatic, ToCryptoCurrency)
  ).toFixed(2);
  const yokupay_fee_dollar = (
    await convertUSD(yokuFeeMatic, ToCryptoCurrency)
  ).toFixed(2);
  const collateral_fee_dollar = (
    await convertUSD(collateralMatic, ToCryptoCurrency)
  ).toFixed(2);

  //Processing Fees in Percent
  const percent = totalPriceMatic - polygonValue / (1 * 10 ** 18);
  const percent1 = polygonValue / (1 * 10 ** 18) / 100;
  const processFeesPercent = (percent / percent1).toFixed(2);

  // From Price
  const price = originalPrice / (1 * 10 ** 18);

  return {
    data: {
      prices: {
        from_price: price,
        to_price: totalPriceMatic,
        usd_price: totalPriceUSD,
      },
      fees: {
        to_currency: {
          process_fee: processingFeesMatic,
          yokupay_fee: yokuFeeMatic,
          collateral_fee: collateralMatic,
        },
        dollar: {
          process_fee: process_fee_dollar,
          yokupay_fee: yokupay_fee_dollar,
          collateral_fee: collateral_fee_dollar,
        },
      },
      percent: {
        process_fee: processFeesPercent,
        yokupay_fee: 1.0,
        collateral_fee: 2.0,
      },
    },
    status: 200,
  };
}

async function convertCrypto(price, FromCryptoCurrency, ToCryptoCurrency) {
  const cryptoResponse = await axios.get(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${FromCryptoCurrency}&tsyms=${ToCryptoCurrency}&api_key={92c44399461d32381bf6d4c5289d23ff639ef1b06da94017e4687ae72ea1b7be}`
  );

  const number = parseFloat(
    cryptoResponse.data[FromCryptoCurrency][ToCryptoCurrency]
  );
  let maticPrice = price * number;
  return maticPrice;
}

async function convertUSD(price, ToCryptoCurrency) {
  const cryptoResponse = await axios.get(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${ToCryptoCurrency}&tsyms=USD&api_key={92c44399461d32381bf6d4c5289d23ff639ef1b06da94017e4687ae72ea1b7be}`
  );
  const number = parseFloat(cryptoResponse.data[ToCryptoCurrency].USD);
  let maticPrice = price * number;
  return maticPrice;
}

async function roundUp(numby) {
  let decimal = numby / (1 * 10 ** 18);
  roundedFee = Math.ceil(decimal);
  return roundedFee;
}
