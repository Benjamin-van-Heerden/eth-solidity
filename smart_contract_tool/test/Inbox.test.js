import assert from "assert";
import ganache from "ganache";
import { ethers } from "ethers";
import { abi, bytecode } from "../compile.js";

// create ethers client with ganache provider
const provider = new ethers.providers.Web3Provider(ganache.provider());

let accounts_and_balances;
let contract_owner;
let contract;
let contract_address;
beforeEach(async () => {
	// get the list of accounts
	const accounts = await provider.listAccounts();
	// get the balances of the accounts
	const balances = await Promise.all(accounts.map((account) => provider.getBalance(account)));
	// store the accounts and balances in an array of objects
	accounts_and_balances = accounts.map((account, index) => ({
		account,
		balance: balances[index],
	}));

	// use the first account to deploy the contract
	contract_owner = accounts[0];
	const signer = provider.getSigner(contract_owner);

	// deploy the contract
	const factory = new ethers.ContractFactory(abi, bytecode, signer);
	contract = await factory.deploy("Hello, World!");
	contract_address = contract.address;

	console.log(contract);
});

describe("Inbox", () => {
	it("deploys a contract", () => {});
});
