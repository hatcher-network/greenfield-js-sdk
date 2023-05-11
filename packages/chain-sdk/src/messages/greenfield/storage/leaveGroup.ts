export const TYPE_URL = '/bnbchain.greenfield.storage.MsgLeaveGroup';

export const TYPES = {
  Msg: [
    {
      name: 'type',
      type: 'string',
    },
    {
      name: 'member',
      type: 'string',
    },
    {
      name: 'group_owner',
      type: 'string',
    },
    {
      name: 'group_name',
      type: 'string',
    },
  ],
};

export interface ILeaveGroupMsg {
  groupOwner: string;
  groupName: string;
  from: string;
}

export const newMsgLeaveGroup = ({ groupOwner, groupName, from }: ILeaveGroupMsg) => {
  return {
    type: TYPE_URL,
    group_owner: groupOwner,
    group_name: groupName,
    member: from, // the one who wants to leave
  };
};
