// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import Web3 from "web3";
// import "bootstrap/dist/css/bootstrap.min.css";
// import uuid from "react-uuid";
// import jwtDecoder from "jwt-decode";
// import axios from "axios";
// import qs from "qs";

// import getCookie from "../../hooks/getCookie";
// import setCookie from "../../hooks/setCookie";
// // const simpleContractAbi = require("./config/contract.json").abi;

// export default function ReceiptNFT({
//   nftContract,
//   marketID,
//   payAddress,
//   receiveAddress,
//   orderID,
//   billingNFT,
//   setContractTransactionHash,
//   storeID,
//   setReceiveAddress,
//   setPayAddress,
//   setBillingNFT,
//   storePrice,
//   setNFTcontract,
//   setMarketID,
//   setTokenID,
//   setNftName,
//   setStorePrice,
//   setOrderID,
//   setEndPoint,
//   setStoreID,
// }) {
//   const [errorChainLinkCall, setErrorChainLinkCall] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [exchangeRate, setExchangeRate] = useState(0);
//   const [currencyAmount, setCUrrencyAmount] = useState(0);
//   const [jwt, setJWT] = useState("");

//   const navigate = useNavigate();
//   const state = useLocation();

//   const web3_polygon = new Web3(
//     new Web3.providers.HttpProvider(process.env.REACT_APP_INFURA_URL)
//   );

//   const MyContract = new web3_polygon.eth.Contract(
//     simpleContractAbi,
//     process.env.REACT_APP_CONTRACT_ADDRESS_1
//   );

//   const back = () => {
//     navigate(
//       `/payment/${storeID}/order${orderID}/checkout/${nftContract}/${marketID}`,
//       { state: { order: orderID } }
//     );
//   };

//   useEffect(() => {
//     if (
//       getCookie("y_rth") !== undefined &&
//       getCookie("u_ead") !== undefined &&
//       getCookie("u_cad") !== undefined
//     ) {
//       setBillingNFT(getCookie("y_rth"));
//       setReceiveAddress(getCookie("u_cad"));
//       setPayAddress(getCookie("u_ead"));
//     }
//   }, []);

//   useEffect(() => {
//     var data = qs.stringify({
//       orderID: state.state.order,
//     });

//     var config = {
//       method: "post",
//       url: "https://service.yokupass.com/database/jwt",
//       headers: {
//         Authorization: process.env.REACT_APP_BEAR,
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//       data: data,
//     };

//     axios(config)
//       .then((json) => {
//         console.log(json.data);
//         const decode = jwtDecoder(json.data.token);
//         setJWT(json.data.token);
//         if (decode) {
//           if (decode !== undefined) {
//             if (decode.tokenid === undefined && decode.orderid === undefined) {
//               navigate(`/payment/error/${uuid()}`);
//             } else {
//               setNFTcontract(decode.nftcontract);
//               setMarketID(decode.marketid);
//               setTokenID(decode.tokenid);
//               setNftName(decode.name);
//               setStorePrice(decode.wei);
//               setEndPoint(decode.endpoint);
//               setStoreID(decode.storeid);
//               setOrderID(decode.orderid);
//               console.log(decode);
//               calc(decode);
//             }
//           } else {
//             navigate(`/payment/error/${uuid()}`);
//           }
//         } else {
//           console.log("Error, cannot decode Json WebToken");
//           navigate(`/payment/error/${uuid()}`);
//         }
//       })
//       .catch((err) => {
//         console.log(err);
//         navigate(`/payment/error/${uuid()}`);
//       });
//   }, []);

//   const calc = async (decode) => {
//     //get current ADA-ETh price
//     const conversion = await getCurrentTFUEL_ETHprice();
//     const final = conversion * 10 ** 18;
//     setExchangeRate(final);

//     // Convert Lovlace to ADA
//     const price = decode.wei;
//     const priceNumber = parseFloat(price);
//     const TFUELamount = priceNumber / 10 ** 18;

//     //get current ADA-ETh price

