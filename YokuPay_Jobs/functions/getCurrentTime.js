// Get Current Timestamp

const getCurrentTimestamp = () => {
    var dt = new Date();
    const newTime = `${(dt.getMonth() + 1).toString().padStart(2, "0")}/${dt
      .getDate()
      .toString()
      .padStart(2, "0")}/${dt.getFullYear().toString().padStart(4, "0")} ${dt
      .getHours()
      .toString()
      .padStart(2, "0")}:${dt.getMinutes().toString().padStart(2, "0")}:${dt
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;
    return newTime;
  };
  
  module.exports = getCurrentTimestamp;
  