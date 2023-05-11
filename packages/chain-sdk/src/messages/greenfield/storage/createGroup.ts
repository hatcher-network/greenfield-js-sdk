export const TYPE_URL = '/bnbchain.greenfield.storage.MsgCreateGroup';

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
      name: 'group_name',
      type: 'string',
    },
    {
      name: 'members',
      type: 'string[]',
    },
  ],
};

export interface ICreateGroupMsg {
  groupName: string;
  members: string[];
  from: string;
}

export const newMsgCreateGroup = ({ groupName, members, from }: ICreateGroupMsg) => {
  return {
    type: TYPE_URL,
    group_name: groupName,
    members: members,
    creator: from,
  };
};
