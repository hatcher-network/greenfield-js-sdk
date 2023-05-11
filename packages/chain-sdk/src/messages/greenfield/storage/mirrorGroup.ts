export const TYPE_URL = '/bnbchain.greenfield.storage.MsgMirrorGroup';

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

export interface IMirrorGroupMsg {
  groupId: string;
  from: string;
}

export const newMsgMirrorGroup = ({ groupId, from }: IMirrorGroupMsg) => {
  return {
    type: TYPE_URL,
    id: groupId,
    operator: from,
  };
};
