import { HardhatRuntimeEnvironment } from "hardhat/types";

import { developmentChains, networkConfig } from "../helper-hardhat-config";
import { verify } from "../utils/verify";

async function deployFundMe(hre: HardhatRuntimeEnvironment) {
    const { getNamedAccounts, deployments, network } = hre;
    const { deploy, log } = deployments;
    const namedAccounts = await getNamedAccounts();
    const chainId = network.config.chainId || 4;

    let ethUsdPriceFeedAddress: string;

    if (developmentChains.includes(network.name)) {
        // Since we've deployed the mock, we can then take the deployment address and use
        // the same in FundMe contract for getting the ETH-USD price
        const ethUsdAggregator = deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = (await ethUsdAggregator).address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeedAddress;
    }

    log("Deploying FundMe contract...");
    const fundme = await deploy("FundMe", {
        from: namedAccounts.deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
        waitConfirmations: networkConfig[chainId].blockConfirmations,
    });
    log("Deployed FundMe contract!!!");
    log("--------------------------------------------");

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundme.address, [ethUsdPriceFeedAddress]);
        log("--------------------------------------------------");
    }
}

export default deployFundMe;
deployFundMe.tags = ["all"];
