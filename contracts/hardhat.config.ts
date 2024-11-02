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
          '0x946e2772b838e9a010f3e2f21f7ae5ba7247bf4d5a1857e5c9437ff69700727a',
          '0x405909c80feac682bf7112023889feaede4f1edc667139b0831b451fa55aed84',
          '0x54b58cb54f87cb4f28e0f95fa3637b57aee96808e449435757f1563ac6116b6a',
          '0x582c5779b276f6286d6e8609898af64b5707d8645afc58e83274a313955c4729'
      ]
    },
  },
};

export default config;
