const axios = require("axios");
const { ftruncate } = require("fs");

async function get() {
  const UTXOs = await axios.get(
    `https://cardano-mainnet.blockfrost.io/api/v0/addresses/addr1q9dhllcxu8n07x760tdnaxlus9z8q8ul89ue8sjh8et4tmp5h8cp59ypga7czh0wqx6gqx00ceza63tt590atmy79dtqm8eyxz/utxos`,
    {
      headers: {
        project_id: "mainnetk2j4Ub9fcAKKDavAKmKHYxvE8QZEwYX6",
      },
    }
  );
  for (let index = 0; index < UTXOs.data.length; index++) {
    if (UTXOs.data[index].amount.length > 1) {
      if (UTXOs.data[index].amount[1].unit === _assetID) {
        const _NFTinfo = {
          txHash: UTXOs.data[index].tx_hash,
          index: UTXOs.data[index].tx_index,
          quantity: UTXOs.data[index].amount[0].quantity,
          assets: UTXOs.data[index].amount[1].unit,
        };
        getSenderUTXOs(
          _assetID,
          _inputAddress,
          _outputAddress,
          _id,
          _NFTinfo,
          _transactionSuccess,
          _transactionError
        );
        break;
      } else if (
        index === UTXOs.data.length - 1 &&
        UTXOs.data[index].amount[1].unit !== _assetID
      ) {
        _transactionError({
          status: 400,
          message: "Error, no asset found with assetID",
        });
      }
    } else if (
      index === UTXOs.data.length - 1 &&
      UTXOs.data[index].amount.length < 2
    ) {
      _transactionError({
        status: 400,
        message: "Error, account has no assets",
      });
    }
  }
}
get();
// addr1q9dhllcxu8n07x760tdnaxlus9z8q8ul89ue8sjh8et4tmp5h8cp59ypga7czh0wqx6gqx00ceza63tt590atmy79dtqm8eyxz

