import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import uuid from "react-uuid";
import jwtDecoder from "jwt-decode";
import axios from "axios";
import qs from "qs";
import Web3 from "web3";

import connectMetaMask from "../../web3/connectMetaMask";
import connectFlint from "../../web3/connectFlint";
import setCookie from "../../hooks/setCookie";
import getCookie from "../../hooks/getCookie";

const simpleContractAbi = require("../../config/contract.json").abi;

export default function Connect({
  fees,
  dollarAmount,
  cryptoAmount,
  currency,
  tokenID,
  nftName,
  setReceiveAddress,
  setPayAddress,
  payAddress,
  receiveAddress,
  nftContract,
  marketID,
  storeID,
  orderID,
  setCryptoAmount,
  setDollarAmount,
  setFees,
  setNFTcontract,
  setMarketID,
  setTokenID,
  setNftName,
  setStorePrice,
  setOrderID,
  setEndPoint,
  setStoreID,
  storePrice,
  setNFTurl,
  nftURL,
  setAssetID,
  assetID,
  stakeAddress,
  setStakeAddress
}) {
  const navigate = useNavigate();
  const [loadingReceiptNFT, setLoadingReceiptNFT] = useState(false);
  const [loadingSCinteraction, setLoadingSCinteraction] = useState(false);
  const [receiptNFTtxHash, setReceiptNFTtxHash] = useState("");
  const [errorRecieptNFTcreation, setErrorReceiptNFTcreation] = useState("");
  const [scInteractionTxHash, setSCinteractionTxHash] = useState("");
  const [polygonNetwork, setPolygonNetwork] = useState(true);

  const [shortPayAddress, setShortPayAddress] = useState("");
  const [shortTxHash, setShortTxHash] = useState("");

  const [exchangeRate, setExchangeRate] = useState(0);
  const [currencyAmount, setCurrencyAmount] = useState(0);
  const [processfees, setProcessFees] = useState("");

  const state = useLocation();

  const web3_polygon = new Web3(
    new Web3.providers.HttpProvider(process.env.REACT_APP_INFURA_URL)
  );

  const MyContract = new web3_polygon.eth.Contract(
    simpleContractAbi,
    process.env.REACT_APP_CONTRACT_ADDRESS_1
  );

  const paymentText =
    "This fee consists the exchange Fee and gas costs for occuring fund transfers.";
  const colleteralText =
    "This is a security payment for possible fast price changes between the cryptocurrencies. This covers a price change up until 2%, any price changes above that are covered by us. Should the price not move, then you will be refunded this amout or part of it.";
  const yokuFeeText = "";

  const LightTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.common.white,
      color: "rgba(0, 0, 0, 0.87)",
      boxShadow: theme.shadows[1],
      fontSize: 14,
    },
  }));

  const changeNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x89" }],
      });
      console.log("You have switched to the right network");
    } catch (switchError) {
      // The network has not been added to MetaMask
      if (switchError.code === 4902) {
        console.log("Please add the Polygon network to MetaMask");
      }
      console.log("Cannot switch to the network");
    }
  };

  // useEffect(() => {
  //   getFees()
  // }, [])

  // const getFees = async () => {
  //   var data = qs.stringify({
  //     price: storePrice,
  //     from: "TFUEL",
  //     to: "MATIC"
  //   });

  //   var config = {
  //     method: "post",
  //     url: "https://service.yokupass.com/yokupay/fees",
  //     headers: {
  //       Authorization: process.env.REACT_APP_BEAR,
  //       "Content-Type": "application/x-www-form-urlencoded",
  //     },
  //     data: data,
  //   };

  //   axios(config).then((res) =>
  //   {
  //     console.log(res.data.fees.to_currency)
  //     setProcessFees(res.data.fees.to_currency.process_fee)
  //   })
  // }

  useEffect(() => {
    window.ethereum.on("accountsChanged", function (accounts) {
      setPayAddress(accounts[0]);
      setReceiveAddress(accounts[0]);
      setCookie("u_ead", accounts[0]);
      setCookie("u_cad", accounts[0]);
    });
    window.ethereum.on("chainChanged", (chainId) => {
      if (chainId !== "0x89") {
        console.log("Error, pleas connect to Matic Mainnet");
        setPolygonNetwork(false);
      } else {
        setPolygonNetwork(true);
      }
    });
  }, []);

  useEffect(() => {
    checkNetwork();
  }, []);

  const checkNetwork = async () => {
    const id = await window.ethereum.request({ method: "net_version" });
    console.log(id);
    if (id !== "137") {
      setPolygonNetwork(false);
    }
  };

  useEffect(() => {
    if (getCookie("u_ead") !== undefined && getCookie("u_cad") !== undefined) {
      setReceiveAddress(getCookie("u_cad"));
      setPayAddress(getCookie("u_ead"));
    }
  }, []);

  useEffect(() => {
    var data = qs.stringify({
      orderID: state.state.order,
    });

    var config = {
      method: "post",
      url: "https://service.yokupass.com/database/jwt",
      headers: {
        Authorization: process.env.REACT_APP_BEAR,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
    };

    axios(config)
      .then((json) => {
        console.log(json.data);
        const decode = jwtDecoder(json.data.token);
        if (decode) {
          if (decode !== undefined) {
            if (decode.tokenid === undefined && decode.orderid === undefined) {
              navigate(`/payment/error/${uuid()}`);
            } else {
              console.log(decode);
              setAssetID(decode.assetid);
              setNftName(decode.name);
              setStorePrice(decode.wei);
              setEndPoint(decode.endpoint);
              setStoreID(decode.storeid);
              setOrderID(decode.orderid);
              setNFTurl(decode.url);
              calc(decode);
            }
          } else {
            navigate(`/payment/error/${uuid()}`);
          }
        } else {
          console.log("Error, cannot decode Json WebToken");
          navigate(`/payment/error/${uuid()}`);
        }
      })
      .catch((err) => {
        console.log(err);
        navigate(`/payment/error/${uuid()}`);
      });
  }, []);

  const calc = async (storePrice) => {
    //get current ADA-ETh price
    const conversion = await getCurrentTFUEL_ETHprice();
    const final = conversion * 10 ** 18;
    setExchangeRate(final);

    // Convert Lovlace to ADA
    const price = storePrice.wei;
    const priceNumber = parseFloat(price);
    const TFUELamount = priceNumber / 10 ** 18;

    //get current ADA-ETh price

    console.log(TFUELamount);
    console.log(TFUELamount * conversion);
    const ETH_first = toNumberString(TFUELamount * conversion);

    //get USD price
    const ETH_USD = await getCurrentETH_USDprice();
    const USD_number_lang = parseFloat(ETH_USD);
    const USD_number = USD_number_lang.toFixed(2);

    // Fees
    const paymentprocess_prozent = ETH_first * 1.01 * 1.006;
    const paymentprocess = paymentprocess_prozent + 0.0055 + 0.0028 + 0.0044;
    const finalETH = paymentprocess * 1.02;
    console.log(finalETH);
    const number_string = toNumberString(finalETH);
    setCurrencyAmount(number_string);
    
    
  };

  const getCurrentTFUEL_ETHprice = async () => {
    const cryptoResponse = await axios.get(
      `https://min-api.cryptocompare.com/data/price?fsym=TFUEL&tsyms=ETH&api_key={1c4ac91e6cfe6b26fdb17cd046918a29aff4d7957c32f1c1df6109ad68ad2e1c}`
    );
    const number = parseFloat(cryptoResponse.data.ETH);
    return number;
  };

  const getCurrentETH_USDprice = async () => {
    const cryptoResponse = await axios.get(
      `https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key={1c4ac91e6cfe6b26fdb17cd046918a29aff4d7957c32f1c1df6109ad68ad2e1c}`
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

  const mintReceiptNFT = async () => {
    console.log("mint NFT");
    // Timestamp
    var datetime = new Date();
    //ExchangeRate
    var tfuel_eth = await getCurrentTFUEL_ETHprice();
    var exchangeRate = tfuel_eth * 10 ** 18;
    setExchangeRate(exchangeRate);

    var data = qs.stringify({
      assetId: assetID,
      ethereumAddress: payAddress,
      cardanoAddress: receiveAddress,
      cardanoStakeAddress: stakeAddress,
      time: datetime,
      exchangeRate: exchangeRate,
      amount: storePrice,
    });

    var config = {
      method: "post",
      url: "https://service.yokupass.com/yokupay/jpg/receiptNFT",
      headers: {
        Authorization: process.env.REACT_APP_BEAR,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
    };
    axios(config).then((json) => {
      if (
        json.data.data.message === "receipt NFT created" &&
        json.data.status === 200
      ) {
        setReceiptNFTtxHash(json.data.data.transactionHash);
        setCookie("y_rth", json.data.data.transactionHash);
        setLoadingSCinteraction(true);
        setLoadingReceiptNFT(false);
        const txH = json.data.data.transactionHash;
        SmartContractDeposit(txH);
      } else {
        setErrorReceiptNFTcreation("Error while creating NFT");
      }
    })
    .catch((err) => {console.log(err)})
  };

  const SmartContractDeposit = async (txH) => {
    //set up transaction parameters
    console.log(
      "Processing Contract: ",
      process.env.REACT_APP_CONTRACT_ADDRESS_1
    );
    const transactionParameters = {
      to: process.env.REACT_APP_CONTRACT_ADDRESS_1, // Required except during contract publications.
      from: payAddress, // must match user's active address.
      data: MyContract.methods.deposit(txH, exchangeRate).encodeABI(),
      value: web3_polygon.utils.toHex(
        web3_polygon.utils.toWei(currencyAmount, "ether")
      ),
    };
    /// 16.251651812438306638 Ether
    //sign the transaction
    try {
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });

      console.log("TxHash: ", txHash);

      // Hier muss geändert werden

      if (txHash) {
        console.log(txHash);
        setSCinteractionTxHash(txHash);
        setCookie("u_ctx", txHash);
        navigate(
          `/payment/${storeID}/order${orderID}/success/${assetID}`,
          { state: { order: orderID } }
        );
      } else {
        setLoadingSCinteraction(false);
      }
    } catch (error) {
      console.log("Error Messages :> ", error.message);
      setLoadingSCinteraction(false);
    }
  };

  useEffect(() => {
    const short =
      payAddress.slice(0, 5) +
      "..." +
      payAddress.slice(payAddress.length - 4, payAddress.length);
    setShortPayAddress(short);
  }, [payAddress]);

  useEffect(() => {
    console.log(receiptNFTtxHash);
    const short =
      receiptNFTtxHash.slice(0, 5) +
      "..." +
      receiptNFTtxHash.slice(
        receiptNFTtxHash.length - 4,
        receiptNFTtxHash.length
      );
    console.log(short);
    setShortTxHash(short);
  }, [receiptNFTtxHash]);

  if (loadingSCinteraction) {
    return (
      <div className="mainDiv">
        <div className="newCard">
          <div className="aroundPicture">
            <img className="nftpicture" src={nftURL}></img>
          </div>
          <div class="LoadingColumn">
            <div className="lds-ring">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <p className="loadingText">
              Waiting for your transaction to reach our smart contract...
            </p>
            <p className="receiptText">
              Receipt NFT:{" "}
              <a
                href={"https://polygonscan.com/tx/" + receiptNFTtxHash}
                target="_blank"
                className="pData"
              >
                {shortTxHash}
              </a>
            </p>
          </div>
        </div>
        <div className="footer">
          <div className="footerItems">
            <a href={"/yokupay/terms-and-conditions"} className="aData a1">
              Terms and Conditions
            </a>
            <a href={"/yokupay/privacy-policy"} className="aData a1">
              Privacy Policy
            </a>
            <a
              href={"https://discord.gg/QcUBHYxW"}
              target="_blank"
              className="aData a1"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loadingReceiptNFT) {
    return (
      <div className="mainDiv">
        <div className="newCard">
          <div className="aroundPicture">
            <img className="nftpicture" src={nftURL}></img>
          </div>
          <div class="LoadingColumn">
            <div className="lds-ring">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <p className="loadingText">Preparing the purchase...</p>
          </div>
        </div>
        <div className="footer">
          <div className="footerItems">
            <a href={"/yokupay/terms-and-conditions"} className="aData a1">
              Terms and Conditions
            </a>
            <a href={"/yokupay/privacy-policy"} className="aData a1">
              Privacy Policy
            </a>
            <a
              href={"https://discord.gg/QcUBHYxW"}
              target="_blank"
              className="aData a1"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {polygonNetwork ? (
        <></>
      ) : (
        <div className="ConnectBack">
          <img src="/svg/404.svg" className="Errimage"></img>
          <p className="pleaseText">
            Please connect back to the Polygon Mainnet
          </p>
          <button className="pressHere" onClick={() => changeNetwork()}>
            press here
          </button>
        </div>
      )}

      <div className="mainDiv">
        <div className="newCard">
          <div className="aroundPicture">
            <img className="nftpicture" src={nftURL}></img>
          </div>
          <div class="TextColumn">
            <div className="HeadlineFlex">
              <p className="TopHeadline">Purchase JPG.Store NFT</p>
              <div className="SegmentHeadlineFlex">
                <p className="CollectionName">{nftName}</p>
              </div>
            </div>
            <div className="InfoBoxFlex">
              <div className="GreyBox">
                <p className="GreyText">
                  You can now pay with Polygon on YokuPay! After the purchase
                  the NFT will be sent to your Cardano Wallet.
                </p>
                <div className="placeholderDiv"></div>
                <img src="/svg/polygon.svg" className="PolygonImage"></img>
              </div>
            </div>
            <div className="CalculationFlex">
              <div className="fees">
                <h1 className="fontFees">1 MATIC</h1>
                <div className="fontFeesDiv">
                  <h1 className="fontFees marginRight">Payment Processing</h1>
                  <LightTooltip title={paymentText}>
                    <HelpOutlineIcon />
                  </LightTooltip>
                </div>
              </div>
              <div className="line"></div>
              <div className="fees">
                <h1 className="fontFees">1%</h1>
                <div className="fontFeesDiv">
                  <h1 className="fontFees marginRight">Yoku Pay Fee</h1>
                  <LightTooltip title={yokuFeeText}>
                    <HelpOutlineIcon />
                  </LightTooltip>
                </div>
              </div>
              <div className="line"></div>
              <div className="fees">
                <h1 className="fontFeesSlim">2%</h1>
                <div className="fontFeesDiv">
                  <h1 className="fontFeesSlim marginRight">
                    Collateral (usually refunded)
                  </h1>
                  <LightTooltip title={colleteralText}>
                    <HelpOutlineIcon />
                  </LightTooltip>
                </div>
              </div>
              <div className="line"></div>
              <div className="price">
                <h1 className="fontTotal">Total: 2 MATIC</h1>
                <p className="subTotal">equals 4 ADA</p>
              </div>
            </div>
            <div className="FooterFlex">
              {receiveAddress.length > 0 && payAddress.length > 0 ? (
                <>
                  <p className="loggedInTag">
                    logged in with {shortPayAddress}
                  </p>
                  <div className="connectBuyButton">
                    <button
                      className="BuyButtonPolygon"
                      onClick={() => {
                        setLoadingReceiptNFT(true);
                        mintReceiptNFT();
                      }}
                    >
                      <h2 className="BuyButtonText">
                        Purchase NFT with Polygon
                      </h2>
                    </button>
                  </div>
                  <p className="ToSText">
                    You agree to <strong>Terms and Conditions</strong>
                  </p>
                </>
              ) : (
                <>
                  <div className="connectMetaMask">
                    <button
                      className="MetaMaskButton"
                      onClick={async () => {
                        const account = await connectMetaMask();
                        if (account !== false) {
                          setPayAddress(account);
                          setReceiveAddress(account);
                          setCookie("u_ead", account);
                          changeNetwork();
                        } else {
                          alert(
                            "Can not connect to MetaMask, please install MetaMask"
                          );
                        }
                      }}
                    >
                      <img className="MetaMaskImg" src={"/svg/MetaMask.svg"} />
                      <h2 className="MetaMaskText">Login with MetaMask</h2>
                    </button>
                    <button
                      className="MetaMaskButton"
                      onClick={async () => {
                        const account = await connectFlint();
                        if (account !== false) {
                          setReceiveAddress(account.address);
                          setStakeAddress(account.stakeAddress);
                          setCookie("u_cad", account.address);
                          changeNetwork();
                        } else {
                          alert(
                            "Can not connect to Flint, please install Flint"
                          );
                        }
                      }}
                    >
                      <img className="MetaMaskImg" src={"/svg/Flint.svg"} />
                      <h2 className="MetaMaskText">Login with Flint</h2>
                    </button>
                  </div>
                  <p className="ToSText">
                    You agree to <strong>Terms and Conditions</strong>
                  </p>
                </>
              )}
            </div>
          </div>
          {/* <div className="ErrorPage">
          <h1 className="ErrorHeader">Uuups, Error happend while redirect</h1>
          <p>Please contact YokuPay</p>
          <button className="buttonConfirm errorButton">To YokuPay</button>
        </div> */}
        </div>
        <div className="footer">
          <div className="footerItems">
            <a href={"/yokupay/terms-and-conditions"} className="aData a1">
              Terms and Conditions
            </a>
            <a href={"/yokupay/privacy-policy"} className="aData a1">
              Privacy Policy
            </a>
            <a
              href={"https://discord.gg/QcUBHYxW"}
              target="_blank"
              className="aData a1"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
//
