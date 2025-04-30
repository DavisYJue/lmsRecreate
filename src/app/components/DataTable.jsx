import Button from "./Button";

const DataTable = ({ data, searchQuery, onRemove, entityType }) => {
  return (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-200">
          <th className="border border-gray-300 p-2">Name</th>
          <th className="border border-gray-300 p-2">ID</th>
          {entityType === "Assistant" ? (
            <th className="border border-gray-300 p-2">Department</th>
          ) : (
            <th className="border border-gray-300 p-2">Class</th>
          )}
          <th className="border border-gray-300 p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data
          .filter(
            (item) =>
              item.student_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              item.student_id
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              (entityType === "Student" &&
                item.class
                  ?.toLowerCase()
                  .includes(searchQuery.toLowerCase())) ||
              (entityType === "Assistant" &&
                item.department
                  ?.toLowerCase()
                  .includes(searchQuery.toLowerCase()))
          )
          .map((item) => (
            <tr key={item.student_id} className="border border-gray-300">
              <td className="border border-gray-300 p-2">
                {item.student_name}
              </td>
              <td className="border border-gray-300 p-2">{item.student_id}</td>
              {entityType === "Assistant" ? (
                <td className="border border-gray-300 p-2">
                  {item.department}
                </td>
              ) : (
                <td className="border border-gray-300 p-2">{item.class}</td>
              )}
              <td className="border border-gray-300 p-2 text-center">
                <Button
                  text={`Remove ${entityType}`}
                  onClick={() => onRemove(item)}
                  className="px-3 py-1 text-slate-950 bg-red-300 hover:bg-rose-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-pink-800 active:text-white active:border-rose-400"
                />
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export default DataTable;
