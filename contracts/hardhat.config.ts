import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'http://localhost:8545',
      // the private key of signers, change it according to your ganache user
      accounts: [
          '0x587d7dbee0c51f02fdbba9fbac0770be0f5f048133adb4f201385899f1fad256',
          '0x2beb99bfe2f9711612c6e9f607060441d9ca73096d2314a8494be72ee8a300ea',
          '0xcf14a3ff3975721259f33ec0c50d64fdcfca68c2008a9ea0e3e5cd33ad09483d',
          '0xa1e2f5d7766086ee1752a7fb2a6f1083c2ff1924695138c3c1ad39c43f110890'
      ]
    },
  },
};

export default config;
