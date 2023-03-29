import {
  GetContractResult,
  getProvider,
  mainnet,
  goerli,
  getContract,
} from "@wagmi/core";
import { BigNumber, providers } from "ethers";
import { Abi } from "abitype";
import * as abis from "./abis";

export type AddressKey = "PoolEscrow" | "StakedETH" | "RewardETH";
export type CustomContract = GetContractResult<Abi>;

interface AddressBook {
  [key: string]: string;
}

const MAINNET: AddressBook = {
  PoolEscrow: "0xdead",
  StakedETH: "0xdead",
  RewardETH: "0xdead",
};

const GOERLI: AddressBook = {
  PoolEscrow: "0x4dC598c4eA2BdbD9366E19a4a2DBb3578Ec610ab",
  StakedETH: "0x7476026B28CFc96006417C73d1319843D6B8AEfC",
  RewardETH: "0xfED1a320Be478C1c7997105f838277ED936FfBb2",
};

export function getAddress(key: AddressKey): string {
  const provider = getProvider();
  switch (BigNumber.from(provider.network.chainId).toNumber()) {
    case mainnet.id:
      return MAINNET[key];
    case goerli.id:
      return GOERLI[key];
  }
  return "0xdead";
}

function getToken(provider: providers.Provider, address: string): CustomContract {
  const contract: GetContractResult<Abi> = getContract({
    address,
    abi: abis.IERC20,
    signerOrProvider: provider,
  });
  return contract;
}

export function getStakedETH(provider: providers.Provider): CustomContract {
  const address = getAddress("StakedETH");
  return getToken(provider, address);
}

export function getRewardETH(provider: providers.Provider): CustomContract {
  const address = getAddress("RewardETH");
  return getToken(provider, address);
}

export function getPoolEscrow(provider: providers.Provider): CustomContract {
  const address = getAddress("PoolEscrow");
  const contract: GetContractResult<Abi> = getContract({
    address,
    abi: abis.IPoolEscrow,
    signerOrProvider: provider,
  });
  return contract;
}
