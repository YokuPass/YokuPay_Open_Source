import React from "react";

export default function NewError() {
  return (
    <div className="mainDiv">
      <div className="newCard">
        <div className="wrapperError">
          <img className="errorlady" src={"/svg/error.svg"}></img>
          <p>Something went wrong...</p>
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
