"use client";
import axios from "axios";

// PROJECT IMPORTS
//import { baseUrl } from "@/API/baseURL";
import { Danger } from "./services/toasterService";
import { RemoveCookiesData } from "@/components/helperFunctions";

// THIRD-PARTY IMPORT
import Cookies from "js-cookie";

export const apiInstance = axios.create({
  baseURL: process.env.BASE_URL
});

apiInstance.interceptors.request.use(
  function (config) {
    const user = JSON.parse(Cookies.get("user_agent") || "{}");
    config.headers.Authorization =
      user && user.access_token ? `Bearer ${user.access_token}` : "";
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Add a response interceptor
apiInstance.interceptors.response.use(
  function (response) {
    return response.data;
  },
  function (error) {
    if (typeof error.response.data.message === "string") {
      if (
        error.response.data.message === "Unauthorized" &&
        error.response.data.statusCode === 401
      ) {
        RemoveCookiesData();
        window.location.reload();
      } else {
        Danger(error.response.data.message);
      }
    } else {
      for (let i = 0; i < error?.response?.data?.message?.length; i++) {
        Danger(error.response.data.message[i]);
      }
    }
    return Promise.reject(error);
  }
);
