import React from 'react';

const CurrentMember = ({ currentMember, renderStatus, renderIcon }) => {
  if (!currentMember) return null;

  const memberTypeClass =
    currentMember.type === 'You'
      ? 'bg-blue-500 text-blue-500'
      : currentMember.type === 'User'
      ? 'bg-green-500 text-green-300'
      : 'bg-gray-500 text-gray-300';

  return (
    <div className="flex justify-between items-center px-2">
      <div className="flex gap-2 items-center">
        <div
          className={`w-8 h-8 flex items-center justify-center rounded-full shadow-inner ${memberTypeClass}`}
        >
          <span className="font-bold">
            {currentMember.name.slice(0, 1).toUpperCase()}
          </span>
        </div>
        <span className={`font-bold ${memberTypeClass.split(' ')[1]}`}>
          {currentMember.name}
        </span>
      </div>
      <div className="flex gap-2 items-center">
        <p className="text-xs text-gray-500">{renderStatus()}</p>
        {renderIcon()}
      </div>
    </div>
  );
};

export default CurrentMember;
