import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { lotteryContractDetails } from "./lotteryContractDetails";
import toast, { Toaster } from "react-hot-toast";
import Spinner from "./Spinner";

function App() {
	const provider = new ethers.providers.Web3Provider(window.ethereum);
	const signer = provider.getSigner();
	const [account, setAccount] = useState(null);
	const [chainId, setChainId] = useState(null);
	const [manager, setManager] = useState(null);
	const [loading, setLoading] = useState(false);
	const [currentPlayers, setCurrentPlayers] = useState([]);
	const [contractBalance, setContractBalance] = useState(0);
	const lotteryContract = new ethers.Contract(
		lotteryContractDetails.address,
		lotteryContractDetails.abi,
		signer
	);

	const connectMetamask = async () => {
		try {
			const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
			const account = accounts[0];
			setAccount(account);
			const chainId = await window.ethereum.request({ method: "eth_chainId" });
			setChainId(chainId);
		} catch (error) {
			console.error(error);
		}
	};

	const enterLottery = async (e) => {
		e.preventDefault();
		const amount = e.target.amount.value;
		setLoading(true);
		try {
			const tx = await lotteryContract.enter({ value: ethers.utils.parseEther(amount) });
			await tx.wait();
			toast.success(`You (${account}) entered the lottery with ${amount} ETH`);
			setCurrentPlayers(await lotteryContract.getPlayers());
			setContractBalance(await provider.getBalance(lotteryContract.address));
		} catch (error) {
			toast.error(
				`There was an error entering the lottery. Please check your wallet and try again.`
			);
		}
		setLoading(false);
	};

	useEffect(() => {
		const getContractDetails = async () => {
			const manager = await lotteryContract.manager();
			setManager(manager);
			const currentPlayers = await lotteryContract.getPlayers();
			setCurrentPlayers(currentPlayers);
			const contractBalance = await provider.getBalance(lotteryContractDetails.address);
			console.log("test");
			setContractBalance(parseInt(contractBalance._hex, 16) * 0.000000000000000001);
		};
		getContractDetails();
	}, []);

	window.ethereum.on("accountsChanged", (accounts) => {
		setAccount(accounts[0]);
	});

	return (
		<div className="App p-8 bg-slate-300 h-screen w-screen">
			<div className="flex flex-col space-y-2 mb-2 w-3/5 border-black border-4 p-4 rounded-md">
				<h1 className="text-3xl">Connect Metamask to your Web Application</h1>
				<button
					className="bg-slate-800 w-32 p-2 text-white rounded-md"
					onClick={connectMetamask}
				>
					Connect to Metamask
				</button>
				<p>Your Current Account: {account ?? ""}</p>
				<p>Chain ID: {chainId ?? ""}</p>
			</div>
			<div className="w-3/5 bg-slate-500 p-4 rounded-md text-white">
				<h2>Lottery Manager: {manager ?? ""}</h2>
			</div>
			<div className="flex flex-col w-3/5 p-4">
				<p>
					The Lottery has a balance of <b>{contractBalance} ETH</b>
				</p>
				{currentPlayers.length > 0 && (
					<ul className="bg-slate-600 rounded-md text-white p-2 self-center">
						<p className="font-semibold text-md">Current Entrants:</p>
						{currentPlayers.map((player) => (
							<li key={player}>- {player}</li>
						))}
					</ul>
				)}
			</div>
			<form action="submit" onSubmit={enterLottery}>
				<div className="flex flex-col space-y-2 mb-2 w-3/5 border-black border-4 p-4 rounded-md">
					<h1 className="text-3xl">Try Your Luck? Enter the Lottery:</h1>
					<p>The lottery expects a minimum entry of 0.02 ETH</p>
					<div className="flex">
						<div className="flex items-center justify-center">
							<label className="mr-2 font-semibold" htmlFor="amount">
								Amount of ETH to enter:
							</label>
						</div>
						<input
							className="p-2 w-24 h-8 rounded-md"
							type="number"
							step="0.001"
							name="amount"
						/>
					</div>
					<div className="flex mr-4 h-full items-center">
						<button
							className="bg-slate-800 w-32 p-2 mr-4 text-white rounded-md"
							type="submit"
						>
							Enter
						</button>
						{loading && (
							<div className="flex items-center">
								<Spinner />
								<p>Processing Transaction, this can take up to 30 seconds.</p>
							</div>
						)}
					</div>
				</div>
			</form>
			<Toaster />
		</div>
	);
}

export default App;
