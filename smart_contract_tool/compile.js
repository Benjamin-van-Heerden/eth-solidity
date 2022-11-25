import fs from "fs";
import path from "path";
import { dirname } from "path";
import solc from "solc";

const inboxPath = path.resolve(dirname("."), "contracts", "Inbox.sol");
const source = fs.readFileSync(inboxPath, "utf8");

let input = {
	language: "Solidity",
	sources: {
		"Inbox.sol": {
			content: source,
		},
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

export const abi = output.contracts["Inbox.sol"]["Inbox"].abi;
export const bytecode = output.contracts["Inbox.sol"]["Inbox"].evm.bytecode.object;
