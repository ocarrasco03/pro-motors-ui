import { type AxiosInstance } from "axios";

export function setupInterceptors(api: AxiosInstance): void {
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("access_token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        if (error.response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("persist:root");
        }
      }

      return Promise.reject(error);
    },
  );
}
