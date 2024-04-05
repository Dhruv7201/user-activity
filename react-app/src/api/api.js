// api.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;
const header = localStorage.getItem("teamname");

const api = axios.create({
  baseURL,
});

export const get = (url, config = {}) => {
  return api.get(url, {
    ...config,
    headers: {
      ...config.headers,
      teamname: header,
    },
  });
};

export const post = (url, data, config = {}) => {
  return api.post(url, data, {
    ...config,
    headers: {
      ...config.headers,
      teamname: header,
    },
  });
};

export const put = (url, data, config = {}) => {
  return api.put(url, data, {
    ...config,
    headers: {
      ...config.headers,
      teamname: header,
    },
  });
};

export const del = (url, config = {}) => {
  return api.delete(url, {
    ...config,
    headers: {
      ...config.headers,
      teamname: header,
    },
  });
};
