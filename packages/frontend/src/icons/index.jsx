// Icon.jsx
import { FiMic } from "react-icons/fi";
import { PiWaveformBold } from "react-icons/pi";
import { HiDotsHorizontal } from "react-icons/hi";

const Icon = ({ name, ...props }) => {
  const IconsList = {
    MicrophoneOn: FiMic, 
    Wave : PiWaveformBold,
    HorizontalDots :HiDotsHorizontal
  };

  const IconComponent = IconsList[name];

  if (!IconComponent) {
    return null; 
  }

  return <IconComponent className='w-4.5 h-4.5' {...props}  />;
};

export default Icon;
