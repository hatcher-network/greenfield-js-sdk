import { PutPolicy } from './put';
import { DeletePolicy } from './delete';
// import { GroupInfo } from './info';

export const Policy = () => {
  return (
    <div>
      <h2>Policy</h2>

      <PutPolicy />

      <div style={{ marginTop: 10 }} />

      <DeletePolicy />

      <div style={{ marginTop: 10 }} />

      {/* <GroupInfo /> */}
    </div>
  );
};
