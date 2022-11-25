{receiveAddress.length > 0 ? (
    <>
      <div className="ShowCardanoField">
        <img className="cardanoLogo" src={"/svg/CardanoLogo.svg"} />
        <p className="CardanoAddressFont">{receiveAddress}</p>
      </div>
    </>
  ) : (
    <div className="connectCardano">
      <div className="dropdown">
        <button className="dropbtn">
          <img className="cardanoLogo" src={"/svg/CardanoLogo.svg"} />
          <p className="CardanoAddressFont">Connect Cardano Wallet</p>
        </button>
        <div className="dropdown-content">
          <button
            className="buttonDropDown radiusTop"
            onClick={async () => {
              const address = await connectNami();
              if (address !== false) {
                setReceiveAddress(address.address); // address.address
                setCardanoStakeAddress(address.stakeAddress); // address.stakeAddress
                setCookie("u_st", address.stakeAddress);
                setCookie("u_cad", address.address);
                console.log(address);
              } else {
                alert(
                  "Can not connect to Nami Wallet, please install Nami Wallet"
                );
              }
            }}
          >
            <img className="imgWallets" src={"/svg/Nami.svg"}></img>
            <p className="buttonDropFont">Nami</p>
          </button>
          <button
            className="buttonDropDown"
            onClick={async () => {
              const address = await connectCCValt();
              if (address !== false) {
                setReceiveAddress(address.address);
                setCardanoStakeAddress(address.stakeAddress);
                setCookie("u_st", address.stakeAddress);
                setCookie("u_cad", address.address);
                console.log(address);
              } else {
                alert(
                  "Can not connect to Nami Wallet, please install Eternl Wallet"
                );
              }
            }}
          >
            <img className="imgWallets" src={"/svg/Eternl.svg"} />
            <p className="buttonDropFont">Eternl</p>
          </button>
          <button
            className="buttonDropDown radiusBottom"
            onClick={async () => {
              const address = await connectFlint();
              if (address !== false) {
                setReceiveAddress(address.address);
                setCardanoStakeAddress(address.stakeAddress);
                setCookie("u_st", address.stakeAddress);
                setCookie("u_cad", address.address);
                console.log(address);
              } else {
                alert(
                  "Can not connect to Nami Wallet, please install Flint Wallet"
                );
              }
            }}
          >
            <img className="imgWallets" src={"/svg/Flint.svg"} />
            <p className="buttonDropFont">Flint</p>
          </button>
        </div>
      </div>
    </div>
  )}