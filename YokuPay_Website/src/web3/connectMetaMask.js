
const connectMetaMask = async () => {
  try {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });

    console.log("Connected", accounts[0]);
    return accounts[0];
  } catch (error) {
    console.log(error);
    return false;
  }
};

export default connectMetaMask;
