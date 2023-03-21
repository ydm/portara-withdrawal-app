import React, { useState } from "react";

import { BigNumber, BigNumberish, ethers } from "ethers";

import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";

import { configureChains, createClient, WagmiConfig } from "wagmi";
import { getProvider, fetchSigner } from "@wagmi/core";
import { mainnet, goerli } from "wagmi/chains";

import * as contracts from "../utils/contracts";
import sign from "../utils/sign";

import { Main } from "./Main";

async function approve() {
  const provider = getProvider();
  const signer = await fetchSigner();
  if (!signer) {
    throw new Error("TODO");
  }

  const chainId = provider.network.chainId;
  const owner = await signer.getAddress();
  const spender = contracts.getAddress("PoolEscrow");
  // 25 blocks == 5 minutes, should be enough.
  // const deadline = (await provider.getBlockNumber()) + 25;
  const deadline: number = 2000000000;

  const stETH: contracts.CustomContract = contracts.getStakedETH(provider);
  const stName: string = await stETH.name().then((x: any) => x.toString());
  const stNonce: number = await stETH
    .nonces(owner)
    .then((x: any) => BigNumber.from(x).toNumber());
  const {
    v: sv,
    r: sr,
    s: ss,
  } = await sign(
    stName,
    chainId,
    stETH.address,
    owner,
    spender,
    stNonce,
    deadline
  );

  // console.log("stETH:");
  // console.log(`  - stName=${stName}`);
  // console.log(`  - chainId=${chainId}`);
  // console.log(`  - stAddress=${stETH.address}`);
  // console.log(`  - owner=${owner}`);
  // console.log(`  - spender=${spender}`);
  // console.log(`  - stNonce=${stNonce}`);
  // console.log(`  - deadline=${deadline}`);
  // console.log(`  - v=${sv}`);
  // console.log(`  - r=${sr}`);
  // console.log(`  - s=${ss}`);

  const rwETH: contracts.CustomContract = contracts.getRewardETH(provider);
  const rwName: string = await rwETH.name().then((x: any) => x.toString());
  const rwNonce: number = await rwETH
    .nonces(owner)
    .then((x: any) => BigNumber.from(x).toNumber());
  const {
    v: rv,
    r: rr,
    s: rs,
  } = await sign(
    rwName,
    chainId,
    rwETH.address,
    owner,
    spender,
    rwNonce,
    deadline
  );
  // console.log("rwETH:");
  // console.log(`  - rwName=${rwName}`);
  // console.log(`  - chainId=${chainId}`);
  // console.log(`  - rwAddress=${rwETH.address}`);
  // console.log(`  - owner=${owner}`);
  // console.log(`  - spender=${spender}`);
  // console.log(`  - rwNonce=${rwNonce}`);
  // console.log(`  - deadline=${deadline}`);
  // console.log(`  - v=${rv}`);
  // console.log(`  - r=${rr}`);
  // console.log(`  - s=${rs}`);

  const escrow: contracts.CustomContract = contracts.getPoolEscrow(provider);
  const res: any = await escrow
    .connect(signer)
    .permitTransfers(owner, deadline, sv, sr, ss, rv, rr, rs);

  console.log("RESULT:", res);
}

async function getAllowances(): Promise<[BigNumberish, BigNumberish]> {
  const provider = getProvider();
  const signer = await fetchSigner();
  if (!signer) {
    return [0, 0];
  }
  const stETH: contracts.CustomContract = contracts.getStakedETH(provider);
  const rwETH: contracts.CustomContract = contracts.getRewardETH(provider);

  const owner: string = await signer.getAddress();
  const spender: string = contracts.getAddress("PoolEscrow");

  const st: BigNumber = await stETH.allowance(owner, spender);
  const rw: BigNumber = await rwETH.allowance(owner, spender);

  return [st, rw];
}

export const MainContainer: React.FC = (props: {}): React.ReactElement<{}> => {
  const chains = [mainnet, goerli];
  const projectId = "f4a8f4aed59838dbf0abebbdb3e7a85a";

  const { provider } = configureChains(chains, [w3mProvider({ projectId })]);
  const wagmiClient = createClient({
    autoConnect: true,
    connectors: w3mConnectors({ projectId, version: 1, chains }),
    provider,
  });
  const ethereumClient = new EthereumClient(wagmiClient, chains);

  const formatAllowances = (
    st: BigNumberish,
    rw: BigNumberish
  ): [string, string] => {
    return [
      ethers.utils.formatEther(st),
      ethers.utils.formatEther(rw),
    ];
  };

  const [allowances, setAllowance] = useState(formatAllowances(0, 0));

  const refreshAllowance = async (): Promise<void> => {
    const [st, rw]: [BigNumberish, BigNumberish] = await getAllowances();
    setAllowance(formatAllowances(st, rw));
  };

  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <Main
          approve={approve}
          allowances={allowances}
          refreshAllowance={refreshAllowance}
        />
      </WagmiConfig>

      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  );
};
