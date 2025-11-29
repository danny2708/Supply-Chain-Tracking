// app/lib/apiClient.ts

// URL backend Django của bạn
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Hàm helper để tự động thêm header
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Hàm gọi API chung cho GET, DELETE
 */
const apiClient = {
  get: async (path: string) => {
    const response = await fetch(`${API_URL}${path}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  },

  post: async (path: string, data: any) => {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      // Cố gắng đọc lỗi từ server để hiển thị
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to create resource");
    }
    return response.json();
  },

  put: async (path: string, data: any) => {
    const response = await fetch(`${API_URL}${path}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to update resource");
    }
    return response.json();
  },

  patch: async (path: string, data: any) => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${API_URL}${path}`, {
      method: "PATCH", // Phương thức PATCH
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to update (PATCH)");
    }
    return res.json();
  },

  delete: async (path: string) => {
    const response = await fetch(`${API_URL}${path}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to delete resource");
    }
    // Lệnh DELETE thường trả về 204 No Content, không có body
    return { success: true };
  },

  /**
   * Hàm đặc biệt để upload file (FormData)
   */
  postWithFile: async (path: string, formData: FormData) => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_URL}${path}`, {
      // Chú ý: URL này không có /v1
      method: "POST",
      headers: {
        // KHÔNG set 'Content-Type' cho FormData, trình duyệt sẽ tự làm
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) throw new Error("File upload failed");
    return response.json();
  },
};

export default apiClient;
