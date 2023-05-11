export const TYPE_URL = '/bnbchain.greenfield.storage.MsgDeleteGroup';

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
      name: 'group_name',
      type: 'string',
    },
  ],
};

export interface IDeleteGroupMsg {
  groupName: string;
  from: string;
}

export const newMsgDeleteGroup = ({ groupName, from }: IDeleteGroupMsg) => {
  return {
    type: TYPE_URL,
    group_name: groupName,
    operator: from,
  };
};
