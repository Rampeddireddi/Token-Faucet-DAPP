import { connectWallet } from "./wallet";
import {
  getProvider,
  getSigner,
  getTokenContract,
  getFaucetContract,
} from "./contracts";

window.__EVAL__ = {
  connectWallet: async () => {
    return await connectWallet();
  },

  requestTokens: async () => {
    const signer = await getSigner();
    const faucet = await getFaucetContract(signer);
    const tx = await faucet.requestTokens();
    await tx.wait();
    return tx.hash;
  },

  getBalance: async (address) => {
    const provider = getProvider();
    const token = await getTokenContract(provider);
    const balance = await token.balanceOf(address);
    return balance.toString();
  },

  canClaim: async (address) => {
    const provider = getProvider();
    const faucet = await getFaucetContract(provider);
    return await faucet.canClaim(address);
  },

  getRemainingAllowance: async (address) => {
    const provider = getProvider();
    const faucet = await getFaucetContract(provider);
    const remaining = await faucet.remainingAllowance(address);
    return remaining.toString();
  },

  getContractAddresses: async () => {
    return {
      token: import.meta.env.VITE_TOKEN_ADDRESS,
      faucet: import.meta.env.VITE_FAUCET_ADDRESS,
    };
  },
};
