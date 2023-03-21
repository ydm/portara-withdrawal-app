import React from "react";
import { Web3Button } from "@web3modal/react";
// import { ethers } from "ethers";
import { useAccount, useDisconnect, WagmiConfig } from "wagmi";
// import { ConnectArgs } from "@wagmi/core";
import { UseMutateFunction } from "react-query";
import { SignTypedDataResult, signTypedData } from "@wagmi/core";
import { BigNumber, ethers, Signature } from "ethers";
import { goerli } from "wagmi/chains";
import { getContract, getProvider, fetchSigner } from "@wagmi/core";

import sign from "../utils/sign";
import * as abi from "../utils/abis";
import {
  CustomContract,
  getAddress,
  getPoolEscrow,
  getRewardETH,
  getStakedETH,
} from "../utils/contracts";

export interface MainProps {}

export const Main: React.FC<MainProps> = (
  props: MainProps
): React.ReactElement<{}> => {
  const {
    disconnect,
  }: { disconnect: UseMutateFunction<void, Error, void, unknown> } =
    useDisconnect();

  const approve2: React.MouseEventHandler<HTMLButtonElement> = async (
    event: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    const provider = getProvider();
    const signer = await fetchSigner();
    if (!signer) {
      throw new Error("TODO");
    }

    const chainId = provider.network.chainId;
    const owner = await signer.getAddress();
    const spender = getAddress("PoolEscrow");
    // 25 blocks == 5 minutes, should be enough.
    // const deadline = (await provider.getBlockNumber()) + 25;
    const deadline: number = 2000000000;

    const stETH: CustomContract = getStakedETH(provider);
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

    const rwETH: CustomContract = getRewardETH(provider);
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

    const escrow: CustomContract = getPoolEscrow(provider);
    const res: any = await escrow.connect(signer).permitTransfers(
      owner,
      deadline,
      sv,
      sr,
      ss,
      rv,
      rr,
      rs
    );

    console.log("RESULT:", res);
  };

  const something = async () => {
    const provider: ethers.providers.InfuraProvider =
      new ethers.providers.InfuraProvider(
        goerli.network,
        "294e8c457b874ae8bba70655b9dd9015"
      );

    console.log(
      await provider
        .getTransactionCount("0x5c63B71F47dfA807aa6a8705e5cf134f4c3Afd8a")
        .then((x) => x.toString())
    );
  };

  return (
    <>
      <Web3Button />
      <button onClick={() => disconnect()}>Disconnect</button>
      <br />
      <button onClick={something}>Something</button>
      <br />
      <button onClick={approve2}>Approve both</button>
    </>
  );
};
