import clsx from "clsx";
import Icon from "../icons";

const BlinkingIcon = ({ icon, iconColor = "blue", pingColor = "blue" }) => {
  const ping = `bg-${pingColor}-500`;
  const border = `border-${iconColor}-500`;
  const text = `text-${iconColor}-500`;
  return (
    <div className={clsx("p-1.5 rounded-full border", border)}>
      <span className="relative flex">
        <span
          className={clsx(
            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
            ping
          )}
        ></span>
        <Icon name={icon} className={clsx(text, "h-4.5 w-4.5")} />
      </span>
    </div>
  );
};

export default BlinkingIcon;
