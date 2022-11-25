import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import jwtDecoder from "jwt-decode";
import qs from "qs";
import uuid from "react-uuid";

import removeCookie from "../../hooks/removeCookie";
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
  setNFTurl,
  nftURL,
  setAssetID
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
    removeCookie("y_rth");
    removeCookie("u_ead");
    removeCookie("u_cad");
    if (searchParams.has("order")) {
      var data = qs.stringify({
        orderID: searchParams.get("order"),
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
            setAssetID(decode.AssetID);
            setNftName(decode.Name);
            setStorePrice(decode.Wei);
            setEndPoint(decode.Endpoint);
            setStoreID(decode.StoreID);
            setOrderID(decode.Orderid);
            setNFTurl(decode.url);
            console.log(decode);
            navigate(
              `/payment/${decode.storeid}/order${decode.orderid}/connect/${decode.AssetID}`,
              { state: { order: decode.orderid } }
            );
          } else {
            console.log("Error, cannot decode Json WebToken");
            navigate(`/payment/error/${uuid()}`);
          }
        })
        .catch((err) => {
          console.log(err);
          navigate(`/payment/error/${uuid()}`);
        });
    } else {
      navigate(`/payment/error/${uuid()}`);
    }
  }, []);

  return <></>;
}
