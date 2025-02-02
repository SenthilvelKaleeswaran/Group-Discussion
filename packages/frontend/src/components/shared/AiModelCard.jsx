import React, { useState } from "react";
import { MessageBadges, RenderSpace, SelectableContainer } from "."; // Ensure this import is correct
import { Button, Checkbox } from "../ui";
import { formatTopicName } from "../../utils";
import Icon from "../../icons";

const BottomButton = ({
  detail,
  selectedModels,
  handleChange,
  handleRotate,
}) => {
  return (
    <div className="flex justify-between items-center mt-2 px-4">
      <Checkbox
        name={detail._id}
        id="select"
        label="Select"
        checked={selectedModels.includes(detail._id)}
        onChange={handleChange}
      />
      <div
        onClick={(e) => {
          e.stopPropagation();
          handleRotate(detail.name);
        }}
        className="cursor-pointer border rounded-md bg-gray-900 p-2"
      >
        <Icon name="Rotate" />
      </div>
    </div>
  );
};

const Card = ({ detail, handleChange, selectedModels }) => {
  const [activeCard, setActiveCard] = useState(null);

  const handleRotate = (id) => {
    setActiveCard((prev) => (prev === id ? null : id));
  };

  const isRotated = activeCard === detail.name;
  const isSelected = selectedModels.includes(detail._id);

  return (
    <div className="group h-80 w-80 [perspective:1000px]  rounded-lg">
      <div
        className={`relative h-full w-full rounded-xl shadow-xl transition-all duration-500 [transform-style:preserve-3d] ${
          isRotated ? "rotate-y-180" : ""
        }`}
      >
        {/* Front Face */}
        <div className="absolute inset-0 h-full w-full rounded-xl [backface-visibility:hidden] border border-black/20 p-4 space-y-4 bg-gray-700">
          <div className="flex justify-center">
            <RenderSpace condition={detail.avatar}>
              <img
                className="cursor-pointer place-content-center h-16 w-16 rounded-full border border-black/50"
                src={detail.avatar}
                alt={detail.name}
              />
            </RenderSpace>
          </div>
          <p className="text-black text-2xl">{detail.name}</p>
          <p className="text-black">{detail.description}</p>
          <p className="text-black">{formatTopicName(detail.gender)}</p>
          <BottomButton
            detail={detail}
            selectedModels={selectedModels}
            handleChange={handleChange}
            handleRotate={handleRotate}
          />
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 h-full w-full rounded-xl p-2 text-center text-slate-200 bg-gray-700 [transform:rotateY(180deg)] [backface-visibility:hidden] border-2 border-black">
          <div className="absolute inset-0 h-full overflow-y-auto w-full rounded-xl text-center text-slate-200 p-2">
            <MessageBadges data={detail?.aiType} />
          </div>
          <BottomButton
            detail={detail}
            selectedModels={selectedModels}
            handleChange={handleChange}
            handleRotate={handleRotate}
          />
        </div>
      </div>
    </div>
  );
};

const AiModelCard = ({
  models,
  selectedModels,
  selectable = true,
  handleChange,
}) => {
  return (
    <div className="grid grid-cols-2 gap-6">
      {models?.map((detail) => (
        <SelectableContainer
          key={detail._id}
          condition={selectable}
          onClick={(e) => {
            e.stopPropagation();
            handleChange(detail._id);
          }}
        >
          <Card
            detail={detail}
            handleChange={() => handleChange(detail._id)}
            selectedModels={selectedModels}
          />
        </SelectableContainer>
      ))}
    </div>
  );
};

export { AiModelCard };
