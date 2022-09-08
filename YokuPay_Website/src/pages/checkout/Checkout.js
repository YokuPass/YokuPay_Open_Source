import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import uuid from "react-uuid";
import jwtDecoder from "jwt-decode";
import axios from "axios";
import qs from "qs";

import setCookie from "../../hooks/setCookie";
import getCookie from "../../hooks/getCookie";

export default function Checkout({
  fees,
  dollarAmount,
  cryptoAmount,
  currency,
  tokenID,
  nftName,
  nftContract,
  marketID,
  receiveAddress,
  payAddress,
  setBillingNFT,
  storeID,
  orderID,
  setReceiveAddress,
  setPayAddress,
  setCryptoAmount,
  setDollarAmount,
  setFees,
  storePrice,
  setNFTcontract,
  setMarketID,
  setTokenID,
  setNftName,
  setStorePrice,
  setOrderID,
  setEndPoint,
  setStoreID,
}) {
  const [loading, setLoading] = useState(false);
  const [errorNFTcreation, setErrorNFTcreation] = useState("");

  const navigate = useNavigate();

  const state = useLocation();

  const back = () => {
    navigate(
      `/payment/${storeID}/order${orderID}/connect/${nftContract}/${marketID}`, {state: {order: orderID}}
    );
  };

  const next = async () => {
    setLoading(true);
    // Timestamp
    var datetime = new Date();
    //ExchangeRate
    var tfuel_eth = await getCurrentTFUEL_ETHprice();
    var exchangeRate = tfuel_eth * 10 ** 18;

    var data = qs.stringify({
      NFTcontract: nftContract,
      MarketID: marketID,
      ThetaAddress: receiveAddress,
      TokenID: tokenID,
      EthereumAddress: payAddress,
      Timestamp: datetime,
      ExchangeRate: exchangeRate,
      Amount: storePrice,
    });

    var config = {
      method: "post",
      url: "https://receipt-nft.yokupass.com/yokupay/opentheta/receiptNFT",
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
        setBillingNFT(json.data.data.transactionHash);
        setCookie("y_rth", json.data.data.transactionHash);
        navigate(
          `/payment/${storeID}/order${orderID}/receiptNFT/${nftContract}/${marketID}`, {state: {order: orderID}}
        );
      } else {
        setErrorNFTcreation("Error while creating NFT");
      }
    });
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
      url: "https://receipt-nft.yokupass.com/database/jwt",
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
              setNFTcontract(decode.nftcontract);
              setMarketID(decode.marketid);
              setTokenID(decode.tokenid);
              setNftName(decode.name);
              setStorePrice(decode.wei);
              setEndPoint(decode.endpoint);
              setStoreID(decode.storeid);
              setOrderID(decode.orderid);
              console.log(decode);
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

  const calc = async (decode) => {
    // Convert Wei -> TFUEL
    const price = decode.wei;
    const priceNumber = parseFloat(price);
    const TFUELamount = priceNumber / 10 ** 18;

    //get current ADA-ETh price
    const conversion = await getCurrentTFUEL_ETHprice();
    const ETH_first = toNumberString(TFUELamount * conversion);

    //get USD price
    const ETH_USD = await getCurrentETH_USDprice();
    const USD_number_lang = parseFloat(ETH_USD);
    const USD_number = USD_number_lang.toFixed(2);

    // Fees
    const paymentprocess_prozent = ETH_first * 1.01 * 1.006;
    const paymentprocess = paymentprocess_prozent + 0.0055 + 0.0028 + 0.0044;
    const finalETH = (paymentprocess * 1.02).toFixed(5);

    // Fees in percent

    const percent = paymentprocess - ETH_first;
    // const percent_1 = finalETH / 100
    // const percent_final = percent / percent_1

    // Set Values
    const ETH = toNumberString(finalETH);
    setCryptoAmount(ETH);

    const Dollar = (USD_number * ETH).toFixed(2);
    setDollarAmount(Dollar);

    const dollarFees = (USD_number * percent).toFixed(2);
    setFees(dollarFees);
  };

  const getCurrentTFUEL_ETHprice = async () => {
    const cryptoResponse = await axios.get(
      `https://min-api.cryptocompare.com/data/price?fsym=TFUEL&tsyms=ETH&api_key={${REACT_APP_CRYPTOCOMPARE}}`
    );
    const number = parseFloat(cryptoResponse.data.ETH);
    return number;
  };

  const getCurrentETH_USDprice = async () => {
    const cryptoResponse = await axios.get(
      `https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key={${REACT_APP_CRYPTOCOMPARE}}`
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

  if (loading) {
    return (
      <div className="mainDiv">
        <div className="card loadingCard">
          <div className="lds-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
        <div className="footer">
          <div className="footerItems">
            <a>Terms and Conditions</a>
            <a>Privacy Policy</a>
            <a>FAQ</a>
            <a>Contact Us</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mainDiv">
      <div className="card">
        <div className="headerLogo">
          <img className="headerLogoIMG" src={"/svg/YokuLogo.svg"} />
        </div>
        <div className="headerTitle">
          <h1 className="headerTitleh1">Purchase Theta NFT</h1>
        </div>
        <div className="CurrencyGrid">
          <button className="fontCurrencys">
            <img className="ethLogo" src={"/svg/Ethereum.svg"} />
            Ethereum
          </button>
        </div>
        <div className="line marginTop"></div>
        <div className="fees">
          <h1 className="fontFees">{fees} $</h1>
          <h1 className="fontFees">Payment Processing</h1>
        </div>
        <div className="line"></div>
        <div className="fees">
          <h1 className="fontFees">2 %</h1>
          <h1 className="fontFees">Collateral (may be refunded)</h1>
        </div>
        <div className="line"></div>
        <div className="price">
          <h1 className="fontTotal">
            Total: ${dollarAmount} / {cryptoAmount} {currency}
          </h1>
          <p className="fontNFTspecs">
            for Token {tokenID} - "{nftName}"{" "}
          </p>
        </div>
        <div className="buttons">
          <button
            className="buttonCancel"
            onClick={() => {
              back();
            }}
          >
            Cancel
          </button>
          <button
            className="buttonConfirm"
            onClick={() => {
              next();
            }}
          >
            Confirm
          </button>
        </div>
        <div className="ToS_1">
          <p>
            You agree to the <a className="Tosa">Terms and Conditions</a>.
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
