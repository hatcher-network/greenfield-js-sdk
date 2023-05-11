import { MsgPutPolicy } from '@bnb-chain/greenfield-cosmos-types/greenfield/storage/tx';
import { Timestamp } from '@bnb-chain/greenfield-cosmos-types/google/protobuf/timestamp';
import {
  Effect,
  Principal,
  PrincipalType,
  Statement,
  ActionType,
  principalTypeToJSON,
  effectToJSON,
  actionTypeToJSON,
} from '@bnb-chain/greenfield-cosmos-types/greenfield/permission/common';
export const TYPE_URL = '/bnbchain.greenfield.storage.MsgPutPolicy';

export const TYPES = {
  Msg: [
    {
      name: 'type',
      type: 'string',
    },
    {
      name: 'operator',
      type: 'string',
    },
    {
      name: 'principal',
      type: 'TypePrincipal',
    },
    {
      name: 'resource',
      type: 'string',
    },
    {
      name: 'statements',
      type: 'TypeStatement[]',
    },
    {
      name: 'expiration_time',
      type: 'TypeTimestamp',
    },
  ],
  TypePrincipal: [
    {
      name: 'type',
      type: 'string',
    },
    {
      name: 'value',
      type: 'string',
    },
  ],
  TypeStatement: [
    {
      name: 'effect',
      type: 'string',
    },
    {
      name: 'actions',
      type: 'string[]',
    },
    {
      name: 'resources',
      type: 'string[]',
    },
    {
      name: 'expiration_time',
      type: 'TypeTimestamp',
    },
  ],
  TypeTimestamp: [
    {
      name: 'seconds',
      type: 'string',
    },
    {
      name: 'nanos',
      type: 'string',
    },
  ],
};

export interface IPutPolicyMsg {
  principal: string; // A group or an address
  resource: string;
  effect: string; // 1: allow, 2: deny
  operation: string; // granted operation, refer to: https://github.com/bnb-chain/greenfield/blob/master/proto/greenfield/permission/common.proto#L12
  expiration: string;
  from: string;
}

export const newMsgPutPolicy = ({
  principal,
  resource,
  effect,
  operation,
  expiration,
  from,
}: IPutPolicyMsg) => {
  const message = MsgPutPolicy.fromPartial({});
  message.operator = from;
  message.principal = Principal.fromJSON({
    type: PrincipalType.PRINCIPAL_TYPE_GNFD_GROUP,
    value: principal,
  });
  message.resource = resource;
  const statement = Statement.fromJSON({
    effect: Effect.EFFECT_ALLOW, //effect, //Effect.EFFECT_ALLOW = 6,
    actions: [ActionType.ACTION_GET_OBJECT], //[operation], // [ActionType.ACTION_GET_OBJECT],
    resources: [resource],
    expirationTime: Timestamp.fromJSON({ seconds: expiration, nanos: '0' }),
  });
  message.statements = [statement];
  message.expirationTime = Timestamp.fromJSON({ seconds: expiration, nanos: '0' });
  return {
    type: TYPE_URL,
    principal: {
      type: principalTypeToJSON(PrincipalType.PRINCIPAL_TYPE_GNFD_GROUP),
      value: principal,
    },
    resource: resource,
    statements: [
      {
        effect: effectToJSON(statement.effect),
        actions: [actionTypeToJSON(ActionType.ACTION_GET_OBJECT)],
        resources: [resource],
        expiration_time: { seconds: expiration, nanos: '0' },
      },
    ],
    expiration_time: { seconds: expiration, nanos: '0' },
    operator: from,
  };
};
