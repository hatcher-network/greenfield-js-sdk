import { BaseAccount } from '@bnb-chain/greenfield-cosmos-types/cosmos/auth/v1beta1/auth';
import { Coin } from '@bnb-chain/greenfield-cosmos-types/cosmos/base/v1beta1/coin';
import { TxBody, TxRaw } from '@bnb-chain/greenfield-cosmos-types/cosmos/tx/v1beta1/tx';
import { Any } from '@bnb-chain/greenfield-cosmos-types/google/protobuf/any';
import { visibilityTypeFromJSON } from '@bnb-chain/greenfield-cosmos-types/greenfield/storage/common';
import { MsgMirrorGroup } from '@bnb-chain/greenfield-cosmos-types/greenfield/storage/tx';
import { bytesFromBase64, Long } from '@bnb-chain/greenfield-cosmos-types/helpers';
import { makeAuthInfoBytes } from '@cosmjs/proto-signing';
import { bufferToHex } from '@ethereumjs/util';
import { createEIP712, generateFee, generateMessage, generateTypes } from '../../../messages';
import {
  IMirrorGroupMsg,
  newMsgMirrorGroup,
  TYPES,
} from '../../../messages/greenfield/storage/mirrorGroup';
import { sign712Tx } from '../../../sign';
import { IRawTxInfo } from '../..';
import { BaseTx, IBaseMsg } from '../../baseTx';

export class MirrorGroupTx extends BaseTx {
  readonly rpcUrl: string;
  readonly chainId: string;
  public readonly txType: string;

  constructor(rpcUrl: string, chainId: string) {
    super(rpcUrl, chainId, '/bnbchain.greenfield.storage.MsgMirrorGroup');

    this.rpcUrl = rpcUrl;
    this.chainId = chainId;
    this.txType = '/bnbchain.greenfield.storage.MsgMirrorGroup';
  }

  public async signTx({
    groupId,
    from,
    accountNumber,
    sequence,
    denom,
    gasLimit,
    gasPrice,
  }: IBaseMsg & IMirrorGroupMsg) {
    const fee = generateFee(
      String(BigInt(gasLimit) * BigInt(gasPrice)),
      denom,
      String(gasLimit),
      from,
      '',
    );

    const msg = newMsgMirrorGroup({
      groupId,
      from,
    });

    const types = generateTypes(TYPES);
    const messages = generateMessage(accountNumber, sequence, this.chainId, '', fee, msg, '0');
    const eip712 = createEIP712(types, this.chainId, messages);

    return await sign712Tx(from, JSON.stringify(eip712));
  }

  public async getRawTxInfo({
    groupId,
    from,
    sequence,
    denom,
    gasLimit,
    sign,
    pubKey,
    gasPrice,
  }: IBaseMsg &
    IMirrorGroupMsg & {
      sign: string;
    } & {
      pubKey: BaseAccount['pubKey'];
    }): Promise<IRawTxInfo> {
    const bodyBytes = this.getSimulateBytes({
      from,
      denom,
      groupId,
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
  }: Pick<IBaseMsg & IMirrorGroupMsg, 'sequence' | 'denom' | 'gasLimit' | 'gasPrice'> & {
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
    groupId,
  }: Pick<IBaseMsg & IMirrorGroupMsg, 'from' | 'denom' | 'groupId'>) {
    const message = MsgMirrorGroup.fromPartial({});
    message.id = groupId;
    message.operator = from;

    const messageBytes = MsgMirrorGroup.encode(message).finish();
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
