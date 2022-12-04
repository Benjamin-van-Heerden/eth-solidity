import assert from "assert";
import ganache from "ganache";
import { ethers } from "ethers";
import { lotteryAbi, lotteryBytecode } from "../compile.js";

// create ethers client with ganache provider
const ethProvider = new ethers.providers.Web3Provider(
	ganache.provider({
		logging: {
			logger: {
				log: () => {}, // don't do anything
			},
		},
	})
);

let accounts_and_balances;
let contract_owner;
let lotteryContract;
beforeEach(async () => {
	ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.OFF);
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
	const factory = new ethers.ContractFactory(lotteryAbi, lotteryBytecode, signer);
	lotteryContract = await factory.deploy();
});

describe("Lottery", () => {
	it("deploys a contract", () => {
		assert.ok(true);
	});

	it("allows someone to enter the lottery", async () => {
		const signer = ethProvider.getSigner(accounts_and_balances[1].account);
		const contract = lotteryContract.connect(signer);
		await contract.enter({ value: ethers.utils.parseEther("0.02") });
		const players = await contract.getPlayers();
		assert.ok(players.includes(accounts_and_balances[1].account));
	});

	it("allows multiple players to enter the lottery", async () => {
		const signer1 = ethProvider.getSigner(accounts_and_balances[1].account);
		const contract1 = lotteryContract.connect(signer1);
		await contract1.enter({ value: ethers.utils.parseEther("0.02") });
		const signer2 = ethProvider.getSigner(accounts_and_balances[2].account);
		const contract2 = lotteryContract.connect(signer2);
		await contract2.enter({ value: ethers.utils.parseEther("0.02") });
		const players = await contract1.getPlayers();
		assert.ok(players.includes(accounts_and_balances[1].account));
		assert.ok(players.includes(accounts_and_balances[2].account));
	});

	it("breaks when too little ether is sent", async () => {
		const signer = ethProvider.getSigner(accounts_and_balances[2].account);
		const contract = lotteryContract.connect(signer);
		try {
			await contract.enter({ value: ethers.utils.parseEther("0.001") });
			assert(false);
		} catch (err) {
			assert(err);
		}
	});

	it("does not allow someone other than the manager to pick a winner", async () => {
		let signer = ethProvider.getSigner(accounts_and_balances[1].account);
		let contract = lotteryContract.connect(signer);
		await contract.enter({ value: ethers.utils.parseEther("0.02") });

		signer = ethProvider.getSigner(accounts_and_balances[3].account);
		contract = lotteryContract.connect(signer);
		await contract.enter({ value: ethers.utils.parseEther("0.05") });

		signer = ethProvider.getSigner(accounts_and_balances[2].account);
		contract = lotteryContract.connect(signer);
		try {
			await contract.pickWinner();
			assert(false);
		} catch (err) {
			assert(err);
		}
	});

	it("allows the manager to pick a winner and then resets the lottery", async () => {
		const signer = ethProvider.getSigner(contract_owner);
		const contract = lotteryContract.connect(signer);
		await contract.enter({ value: ethers.utils.parseEther("0.02") });
		await contract.pickWinner();
		const players = await contract.getPlayers();
		assert.equal(players.length, 0);
	});
});
