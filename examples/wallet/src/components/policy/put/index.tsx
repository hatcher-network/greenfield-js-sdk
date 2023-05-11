import { GRPC_URL } from '@/config';
import { decodeFromHex } from '@/utils/encoding';
import { makeCosmsPubKey, recoverPk, ZERO_PUBKEY } from '@bnb-chain/greenfield-chain-sdk';
import { getGasFeeBySimulate } from '@/utils/simulate';
import { PutPolicyTx, getAccount, ISignature712 } from '@bnb-chain/greenfield-chain-sdk';
import { useState } from 'react';
import { useAccount, useNetwork } from 'wagmi';

export const PutPolicy = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const putPolicyTx = new PutPolicyTx(GRPC_URL!, String(chain?.id)!);
  const [signInfo, setSignInfo] = useState<ISignature712>({
    messageHash: Uint8Array.from([]),
    signature: '',
  });
  const [gasLimit, setGasLimit] = useState(0);
  const [textarea, setTextArea] = useState('');
  const [groupId, setGroupId] = useState('');
  const [resource, setResource] = useState('');
  const [gasPrice, setGasPrice] = useState('');
  const now = 1683797969 + 10000000;

  return (
    <>
      <h4>Grant GET access for a group</h4>
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
        <textarea
          value={groupId}
          rows={1}
          placeholder="group ID"
          onChange={(e) => {
            setGroupId(e.target.value);
          }}
        ></textarea>
      </div>
      <div>
        <textarea
          value={resource}
          rows={1}
          placeholder="resource"
          onChange={(e) => {
            setResource(e.target.value);
          }}
        ></textarea>
      </div>
      <button
        onClick={async () => {
          if (!resource || !address || !groupId) return;

          const { sequence } = await getAccount(GRPC_URL!, address!);
          // resource: grn:o::testbucket/testobject
          const simulateBytes = putPolicyTx.getSimulateBytes({
            from: address,
            resource: resource,
            effect: 1, // 1 = allow, 2 = deny
            operation: 6, // 6 = get object
            principal: groupId,
            expiration: now,
            denom: 'BNB',
          });

          const authInfoBytes = putPolicyTx.getAuthInfoBytes({
            sequence: sequence + '',
            denom: 'BNB',
            gasLimit: 0,
            gasPrice: '0',
            pubKey: makeCosmsPubKey(ZERO_PUBKEY),
          });

          const simulateGas = await putPolicyTx.simulateTx(simulateBytes, authInfoBytes);
          console.log('simulateGas', simulateGas, getGasFeeBySimulate(simulateGas));

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
          const { sequence, accountNumber } = await getAccount(GRPC_URL!, address!);
          const sign = await putPolicyTx.signTx({
            from: address,
            resource: resource,
            effect: 1, // 1 = allow, 2 = deny
            operation: 6, // 6 = get object
            principal: groupId,
            expiration: now,
            sequence: sequence + '',
            accountNumber: accountNumber + '',
            denom: 'BNB',
            gasLimit,
            gasPrice,
          });

          console.log('712 sign', sign);
          setSignInfo(sign);
        }}
      >
        1. sign 712
      </button>
      <br />
      <button
        onClick={async () => {
          const { sequence, accountNumber } = await getAccount(GRPC_URL, address);

          const pk = recoverPk({
            signature: signInfo.signature,
            messageHash: signInfo.messageHash,
          });
          const pubKey = makeCosmsPubKey(pk);
          console.log(pubKey);

          const rawBytes = await putPolicyTx.getRawTxInfo({
            from: address,
            resource: resource,
            effect: 1, // 1 = allow, 2 = deny
            operation: 6, // 6 = get object
            principal: groupId,
            expiration: now,
            denom: 'BNB',
            gasLimit,
            gasPrice,
            pubKey,
            sequence: sequence + '',
            accountNumber: accountNumber + '',
            sign: signInfo.signature,
          });

          console.log('rawBytes', rawBytes.hex);

          const txRes = await putPolicyTx.broadcastTx(rawBytes.bytes);
          console.log('txRes', txRes);
          if (txRes.code === 0) {
            alert('success');
          }
        }}
      >
        2. broadcast tx
      </button>
    </>
  );
};
