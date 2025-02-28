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
import { FiMicOff } from "react-icons/fi";
import { ImBlocked } from "react-icons/im";
import { HiDotsVertical } from "react-icons/hi";
import { LuListPlus } from "react-icons/lu";
import { FaUser } from "react-icons/fa";
import { LuTrash2 } from "react-icons/lu";
import { MdDragIndicator } from "react-icons/md";
import { MdTimeline } from "react-icons/md";
import { HiStatusOffline } from "react-icons/hi";
import { MdOutlineMotionPhotosPaused } from "react-icons/md";
import { CgPlayListRemove } from "react-icons/cg";
import { TbTimeDurationOff } from "react-icons/tb";
import { GrDrag } from "react-icons/gr";
import { IoReloadOutline } from "react-icons/io5";
import { MdDeleteSweep } from "react-icons/md";
import { GoStack } from "react-icons/go";
import { MdClose } from "react-icons/md";
import { LuLayoutList } from "react-icons/lu";
import { MdDisplaySettings } from "react-icons/md";

const Icon = ({ name, ...props }) => {
  const IconsList = {
    Admin: FaUserShield,
    Backward: IoPlayBack,
    Block: ImBlocked,
    Close : MdClose,
    ChevronDown: FaChevronDown,
    ChevronUp: FaChevronUp,
    Correct: IoCheckmarkCircle,
    Delete: LuTrash2,
    Drag: GrDrag,
    Forward: IoPlayForward,
    MicrophoneOn: FiMic,
    MicrophoneOff: FiMicOff,
    Hold: MdOutlineMotionPhotosPaused,
    HorizontalDots: HiDotsHorizontal,
    InProgress: MdTimeline,
    InActive: HiStatusOffline,
    List : LuLayoutList,
    Loader: FiLoader,
    LoadArrow : MdDeleteSweep,
    NotStartedQueue: TbTimeDurationOff,
    Pause: FaPause,
    Play: FaPlay,
    Queue: LuListPlus,
    QueueStack : GoStack,
    Require: LuTarget,
    Robot: VscRobot,
    Rotate: FaRotate,
    SettingsSession : MdDisplaySettings,
    Settings: IoSettings,
    User: FaUser,
    Users: FaUsers,
    VerticlDots: HiDotsVertical,
    Wave: PiWaveformBold,
  };

  const IconComponent = IconsList[name];

  if (!IconComponent) {
    return null;
  }

  return <IconComponent className="w-4.5 h-4.5" {...props} />;
};

export default Icon;
