// const jpg_checkWallet = require("./src/function/jpg_checkWallet").checkWallet;
const opentheta_checkWallet = require("./src/function/openTheta_checkWallet").checkWallet;

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const port = 6500;

app.use(bodyParser.json());
app.use(cors());

// JPG.store External Adapters (*** beta, not in use ***)

// Endpoint 1
// app.post("/payment/jpg/checkwallet/1", (req, res) => {
//   jpg_checkWallet(req.body, (status, result) => {
//     if (result) {
//       res.json(result);
//     }
//   });
// });

// Endpoint 2
// app.post("/payment/jpg/checkwallet/2", (req, res) => {
//   jpg_checkWallet(req.body, (status, result) => {
//     if (result) {
//       res.json(result);
//     }
//   });
// });

// Endpoint 3
// app.post("/payment/jpg/checkwallet/3", (req, res) => {
//   jpg_checkWallet(req.body, (status, result) => {
//     if (result) {
//       res.json(result);
//     }
//   });
// });

// Endpoint 4
// app.post("/payment/jpg/checkwallet/4", (req, res) => {
//   jpg_checkWallet(req.body, (status, result) => {
//     if (result) {
//       res.json(result);
//     }
//   });
// });

// Endpoint 5
// app.post("/payment/jpg/checkwallet/5", (req, res) => {
//   jpg_checkWallet(req.body, (status, result) => {
//     if (result) {
//       res.json(result);
//     }
//   });
// });


// OpenTheta External Adapters

// Main Endpoint 
app.post("/payment/opentheta/checkwallet", (req,res) => { 
  opentheta_checkWallet(req.body, (status, result) => {
    if (result) {
      res.status(status).json(result)
    }
  })
})

// Endpoint 1
app.post("/buyNFT", (req, res) => {
  opentheta_checkWallet(req.body, (status, result) => {
    if (result) {
      res.json(result);
    }
  });
});

// Endpoint 2
app.post("/buyNFT_1", (req, res) => {
  opentheta_checkWallet(req.body, (status, result) => {
    if (result) {
      res.json(result);
    }
  });
});

// Endpoint 3
app.post("/buyNFT_2", (req, res) => {
  opentheta_checkWallet(req.body, (status, result) => {
    if (result) {
      res.json(result);
    }
  });
});

// Endpoint 4
app.post("/buyNFT_3", (req, res) => {
  opentheta_checkWallet(req.body, (status, result) => {
    if (result) {
      res.json(result);
    }
  });
});

// Endpoint 5
app.post("/buyNFT_4", (req, res) => {
  opentheta_checkWallet(req.body, (status, result) => {
    if (result) {
      res.json(result);
    }
  });
});

app.get("/service/online", (req, res) => {
  console.log("Is Online!");
  res.status(200).send({ status: "online" });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));

module.exports.app = app;