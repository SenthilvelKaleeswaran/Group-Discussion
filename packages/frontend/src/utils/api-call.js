const apiCall = async ({ endpoint, method = "GET", body = null }) => {
    const token = localStorage.getItem("token"); // Optional, if token needs to be sent
  
    const headers = {
      "Content-Type": "application/json",
    };
  
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  
    const requestOptions = {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    };
  
    // Ensure the API URL is formed correctly
    const apiUrl = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_PORT}/api${endpoint}`;
  
    console.log({
      aaa: apiUrl, // Check the final URL being generated
    });
  
    try {
      const response = await fetch(apiUrl, requestOptions);
  
      const data = await response.json();
      console.log({data})
  
      if (!response.ok) {
        throw new Error(data.message || data.msg || "Something went wrong");
      }
  
      return data;
    } catch (error) {
      console.error("API call error:", error);
      throw error;
    }
  };
  
  export const registerUser = async (data) => {
    return await apiCall({
      endpoint: "/auth/register",
      method: "POST",
      body: data,
    });
  };
  
  export const loginUser = async (data) => {
    return await apiCall({
      endpoint: "/auth/login",
      method: "POST",
      body: data,
    });
  };
  