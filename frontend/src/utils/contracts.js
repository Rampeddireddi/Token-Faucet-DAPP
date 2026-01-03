import { ethers } from "ethers";
import TokenJson from "./Token.json";
import FaucetJson from "./TokenFaucet.json";

// ✅ IMPORTANT: extract ONLY the abi array
const tokenAbi = TokenJson.abi;
const faucetAbi = FaucetJson.abi;

const RPC_URL = import.meta.env.VITE_RPC_URL;
const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS;
const FAUCET_ADDRESS = import.meta.env.VITE_FAUCET_ADDRESS;

export function getProvider() {
  return new ethers.JsonRpcProvider(RPC_URL);
}

export async function getSigner() {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  return provider.getSigner();
}

export function getTokenContract(signerOrProvider) {
  return new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signerOrProvider);
}

export function getFaucetContract(signerOrProvider) {
  return new ethers.Contract(FAUCET_ADDRESS, faucetAbi, signerOrProvider);
}
