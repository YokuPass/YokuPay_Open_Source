const axios = require("axios");
const fs = require("fs");
const exec = require("child_process").exec;

async function sendNFT(inputAddress, assetID, outputAddress, transactionSuccess, transactionError) {
  
  const id = genID(16);

  GetAndWriteParams(
    assetID,
    inputAddress,
    outputAddress,
    id,
    transactionSuccess,
    transactionError
  );
}

async function GetAndWriteParams(
  _assetID,
  _inputAddress,
  _outputAddress,
  _id,
  _transactionSuccess,
  _transactionError
) {
  const params = await axios.get(
    "https://cardano-mainnet.blockfrost.io/api/v0/epochs/latest/parameters",
    {
      headers: {
        project_id: "mainnetTjYNHnX3xSEf1gJcsOBHZKZ6u3TS7kI5",
      },
    }
  );

  const recreatedProtocol = {
    decentralization: Number(params.data.decentralisation_param),
    extraPraosEntropy: Number(params.data.extra_entropy) || null,
    maxBlockBodySize: Number(params.data.max_block_size),
    maxBlockHeaderSize: Number(params.data.max_block_header_size),
    minPoolCost: Number(params.data.min_pool_cost),
    maxTxSize: Number(params.data.max_tx_size),
    minUTxOValue: Number(params.data.min_utxo),
    monetaryExpansion: Number(params.data.rho),
    poolPledgeInfluence: Number(params.data.a0),
    poolRetireMaxEpoch: Number(params.data.e_max),
    protocolVersion: {
      minor: Number(params.data.protocol_minor_ver),
      major: Number(params.data.protocol_major_ver),
    },
    stakeAddressDeposit: Number(params.data.key_deposit),
    stakePoolDeposit: Number(params.data.pool_deposit),
    stakePoolTargetNum: Number(params.data.n_opt),
    treasuryCut: Number(params.data.tau),
    txFeeFixed: Number(params.data.min_fee_b),
    txFeePerByte: Number(params.data.min_fee_a),
  };

  fs.writeFile(
    `protocol.json`,
    JSON.stringify(recreatedProtocol),
    function (err) {
      if (err) {
        _transactionError({
          status: 400,
          message: err,
        });
      }
      getNFTUTXOs(
        _assetID,
        _inputAddress,
        _outputAddress,
        _id,
        _transactionSuccess,
        _transactionError
      );
    }
  );
}

