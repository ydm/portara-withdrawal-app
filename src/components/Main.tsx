import React from "react";
import { Web3Button } from "@web3modal/react";
import { useAccount } from "wagmi";
import { BigNumber } from "ethers";

type Status = "connected" | "reconnecting" | "connecting" | "disconnected";

export interface MainProps {
  approve: () => Promise<void>;

  allowances: [string, string];
  refreshAllowance: () => void;
}

export const Main: React.FC<MainProps> = (
  props: MainProps
): React.ReactElement<{}> => {
  const { status }: { status: Status } = useAccount();
  return (
    <>
      <Web3Button />
      <p>
        Staked ETH allowance: {props.allowances[0]}
        <br />
        Reward ETH allowance: {props.allowances[1]}
      </p>
      <button
        onClick={() => props.refreshAllowance()}
        disabled={status === "disconnected"}
      >
        Refresh
      </button>
      <button
        onClick={() => props.approve()}
        disabled={status === "disconnected"}
      >
        Approve both
      </button>
    </>
  );
};
