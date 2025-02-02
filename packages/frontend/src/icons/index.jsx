// Icon.jsx
import { FiMic } from "react-icons/fi";
import { PiWaveformBold } from "react-icons/pi";
import { HiDotsHorizontal } from "react-icons/hi";
import { FaPlay } from "react-icons/fa";
import { IoPlayBack } from "react-icons/io5";
import { IoPlayForward } from "react-icons/io5";
import { FaPause } from "react-icons/fa6";
import { VscRobot } from "react-icons/vsc";
import { FiLoader } from "react-icons/fi";
import { FaRotate } from "react-icons/fa6";
import { IoCheckmarkCircle } from "react-icons/io5";
import { FaStarOfLife } from "react-icons/fa6";
import { LuTarget } from "react-icons/lu";
import { FaChevronDown } from "react-icons/fa";
import { FaChevronUp } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { FaUserShield } from "react-icons/fa6";
import { IoSettings } from "react-icons/io5";
import { ImBlocked } from "react-icons/im";


const Icon = ({ name, ...props }) => {
  const IconsList = {
    Admin : FaUserShield,
    Backward: IoPlayBack,
    Block : ImBlocked,
    ChevronDown: FaChevronDown,
    ChevronUp: FaChevronUp,
    Correct: IoCheckmarkCircle,
    Forward: IoPlayForward,
    MicrophoneOn: FiMic,
    HorizontalDots: HiDotsHorizontal,
    Loader: FiLoader,
    Pause: FaPause,
    Play: FaPlay,
    Require: LuTarget,
    Robot: VscRobot,
    Rotate: FaRotate,
    Settings :IoSettings ,
    Users : FaUsers,
    Wave: PiWaveformBold,
  };

  const IconComponent = IconsList[name];

  if (!IconComponent) {
    return null;
  }

  return <IconComponent className="w-4.5 h-4.5" {...props} />;
};

export default Icon;
