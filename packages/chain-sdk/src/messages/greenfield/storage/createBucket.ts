import { MsgCreateBucket } from '@bnb-chain/greenfield-cosmos-types/greenfield/storage/tx';
import { visibilityTypeToJSON } from '@bnb-chain/greenfield-cosmos-types/greenfield/storage/common';

export const TYPE_URL = '/bnbchain.greenfield.storage.MsgCreateBucket';

export const TYPES = {
  Msg: [
    {
      name: 'type',
      type: 'string',
    },
    {
      name: 'creator',
      type: 'string',
    },
    {
      name: 'bucket_name',
      type: 'string',
    },
    {
      name: 'visibility',
      type: 'string',
    },
    {
      name: 'payment_address',
      type: 'string',
    },
    {
      name: 'primary_sp_address',
      type: 'string',
    },
    {
      name: 'primary_sp_approval',
      type: 'TypePrimarySpApproval',
    },
    {
      name: 'charged_read_quota',
      type: 'uint64',
    },
  ],
  TypePrimarySpApproval: [
    {
      name: 'expired_height',
      type: 'uint64',
    },
    {
      name: 'sig',
      type: 'bytes',
    },
  ],
};

export interface ICreateBucketMsg {
  bucketName: string;
  expiredHeight: string;
  from: string;
  visibility: string;
  paymentAddress: string;
  primarySpAddress: string;
  chargedReadQuota: number;
  sig: string;
}

export const newMsgCreateBucket = ({
  bucketName,
  expiredHeight,
  from,
  visibility,
  paymentAddress,
  primarySpAddress,
  chargedReadQuota,
  sig,
}: ICreateBucketMsg) => {
  const message = MsgCreateBucket.fromJSON({
    visibility,
  });

  return {
    type: TYPE_URL,
    bucket_name: bucketName,
    creator: from,
    visibility: visibilityTypeToJSON(message.visibility),
    payment_address: paymentAddress,
    primary_sp_address: primarySpAddress,
    primary_sp_approval: {
      expired_height: expiredHeight,
      sig,
    },
    charged_read_quota: chargedReadQuota,
  };
};
