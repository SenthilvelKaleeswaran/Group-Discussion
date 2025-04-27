const Permission = require("../models/permission");

// Data view levels defining which roles can access which permissions
const dataViewLevel = {
  admin: ["admin", "host", "listener", "participant"],
  host: ["host", "listener", "participant"],
  listener: ["listener", "participant"],
  participant: ["participant"],
};

const getPermissionControls = async ({ sessionId, role }) => {
  try {
    console.log({ sessionId, role });
    // Fetch permissions for the given session
    const permission = await Permission.findOne({ sessionId });
    console.log({ permission });

    if (!permission) {
      throw new Error("Permissions not found for the session");
    }

    // Get allowed roles for the given user role
    const userDataViewLevel = dataViewLevel[role] || [];

    const {
      _id,
      groupDiscussionId,
      __v,
      sessionId: sessionIdFromPermission,
      ...rest
    } = permission.toObject();

    console.log({ permission, role });

    // Filter permissions based on allowed roles
    const filteredPermissions = Object.entries(rest).reduce(
      (acc, [key, value]) => {
        if (typeof value === "object" && value !== null) {
          acc[key] = Object.keys(value?.permission)
            .filter((permKey) => userDataViewLevel.includes(permKey))
            .reduce((subAcc, permKey) => {
              subAcc[permKey] = value?.permission[permKey];
              return subAcc;
            }, {});
        } else {
          acc[key] = value; // Keep non-object properties as they are
        }
        return acc;
      },
      {}
    );

    return filteredPermissions;
  } catch (err) {
    console.error("Error in getPermissionControls:", err.message);
    return null; // Ensure a safe fallback
  }
};

module.exports = {
  getPermissionControls,
};
