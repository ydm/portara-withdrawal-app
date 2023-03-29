import React, { useEffect, useState } from "react";
import core from "@wagmi/core";
import { useAccount, useProvider } from "wagmi";
import { LogDescription } from "@ethersproject/abi";
import { Log } from "@ethersproject/abstract-provider";
import { getProvider, GetProviderResult, GetAccountResult } from "@wagmi/core";
import { ethers } from "ethers";

import WithdrawalRequestList from "./WithdrawalRequestList";
import { CustomContract, getPoolEscrow } from "../utils/contracts";

// +------+
// | Logs |
// +------+

async function fetch(
    topic: string,
    escrow: CustomContract,
    beneficiary: string
): Promise<LogDescription[]> {
    const span = (x: number): number => x - 2563200;
    const provider: GetProviderResult = getProvider();
    const logs: Log[] = await provider.getLogs({
        fromBlock: await provider.getBlockNumber().then(span),
        toBlock: "latest",
        address: escrow.address,
        topics: [topic, ethers.utils.hexZeroPad(beneficiary, 32)],
    });
    return logs.map((log) => escrow.interface.parseLog(log));
}

const fetchDeferred = (escrow: CustomContract, beneficiary: string) =>
    fetch(
        "0x7090f70bd4afd5b45b486b6a0df04e33626a4b9a8bc0efc2e80bea5e0f8e77df",
        escrow,
        beneficiary
    );

const fetchInstant = (escrow: CustomContract, beneficiary: string) =>
    fetch(
        "0xd8bf868f50f15ddcb40ea47ab9da2d20bea22c85aab66bd452b025dc16b28dd1",
        escrow,
        beneficiary
    );

const fetchPartial = (escrow: CustomContract, beneficiary: string) =>
    fetch(
        "0x5fe4ed9ce6a6d20e48df0ec6e0a077d2040e70627d84645eea00920e3aff485d",
        escrow,
        beneficiary
    );

async function printWithdrawalRequests(
    escrow: CustomContract,
    beneficiary: string
): Promise<string> {
    const lines: string[] = [];
    const collect = (x: string): number => lines.push(x);

    collect(`${beneficiary}:`);

    collect("  - deferred:");
    await fetchDeferred(escrow, beneficiary)
        .then((xs) =>
            xs.map(
                (x) =>
                    `    - ` +
                    `ticket=${x.args.requestIndex} ` +
                    `st=${ethers.utils.formatEther(x.args.stakedEthAmount)} ` +
                    `rw=${ethers.utils.formatEther(x.args.rewardEthAmount)} ` +
                    `df=${ethers.utils.formatEther(x.args.deferredPayment)}`
            )
        )
        .then((xs) => xs.forEach(collect));

    collect("  - partial:");
    await fetchPartial(escrow, beneficiary)
        .then((xs) =>
            xs.map(
                (x) =>
                    `    - ` +
                    `ticket=${x.args.requestIndex} ` +
                    `st=${ethers.utils.formatEther(x.args.stakedEthAmount)} ` +
                    `rw=${ethers.utils.formatEther(x.args.rewardEthAmount)} ` +
                    `im=${ethers.utils.formatEther(x.args.immediatePayment)} ` +
                    `df=${ethers.utils.formatEther(x.args.deferredPayment)}`
            )
        )
        .then((xs) => xs.forEach(collect));

    collect("  - instant:");
    await fetchInstant(escrow, beneficiary)
        .then((xs) =>
            xs.map(
                (x) =>
                    `    - ` +
                    `st=${ethers.utils.formatEther(x.args.stakedEthAmount)} ` +
                    `rw=${ethers.utils.formatEther(x.args.rewardEthAmount)} ` +
                    `im=${ethers.utils.formatEther(x.args.immediatePayment)}`
            )
        )
        .then((xs) => xs.forEach(collect));

    return lines.join("\n");
}

const WithdrawalRequestListContainer: React.FC =
    (_props: {}): React.ReactElement<{}> => {
        const provider: GetProviderResult<core.Provider> = useProvider();
        const account: GetAccountResult<core.Provider> = useAccount();
        const [requests, setRequests]: [
            string,
            React.Dispatch<React.SetStateAction<string>>
        ] = useState<string>("");

        useEffect(() => {
            (async (): Promise<void> => {
                if (!provider) {
                    // console.log("[X] no provider");
                    return setRequests("no provider");
                }

                const escrow: CustomContract = getPoolEscrow(provider);
                if (
                    !account.address ||
                    !ethers.utils.isAddress(account.address) ||
                    !ethers.utils.isAddress(escrow.address)
                ) {
                    // console.log(
                    //     `[X] bad addresses: account=${account.address} escrow=${escrow.address}`
                    // );
                    return setRequests(`bad addresses: account=${account.address} escrow=${escrow.address}`);
                }

                const ans = await printWithdrawalRequests(
                    escrow,
                    account.address
                );
                // console.log("[X] ans:", ans);
                setRequests(ans);
            })();
        }, [provider, account.address]);

        return <WithdrawalRequestList requests={requests} />;
    };

export default WithdrawalRequestListContainer;
