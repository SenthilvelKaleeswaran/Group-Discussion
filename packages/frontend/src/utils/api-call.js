import axios from "axios";

const apiCall = async ({ endpoint, method = "GET", data = null }) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const requestOptions = {
    method,
    headers,
    data,
  };

  const apiUrl = `${import.meta.env.VITE_API_URL}${
    import.meta.env.VITE_API_PORT
  }/api${endpoint}`;

  try {
    const response = await axios(apiUrl, requestOptions);
    const data = response.data;
    console.log({ data });

    return data;
  } catch (error) {
    console.error("API call error:", error);
    throw error.response?.data || error.message || "Something went wrong"; // Extracting error details from the response
  }
};

export const registerUser = async (data) => {
  return await apiCall({
    endpoint: "/auth/register",
    method: "POST",
    data,
  });
};

export const loginUser = async (data) => {
  return await apiCall({
    endpoint: "/auth/login",
    method: "POST",
    data,
  });
};

export const createDiscussion = async (data) => {
  return await apiCall({
    endpoint: "/group-discussion/create",
    method: "POST",
    data,
  });
};

export const updateUser = async (data) => {
  return await apiCall({
    endpoint: `/user/update`,
    method: "POST",
    data,
  });
};

export const getUserDetails = async () => {
  return await apiCall({ endpoint: `/user/get` });
};

export const getGroupDiscussion = async (data) => {
  return await apiCall({
    endpoint: `/group-discussion/${data}`,
    method: "GET",
  });
};

export const generateConversation = async (data) => {
  return await apiCall({
    endpoint: `/generate/conversation`,
    method: "POST",
    data,
  });
};

export const generateFeedback = async (data) => {
  return await apiCall({
    endpoint: `/generate/feedback`,
    method: "POST",
    data,
  });
};
