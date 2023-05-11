export const TYPE_URL = '/bnbchain.greenfield.storage.MsgDeletePolicy';

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
      type: 'principal',
    },
    {
      name: 'resource',
      type: 'string',
    },
  ],
  principal: [
    {
      name: 'type',
      type: 'int',
    },
    {
      name: 'value',
      type: 'string',
    },
  ],
};

export interface IDeletePolicyMsg {
  principal: string;
  resource: string;
  from: string;
}

export const newMsgDeletePolicy = ({ principal, resource, from }: IDeletePolicyMsg) => {
  return {
    type: TYPE_URL,
    principal: {
      type: 2,
      value: principal,
    },
    resource: resource,
    operator: from,
  };
};
