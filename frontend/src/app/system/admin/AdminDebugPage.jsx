import React, { useEffect, useState } from "react";
import api from "../../../service/api";

const AdminDebugPage = () => {
  const [authInfo, setAuthInfo] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Lấy thông tin auth từ localStorage
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    if (token && user) {
      try {
        // Decode JWT (phần payload)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const tokenData = JSON.parse(jsonPayload);
        const userData = JSON.parse(user);
        
        setAuthInfo({
          token: token.substring(0, 50) + "...",
          tokenData,
          userData,
          baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
        });
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const testEndpoint = async (name, method, url) => {
    setLoading(true);
    try {
      let response;
      if (method === "GET") {
        response = await api.get(url);
      } else if (method === "POST") {
        response = await api.post(url, {});
      } else if (method === "DELETE") {
        response = await api.delete(url);
      }
      
      setTestResults((prev) => ({
        ...prev,
        [name]: {
          status: response.status,
          success: true,
          message: "Success"
        }
      }));
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        [name]: {
          status: error.response?.status || "Network Error",
          success: false,
          message: error.response?.data?.message || error.message
        }
      }));
    }
    setLoading(false);
  };

  const testAllEndpoints = async () => {
    // Test các endpoints quan trọng
    await testEndpoint("Get All Forms", "GET", "/api/forms/admin/all");
    await testEndpoint("Get Patients", "GET", "/api/patients/doctor/list");
  };

  return (
    <div className="space-y-6 p-6">
      <header className="rounded-3xl bg-gradient-to-r from-sky-50 via-white to-slate-50 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Admin Debug Console</h1>
        <p className="text-sm text-slate-500">Kiểm tra phân quyền và authorization</p>
      </header>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Authentication Info</h2>
        {authInfo ? (
          <div className="space-y-2 font-mono text-sm">
            <div>
              <span className="font-semibold text-slate-700">API Base URL:</span>{" "}
              <span className="text-sky-600">{authInfo.baseURL}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">User ID:</span>{" "}
              <span className="text-slate-600">{authInfo.userData?.id || authInfo.tokenData?.userId}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Email:</span>{" "}
              <span className="text-slate-600">{authInfo.userData?.email || authInfo.tokenData?.sub}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Role:</span>{" "}
              <span className="text-sky-600 font-bold">
                {authInfo.userData?.role || authInfo.tokenData?.role}
              </span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Token:</span>{" "}
              <span className="text-slate-400">{authInfo.token}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Token Expires:</span>{" "}
              <span className="text-slate-600">
                {authInfo.tokenData?.exp
                  ? new Date(authInfo.tokenData.exp * 1000).toLocaleString()
                  : "N/A"}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-rose-600">Không tìm thấy thông tin đăng nhập</p>
        )}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">API Endpoint Tests</h2>
          <button
            onClick={testAllEndpoints}
            disabled={loading}
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-50"
          >
            {loading ? "Testing..." : "Test All"}
          </button>
        </div>

        <div className="space-y-2">
          {Object.entries(testResults).map(([name, result]) => (
            <div
              key={name}
              className={`rounded-lg border p-3 ${
                result.success
                  ? "border-green-200 bg-green-50"
                  : "border-rose-200 bg-rose-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">{name}</span>
                <span
                  className={`rounded px-2 py-1 text-xs font-bold ${
                    result.success
                      ? "bg-green-600 text-white"
                      : "bg-rose-600 text-white"
                  }`}
                >
                  {result.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{result.message}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          <h3 className="font-semibold text-slate-700">Manual Tests:</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              onClick={() => testEndpoint("List Forms", "GET", "/api/forms/admin/all")}
              disabled={loading}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              GET /api/forms/admin/all
            </button>
            <button
              onClick={() => testEndpoint("List Patients", "GET", "/api/patients/doctor/list")}
              disabled={loading}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              GET /api/patients/doctor/list
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h3 className="mb-2 font-semibold text-amber-900">Hướng dẫn Debug</h3>
        <ul className="list-inside list-disc space-y-1 text-sm text-amber-800">
          <li>Kiểm tra Role phải là <strong>ADMIN</strong> (không phải ROLE_ADMIN)</li>
          <li>API Base URL phải là <strong>http://localhost:8080</strong></li>
          <li>Token phải còn hạn (kiểm tra Token Expires)</li>
          <li>Status 403 = Forbidden (không có quyền)</li>
          <li>Status 401 = Unauthorized (token hết hạn hoặc không hợp lệ)</li>
          <li>Status 404 = Endpoint không tồn tại</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDebugPage;
