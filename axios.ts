import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the access token to every API request.
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access_token");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// Refresh the access token when it expires.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest =
      error.config as RetryableRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url ?? "";

    // Login and refresh requests should not trigger another refresh.
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      requestUrl.includes("/login") ||
      requestUrl.includes("/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      window.location.replace("/login");

      return Promise.reject(error);
    }

    try {
      // Use the base Axios client so this refresh request
      // does not trigger the api interceptors again.
      const response = await axios.post<{ access_token: string }>(
        `${api.defaults.baseURL}/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        },
      );

      const newAccessToken = response.data.access_token;

      localStorage.setItem("access_token", newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError: unknown) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      window.location.replace("/login");

      return Promise.reject(refreshError);
    }
  },
);

export default api;