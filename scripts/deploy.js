async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // 1️⃣ Deploy Token
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.waitForDeployment();
  console.log("Token deployed to:", await token.getAddress());

  // 2️⃣ Deploy Faucet
  const Faucet = await ethers.getContractFactory("TokenFaucet");
  const faucet = await Faucet.deploy(await token.getAddress());
  await faucet.waitForDeployment();
  console.log("Faucet deployed to:", await faucet.getAddress());

  // 3️⃣ Set faucet as minter
  const tx = await token.setFaucet(await faucet.getAddress());
  await tx.wait();
  console.log("Faucet set as token minter ✅");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
