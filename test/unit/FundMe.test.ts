import { assert, expect } from "chai";
import { deployments, ethers, getNamedAccounts } from "hardhat";
import { MockV3Aggregator } from "../../typechain-types/@chainlink/contracts/src/v0.8/tests";
import { FundMe } from "../../typechain-types/contracts/FundMe";

describe("FundMe", async function () {
    let fundMe: FundMe;
    let deployer: string;
    let mockV3Aggregator: MockV3Aggregator;
    const sendValue = ethers.utils.parseEther("1"); // 1ETH
    console.log(sendValue);

    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        );
    });

    describe("constructor", async () => {
        it("sets the aggregator address correctly", async () => {
            const response = await fundMe.priceFeed();
            assert.equal(response, mockV3Aggregator.address);
        });

        it("sets the owner correctly", async () => {
            const response = await fundMe.i_owner();
            assert.equal(response, deployer);
        });
    });

    describe("Fund", async () => {
        it("fails if you don't send enough ETH", async () => {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            );
        });

        it("updates the amount funded state", async () => {
            await fundMe.fund({ value: sendValue });
            const response = await fundMe.addressToAmountFunded(deployer);
            assert.equal(response.toString(), sendValue.toString());
        });

        it("adds funder to array of funders", async () => {
            await fundMe.fund({ value: sendValue });
            const response = await fundMe.funders(0);
            assert.equal(response, deployer);
        });
    });

    describe("withdraw", async () => {
        beforeEach(async () => {
            await fundMe.fund({ value: sendValue });
        });

        it("can withdraw ETH when there is a single funder", async () => {
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            );

            const response = await fundMe.withdraw();
            const receipt = await response.wait(1);

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            );

            const gasCost = receipt.gasUsed.mul(receipt.effectiveGasPrice);

            assert.equal(endingFundMeBalance.toString(), "0");
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            );
        });

        it("allows us to withdraw when there are multiple funders", async () => {
            const accounts = await ethers.getSigners();
            for (let i = 1; i <= 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                );
                await fundMeConnectedContract.fund({ value: sendValue });
            }

            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            );

            const response = await fundMe.withdraw();
            const receipt = await response.wait(1);

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            );

            const gasCost = receipt.gasUsed.mul(receipt.effectiveGasPrice);

            assert.equal(endingFundMeBalance.toString(), "0");
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            );

            await expect(fundMe.funders(0)).to.be.reverted;

            for (let i = 1; i <= 6; i++) {
                assert.equal(
                    await (
                        await fundMe.addressToAmountFunded(accounts[i].address)
                    ).toString(),
                    "0"
                );
            }
        });

        it("only allows owner to withdraw", async () => {
            const accounts = await ethers.getSigners();
            const attacker = accounts[1];
            const attackerConnectedContract = await fundMe.connect(attacker);

            await expect(
                attackerConnectedContract.withdraw()
            ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
        });
    });
});
