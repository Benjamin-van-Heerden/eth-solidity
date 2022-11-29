import assert from "assert";
import ganache from "ganache";
import { ethers } from "ethers";
import { abi, bytecode } from "../compile.js";

// create ethers client with ganache provider
const ethProvider = new ethers.providers.Web3Provider(ganache.provider());

let accounts_and_balances;
let contract_owner;
let inboxContract;
beforeEach(async () => {
	// get the list of accounts
	const accounts = await ethProvider.listAccounts();
	// get the balances of the accounts
	const balances = await Promise.all(accounts.map((account) => ethProvider.getBalance(account)));
	// store the accounts and balances in an array of objects
	accounts_and_balances = accounts.map((account, index) => ({
		account,
		balance: balances[index],
	}));

	// use the first account to deploy the contract
	contract_owner = accounts[0];
	const signer = ethProvider.getSigner(contract_owner);

	// deploy the contract
	const factory = new ethers.ContractFactory(abi, bytecode, signer);
	inboxContract = await factory.deploy("Hello, World!");

});

describe("Inbox", () => {
	it("deploys a contract", () => {
		assert.ok(inboxContract.address);
	});

	it("has a default message", async () => {
		const message = await inboxContract.message();
		assert.equal(message, "Hello, World!");
	});

	it("can change the message by owner", async () => {
		const signer = ethProvider.getSigner(contract_owner);
		const contract = inboxContract.connect(signer);
		await contract.setMessage("Bye, World (from owner)!");
		const message = await contract.message();
		assert.equal(message, "Bye, World (from owner)!");
	});

	it("can change message by non-owner", async () => {
		const signer = ethProvider.getSigner(accounts_and_balances[1].account);
		const contract = inboxContract.connect(signer);
		await contract.setMessage("Bye, World (from non-owner)!");
		const message = await contract.message();
		assert.equal(message, "Bye, World (from non-owner)!");
	});
});
