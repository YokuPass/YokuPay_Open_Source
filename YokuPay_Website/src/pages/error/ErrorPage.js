import React from "react";

const backToStore = () => {
    window.location.replace("https://yokupass.com");
  };

export default function ErrorPage() {
    return (
        <div className="mainDiv">
          <div className="card">
            <div className="ErrorPage">
              <h1 className="ErrorHeader">Uuups, could not find order</h1>
              <p>Please contact YokuPay</p>
              <button
                className="buttonConfirm errorButton"
                onClick={() => {
                  backToStore();
                }}
              >
                Back
              </button>
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