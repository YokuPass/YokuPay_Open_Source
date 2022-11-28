const Processing = artifacts.require("Processing");
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
const linktokenInterface = require("@chainlink/contracts/abi/v0.8/LinkTokenInterface.json");

//each test should be run individually

contract("withdrawYokuFunctionTest", (accounts) => {
  it("should do the calculation for collateral correctly - 1.5% price increase in the ExchangeRate", async () => {
    const processingInstance = await Processing.deployed();
    await processingInstance.deposit("Receipt NFT txh", 8000000000, {
      from: accounts[0],
      value: 10200000,
    });
    await processingInstance.withdrawYoku(accounts[0], 2, 8120000000); //increased the exchange rate by 1.5%
    const status1 = await processingInstance.status1.call();
    const payBack = await processingInstance.payBack.call();

    assert.equal(
      status1,
      "backCollateralPercentage",
      "the calculation of the collateral payback is wrong"
    );

    assert.equal(
      payBack.toString(),
      "53000",
      "the calculation of the collateral payback is wrong"
    );
  });

  it("should do the calculation for collateral correctly - 2.5% price increase in the ExchangeRate", async () => {
    const processingInstance = await Processing.deployed();
    await processingInstance.deposit("Receipt NFT txh", 8000000000, {
      from: accounts[0],
      value: 10200000,
    });
    await processingInstance.withdrawYoku(accounts[0], 2, 8200000000); //increased the exchange rate by 2.5%
    const status1 = await processingInstance.status1.call();
    const payBack = await processingInstance.payBack.call();

    assert.equal(
      status1,
      "keepCollateral",
      "the calculation of the collateral payback is wrong"
    );
  });

  it("should do the calculation for collateral correctly - no price increase in the ExchangeRate", async () => {
    const processingInstance = await Processing.deployed();
    await processingInstance.deposit("Receipt NFT txh", 8000000000, {
      from: accounts[0],
      value: 10200000,
    });
    await processingInstance.withdrawYoku(accounts[0], 2, 7900000000); //decreased the exchange rate
    const status1 = await processingInstance.status1.call();
    const payBack = await processingInstance.payBack.call();

    assert.equal(
      status1,
      "backCollateralComplete",
      "the calculation of the collateral payback is wrong"
    );
  });

  it("should send funds back to user, NFT purchase failed", async () => {
    const processingInstance = await Processing.deployed();
    await processingInstance.deposit("Receipt NFT txh", 8000000000, {
      from: accounts[0],
      value: 10200000,
    });
    await processingInstance.withdrawYoku(accounts[0], 3, 8000000000);
    const status1 = await processingInstance.status1.call();
    const payBack = await processingInstance.payBack.call();

    assert.equal(
      status1,
      "sendBackToUser",
      "the calculation of the collateral payback is wrong"
    );
  });
});
