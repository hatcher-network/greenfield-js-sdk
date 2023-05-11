import { GRPC_URL } from '@/config';
import { decodeFromHex } from '@/utils/encoding';
import { makeCosmsPubKey, recoverPk, ZERO_PUBKEY } from '@bnb-chain/greenfield-chain-sdk';
import { getGasFeeBySimulate } from '@/utils/simulate';
import { CreateGroupTx, getAccount, ISignature712 } from '@bnb-chain/greenfield-chain-sdk';
import { useState } from 'react';
import { useAccount, useNetwork } from 'wagmi';

export const CreateGroup = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const createGroupTx = new CreateGroupTx(GRPC_URL!, String(chain?.id)!);
  const [signInfo, setSignInfo] = useState<ISignature712>({
    messageHash: Uint8Array.from([]),
    signature: '',
  });
  const [gasLimit, setGasLimit] = useState(0);
  const [textarea, setTextArea] = useState('');
  const [groupName, setGroupName] = useState('');
  // const [xGnfdSignedMsg, setXGnfdSignedMsg] = useState<IApprovalCreateBucket | null>(null);
  const [members, setGroupMembers] = useState<string[] | null>(null);
  const [gasPrice, setGasPrice] = useState('');

  return (
    <>
      <h4>Create Group</h4>
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
        <textarea
          value={groupName}
          rows={1}
          placeholder="group Name"
          onChange={(e) => {
            setGroupName(e.target.value);
          }}
        ></textarea>
        <textarea
          value={textarea}
          rows={14}
          placeholder="group members"
          onChange={(e) => {
            setTextArea(e.target.value);

            try {
              const json = JSON.parse(e.target.value) as string[];

              console.log('members', json);
              setGroupMembers(json);
            } catch (err) {
              setGroupMembers(null);
            }
          }}
        ></textarea>
      </div>
      <button
        onClick={async () => {
          if (!members || !address || !groupName) return;

          const { sequence } = await getAccount(GRPC_URL!, address!);

          const simulateBytes = createGroupTx.getSimulateBytes({
            from: address,
            groupName: groupName,
            members: members,
            denom: 'BNB',
          });

          const authInfoBytes = createGroupTx.getAuthInfoBytes({
            sequence: sequence + '',
            denom: 'BNB',
            gasLimit: 0,
            gasPrice: '0',
            pubKey: makeCosmsPubKey(ZERO_PUBKEY),
          });

          const simulateGas = await createGroupTx.simulateTx(simulateBytes, authInfoBytes);
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
          console.log('members:', members, 'address:', address);
          const sign = await createGroupTx.signTx({
            from: address,
            groupName: groupName,
            members: members,
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

          const rawBytes = await createGroupTx.getRawTxInfo({
            groupName: groupName,
            members: members,
            denom: 'BNB',
            from: address,
            gasLimit,
            gasPrice,
            pubKey,
            sequence: sequence + '',
            accountNumber: accountNumber + '',
            sign: signInfo.signature,
          });

          console.log('rawBytes', rawBytes.hex);

          const txRes = await createGroupTx.broadcastTx(rawBytes.bytes);
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