async function getNFTUTXOs(
  _assetID,
  _inputAddress,
  _outputAddress,
  _id,
  _transactionSuccess,
  _transactionError
) {
  const UTXOs = await axios.get(
    `https://cardano-mainnet.blockfrost.io/api/v0/addresses/${_inputAddress}/utxos`,
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

async function getSenderUTXOs(
  _assetID,
  _inputAddress,
  _outputAddress,
  _id,
  _NFTinfo,
  _transactionSuccess,
  _transactionError
) {
  const UTXOs = await axios.get(
    `https://cardano-mainnet.blockfrost.io/api/v0/addresses/${_inputAddress}/utxos`,
    {
      headers: {
        project_id: "mainnetk2j4Ub9fcAKKDavAKmKHYxvE8QZEwYX6",
      },
    }
  );
  for (let index = 0; index < UTXOs.data.length; index++) {
    if (UTXOs.data[index].amount.length === 1) {
      if (UTXOs.data[index].amount[0].quantity !== "5000000" && UTXOs.data[index].amount[0].quantity > "1000000") {
        const _senderUTXO = {
          txHash: UTXOs.data[index].tx_hash,
          index: UTXOs.data[index].tx_index,
          quantity: UTXOs.data[index].amount[0].quantity,
        };
        getAssetInfo(
          _assetID,
          _inputAddress,
          _outputAddress,
          _id,
          _NFTinfo,
          _senderUTXO,
          _transactionSuccess,
          _transactionError
        );
      }
    } else if (index === UTXOs.data.length - 1) {
      _transactionError({
        status: 400,
        message: "No spender UTXO found",
      });
    }
  }
}

async function getAssetInfo(
  _assetID,
  _inputAddress,
  _outputAddress,
  _id,
  _NFTinfo,
  _senderUTXO,
  _transactionSuccess,
  _transactionError
) {
  const Asset = await axios.get(
    `https://cardano-mainnet.blockfrost.io/api/v0/assets/${_assetID}`,
    {
      headers: {
        project_id: "mainnetTjYNHnX3xSEf1gJcsOBHZKZ6u3TS7kI5",
      },
    }
  );
  const _assetInfo = {
    policy_id: Asset.data.policy_id,
    asset_name: Asset.data.asset_name,
    quantity: Number(Asset.data.quantity),
  };
  setPath(
    _assetID,
    _inputAddress,
    _outputAddress,
    _id,
    _NFTinfo,
    _senderUTXO,
    _assetInfo,
    _transactionSuccess,
    _transactionError
  );
}

async function setPath(
  _assetID,
  _inputAddress,
  _outputAddress,
  _id,
  _NFTinfo,
  _senderUTXO,
  _assetInfo,
  _transactionSuccess,
  _transactionError
) {
  exec(
    `export PATH="$HOME/.local/bin/:$PATH"`,
    { shell: "/bin/bash" },
    (err, stdout, stderr) => {
      if (err) {
        console.log("Error: ", err);
        _transactionError({
          status: 200,
          message: err,
        });
      } else if (stderr) {
        console.log("Error: ", stderr);
        _transactionError({
          status: 200,
          message: stderr,
        });
      } else {
        buildDraft(
          _assetID,
          _inputAddress,
          _outputAddress,
          _id,
          _NFTinfo,
          _senderUTXO,
          _assetInfo,
          _transactionSuccess,
          _transactionError
        );
      }
    }
  );
}

async function buildDraft(
  _assetID,
  _inputAddress,
  _outputAddress,
  _id,
  _NFTinfo,
  _senderUTXO,
  _assetInfo,
  _transactionSuccess,
  _transactionError
) {
  exec(
    `cardano-cli transaction build-raw \
        --tx-in ${_NFTinfo.txHash}#${_NFTinfo.index} \
        --tx-in ${_senderUTXO.txHash}#${_senderUTXO.index} \
        --tx-out ${_outputAddress}+0\
        --tx-out ${_inputAddress}+0 \
        --fee 0 \
        --out-file ${_id}.draft`,
    { shell: "/bin/bash" },
    (err, stdout, stderr) => {
      if (err) {
        console.log("Error: ", err);
        _transactionError({
          status: 200,
          message: err,
        });
      } else if (stderr) {
        console.log("Error: ", stderr);
        _transactionError({
          status: 200,
          message: stderr,
        });
      } else {
        getFees(
          _assetID,
          _inputAddress,
          _outputAddress,
          _id,
          _NFTinfo,
          _senderUTXO,
          _assetInfo,
          _transactionSuccess,
          _transactionError
        );
      }
    }
  );
}

async function getFees(
  _assetID,
  _inputAddress,
  _outputAddress,
  _id,
  _NFTinfo,
  _senderUTXO,
  _assetInfo,
  _transactionSuccess,
  _transactionError
) {
  exec(
    `cardano-cli transaction calculate-min-fee \
    --tx-body-file ${_id}.draft \
    --tx-in-count 2 \
    --tx-out-count 2 \
    --witness-count 1 \
    --byron-witness-count 0 \
    --mainnet \
    --protocol-params-file protocol.json`,
    { shell: "/bin/bash" },
    (err, stdout, stderr) => {
      if (err) {
        console.log("Error: ", err);
        _transactionError({
          status: 400,
          message: err,
        });
      } else if (stderr) {
        console.log("Error: ", stderr);
        _transactionError({
          status: 400,
          message: stderr,
        });
      } else {
        const _fees = Number(stdout.replace(/\D/g, ""));
        buildRaw(
          _assetID,
          _inputAddress,
          _outputAddress,
          _id,
          _NFTinfo,
          _senderUTXO,
          _assetInfo,
          _fees,
          _transactionSuccess,
          _transactionError
        );
      }
    }
  );
}

async function buildRaw(
  _assetID,
  _inputAddress,
  _outputAddress,
  _id,
  _NFTinfo,
  _senderUTXO,
  _assetInfo,
  _fees,
  _transactionSuccess,
  _transactionError
) {
  const funds = _senderUTXO.quantity - _fees;
  exec(
    `cardano-cli transaction build-raw \
        --tx-in ${_NFTinfo.txHash}#${_NFTinfo.index} \
        --tx-in ${_senderUTXO.txHash}#${_senderUTXO.index} \
        --tx-out ${_outputAddress}+${_NFTinfo.quantity}+"${_assetInfo.quantity} ${_assetInfo.policy_id}.${_assetInfo.asset_name}"\
        --tx-out ${_inputAddress}+${funds} \
        --fee ${_fees} \
        --out-file ${_id}.raw`,
    { shell: "/bin/bash" },
    (err, stdout, stderr) => {
      if (err) {
        console.log("Error: ", err);
        _transactionError({
          status: 400,
          message: err,
        });
      } else if (stderr) {
        console.log("Error: ", stderr);
        _transactionError({
          status: 400,
          message: stderr,
        });
      } else {
        signTransaction(
          _id,
          _inputAddress,
          _transactionSuccess,
          _transactionError
        );
      }
    }
  );
}

async function signTransaction(
  _id,
  _inputAddress,
  _transactionSuccess,
  _transactionError
) {
  exec(
    `cardano-cli transaction sign \
        --tx-body-file ${_id}.raw \
        --signing-key-file ${_inputAddress}.skey \
        --mainnet \
        --out-file ${_id}.signed`,
    { shell: "/bin/bash" },
    (err, stdout, stderr) => {
      if (err) {
        console.log("Error: ", err);
        _transactionError({
          status: 400,
          message: err,
        });
      } else if (stderr) {
        console.log("Error: ", stderr);
        _transactionError({
          status: 400,
          message: stderr,
        });
      } else {
        submitTransaction(
          _id,
          _inputAddress,
          _transactionSuccess,
          _transactionError
        );
      }
    }
  );
}

async function submitTransaction(
  _id,
  _inputAddress,
  _transactionSuccess,
  _transactionError
) {
  exec(
    `xxd -r -p <<< $(jq .cborHex ${_id}.signed) > ${_id}.submit-api.raw`,
    { shell: "/bin/bash" },
    (err, stdout, stderr) => {
      if (err) {
        console.log("Error: ", err);
        _transactionError({
          status: 400,
          message: err,
        });
      } else if (stderr) {
        console.log("Error: ", stderr);
        _transactionError({
          status: 400,
          message: stderr,
        });
      } else {
        exec(
          `curl "https://cardano-mainnet.blockfrost.io/api/v0/tx/submit" -X POST -H "Content-Type: application/cbor" -H "project_id: mainnetTjYNHnX3xSEf1gJcsOBHZKZ6u3TS7kI5" --data-binary @./${_id}.submit-api.raw`,
          (err, stdout, stderr) => {
            const transactionHash = stdout;
            exec(
              `rm -rf ${_id}.draft  ${_id}.raw ${_id}.signed ${_id}.submit-api.raw`,
              (err, stdout, stderr) => {
                if (err) {
                  console.log("Error: ", err);
                } else if (stderr) {
                  console.log("Error: ", stderr);
                } else {
                  const TXres = transactionHash.replace(/"/g, "");
                  if (TXres.length > 66) {
                    _transactionError({
                      status: 400,
                      message: transactionHash,
                    });
                  } else {
                    console.log(TXres)
                    _transactionSuccess({
                      status: 200,
                      message: TXres,
                    });
                  }
                }
              }
            );
          }
        );
      }
    }
  );
}

const genID = (length) => {
  var result = [];
  var characters = "0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result.push(
      characters.charAt(Math.floor(Math.random() * charactersLength))
    );
  }
  return result.join("");
};

module.exports.sendNFT = sendNFT

// cardano-cli transaction build-raw \
//         --tx-in 081b86f80bded8fe904ba162f7cc256b4d8af029607ac5c21863aaadf0e4395c#3 \
//         --tx-out addr1qxzmkfsn7vmy8pe6nd4hq3fm77tntnx5hexppcttmguxcnaey7ml57r03q4yenqlmssfsh3vermp7mmy44j9nz753cqqcaa2e7+0\
//         --tx-out addr1qxzmkfsn7vmy8pe6nd4hq3fm77tntnx5hexppcttmguxcnaey7ml57r03q4yenqlmssfsh3vermp7mmy44j9nz753cqqcaa2e7+0 \
//         --fee 0 \
//         --out-file test.draft

//         cardano-cli transaction calculate-min-fee \
//         --tx-body-file test.draft \
//         --tx-in-count 1 \
//         --tx-out-count 2 \
//         --witness-count 1 \
//         --byron-witness-count 0 \
//         --mainnet \
//         --protocol-params-file protocol.json

//         176325

//         cardano-cli transaction build-raw \
//         --tx-in 081b86f80bded8fe904ba162f7cc256b4d8af029607ac5c21863aaadf0e4395c#3 \
//         --tx-out addr1qxzmkfsn7vmy8pe6nd4hq3fm77tntnx5hexppcttmguxcnaey7ml57r03q4yenqlmssfsh3vermp7mmy44j9nz753cqqcaa2e7+1500000+"1 8af3068889a7cd26eccc1db74f9be10bd4987008669fe6acbec11467.416461436869636b416c7068617331363431"\
//         --tx-out addr1qxzmkfsn7vmy8pe6nd4hq3fm77tntnx5hexppcttmguxcnaey7ml57r03q4yenqlmssfsh3vermp7mmy44j9nz753cqqcaa2e7+6524533 \
//         --fee 176325 \
//         --out-file test.raw

//         cardano-cli transaction sign \
//         --tx-body-file test.raw \
//         --signing-key-file addr1qxzmkfsn7vmy8pe6nd4hq3fm77tntnx5hexppcttmguxcnaey7ml57r03q4yenqlmssfsh3vermp7mmy44j9nz753cqqcaa2e7.skey \
//         --mainnet \
//         --out-file test.signed

//         xxd -r -p <<< $(jq .cborHex test.signed) > test.submit-api.raw

//         curl "https://cardano-mainnet.blockfrost.io/api/v0/tx/submit" -X POST -H "Content-Type: application/cbor" -H "project_id: mainnetTjYNHnX3xSEf1gJcsOBHZKZ6u3TS7kI5" --data-binary @./test.submit-api.raw