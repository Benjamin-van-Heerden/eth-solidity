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