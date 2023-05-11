import { BaseAccount } from '@bnb-chain/greenfield-cosmos-types/cosmos/auth/v1beta1/auth';
import { Coin } from '@bnb-chain/greenfield-cosmos-types/cosmos/base/v1beta1/coin';
import { TxBody, TxRaw } from '@bnb-chain/greenfield-cosmos-types/cosmos/tx/v1beta1/tx';
import { Any } from '@bnb-chain/greenfield-cosmos-types/google/protobuf/any';
import { visibilityTypeFromJSON } from '@bnb-chain/greenfield-cosmos-types/greenfield/storage/common';
import { MsgUpdateGroupMember } from '@bnb-chain/greenfield-cosmos-types/greenfield/storage/tx';
import { bytesFromBase64, Long } from '@bnb-chain/greenfield-cosmos-types/helpers';
import { makeAuthInfoBytes } from '@cosmjs/proto-signing';
import { bufferToHex } from '@ethereumjs/util';
import { createEIP712, generateFee, generateMessage, generateTypes } from '../../../messages';
import {
  IUpdateGroupMemberMsg,
  newMsgUpdateGroupMember,
  TYPES,
} from '../../../messages/greenfield/storage/updateGroupMember';
import { sign712Tx } from '../../../sign';
import { IRawTxInfo } from '../..';
import { BaseTx, IBaseMsg } from '../../baseTx';

export class UpdateGroupMemberTx extends BaseTx {
  readonly rpcUrl: string;
  readonly chainId: string;
  public readonly txType: string;

  constructor(rpcUrl: string, chainId: string) {
    super(rpcUrl, chainId, '/bnbchain.greenfield.storage.MsgUpdateGroupMember');

    this.rpcUrl = rpcUrl;
    this.chainId = chainId;
    this.txType = '/bnbchain.greenfield.storage.MsgUpdateGroupMember';
  }

  public async signTx({
    groupOwner,
    groupName,
    membersToAdd,
    membersToDelete,
    from,
    accountNumber,
    sequence,
    denom,
    gasLimit,
    gasPrice,
  }: IBaseMsg & IUpdateGroupMemberMsg) {
    const fee = generateFee(
      String(BigInt(gasLimit) * BigInt(gasPrice)),
      denom,
      String(gasLimit),
      from,
      '',
    );

    const msg = newMsgUpdateGroupMember({
      groupOwner,
      groupName,
      membersToAdd,
      membersToDelete,
      from,
    });

    const types = generateTypes(TYPES);
    const messages = generateMessage(accountNumber, sequence, this.chainId, '', fee, msg, '0');
    const eip712 = createEIP712(types, this.chainId, messages);

    return await sign712Tx(from, JSON.stringify(eip712));
  }

  public async getRawTxInfo({
    groupOwner,
    groupName,
    membersToAdd,
    membersToDelete,
    from,
    sequence,
    denom,
    gasLimit,
    sign,
    pubKey,
    gasPrice,
  }: IBaseMsg &
    IUpdateGroupMemberMsg & {
      sign: string;
    } & {
      pubKey: BaseAccount['pubKey'];
    }): Promise<IRawTxInfo> {
    const bodyBytes = this.getSimulateBytes({
      from,
      denom,
      groupOwner,
      groupName,
      membersToAdd,
      membersToDelete,
    });
    const authInfoBytes = this.getAuthInfoBytes({ sequence, pubKey, denom, gasLimit, gasPrice });
    const signtureFromWallet = this.getSignture(sign);

    const txRaw = TxRaw.fromPartial({
      bodyBytes,
      authInfoBytes,
      signatures: [signtureFromWallet],
    });

    const txRawBytes = TxRaw.encode(txRaw).finish();

    return {
      bytes: txRawBytes,
      hex: bufferToHex(Buffer.from(txRawBytes)),
    };
  }

  public getAuthInfoBytes({
    sequence,
    pubKey,
    denom,
    gasLimit,
    gasPrice,
  }: Pick<IBaseMsg & IUpdateGroupMemberMsg, 'sequence' | 'denom' | 'gasLimit' | 'gasPrice'> & {
    pubKey: BaseAccount['pubKey'];
  }) {
    if (!pubKey) throw new Error('pubKey is required');

    const bigGasPrice = BigInt(gasPrice);
    const bigGasLimit = BigInt(gasLimit);

    const feeAmount: Coin[] = [
      {
        amount: String(bigGasPrice * bigGasLimit),
        denom,
      },
    ];
    const feeGranter = undefined;
    const feePayer = undefined;
    const authInfoBytes = makeAuthInfoBytes(
      [{ pubkey: pubKey, sequence: Number(sequence) }],
      feeAmount,
      gasLimit,
      feeGranter,
      feePayer,
      712,
    );

    return authInfoBytes;
  }

  public getSimulateBytes({
    from,
    groupOwner,
    groupName,
    membersToAdd,
    membersToDelete,
  }: Pick<
    IBaseMsg & IUpdateGroupMemberMsg,
    'from' | 'denom' | 'groupOwner' | 'groupName' | 'membersToAdd' | 'membersToDelete'
  >) {
    const message = MsgUpdateGroupMember.fromPartial({});
    message.groupOwner = groupOwner;
    message.groupName = groupName;
    message.membersToAdd = membersToAdd;
    message.membersToDelete = membersToDelete;
    message.operator = from;

    const messageBytes = MsgUpdateGroupMember.encode(message).finish();
    const msgWrapped = Any.fromPartial({
      typeUrl: this.txType,
      value: messageBytes,
    });

    const txBody = TxBody.fromPartial({
      messages: [msgWrapped],
    });

    return TxBody.encode(txBody).finish();
  }
}
