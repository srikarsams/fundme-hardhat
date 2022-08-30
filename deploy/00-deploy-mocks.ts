import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} from "../helper-hardhat-config";

// For deploying chainlink pricefeed mock for testing the contract on local hardhat networks
async function deployMocks(hre: HardhatRuntimeEnvironment) {
    const { getNamedAccounts, deployments, network } = hre;
    const { deploy, log } = deployments;
    const namedAccounts = await getNamedAccounts();

    if (developmentChains.includes(network.name)) {
        log("Local network detected. Deploying mocks...");
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: namedAccounts.deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        });
        log("Mocks deployed!!");
        log("--------------------------------------------");
    }
}

deployMocks.tags = ["all", "mocks"];
export default deployMocks;
