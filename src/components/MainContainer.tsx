import React from "react";
import type { BigNumberish } from "ethers";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { mainnet, goerli } from "wagmi/chains";

import { Web3Button } from "@web3modal/react";
// import { ethers } from "ethers";
import { useAccount, useDisconnect } from "wagmi";
// import { ConnectArgs } from "@wagmi/core";
import { UseMutateFunction } from "react-query";
import { SignTypedDataResult, signTypedData } from "@wagmi/core";
import { BigNumber, ethers, Signature } from "ethers";
import { getContract } from "@wagmi/core";

import { Main } from "./Main";

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

  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <Main />
      </WagmiConfig>

      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  );
};
