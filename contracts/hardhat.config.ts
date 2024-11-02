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
          '0x46094f3454c765a2f5693e359458803e1bff54967f17c030464381a0a1955c54',
          '0xcf5abdf684fc2a7e48910edf4aa657818b39ab5f39259a15817a07f181e9b96c',
          '0xfa011673df375e442848b1277d5cc804e9a8a76c99b9ca6fa36c1ad82149c38c',
          '0xe5ea08b5603ace966ba5f796e9330a31b8f6d4b10e2b266d5af4dec819a62408'
      ]
    },
  },
};

export default config;
