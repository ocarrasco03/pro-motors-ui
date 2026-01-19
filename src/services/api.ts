import axios from "axios";
import { setupInterceptors } from "./interseptors";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  // withCredentials: true,
  timeout: 10000,
});

setupInterceptors(api);
