import { BaseAccount } from '@bnb-chain/greenfield-cosmos-types/cosmos/auth/v1beta1/auth';
import { Coin } from '@bnb-chain/greenfield-cosmos-types/cosmos/base/v1beta1/coin';
import { TxBody, TxRaw } from '@bnb-chain/greenfield-cosmos-types/cosmos/tx/v1beta1/tx';
import { Any } from '@bnb-chain/greenfield-cosmos-types/google/protobuf/any';
import { MsgDeleteGroup } from '@bnb-chain/greenfield-cosmos-types/greenfield/storage/tx';
import { makeAuthInfoBytes } from '@cosmjs/proto-signing';
import { bufferToHex } from '@ethereumjs/util';
import { createEIP712, generateFee, generateMessage, generateTypes } from '../../../messages';
import {
  newMsgDeleteGroup,
  TYPES,
  TYPE_URL,
  type IDeleteGroupMsg,
} from '../../../messages/greenfield/storage/deleteGroup';
import { sign712Tx } from '../../../sign';
import { type IRawTxInfo } from '../..';
import { BaseTx, type IBaseMsg } from '../../baseTx';

export class DelGroupTx extends BaseTx {
  readonly rpcUrl: string;
  readonly chainId: string;
  public readonly txType: string;

  constructor(rpcUrl: string, chainId: string) {
    super(rpcUrl, chainId, TYPE_URL);

    this.rpcUrl = rpcUrl;
    this.chainId = chainId;
    this.txType = TYPE_URL;
  }

  public async signTx({
    from,
    groupName,
    accountNumber,
    sequence,
    gasLimit,
    denom,
    gasPrice,
  }: IBaseMsg & IDeleteGroupMsg) {
    const fee = generateFee(
      String(BigInt(gasLimit) * BigInt(gasPrice)),
      denom,
      String(gasLimit),
      from,
      '',
    );
    const msg = newMsgDeleteGroup({
      groupName,
      from,
    });

    const types = generateTypes(TYPES);
    const messages = generateMessage(accountNumber, sequence, this.chainId, '', fee, msg, '0');
    const eip712 = createEIP712(types, this.chainId, messages);
    return await sign712Tx(from, JSON.stringify(eip712));
  }

  public async getRawTxInfo({
    groupName,
    from,
    sequence,
    gasLimit,
    sign,
    pubKey,
    denom,
    gasPrice,
  }: IBaseMsg &
    IDeleteGroupMsg & {
      sign: string;
    } & {
      pubKey: BaseAccount['pubKey'];
    }): Promise<IRawTxInfo> {
    const bodyBytes = this.getSimulateBytes({
      from,
      groupName,
    });
    const authInfoBytes = this.getAuthInfoBytes({ denom, sequence, pubKey, gasLimit, gasPrice });
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

  public getSimulateBytes({
    from,
    groupName,
  }: Pick<IBaseMsg & IDeleteGroupMsg, 'from' | 'groupName'>): Uint8Array {
    const message = MsgDeleteGroup.fromJSON({
      operator: from,
      groupName,
    });
    const messageBytes = MsgDeleteGroup.encode(message).finish();
    const msgDemoWrapped = Any.fromPartial({
      typeUrl: this.txType,
      value: messageBytes,
    });

    const txBody = TxBody.fromPartial({
      messages: [msgDemoWrapped],
    });

    return TxBody.encode(txBody).finish();
  }

  public getAuthInfoBytes({
    sequence,
    pubKey,
    denom,
    gasLimit,
    gasPrice,
  }: Pick<IBaseMsg & IDeleteGroupMsg, 'denom' | 'sequence' | 'gasLimit' | 'gasPrice'> & {
    pubKey: BaseAccount['pubKey'];
  }) {
    if (!pubKey) throw new Error('pubKey is required');

    const feeAmount: Coin[] = [
      {
        amount: String(BigInt(gasLimit) * BigInt(gasPrice)),
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
}
