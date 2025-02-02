export const PeopleList = ({list,title}) => {
  return (
    <div className="space-y-2">
      <p>{title}</p>
      {list
        ?.filter((item) => item?.isActive)
        ?.map((item, index) => (
          <div className="cursor-pointer hover:bg-gray-800 px-2 py-1 rounded-md">
            <p className="text-left">
              {index + 1}. {item?.name}
            </p>
            <div></div>
          </div>
        ))}
    </div>
  );
};
