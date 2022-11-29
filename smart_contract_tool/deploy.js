import HDWalletProvider from "@truffle/hdwallet-provider";
import { ethers } from "ethers";
import { abi, bytecode } from "./compile.js";


const chainProvider = new HDWalletProvider(
    "tone drama decide ginger goose portion doll found enjoy consider pattern dinner",
    "https://goerli.infura.io/v3/f205a18580274dd8a8ec8f76e7e2fecb"
);

const ethProvider = new ethers.providers.Web3Provider(chainProvider);

(async function deploy() {
    const accounts = await ethProvider.listAccounts();
    console.log("Attempting to deploy from account:", accounts[0]);
    const signer = ethProvider.getSigner(accounts[0]);

    // deploy the contract with 1000000 gas
    const factory = new ethers.ContractFactory(abi, bytecode, signer);
    const inboxContract = await factory.deploy("Hello, World!", { gasLimit: 1000000 });
    console.log("Contract deployed to:", inboxContract.address);
})();

chainProvider.engine.stop();