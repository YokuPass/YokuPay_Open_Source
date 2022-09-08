import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import jwtDecoder from "jwt-decode";
import qs from "qs";

import setCookie from "../../hooks/setCookie";

// This Components is just used to Redirect
export default function Landing({
  setNFTcontract,
  setMarketID,
  setTokenID,
  setNftName,
  setStorePrice,
  setOrderID,
  setEndPoint,
  setStoreID,
}) {
  const [errorPage, setErrorPage] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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

  useEffect(() => {
    if (searchParams.has("order")) {
      var data = qs.stringify({
        orderID: searchParams.get("order"),
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
            setNFTcontract(decode.nftcontract);
            setMarketID(decode.marketid);
            setTokenID(decode.tokenid);
            setNftName(decode.name);
            setStorePrice(decode.wei);
            setEndPoint(decode.endpoint);
            setStoreID(decode.storeid);
            setOrderID(decode.orderid);
            console.log(decode);
            navigate(
              `/payment/${decode.storeid}/order${decode.orderid}/connect/${
                decode.orderid
              }/${decode.nftcontract}`,
              { state: { order: decode.orderid } }
            );
          } else {
            console.log("Error, cannot decode Json WebToken");
            setErrorPage(true);
          }
        })
        .catch((err) => {
          console.log(err);
          setErrorPage(true);
        });
    } else {
      setErrorPage(true);
    }
  }, []);

  const backToStore = () => {
    window.location.replace("https://yokupass.com");
  };

  if (errorPage) {
    return (
      <div className="mainDiv">
        <div className="card">
          <div className="ErrorPage">
            <h1 className="ErrorHeader">Uuups, Error happend while redirect</h1>
            <p>Please contact YokuPay</p>
            <button
              className="buttonConfirm errorButton"
              onClick={() => {
                backToStore();
              }}
            >
              To YokuPay
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
}

// Bsp.: http://localhost:3000/pay?nftcontract= &marketid= &tokenid= &name= &wei= &endpoint=
// https://pay.yokupass.com/payment/pay?assetid=a02684b9ece84a4341585d2ae813163356ba0ca950091d1935bdb9054855534b59484f53544c45523137333038&policyid=a02684b9ece84a4341585d2ae813163356ba0ca950091d1935bdb905&collection=The-Ape-Society&name=Telford-White&lovelace=100000000&endpoint=https://www.jpg.store&storeid=jpg

// https://pay.yokupass.com/payment/pay?assetid=a02684b9ece84a4341585d2ae813163356ba0ca950091d1935bdb9054855534b59484f53544c45523137333038&policyid=a02684b9ece84a4341585d2ae813163356ba0ca950091d1935bdb905&collection=The-Ape-Society&name=Telford-White&lovelace=10000000&endpoint=https://www.jpg.store&storeid=jpg

// https://pay.yokupass.com/payment/pay?nftcontract=0xda05058a12541a18f45123e4f0475f93422445e1&marketid=23338&tokenid=1662&name=Test&wei=6000000000000000000&endpoint=https://www.opentheta.io&storeid=opentheta
// https://pay.yokupass.com/payment/pay?nftcontract=-------------&marketid=--------&tokenid=----------&name=--------&wei=5000000000000000000&endpoint=https://www.opentheta.io&storeid=opentheta
