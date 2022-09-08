const { Requester, Validator } = require("@chainlink/external-adapter");
let jobRunID = 200;

const TestBuyNFT = async (input, callback) => {
  console.log(input);

  const response = { data: { result: "30783765314242444465336342323646343036383030383638663130313035353932643530376244303732" }, status: 200 };
  callback(jobRunID, Requester.success(jobRunID, response));
};

module.exports.TestBuyNFT = TestBuyNFT;
