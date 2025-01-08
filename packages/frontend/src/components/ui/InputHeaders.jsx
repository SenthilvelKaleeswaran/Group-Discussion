import React, { useEffect, useState } from "react";
import { RenderSpace } from "../shared";
import Icon from "../../icons";


const FieldValidation = ({ data }) => {
  const [success, setSuccess] = useState(false);

  const {
    hideCorrection,
    value,
    validation = {
      validate: (val) => {
        if (typeof val === "number") {
          return val > 0;
        }
        return val?.length > 3;
      },
    },
  } = data;

  const { validate } = validation;

  useEffect(() => {
    setSuccess(validate(value));
  }, [value]);

  return (
    <RenderSpace condition={hideCorrection && success}>
      <Icon className="text-base text-green-500 " name="Correct" />
    </RenderSpace>
  );
};

const InputHeader = ({ field }) => {
  const { required, id, label, } = field;
  console.log({nameee : field?.name,field})

  return (
    <RenderSpace condition={true}>
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={id}
          className="block text-lg text-left font-medium text-gray-700 mb-2 "
        >
          {label}
        </label>
        <div className="flex gap-1 items-center">
          <RenderSpace condition={required}>
            <Icon className="text-red-500 text-sm" name="Require" />
          </RenderSpace>
          <FieldValidation data={field} />
        </div>
      </div>
    </RenderSpace>
  );
};

export default InputHeader;
