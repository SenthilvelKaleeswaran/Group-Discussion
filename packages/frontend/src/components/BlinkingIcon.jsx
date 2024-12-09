import clsx from "clsx";
import Icon from "../icons";

const BlinkingIcon = ({ icon, iconColor = "blue", pingColor = "blue" }) => {
  return (
    <div
      className={clsx(
        "p-1.5 rounded-full border",
        `border-${iconColor}-500`
      )}
    >
      <span className="relative flex">
        <span
          className={clsx(
            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
            `bg-${pingColor}-400`
          )}
        ></span>
        <Icon name={icon} className={clsx(`text-${iconColor}-500`, "h-4.5 w-4.5")} />
      </span>
    </div>
  );
};

export default BlinkingIcon;
