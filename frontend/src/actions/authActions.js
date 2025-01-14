import axios from "axios";

export const setUser = (user) => {
  return {
    type: "SET_USER",
    payload: user, // Set user data in the store
  };
};
export const logout = () => {
  return (dispatch) => {
    // Remove user data from Redux store
    dispatch({
      type: "LOGOUT",
    });

    // Clear access token from sessionStorage
    sessionStorage.removeItem("access_token");
  };
};

export const login = (email, password) => async (dispatch) => {
  try {
    const response = await axios.post("https://localhost:443/login", {
      email,
      password,
    });

    dispatch({
      type: "LOGIN_SUCCESS",
      payload: response.data,
    });

    // Return the response data to be used in the component
    return response.data;
  } catch (error) {
    // Dispatch failure action with error message
    if (error.response) {
      dispatch({
        type: "LOGIN_FAILURE",
        payload: error.response.data.message, // Use the error message from the API
      });
    } else {
      dispatch({
        type: "LOGIN_FAILURE",
        payload: "Login failed. Please try again.",
      });
    }
    throw error; // Rethrow to be caught in the component
  }
};

// New action for OTP verification
export const verifyOtp = (email, otp) => async (dispatch) => {
  try {
    // Send OTP verification request to the backend
    const response = await axios.post("https://localhost:443/verify-otp", {
      email,
      otp,
    });

    // On successful OTP verification, store the token and user data
    sessionStorage.setItem("access_token", response.data.access_token);
    sessionStorage.setItem("user", JSON.stringify(response.data));
    
    dispatch({
      type: "LOGIN_SUCCESS",
      payload: response.data,
    });

    // Return the response data to be used in the component
    return response.data;
  } catch (error) {
    // Dispatch failure action with error message
    if (error.response) {
      dispatch({
        type: "VERIFY_OTP_FAILURE",
        payload: error.response.data.message,
      });
    } else {
      dispatch({
        type: "VERIFY_OTP_FAILURE",
        payload: "OTP verification failed. Please try again.",
      });
    }
    throw error; // Rethrow to be caught in the component
  }
};

export const register =
  (username, email, password, history) => async (dispatch) => {
    try {
      const response = await axios.post("https://localhost:443/register", {
        username,
        email,
        password,
      });
      dispatch({
        type: "REGISTER_SUCCESS",
        payload: response.data,
      });
      history.push("/login");
    } catch (error) {
      dispatch({
        type: "REGISTER_FAILURE",
        payload: error.message,
      });
    }
  };
