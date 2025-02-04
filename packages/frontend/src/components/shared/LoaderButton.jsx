import { useEffect, useState } from "react";
import { Button } from "../ui";
import { Loader } from "./Loader";
import { RenderSpace } from "./RenderSpace";
import { LOCAL_STORAGE_LOADING_STATE } from "../../constants";

export const LoaderButton = ({
  id,
  condition,
  buttonProps,
  onClick,
  retry = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedStatus = localStorage.getItem(id);

    if (!savedStatus) return;
    if (!condition) {
      const parsedStatus = JSON.parse(savedStatus);

      setIsLoading(true);
      localStorage.setItem(
        id,
        JSON.stringify({
          ...parsedStatus,
          loaded: (parsedStatus.loaded || 0) + 1,
        })
      );
      if (retry) return onClick();
    } else {
      setIsLoading(false);
      localStorage.removeItem(id);
    }
  }, [id, condition]);

  const handleClick = () => {
    localStorage.setItem(
      id,
      JSON.stringify({ ...LOCAL_STORAGE_LOADING_STATE[id], loaded: 0 })
    );
    setIsLoading(true);
    onClick();
  };

  return (
    <Button {...buttonProps} onClick={handleClick} disabled={isLoading}>
      <div className="flex gap-2">
        <RenderSpace condition={isLoading}>
          <Loader showText={false} />
        </RenderSpace>

        <p>{buttonProps?.label}</p>
      </div>
    </Button>
  );
};
