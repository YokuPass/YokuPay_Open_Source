const express = require("express");
const axios = require("axios");
var fs = require("fs");

const sendNFT = require("./sendNFT").sendNFT;

const app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.post("/cardanoNode/buyNFT", (req, res) => {
  const cbor = req.body.cbor;
  const _assetID = req.body.assetID;
  const _outputAddress = req.body.outputAddress;

  const _inputAddress =
    "addr1qxzmkfsn7vmy8pe6nd4hq3fm77tntnx5hexppcttmguxcnaey7ml57r03q4yenqlmssfsh3vermp7mmy44j9nz753cqqcaa2e7";

  const purchaseID = genID(16);

  const transactionSuccess = (obj) => {
    console.log("Successful: ", obj)
    res.status(obj.status).send({
      data: obj.message,
    });
    return;
  };
  const transactionError = (obj) => {
    console.log("Error: ", obj)
    res.status(obj.status).send({
      data: obj.message,
    });
    return;
  };

  const newTxBody = {
    type: "Unwitnessed Tx AlonzoEra",
    description: "",
    cborHex: cbor,
  };
  //
  fs.writeFile(`${purchaseID}.body`, JSON.stringify(newTxBody), function (err) {
    if (err) throw err;
    console.log("File is created successfully.");

    require("child_process").exec(
      `export PATH="$HOME/.local/bin/:$PATH"`,
      { shell: "/bin/bash" },
      (err, stdout, stderr) => {
        if (err) {
          console.log("Error: ", err);
        } else if (stderr) {
          console.log("Error: ", stderr);
        } else {
          console.log("UTXO Output: ", stdout, stderr);
          require("child_process").exec(
            `cardano-cli transaction sign --tx-body-file ${purchaseID}.body --signing-key-file ${_inputAddress}.skey --mainnet --out-file ${purchaseID}.signed`,
            { shell: "/bin/bash" },
            (err, stdout, stderr) => {
              if (err) {
                console.log("Error: ", err);
                transactionError({
                  status: 400,
                  message: err,
                });
              } else if (stderr) {
                console.log("Error: ", stderr);
                transactionError({
                  status: 400,
                  message: stderr,
                });
              } else {
                console.log("UTXO Output: ", stdout, stderr);
                require("child_process").exec(
                  `xxd -r -p <<< $(jq .cborHex ${purchaseID}.signed) > ${purchaseID}.submit-api.raw`,
                  { shell: "/bin/bash" },
                  (err, stdout, stderr) => {
                    if (err) {
                      console.log("Error: ", err);
                    } else if (stderr) {
                      console.log("Error: ", stderr);
                    } else {
                      console.log("UTXO Output: ", stdout, stderr);
                      require("child_process").exec(
                        `curl "https://cardano-mainnet.blockfrost.io/api/v0/tx/submit" -X POST -H "Content-Type: application/cbor" -H "project_id: mainnetTjYNHnX3xSEf1gJcsOBHZKZ6u3TS7kI5" --data-binary @./${purchaseID}.submit-api.raw`,
                        (err, stdout, stderr) => {
                          if (err) {
                            console.log("Error: ", err);
                            console.log(stdout);
                          } else if (stderr) {
                            console.log("Error: ", stderr);
                            console.log(stdout);
                          } else {
                            console.log("UTXO Output: ", stdout, stderr);
                          }
                          const transactionHash = stdout;
                          require("child_process").exec(
                            `rm -rf ${purchaseID}.body ${purchaseID}.signed ${purchaseID}.submit-api.raw`,
                            (err, stdout, stderr) => {
                              if (err) {
                                console.log("Error: ", err);
                              } else if (stderr) {
                                console.log("Error: ", stderr);
                              } else {
                                console.log("UTXO Output: ", stdout, stderr);
                                const TXres = transactionHash.replace(
                                  /"/g,
                                  ""
                                );
                                if (TXres.length >= 66) {
                                  res
                                    .status(400)
                                    .send({ data: transactionHash });
                                } else {
                                  sendLoop(
                                    _inputAddress,
                                    _assetID,
                                    _outputAddress,
                                    transactionSuccess,
                                    transactionError
                                  );
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
            }
          );
        }
      }
    );
  });
});

async function sendLoop(
  _inputAddress,
  _assetID,
  _outputAddress,
  transactionSuccess,
  transactionError
) {
  for (let index = 0; index < 4; index++) {
    console.log(index)
    const transactionErrorLoop = (obj) => {
      console.log(obj, "", index)
    }
    
    if (index === 0) {
      setTimeout(function () {
        // Code, der erst nach 1 Min ausgeführt wird
        sendNFT(
          _inputAddress,
          _assetID,
          _outputAddress,
          transactionSuccess,
          transactionErrorLoop
        );
      }, 60000);
    }
    if (index === 1) {
      setTimeout(function () {
        // Code, der erst nach 1 Min ausgeführt wird
        sendNFT(
          _inputAddress,
          _assetID,
          _outputAddress,
          transactionSuccess,
          transactionErrorLoop
        );
      }, 120000);
    }
    if (index === 2) {
      setTimeout(function () {
        // Code, der erst nach 1 Min ausgeführt wird
        sendNFT(
          _inputAddress,
          _assetID,
          _outputAddress,
          transactionSuccess,
          transactionErrorLoop
        );
      }, 300000);
    }
    if (index === 3) {
      setTimeout(function () {
        // Code, der erst nach 1 Min ausgeführt wird
        sendNFT(
          _inputAddress,
          _assetID,
          _outputAddress,
          transactionSuccess,
          transactionError
        );
      }, 600000);
    }
  }
}

app.get("/online", (req, res) => {
  res.send({ status: "online" });
});

app.listen(6001, () => console.log("Listening on Port 6001"));

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
