import hre from "hardhat";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const tokenContract = await hre.ethers.deployContract("Token");
  await tokenContract.waitForDeployment();

  const exchangeContract = await hre.ethers.deployContract("Exchange", [
    tokenContract.target,
  ]);
  await exchangeContract.waitForDeployment();

  await sleep(30 * 1000);

  await hre.run("verify:verify", {
    address: tokenContract.target,
    constructorArguments: [],
    contract: "contracts/Token.sol:Token",
  });

  await hre.run("verify:verify", {
    address: exchangeContract.target,
    constructorArguments: [tokenContract.target],
    contract: "contracts/Exchange.sol:Exchange",
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
