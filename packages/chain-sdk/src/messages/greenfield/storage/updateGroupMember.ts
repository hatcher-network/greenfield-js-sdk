export const TYPE_URL = '/bnbchain.greenfield.storage.MsgUpdateGroupMember';

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
      name: 'group_owner',
      type: 'string',
    },
    {
      name: 'group_name',
      type: 'string',
    },
    {
      name: 'members_to_add',
      type: 'string[]',
    },
    {
      name: 'members_to_delete',
      type: 'string[]',
    },
  ],
};

export interface IUpdateGroupMemberMsg {
  groupOwner: string;
  groupName: string;
  membersToAdd: string[];
  membersToDelete: string[];
  from: string;
}

export const newMsgUpdateGroupMember = ({
  groupOwner,
  groupName,
  membersToAdd,
  membersToDelete,
  from,
}: IUpdateGroupMemberMsg) => {
  return {
    type: TYPE_URL,
    group_owner: groupOwner,
    group_name: groupName,
    members_to_add: membersToAdd,
    members_to_delete: membersToDelete,
    operator: from,
  };
};
