import { IconWithLoader } from "./VariantsIcon";
import { Button } from "../ui";

export const ButtonIcon = ({ isLoading, name,className, iconClassName, ...rest }) => {
  return (
    <Button {...rest} className={`p-0 px-0 py-0 ${className}`}>
      <IconWithLoader
        isLoading={isLoading}
        name={name}
        className={iconClassName}
      />
    </Button>
  );
};
