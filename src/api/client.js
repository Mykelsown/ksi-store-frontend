import axios from "axios";

const DEFAULT_HOSTED_BASE_URL = "https://ksi-gadgets-backend.onrender.com/api";
const DEFAULT_LOCAL_BASE_URL = "http://localhost:5000/api";

const PRIMARY_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? DEFAULT_LOCAL_BASE_URL : DEFAULT_HOSTED_BASE_URL);
const FALLBACK_BASE_URL =
  import.meta.env.VITE_API_FALLBACK_BASE_URL ||
  (import.meta.env.DEV ? DEFAULT_HOSTED_BASE_URL : DEFAULT_LOCAL_BASE_URL);

let activeBaseUrl = PRIMARY_BASE_URL;

const api = axios.create({
  baseURL: activeBaseUrl,
  timeout: 30000,
});

const shouldUseFallback = (error, originalRequest) => {
  const status = error.response?.status;
  const retryableStatus = status === 502 || status === 503 || status === 504;
  const networkFailure = !error.response;

  return (
    activeBaseUrl === PRIMARY_BASE_URL &&
    originalRequest &&
    !originalRequest._fallbackRetried &&
    (networkFailure || retryableStatus)
  );
};

const switchToFallbackBaseUrl = () => {
  if (activeBaseUrl === FALLBACK_BASE_URL) {
    return;
  }

  activeBaseUrl = FALLBACK_BASE_URL;
  api.defaults.baseURL = FALLBACK_BASE_URL;
  console.warn(
    `Primary backend unreachable. Switched API base URL to fallback: ${FALLBACK_BASE_URL}`,
  );
};

const logResponse = (response) => {
  console.log("API RESPONSE:", {
    method: response.config?.method?.toUpperCase(),
    url: response.config?.url,
    status: response.status,
    data: response.data,
  });
};

const logErrorResponse = (error) => {
  const isWishlist404 =
    error.response?.status === 404 &&
    String(error.config?.url || "").includes("/wishlist");

  if (isWishlist404) {
    console.warn(
      "Wishlist endpoint is unavailable on current backend deployment; using compatibility mode.",
    );
    return;
  }

  if (error.response) {
    console.error("API ERROR RESPONSE:", {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response.status,
      data: error.response.data,
    });
  }
};

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor for automatic token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    logResponse(response);
    return response;
  },
  async (error) => {
    logErrorResponse(error);
    const originalRequest = error.config;

    if (shouldUseFallback(error, originalRequest)) {
      switchToFallbackBaseUrl();
      originalRequest._fallbackRetried = true;
      return api(originalRequest);
    }

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = sessionStorage.getItem("refreshToken");

        if (!refreshToken) {
          // No refresh token, redirect to login
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("refreshToken");
          sessionStorage.removeItem("user");
          window.location.href = "/account";
          return Promise.reject(error);
        }

        // Try to refresh the token
        const response = await axios.post(`${activeBaseUrl}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data;

        // Save new tokens
        sessionStorage.setItem("token", accessToken);
        if (newRefreshToken) {
          sessionStorage.setItem("refreshToken", newRefreshToken);
        }

        // Update authorization header
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Process queued requests
        processQueue(null, accessToken);

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth data and redirect
        processQueue(refreshError, null);
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("refreshToken");
        sessionStorage.removeItem("user");
        window.location.href = "/account";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For 403 Forbidden errors
    if (error.response?.status === 403) {
      console.error("Access forbidden - insufficient permissions");
    }

    return Promise.reject(error);
  },
);

export default api;
