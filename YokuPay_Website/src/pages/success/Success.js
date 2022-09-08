import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import uuid from "react-uuid";
import jwtDecoder from "jwt-decode";
import axios from "axios";
import qs from "qs";

import getCookie from "../../hooks/getCookie";
import removeCookie from "../../hooks/removeCookie";
import { useLocation, useNavigate } from "react-router-dom";

export default function Success({
  orderID,
  contractTransactionHash,
  endPoint,
  setContractTransactionHash,
  setNFTcontract,
  setMarketID,
  setTokenID,
  setNftName,
  setStorePrice,
  setOrderID,
  setEndPoint,
  setStoreID,
  setBillingNFT,
}) {
  const confirm = () => {
    removeCookie("y_rth");
    removeCookie("u_ead");
    removeCookie("u_cad");

    window.location.replace(endPoint);
  };

  const navigate = useNavigate();
  const state = useLocation();

  useEffect(() => {
    setContractTransactionHash(getCookie("u_ctx"));
  });

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

  return (
    <div className="mainDiv">
      <div className="card">
        <div className="headerLogo">
          <img className="headerLogoIMG" src={"/svg/YokuLogo.svg"} />
        </div>
        <div className="headerTitle">
          <h1 className="headerTitleh1">Congrats</h1>
        </div>
        <img className="successImg" src={"/svg/SuccessImg.svg"} />
        <div className="textDiv">
          <h1 className="textSuccessH1">Your NFT will arrive within 30min</h1>
          <p className="textSuccessP">Oder ID: {orderID} </p>
          <p className="textSuccessP">
            Transaction Hash:{" "}
            <a
              href={"https://etherscan.com/tx/" + contractTransactionHash}
              target="_blank"
              className="pData"
            >
              {contractTransactionHash}
            </a>{" "}
          </p>
          <button
            className="buttonSuccess"
            onClick={() => {
              confirm();
            }}
          >
            Back to store
          </button>
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
