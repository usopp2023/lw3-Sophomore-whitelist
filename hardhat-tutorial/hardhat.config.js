require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });

const HTTP_URL = process.env.HTTP_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_KEY = process.env.ETHERSACN_PRIVATE;

module.exports = {
  solidity: "0.8.9",
  networks: {
    goerli: {
      url: HTTP_URL,
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan:{
    apiKey:ETHERSCAN_KEY,
  }
  
};