//     console.log(TFUELamount);
//     console.log(TFUELamount * conversion);
//     const ETH_first = toNumberString(TFUELamount * conversion);

//     //get USD price
//     const ETH_USD = await getCurrentETH_USDprice();
//     const USD_number_lang = parseFloat(ETH_USD);
//     const USD_number = USD_number_lang.toFixed(2);

//     // Fees
//     const paymentprocess_prozent = ETH_first * 1.01 * 1.006;
//     const paymentprocess = paymentprocess_prozent + 0.0055 + 0.0028 + 0.0044;
//     const finalETH = paymentprocess * 1.02;
//     console.log(finalETH);
//     const number_string = toNumberString(finalETH);
//     setCUrrencyAmount(number_string);
//   };

//   const getCurrentTFUEL_ETHprice = async () => {
//     const cryptoResponse = await axios.get(
//       `https://min-api.cryptocompare.com/data/price?fsym=TFUEL&tsyms=ETH&api_key={1c4ac91e6cfe6b26fdb17cd046918a29aff4d7957c32f1c1df6109ad68ad2e1c}`
//     );
//     const number = parseFloat(cryptoResponse.data.ETH);
//     return number;
//   };

//   const getCurrentETH_USDprice = async () => {
//     const cryptoResponse = await axios.get(
//       `https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key={1c4ac91e6cfe6b26fdb17cd046918a29aff4d7957c32f1c1df6109ad68ad2e1c}`
//     );
//     const number = parseFloat(cryptoResponse.data.USD);
//     return number;
//   };

//   function toNumberString(num) {
//     if (Number.isInteger(num)) {
//       return num + ".0";
//     } else {
//       return num.toString();
//     }
//   }

//   // new
//   const buyNow = async () => {
//     setLoading(true);
//     //set up transaction parameters
//     const transactionParameters = {
//       to: "0xbe97d1BcfA579611d8681CF3F11B80AF064C2c97", // Required except during contract publications.
//       from: payAddress, // must match user's active address.
//       data: MyContract.methods.deposit(billingNFT, exchangeRate).encodeABI(),
//       value: web3_polygon.utils.toHex(web3_polygon.utils.toWei(currencyAmount, "ether")),
//     };
//     /// 16.251651812438306638 Ether
//     //sign the transaction
//     try {
//       const txHash = await window.ethereum.request({
//         method: "eth_sendTransaction",
//         params: [transactionParameters],
//       });

//       console.log("TxHash: ", txHash);

//       // Hier muss geändert werden

//       if (txHash) {
//         console.log(txHash);
//         setContractTransactionHash(txHash);
//         setCookie("u_ctx", txHash);

//         var data = qs.stringify({
//           nftContract,
//           marketID,
//           value: storePrice,
//         });

//         const transactionParametersPurchase = {
//           to: "0xbe97d1BcfA579611d8681CF3F11B80AF064C2c97", // Required except during contract publications.
//           from: payAddress, // must match user's active address.
//           data: MyContract.methods
//             .deposit(billingNFT, exchangeRate)
//             .encodeABI(),
//           value: web3_polygon.utils.toHex(web3_polygon.utils.toWei(currencyAmount, "ether")),
//         };

//         const txHashPurchase = await window.ethereum.request({
//           method: "eth_sendTransaction",
//           params: [transactionParametersPurchase],
//         });

//         if (txHashPurchase) {
//           var data = qs.stringify({
//             transactionHash: billingNFT,
//             marketID,
//             ethereumAddress: payAddress,
//           });

//           var config = {
//             method: "post",
//             url: "https://utxo.yokupass.com/yokupay/opentheta/checkUTXO",
//             headers: {
//               Authorization: process.env.REACT_APP_BEAR,
//               "Content-Type": "application/x-www-form-urlencoded",
//             },
//             data: data,
//           };
//           axios(config).then((response) => {
//             if (response.status === 200) {
//               const datetime = new Date();
//               const datetimeUnix = Math.floor(new Date().getTime() / 1000.0);
//               var data = qs.stringify({
//                 orderID: state.state.order,
//                 token: jwt,
//                 receiptTxH: getCookie("y_rth"),
//                 contractTxH: txHash,
//                 ethAddress: payAddress,
//                 nativeAddress: receiveAddress,
//                 closedAt: datetime,
//                 closedAtUnix: datetimeUnix,
//               });

