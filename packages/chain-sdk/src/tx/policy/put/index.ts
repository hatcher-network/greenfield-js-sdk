import { BaseAccount } from '@bnb-chain/greenfield-cosmos-types/cosmos/auth/v1beta1/auth';
import { Coin } from '@bnb-chain/greenfield-cosmos-types/cosmos/base/v1beta1/coin';
import { TxBody, TxRaw } from '@bnb-chain/greenfield-cosmos-types/cosmos/tx/v1beta1/tx';
import { Timestamp } from '@bnb-chain/greenfield-cosmos-types/google/protobuf/timestamp';
import { Any } from '@bnb-chain/greenfield-cosmos-types/google/protobuf/any';
import { visibilityTypeFromJSON } from '@bnb-chain/greenfield-cosmos-types/greenfield/storage/common';
import { MsgPutPolicy } from '@bnb-chain/greenfield-cosmos-types/greenfield/storage/tx';
import { bytesFromBase64, Long } from '@bnb-chain/greenfield-cosmos-types/helpers';
import { makeAuthInfoBytes } from '@cosmjs/proto-signing';
import { bufferToHex } from '@ethereumjs/util';
import { createEIP712, generateFee, generateMessage, generateTypes } from '../../../messages';
import {
  IPutPolicyMsg,
  newMsgPutPolicy,
  TYPES,
} from '../../../messages/greenfield/storage/putPolicy';
import { sign712Tx } from '../../../sign';
import { IRawTxInfo } from '../..';
import { BaseTx, IBaseMsg } from '../../baseTx';
import {
  Effect,
  Principal,
  PrincipalType,
  Statement,
  ActionType,
} from '@bnb-chain/greenfield-cosmos-types/greenfield/permission/common';

export class PutPolicyTx extends BaseTx {
  readonly rpcUrl: string;
  readonly chainId: string;
  public readonly txType: string;

  constructor(rpcUrl: string, chainId: string) {
    super(rpcUrl, chainId, '/bnbchain.greenfield.storage.MsgPutPolicy');

    this.rpcUrl = rpcUrl;
    this.chainId = chainId;
    this.txType = '/bnbchain.greenfield.storage.MsgPutPolicy';
  }

  public async signTx({
    from,
    principal,
    resource,
    effect,
    operation,
    expiration,
    sequence,
    denom,
    accountNumber,
    gasLimit,
    gasPrice,
  }: IBaseMsg & IPutPolicyMsg) {
    const fee = generateFee(
      String(BigInt(gasLimit) * BigInt(gasPrice)),
      denom,
      String(gasLimit),
      from,
      '',
    );

    const msg = newMsgPutPolicy({
      from,
      principal,
      resource,
      effect,
      operation,
      expiration,
    });

    const msg1 = MsgPutPolicy.fromJSON(msg);

    console.log('msg:', msg);
    console.log('msg1:', msg1);

    const types = generateTypes(TYPES);
    console.log('types:', types);
    const messages = generateMessage(accountNumber, sequence, this.chainId, '', fee, msg, '0');
    console.log('messages:', messages);
    const eip712 = createEIP712(types, this.chainId, messages);

    return await sign712Tx(from, JSON.stringify(eip712));
  }

  public async getRawTxInfo({
    from,
    principal,
    resource,
    effect,
    operation,
    expiration,
    pubKey,
    sign,
    sequence,
    denom,
    gasLimit,
    gasPrice,
  }: IBaseMsg &
    IPutPolicyMsg & {
      sign: string;
    } & {
      pubKey: BaseAccount['pubKey'];
    }): Promise<IRawTxInfo> {
    const bodyBytes = this.getSimulateBytes({
      from,
      denom,
      principal,
      resource,
      effect,
      operation,
      expiration,
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
  }: Pick<IBaseMsg & IPutPolicyMsg, 'sequence' | 'denom' | 'gasLimit' | 'gasPrice'> & {
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
    principal,
    resource,
    effect,
    operation,
    expiration,
  }: Pick<
    IBaseMsg & IPutPolicyMsg,
    'from' | 'denom' | 'principal' | 'resource' | 'effect' | 'operation' | 'expiration'
  >) {
    const message = MsgPutPolicy.fromPartial({});
    message.operator = from;
    message.principal = Principal.fromJSON({
      type: PrincipalType.PRINCIPAL_TYPE_GNFD_GROUP,
      value: principal,
    });
    message.resource = resource;
    const statement = Statement.fromJSON({
      effect: effect, //Effect.EFFECT_ALLOW = 6,
      actions: [operation], // [ActionType.ACTION_GET_OBJECT],
      resources: [resource],
      expirationTime: Timestamp.fromJSON({ seconds: expiration, nanos: '0' }),
    });
    message.statements = [statement];
    message.expirationTime = Timestamp.fromJSON({ seconds: expiration, nanos: '0' });

    console.log(message);
    console.log(MsgPutPolicy.toJSON(message));

    const messageBytes = MsgPutPolicy.encode(message).finish();
    console.log('MsgPutPolicy bytes:', messageBytes.toString());
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
