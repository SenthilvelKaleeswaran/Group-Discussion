// Icon.jsx
import { FiMic } from "react-icons/fi";
import { PiWaveformBold } from "react-icons/pi";
import { HiDotsHorizontal } from "react-icons/hi";
import { FaPlay } from "react-icons/fa";
import { IoPlayBack } from "react-icons/io5";
import { IoPlayForward } from "react-icons/io5";
import { FaPause } from "react-icons/fa6";

const Icon = ({ name, ...props }) => {
  const IconsList = {
    Backward: IoPlayBack,
    Forward: IoPlayForward,
    MicrophoneOn: FiMic, 
    HorizontalDots: HiDotsHorizontal,
    Pause : FaPause,
    Play: FaPlay,
    Wave: PiWaveformBold,
  };

  const IconComponent = IconsList[name];

  if (!IconComponent) {
    return null; 
  }

  return <IconComponent className="w-4.5 h-4.5" {...props} />;
};

export default Icon;