//               var config = {
//                 method: "post",
//                 url: "https://service.yokupass.com/database/closed_orders",
//                 headers: {
//                   Authorization: process.env.REACT_APP_BEAR,
//                   "Content-Type": "application/x-www-form-urlencoded",
//                 },
//                 data: data,
//               };

//               axios(config).then(() => {
//                 if (response.status === 200) {
//                   setLoading(false);
//                   navigate(
//                     `/payment/${storeID}/order${orderID}/success/${nftContract}/${marketID}`,
//                     { state: { order: orderID } }
//                   );
//                 }
//               });
//             } else {
//               setErrorChainLinkCall(
//                 "Error interacting with the smart contratc"
//               );
//             }
//           });
//         } else {
//           setLoading(false);
//           console.log("Error while pruchasing NFT");
//         }

//         return;
//       }
//     } catch (error) {
//       setLoading(false);
//       console.log(error.message);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="mainDiv">
//         <div className="card loadingCard">
//           <div className="lds-ring">
//             <div></div>
//             <div></div>
//             <div></div>
//             <div></div>
//           </div>
//         </div>
//         <div className="footer">
//           <div className="footerItems">
//             <a>Terms and Conditions</a>
//             <a>Privacy Policy</a>
//             <a>FAQ</a>
//             <a>Contact Us</a>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="mainDiv">
//       <div className="card">
//         <div className="headerLogo">
//           <img className="headerLogoIMG" src={"/svg/YokuLogo.svg"} />
//         </div>
//         <div className="headerTitle">
//           <h1 className="headerTitleh1">Purchase Theta NFT</h1>
//         </div>
//         <div className="receiptData">
//           <h2 className="receiptNFTdata">Receipt NFT Data</h2>
//           <div className="NFTdata">
//             <p className="pDataTitle">
//               NFT Contract: <p className="pData">{nftContract}</p>{" "}
//             </p>
//             <p className="pDataTitle">
//               Market ID: <p className="pData">{marketID}</p>{" "}
//             </p>
//             <p className="pDataTitle">
//               Payment Address: <p className="pData">{payAddress}</p>
//             </p>
//             <p className="pDataTitle">
//               Receiver Address: <p className="pData">{receiveAddress}</p>{" "}
//             </p>
//             <p className="pDataTitle">
//               Order ID: <p className="pData">{orderID}</p>{" "}
//             </p>
//             <p className="pDataTitle">
//               Transaction Hash:{" "}
//               <a
//                 href={"https://polygonscan.com/tx/" + billingNFT}
//                 target="_blank"
//                 className="pData a"
//               >
//                 <p className="pData a">{billingNFT}</p>
//               </a>{" "}
//             </p>
//           </div>
//         </div>
//         <div className="buttons">
//           <button
//             className="buttonCancel"
//             onClick={() => {
//               back();
//             }}
//           >
//             Cancel
//           </button>
//           <button
//             className="buttonConfirm"
//             onClick={() => {
//               buyNow();
//             }}
//           >
//             Buy Now
//           </button>
//         </div>
//         <div className="ToS_1">
//           <p>
//             You agree to the <a className="Tosa">Terms and Conditions</a>.
//           </p>
//         </div>
//       </div>
//       <div className="footer">
//         <div className="footerItems">
//           <a href={"/yokupay/terms-and-conditions"} className="aData a1">
//             Terms and Conditions
//           </a>
//           <a href={"/yokupay/privacy-policy"} className="aData a1">
//             Privacy Policy
//           </a>
//           <a
//             href={"https://discord.gg/QcUBHYxW"}
//             target="_blank"
//             className="aData a1"
//           >
//             Contact Us
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// }
