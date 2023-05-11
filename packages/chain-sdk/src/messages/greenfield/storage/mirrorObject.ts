export const TYPE_URL = '/bnbchain.greenfield.storage.MsgMirrorObject';

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

export interface IMirrorObjectMsg {
  objId: string;
  from: string;
}

export const newMsgMirrorObject = ({ objId, from }: IMirrorObjectMsg) => {
  return {
    type: TYPE_URL,
    id: objId,
    operator: from,
  };
};
