import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import uuid from "react-uuid";
import jwtDecoder from "jwt-decode";
import axios from "axios";
import qs from "qs";

import getCookie from "../../hooks/getCookie";
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
  nftName,
  tokenID,
  setNFTurl,
  nftURL,
  assetID
}) {

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
              setNFTcontract(decode.nftcontract);
              setMarketID(decode.marketid);
              setTokenID(decode.tokenid);
              setNftName(decode.name);
              setStorePrice(decode.wei);
              setEndPoint(decode.endpoint);
              setStoreID(decode.storeid);
              setOrderID(decode.orderid);
              setNFTurl(decode.url);
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
      <div className="newCard">
        <div className="aroundPicture">
          <img className="nftpicture" src={nftURL}></img>
        </div>
        <div class="SuccessColumn">
          <p className="congratsText ct">Congratulations!</p>
          <p className="orderText ct">Order ID: {orderID}</p>
          <p className="youPurchasedText ct">You just purchased:</p>
          <p className="nftNameText ct">
            <strong>{nftName}</strong> AssetID: {assetID}
          </p>
          <p className="orderDescText ct">
            Your order will arrive within the next 30 minutes. {nftName} {" "}
            will be visible under “My NFTs” on jpg.store.
          </p>
          <p className="questionsText">
            If you have questions, visit our Discord
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
