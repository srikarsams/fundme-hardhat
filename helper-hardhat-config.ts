const networkConfig: {
    [number: number]: {
        name: string;
        ethUsdPriceFeedAddress: string;
        blockConfirmations: number;
    };
} = {
    4: {
        name: "rinkeby",
        ethUsdPriceFeedAddress: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
        blockConfirmations: 6,
    },
    137: {
        name: "polygon",
        ethUsdPriceFeedAddress: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
        blockConfirmations: 0,
    },
    31337: {
        name: "localhost",
        ethUsdPriceFeedAddress: "",
        blockConfirmations: 0,
    },
};

const developmentChains = ["hardhat", "localhost"];
const DECIMALS = "18";
const INITIAL_ANSWER = "2000000000000000000000";

export { networkConfig, developmentChains, DECIMALS, INITIAL_ANSWER };
