import fs from "fs";
import path from "path";
import { dirname } from "path";
import solc from "solc";

const inboxPath = path.resolve(dirname("."), "contracts", "Inbox.sol");
const inboxSource = fs.readFileSync(inboxPath, "utf8");

const lotteryPath = path.resolve(dirname("."), "contracts", "Lottery.sol");
const lotterySource = fs.readFileSync(lotteryPath, "utf8");

let input = {
	language: "Solidity",
	sources: {
		"Inbox.sol": {
			content: inboxSource,
		},
		"Lottery.sol": {
			content: lotterySource,
		}
	},
	settings: {
		outputSelection: {
			"*": {
				"*": ["*"],
			},
		},
	},
};

let output = JSON.parse(solc.compile(JSON.stringify(input)));

export const inboxAbi = output.contracts["Inbox.sol"]["Inbox"].abi;
export const inboxBytecode = output.contracts["Inbox.sol"]["Inbox"].evm.bytecode.object;

export const lotteryAbi = output.contracts["Lottery.sol"]["Lottery"].abi;
export const lotteryBytecode = output.contracts["Lottery.sol"]["Lottery"].evm.bytecode.object;


