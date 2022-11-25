const jpg_checkWallet = require("./src/function/jpg_checkWallet").checkWallet;
const opentheta_checkWallet = require("./src/function/openTheta_checkWallet").checkWallet;
const ADA_ETH = require("./src/function/ADA_ETH").ADA_ETH;
const TestBuyNFT = require("./src/function/TestBuyNft").TestBuyNFT;

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const port = 6500;

app.use(bodyParser.json());
app.use(cors());

app.post("/payment/jpg/checkwallet/1", (req, res) => {
  jpg_checkWallet(req.body, (status, result) => {
    if (result) {
      res.json(result);
    }
  });
});
app.post("/payment/jpg/checkwallet/2", (req, res) => {
  jpg_checkWallet(req.body, (status, result) => {
    if (result) {
      res.json(result);
    }
  });
});
app.post("/payment/jpg/checkwallet/3", (req, res) => {
  jpg_checkWallet(req.body, (status, result) => {
    if (result) {
      res.json(result);
    }
  });
});
app.post("/payment/jpg/checkwallet/4", (req, res) => {
  jpg_checkWallet(req.body, (status, result) => {
    if (result) {
      res.json(result);
    }
  });
});
app.post("/payment/jpg/checkwallet/5", (req, res) => {
  jpg_checkWallet(req.body, (status, result) => {
    if (result) {
      res.json(result);
    }
  });
});

app.post("/payment/opentheta/checkwallet", (req,res) => {
  opentheta_checkWallet(req.body, (status, result) => {
    if (result) {
      res.json(result)
    }
  })
})

app.post("/buyNFT", (req, res) => {
  opentheta_checkWallet(req.body, (status, result) => {
    if (result) {
      res.json(result);
    }
  });
});

app.post("/buyNFT_1", (req, res) => {
  opentheta_checkWallet(req.body, (status, result) => {
    if (result) {
      res.json(result);
    }
  });
});

app.post("/buyNFT_2", (req, res) => {
  opentheta_checkWallet(req.body, (status, result) => {
    if (result) {
      res.json(result);
    }
  });
});

app.post("/buyNFT_3", (req, res) => {
  opentheta_checkWallet(req.body, (status, result) => {
    if (result) {
      res.json(result);
    }
  });
});
app.post("/buyNFT_4", (req, res) => {
  opentheta_checkWallet(req.body, (status, result) => {
    if (result) {
      res.json(result);
    }
  });
});

app.post("/adapters/adaeth", (req, res) => {
  ADA_ETH(req.body, (status, result) => {
    if (result) {
      res.json(result);
    }
  });
});

app.get("/service/online", (req, res) => {
  console.log("Is Online!");
  res.send({ status: "online" });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
