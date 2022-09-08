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

import connectMetaMask from "../../web3/connectMetaMask";
import setCookie from "../../hooks/setCookie";
import getCookie from "../../hooks/getCookie";

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
}) {
  const navigate = useNavigate();

  const state = useLocation();

  const paymentText =
    "This fee consists of the 1% Yoku Pay fee, the exchange Fee and gas costs for occuring fund transfers.";
  const colleteralText =
    "This is a security payment for possible fast price changes between the cryptocurrencies. This covers a price change up until 2%, any price changes above that are covered by us. Should the price not move, then you will be refunded this amout or part of it.";

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

  const nextPage = () => {
    navigate(
      `/payment/${storeID}/order${orderID}/checkout/${nftContract}/${marketID} `,
      { state: { order: orderID } }
    );
  };

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

  return (
    <div className="mainDiv">
      <div className="card">
        <div className="headerLogo">
          <img className="headerLogoIMG" src={"/svg/YokuLogo.svg"} />
        </div>
        <div className="headerTitle">
          <h1 className="headerTitleh1">Purchase Theta NFT</h1>
        </div>
        <div className="connectMetaMask">
          <button
            className="MetaMaskButton"
            onClick={async () => {
              const account = await connectMetaMask();
              if (account !== false) {
                setPayAddress(account);
                setReceiveAddress(account);
                setCookie("u_ead", account);
                setCookie("u_cad", account);
              } else {
                alert("Can not connect to MetaMask, please install MetaMask");
              }
            }}
          >
            <img className="MetaMaskImg" src={"/svg/MetaMask.svg"} />
            <h2 className="MetaMaskText">
              {payAddress ? payAddress : "Login with MetaMask"}
            </h2>
          </button>
        </div>

        <div className="line marginTop"></div>
        <div className="fees">
          <h1 className="fontFees">{fees} $</h1>
          <div className="fontFeesDiv">
            <h1 className="fontFees marginRight">Payment Processing</h1>
            <LightTooltip title={paymentText}>
              <HelpOutlineIcon />
            </LightTooltip>
          </div>
        </div>
        <div className="line"></div>
        <div className="fees">
          <h1 className="fontFees">2%</h1>
          <div className="fontFeesDiv">
            <h1 className="fontFees marginRight">
              Collateral (may be refunded)
            </h1>
            <LightTooltip title={colleteralText}>
              <HelpOutlineIcon />
            </LightTooltip>
          </div>
        </div>
        <div className="line"></div>
        <div className="price">
          <h1 className="fontTotal">Total: ${dollarAmount}</h1>
          <p className="fontNFTspecs">
            for Token {tokenID} - "{nftName}"{" "}
          </p>
        </div>
        {receiveAddress.length > 0 && payAddress.length > 0 ? (
          <>
            <div className="buttons">
              <button
                className="buttonNext"
                onClick={() => {
                  nextPage();
                }}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <></>
        )}
        <div className="ToS">
          <p>
            You agree to the{" "}
            <a className="Tosa" href={"/yokupay/terms-and-conditions"}>
              Terms and Conditions
            </a>
            .
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
