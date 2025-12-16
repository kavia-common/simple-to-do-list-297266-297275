//
// API client for the To Do frontend.
//
/* eslint-disable no-undef */

 // PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /**
   * Determine the API base URL based on environment variables.
   * Priority:
   * 1) REACT_APP_API_BASE
   * 2) REACT_APP_BACKEND_URL + '/api'
   * 3) 'http://localhost:4000/api'
   */
  const apiBase = (process.env.REACT_APP_API_BASE || "").trim();
  if (apiBase) {
    return apiBase.replace(/\/+$/, "");
  }

  const backendUrl = (process.env.REACT_APP_BACKEND_URL || "").trim();
  if (backendUrl) {
    const normalized = backendUrl.replace(/\/+$/, "");
    return `${normalized}/api`;
  }

  // Final fallback for local dev
  return "http://localhost:4000/api";
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
  const url = base.replace(/\/+$/, "") + (path.startsWith("/") ? path : `/${path}`);

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
