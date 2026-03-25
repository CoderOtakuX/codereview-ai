export const API_BASE = import.meta.env.PROD ? "" : "http://localhost:8080";

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }
  
  return response.json();
};

export const api = {
  login: (data: any) => fetchWithAuth("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  register: (data: any) => fetchWithAuth("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  
  submitReview: async (code: string, language: string) => {
    return fetchWithAuth("/reviews", {
      method: "POST",
      body: JSON.stringify({ code, language }),
    });
  },

  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetchWithAuth("/reviews/upload", {
      method: "POST",
      body: formData, // FormData automatically overrides JSON constraints with multipart headers natively
    });
  },

  submitGithubPR: async (prUrl: string) => {
    return fetchWithAuth("/reviews/github", {
      method: "POST",
      body: JSON.stringify({ prUrl }),
    });
  },

  submitGithubRepo: async (repoUrl: string) => {
    return fetchWithAuth(`/reviews/github-repo/files?url=${encodeURIComponent(repoUrl)}`);
  },

  submitSelectedFiles: async (selectedFiles: Array<{ path: string; url: string }>) => {
    return fetchWithAuth("/reviews/github-repo", {
      method: "POST",
      body: JSON.stringify({ selectedFiles }),
    });
  },

  getReview: (id: string) => fetchWithAuth(`/reviews/${id}`),
  
  getReviewStatus: (id: string) => fetchWithAuth(`/reviews/${id}/status`),
  
  chatWithReview: async (reviewId: string, message: string) => {
    return fetchWithAuth(`/reviews/${reviewId}/chat`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  },
  // Download single issue fix
  downloadIssuePatch: async (reviewId: string, issueIndex: number) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/reviews/${reviewId}/patch/${issueIndex}`, {
      method: "GET",
      headers: { Authorization: token ? `Bearer ${token}` : "" }
    });
    
    if (!response.ok) throw new Error("Failed to download patch");
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `fix-line-${issueIndex}.patch`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
  
  // Download all fixes as one patch
  downloadAllPatches: async (reviewId: string, filename: string) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/reviews/${reviewId}/patch`, {
      method: "GET",
      headers: { Authorization: token ? `Bearer ${token}` : "" }
    });
    
    if (!response.ok) throw new Error("Failed to download patches");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}-fixes.patch`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
