import { useSelector } from "react-redux";

export const PermissionGuard = ({ children, field, condition = true }) => {
  if (condition) {
    const { userRole, permission } = useSelector((state) => state.controls);

    if (!userRole || !permission || !field) {
      return null; // Hide content if role, permission, or field is missing
    }

    console.log({ permission, aaaaaabbbba: permission?.[field]?.[userRole] });

    // Check if the user's role has a valid permission for the given field
    if (permission?.[field]?.[userRole] > 0) {
      return <>{children}</>; // Render children if permission exists
    }

    return null; // Otherwise, return nothing
  }
};
