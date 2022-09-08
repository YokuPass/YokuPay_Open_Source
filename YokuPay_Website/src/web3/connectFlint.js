import { Address } from "@emurgo/cardano-serialization-lib-asmjs";

const connectFlint = async () => {
  try {
    var API = undefined;
    API = await window.cardano.flint.enable();
    const raw = await API.getChangeAddress();
    const changeAddress = Address.from_bytes(
      Buffer.from(raw, "hex")
    ).to_bech32();
    const rawReward = await API.getRewardAddresses();
    const rawFirst = rawReward[0];
    const rewardAddress = Address.from_bytes(
      Buffer.from(rawFirst, "hex")
    ).to_bech32();
    return { address: changeAddress, stakeAddress: rewardAddress };
  } catch (error) {
    return false;
  }
};

export default connectFlint;
