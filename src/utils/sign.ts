import type { BigNumberish } from "ethers";
import { BigNumber, ethers, Signature } from "ethers";
import { SignTypedDataResult, signTypedData } from "@wagmi/core";
import { Address } from "abitype";

export default async function sign(
  name: string,
  chainId: number,
  verifyingContract: string,
  owner: string,
  spender: string,
  nonce: BigNumberish,
  deadline: BigNumberish
): Promise<{ v: number; r: string; s: string }> {
  const cast = (x: string): Address => {
    if (ethers.utils.isAddress(x)) {
      return x as Address;
    }
    throw new Error(`invalid address: ${x}`);
  };
  const signature: SignTypedDataResult = await signTypedData({
    domain: {
      name: name,
      version: "1",
      chainId: chainId,
      verifyingContract: cast(verifyingContract),
    },
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    value: {
      owner: cast(owner),
      spender: cast(spender),
      value: ethers.constants.MaxUint256,
      nonce: BigNumber.from(nonce),
      deadline: BigNumber.from(deadline),
    },
  });

  // console.log(`signature=${signature}`);
  const { v, r, s }: Signature = ethers.utils.splitSignature(signature);
  return { v, r, s };
}
