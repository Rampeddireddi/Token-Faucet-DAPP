import React, { useEffect, useState } from "react";
import "./utils/eval";

function App() {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("0");
  const [canClaim, setCanClaim] = useState(false);
  const [remaining, setRemaining] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Connect wallet
  async function connect() {
    try {
      setError("");
      const addr = await window.__EVAL__.connectWallet();
      setAddress(addr);
    } catch (err) {
      setError(err.message || "Wallet connection failed");
    }
  }

  // 🔹 Disconnect wallet (frontend only)
  function disconnect() {
    setAddress("");
    setBalance("0");
    setRemaining("0");
    setCanClaim(false);
    setError("");
  }

  // 🔹 Load user data
  async function loadData(addr) {
    try {
      const bal = await window.__EVAL__.getBalance(addr);
      const claimable = await window.__EVAL__.canClaim(addr);
      const rem = await window.__EVAL__.getRemainingAllowance(addr);

      setBalance(bal);
      setCanClaim(claimable);
      setRemaining(rem);
    } catch (err) {
      setError("Failed to load wallet data");
    }
  }

  // 🔹 Claim tokens (WITH COOLDOWN MESSAGE)
  async function claim() {
    try {
      setError("");

      // ✅ PRE-CHECK COOLDOWN
      if (!canClaim) {
        setError("Cooldown active. Please wait before claiming again.");
        return;
      }

      setLoading(true);
      const txHash = await window.__EVAL__.requestTokens();
      await loadData(address);

      alert("Tokens claimed successfully!\nTransaction:\n" + txHash);
    } catch (err) {
      if (err.code === 4001) {
        setError("Transaction rejected by user.");
      } else if (err.message?.includes("Cooldown")) {
        setError("Cooldown active. Please wait before claiming again.");
      } else {
        setError(err.message || "Transaction failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Auto-load data when wallet connects
  useEffect(() => {
    if (address) loadData(address);
  }, [address]);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>🚰 Token Faucet DApp</h1>

        {!address ? (
          <button style={styles.btn} onClick={connect}>
            Connect Wallet
          </button>
        ) : (
          <>
            <p style={styles.label}>Connected Wallet</p>
            <p style={styles.address}>{address}</p>

            <div style={styles.infoBox}>
              <p><b>Token Balance:</b></p>
              <p>{balance}</p>
            </div>

            <div style={styles.infoBox}>
              <p><b>Remaining Allowance:</b></p>
              <p>{remaining}</p>
            </div>

            <div style={styles.infoBox}>
              <p><b>Cooldown Status:</b></p>
              <p>{canClaim ? "Ready to claim ✅" : "Cooldown active ⏳"}</p>
            </div>

            <button
              style={{
                ...styles.btn,
                background: canClaim ? "#4CAF50" : "#777",
              }}
              onClick={claim}
            >
              {loading ? "Processing..." : "Request Tokens"}
            </button>

            <button style={styles.disconnect} onClick={disconnect}>
              Disconnect
            </button>

            {error && <p style={styles.error}>{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#1e1e2f",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    background: "#2c2c3e",
    padding: "30px",
    borderRadius: "12px",
    width: "420px",
    textAlign: "center",
    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
  },
  title: {
    marginBottom: "20px",
  },
  btn: {
    width: "100%",
    padding: "12px",
    marginTop: "12px",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  disconnect: {
    width: "100%",
    marginTop: "10px",
    padding: "10px",
    background: "#ff5252",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    cursor: "pointer",
  },
  label: {
    fontSize: "14px",
    color: "#bbb",
  },
  address: {
    fontSize: "14px",
    wordBreak: "break-all",
    background: "#1a1a28",
    padding: "10px",
    borderRadius: "8px",
  },
  infoBox: {
    background: "#1a1a28",
    padding: "10px",
    borderRadius: "8px",
    marginTop: "10px",
  },
  error: {
    marginTop: "12px",
    color: "#ff6b6b",
    fontWeight: "bold",
  },
};

export default App;
