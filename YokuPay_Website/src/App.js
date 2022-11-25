import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import jwtDecoder from "jwt-decode";

import ErrorPage from "./pages/error/ErrorPage";
import Connect from "./pages/process/Connect";
import Success from "./pages/success/Success";
import Landing from "./pages/process/Landing";
import TermsAndConditions from "./pages/legal/TermsAndConditions";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";


import getCookie from "./hooks/getCookie";

/*example*/

function App() {
  //ReceiptNFT
  const [nftContract, setNFTcontract] = useState("");
  const [marketID, setMarketID] = useState("");
  const [payAddress, setPayAddress] = useState("");
  const [receiveAddress, setReceiveAddress] = useState("");
  const [billingNFT, setBillingNFT] = useState("");
  const [contractTransactionHash, setContractTransactionHash] = useState("");
  const [orderID, setOrderID] = useState("");
  const [nftURL, setNFTurl] = useState("")
  const [assetID, setAssetID] = useState("")
  const [stakeAddress, setStakeAddress] = useState("")

  //Connect
  const [fees, setFees] = useState();
  const [dollarAmount, setDollarAmount] = useState(0);
  const [cryptoAmount, setCryptoAmount] = useState(0);
  const [currency, setCurrency] = useState("");
  const [tokenID, setTokenID] = useState();
  const [nftName, setNftName] = useState("");
  //Store
  const [storePrice, setStorePrice] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [storeID, setStoreID] = useState("");

  useEffect(() => {
    if (getCookie("y_wt") !== undefined) {
      const decode = jwtDecoder(getCookie("y_wt"));

      if (decode) {
        setAssetID(decode.AssetID);
        setNftName(decode.Name);
        setStorePrice(decode.Wei);
        setEndPoint(decode.Endpoint);
        setStoreID(decode.StoreID);
        setOrderID(decode.Orderid);
        console.log(decode);
      } else {
        console.log("Error, cannot decode Json WebToken");
      }
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/payment/:storeid/:orderid/connect/:assetID"
          element={
            <Connect
              setNFTcontract={setNFTcontract}
              setMarketID={setMarketID}
              setTokenID={setTokenID}
              setNftName={setNftName}
              setStorePrice={setStorePrice}
              setOrderID={setOrderID}
              setEndPoint={setEndPoint}
              setStoreID={setStoreID}
              fees={fees}
              dollarAmount={dollarAmount}
              cryptoAmount={cryptoAmount}
              currency={currency}
              tokenID={tokenID}
              nftName={nftName}
              payAddress={payAddress}
              receiveAddress={receiveAddress}
              setReceiveAddress={setReceiveAddress}
              setPayAddress={setPayAddress}
              nftContract={nftContract}
              marketID={marketID}
              storeID={storeID}
              orderID={orderID}
              storePrice={storePrice}
              setCryptoAmount={setCryptoAmount}
              setDollarAmount={setDollarAmount}
              setFees={setFees}
              setNFTurl={setNFTurl}
              nftURL={nftURL}
              setAssetID={setAssetID}
              assetID={assetID}
              setStakeAddress={setStakeAddress}
              stakeAddress={stakeAddress}
            />
          }
        />
        <Route
          path="/payment/:storeid/:orderid/success/:assetid"
          element={
            <Success
              setNFTcontract={setNFTcontract}
              setMarketID={setMarketID}
              setTokenID={setTokenID}
              setNftName={setNftName}
              setStorePrice={setStorePrice}
              setOrderID={setOrderID}
              setEndPoint={setEndPoint}
              setStoreID={setStoreID}
              orderID={orderID}
              contractTransactionHash={contractTransactionHash}
              endPoint={endPoint}
              setContractTransactionHash={setContractTransactionHash}
              setBillingNFT={setBillingNFT}
              nftName={nftName}
              tokenID={tokenID}
              setNFTurl={setNFTurl}
              nftURL={nftURL}
              setAssetID={setAssetID}
              assetID={assetID}
            />
          }
        />
        <Route
          path="/payment/pay"
          element={
            <Landing
              setNFTcontract={setNFTcontract}
              setMarketID={setMarketID}
              setTokenID={setTokenID}
              setNftName={setNftName}
              setStorePrice={setStorePrice}
              setOrderID={setOrderID}
              setEndPoint={setEndPoint}
              setStoreID={setStoreID}
              setNFTurl={setNFTurl}
              nftURL={nftURL}
              setAssetID={setAssetID}
            />
          }
        />
        <Route path="/payment/error/:id" element={<ErrorPage />} />
        <Route
          path="/yokupay/terms-and-conditions"
          element={<TermsAndConditions />}
        />
        <Route path="/yokupay/privacy-policy" element={<PrivacyPolicy />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
