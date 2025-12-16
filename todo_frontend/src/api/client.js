//
// API client for the To Do frontend.
//
/* eslint-disable no-undef */

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /**
   * Determine the API base URL based on environment variables.
   * Priority:
   * - REACT_APP_API_BASE
   * - REACT_APP_BACKEND_URL
   * - If running in same origin, default to empty (relative)
   * - Fallback to http://localhost:4000
   */
  const envBase =
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    "";

  if (envBase) return envBase.replace(/\/+$/, "");

  try {
    // If frontend and backend are served from same domain with path /api
    const sameOriginApi = "/api";
    return sameOriginApi;
  } catch (e) {
    // Fallback for non-browser envs
  }
  return "http://localhost:4000";
}

// PUBLIC_INTERFACE
export async function apiRequest(path, options = {}) {
  /**
   * Generic JSON fetch wrapper.
   * - Adds JSON headers
   * - Parses JSON responses
   * - Throws on HTTP errors with structured error
   */
  const base = getApiBaseUrl();
  const url =
    (base.startsWith("http") ? base : "").concat(
      base.startsWith("http") ? path : `${base}${path}`
    );

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  let data = null;
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  if (isJson) {
    try {
      data = await response.json();
    } catch (e) {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const err = new Error(
      (data && data.message) || `Request failed with status ${response.status}`
    );
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}
