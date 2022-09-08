import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import jwtDecoder from "jwt-decode";

import ErrorPage from "./pages/error/ErrorPage";
import Connect from "./pages/process/Connect";
import Checkout from "./pages/checkout/Checkout";
import ReceiptNFT from "./pages/receiptNFT/ReceiptNFT";
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
        setNFTcontract(decode.nftcontract);
        setMarketID(decode.marketid);
        setTokenID(decode.tokenid);
        setNftName(decode.name);
        setStorePrice(decode.wei);
        setEndPoint(decode.endpoint);
        setStoreID(decode.storeid);
        setOrderID(decode.orderid);
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
          path="/payment/:storeid/:orderid/connect/:tokenid/:nftcontract"
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
            />
          }
        />
        <Route
          path="/payment/:storeid/:orderid/checkout/:tokenid/:nftcontract"
          element={
            <Checkout
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
              nftContract={nftContract}
              marketID={marketID}
              receiveAddress={receiveAddress}
              payAddress={payAddress}
              setBillingNFT={setBillingNFT}
              storeID={storeID}
              orderID={orderID}
              setReceiveAddress={setReceiveAddress}
              setPayAddress={setPayAddress}
              setCryptoAmount={setCryptoAmount}
              setDollarAmount={setDollarAmount}
              setFees={setFees}
              storePrice={storePrice}
            />
          }
        />
        <Route
          path="/payment/:storeid/:orderid/receiptNFT/:tokenid/:nftcontract"
          element={
            <ReceiptNFT
              setNFTcontract={setNFTcontract}
              setMarketID={setMarketID}
              setTokenID={setTokenID}
              setNftName={setNftName}
              setStorePrice={setStorePrice}
              setOrderID={setOrderID}
              setEndPoint={setEndPoint}
              setStoreID={setStoreID}
              nftContract={nftContract}
              marketID={marketID}
              payAddress={payAddress}
              receiveAddress={receiveAddress}
              orderID={orderID}
              billingNFT={billingNFT}
              setContractTransactionHash={setContractTransactionHash}
              storeID={storeID}
              setReceiveAddress={setReceiveAddress}
              setPayAddress={setPayAddress}
              setBillingNFT={setBillingNFT}
              storePrice={storePrice}
            />
          }
        />
        <Route
          path="/payment/:storeid/:orderid/success/:tokenid/:nftcontract"
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
