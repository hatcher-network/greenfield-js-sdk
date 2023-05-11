import { useState } from 'react';
import {
  DelPolicyTx,
  getAccount,
  ISignature712,
  ZERO_PUBKEY,
} from '@bnb-chain/greenfield-chain-sdk';
import { GRPC_URL } from '@/config';
import { useAccount, useNetwork } from 'wagmi';
import { makeCosmsPubKey, recoverPk } from '@bnb-chain/greenfield-chain-sdk';

export const DeletePolicy = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const [groupName, setGroupName] = useState('');
  const [resource, setResource] = useState('');
  const [gasLimit, setGasLimit] = useState(0);
  const [signInfo, setSignInfo] = useState<ISignature712>({
    messageHash: Uint8Array.from([]),
    signature: '',
  });

  const delPolicyTx = new DelPolicyTx(GRPC_URL, String(chain?.id)!);
  const [gasPrice, setGasPrice] = useState('');

  return (
    <>
      <h4>Delete Permission for Group to access resource</h4>
      <div>
        group name:
        <input
          onChange={(e) => {
            setGroupName(e.target.value);
          }}
        />
        <br />
        resource:
        <input
          onChange={(e) => {
            setResource(e.target.value);
          }}
        />
        <br />
        <button
          onClick={async () => {
            if (!address) return;

            const { sequence } = await getAccount(GRPC_URL!, address!);

            const simulateBytes = delPolicyTx.getSimulateBytes({
              principal: groupName,
              resource: resource,
              from: address,
            });

            const authInfoBytes = delPolicyTx.getAuthInfoBytes({
              sequence: sequence + '',
              denom: 'BNB',
              gasLimit: 0,
              gasPrice: '0',
              pubKey: makeCosmsPubKey(ZERO_PUBKEY),
            });

            const simulateGas = await delPolicyTx.simulateTx(simulateBytes, authInfoBytes);

            console.log(simulateGas);

            const gasPri = simulateGas.gasInfo?.minGasPrice.replaceAll('BNB', '');
            setGasPrice(gasPri!);

            setGasLimit(simulateGas.gasInfo?.gasUsed.toNumber() || 0);
          }}
        >
          0. simulate
        </button>
        <br />
        <button
          onClick={async () => {
            if (!address) return;

            const { sequence, accountNumber } = await getAccount(GRPC_URL!, address!);

            const sign = await delPolicyTx.signTx({
              accountNumber: accountNumber + '',
              principal: groupName,
              resource: resource,
              from: address,
              sequence: sequence + '',
              gasLimit,
              gasPrice,
              denom: 'BNB',
            });

            console.log('delete bucket 712 sign', sign);
            setSignInfo(sign);
          }}
        >
          1. sign 712
        </button>
        <br />
        <button
          onClick={async () => {
            if (!address) return;

            const { sequence, accountNumber } = await getAccount(GRPC_URL, address);

            const pk = recoverPk({
              signature: signInfo.signature,
              messageHash: signInfo.messageHash,
            });
            const pubKey = makeCosmsPubKey(pk);

            const rawBytes = await delPolicyTx.getRawTxInfo({
              accountNumber: accountNumber + '',
              principal: groupName,
              resource: resource,
              from: address,
              sequence: sequence + '',
              gasLimit,
              pubKey,
              sign: signInfo.signature,
              denom: 'BNB',
              gasPrice,
            });

            console.log('delete rawBytes', rawBytes);

            const txRes = await delPolicyTx.broadcastTx(rawBytes.bytes);

            console.log(txRes);

            if (txRes.code === 0) {
              alert('delete policy success');
            }
          }}
        >
          2. broadcast tx
        </button>
      </div>
    </>
  );
};
