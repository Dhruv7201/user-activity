// authUtils.js
import jwtDecode from "jwt-decode";
import { useNavigate } from "react-router-dom";

const TOKEN_KEY = "token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("teamname");
  localStorage.removeItem("role");
  localStorage.removeItem("username");
};

export const isTokenValid = () => {
  const token = getToken();
  if (!token) {
    return false;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return false;
  }
};

export const getUsernameFromToken = () => {
  const token = getToken();
  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode(token);
    return decoded.sub; // Assuming 'sub' is the key containing the username
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const logout = () => {
  removeToken();
};

export const checkValidToken = () => {
  const tokenValid = isTokenValid();
  const navigate = useNavigate();

  if (!tokenValid) {
    console.log("Token is not valid. Redirect to login.");
    removeToken();
    return false;
  }
  return true;
};
