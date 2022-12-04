import HDWalletProvider from "@truffle/hdwallet-provider";
import { ethers } from "ethers";
import { inboxAbi, inboxBytecode } from "./compile.js";
import dotenv from "dotenv";
dotenv.config();


const chainProvider = new HDWalletProvider(
    process.env.WALLET_PASSPHRASE,
    process.env.INFURA_URL
);

const ethProvider = new ethers.providers.Web3Provider(chainProvider);

(async function deployInbox() {
    const accounts = await ethProvider.listAccounts();
    console.log("Attempting to deploy from account:", accounts[0]);
    const signer = ethProvider.getSigner(accounts[0]);

    // deploy the contract with 1000000 gas
    const factory = new ethers.ContractFactory(inboxAbi, inboxBytecode, signer);
    const inboxContract = await factory.deploy("Hello, World!", { gasLimit: 1000000 });
    console.log("Contract deployed to:", inboxContract.address);
})();

chainProvider.engine.stop();