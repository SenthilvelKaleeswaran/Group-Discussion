import toast from "react-hot-toast";

export const displayToast = ({ id, remove, data, customComponent }) => {
  let type = "default";
  let message = "";

  if (data) {
    const [key, value] = Object.entries(data)[0];
    type = key;
    message = value;
  }

  const toastOptions = {
    id: id || `${type}_${message}`,
    duration: type === "loading" ? Infinity : 4000,
  };

  const content = customComponent || message;

  if (remove) {
    remove.forEach((toastIdToRemove) => toast.dismiss(toastIdToRemove));
  }

  switch (type) {
    case "success":
      toast.success(content, toastOptions);
      break;
    case "error":
      toast.error(content, toastOptions);
      break;
    case "loading":
      toast.loading(content, toastOptions);
      break;
    default:
      toast(content, toastOptions);
  }
};
