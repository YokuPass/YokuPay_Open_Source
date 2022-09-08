const { Requester, Validator } = require("@chainlink/external-adapter");
const axios = require("axios");
require("dotenv").config();

let jobRunID = 200;

const ADA_ETH = async (input, callback) => {
  console.log(input);
  const cryptoResponse = await axios.get(
    `https://min-api.cryptocompare.com/data/price?fsym=ADA&tsyms=ETH&api_key={${process.env.CRYPTOCOMPARE}}`
  );

  console.log(cryptoResponse.data.ETH);
  const response = { data: { result: cryptoResponse.data.ETH }, status: 200 };
  callback(jobRunID, Requester.success(jobRunID, response));
};

module.exports.ADA_ETH = ADA_ETH;
