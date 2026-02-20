import React, { useEffect, useMemo, useState } from "react";
import api from "../../../service/api";

const fallbackGuidelines = [
  {
    id: "GL-001",
    title: "Hướng dẫn tăng huyết áp giai đoạn 1",
    category: "Tim mạch",
    updatedAt: "2025-11-12",
    status: "Đang áp dụng",
    owner: "Hội đồng chuyên môn",
  },
  {
    id: "GL-002",
    title: "Sàng lọc đái tháo đường type 2",
    category: "Nội tiết",
    updatedAt: "2025-10-03",
    status: "Đang áp dụng",
    owner: "Khoa Nội",
  },
  {
    id: "GL-003",
    title: "Phác đồ theo dõi hen và COPD",
    category: "Hô hấp",
    updatedAt: "2025-08-27",
    status: "Cần cập nhật",
    owner: "Khoa Hô hấp",
  },
];

const Guidelines = () => {
  const [guidelines, setGuidelines] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadGuidelines = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/api/guidelines");
        setGuidelines(response.data || []);
      } catch (err) {
        console.error("Guidelines API error:", err);
        setGuidelines(fallbackGuidelines);
        setError("Đang sử dụng dữ liệu mẫu do chưa kết nối API.");
      } finally {
        setLoading(false);
      }
    };

    loadGuidelines();
  }, []);

  const filteredGuidelines = useMemo(() => {
    if (!query) return guidelines;
    const lower = query.toLowerCase();
    return guidelines.filter((item) =>
      [item.title, item.category, item.id].some((value) =>
        String(value).toLowerCase().includes(lower)
      )
    );
  }, [guidelines, query]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Hướng dẫn</h1>
          <p className="text-slate-500 mt-2">
            Quản lý guideline và phác đồ lâm sàng cho hệ thống CDSS.
          </p>
        </div>
        <div className="flex gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm guideline..."
            className="px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl font-bold">
            Thêm guideline
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 px-6 py-3 text-xs uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100">
          <div className="col-span-4">Tiêu đề</div>
          <div className="col-span-2">Danh mục</div>
          <div className="col-span-2">Cập nhật</div>
          <div className="col-span-2">Trạng thái</div>
          <div className="col-span-2">Phụ trách</div>
        </div>
        {filteredGuidelines.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            Chưa có guideline phù hợp.
          </div>
        ) : (
          filteredGuidelines.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-12 px-6 py-4 border-b border-slate-50 text-sm text-slate-700"
            >
              <div className="col-span-4 font-semibold text-slate-900">
                {item.title}
              </div>
              <div className="col-span-2">{item.category}</div>
              <div className="col-span-2">
                {new Date(item.updatedAt).toLocaleDateString("vi-VN")}
              </div>
              <div className="col-span-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.status === "Đang áp dụng"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <div className="col-span-2 text-slate-500">{item.owner}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Guidelines;
