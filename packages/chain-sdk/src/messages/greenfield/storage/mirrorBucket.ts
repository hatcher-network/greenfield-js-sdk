export const TYPE_URL = '/bnbchain.greenfield.storage.MsgMirrorBucket';

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
      name: 'id',
      type: 'string',
    },
  ],
};

export interface IMirrorBucketMsg {
  bucketId: string;
  from: string;
}

export const newMsgMirrorGroup = ({ bucketId, from }: IMirrorBucketMsg) => {
  return {
    type: TYPE_URL,
    id: bucketId,
    operator: from,
  };
};
