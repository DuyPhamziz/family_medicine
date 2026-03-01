import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import PublicLayout from "../../components/layout/PublicLayout";
import { publicFormApi } from "../../api/formsApi";
import { queryKeys } from "../../lib/queryKeys";

const Home = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const { data: publicForms = [], isLoading } = useQuery({
    queryKey: queryKeys.publicForms.lists(),
    queryFn: publicFormApi.getPublicForms,
  });

  const categories = useMemo(() => {
    const all = [...new Set(publicForms.map((form) => form.category).filter(Boolean))];
    return ["all", ...all];
  }, [publicForms]);

  const filteredForms = useMemo(() => {
    const query = search.trim().toLowerCase();
    return publicForms.filter((form) => {
      const categoryMatch = category === "all" || form.category === category;
      if (!query) {
        return categoryMatch;
      }
      const inTitle = form.title?.toLowerCase().includes(query);
      const inDescription = form.description?.toLowerCase().includes(query);
      return categoryMatch && (inTitle || inDescription);
    });
  }, [publicForms, search, category]);

  return (
    <PublicLayout>
      <section className="px-4 md:px-10 py-10 bg-emerald-50/50 dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-8 md:p-12">
            <p className="uppercase tracking-[0.24em] text-emerald-100 text-xs">Health Tools & Clinical Screening</p>
            <h1 className="text-3xl md:text-5xl font-bold mt-3">Công cụ sức khỏe & sàng lọc lâm sàng</h1>
            <p className="mt-4 text-emerald-50 max-w-2xl">Khám phá các biểu mẫu cộng đồng và công cụ tính nguy cơ dành cho người Việt.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/risk-tools")}
                className="px-5 py-3 rounded-xl bg-white text-emerald-700 font-semibold hover:bg-emerald-50 transition-colors"
              >
                Mở công cụ tính nguy cơ
              </button>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="px-5 py-3 rounded-xl border border-emerald-100 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                Đăng nhập bác sĩ
              </button>
            </div>
          </div>

          <div className="mt-8 mb-5 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm biểu mẫu theo tên hoặc mô tả"
              className="w-full rounded-xl border border-emerald-200 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`px-4 py-2 rounded-full text-sm border transition-all ${
                  category === item
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "bg-white dark:bg-slate-900 border-emerald-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-400"
                }`}
              >
                {item === "all" ? "Tất cả danh mục" : item}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[...Array(6)].map((_, index) => (
                <div key={`home-skeleton-${index + 1}`} className="rounded-2xl border border-emerald-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 animate-pulse">
                  <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="mt-3 h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="mt-2 h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="mt-6 h-8 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          ) : filteredForms.length === 0 ? (
            <div className="rounded-2xl border border-emerald-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-slate-500 dark:text-slate-400">
              Không có biểu mẫu phù hợp với từ khóa.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredForms.map((form) => (
                <button
                  key={form.publicToken}
                  type="button"
                  onClick={() => navigate(`/form/${form.publicToken}`)}
                  className="text-left rounded-2xl border border-emerald-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className="inline-flex h-10 w-10 rounded-xl items-center justify-center text-white text-lg"
                      style={{ backgroundColor: form.iconColor || "#16a34a" }}
                    >
                      🩺
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-slate-300">
                      {form.category || "Tổng quát"}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">{form.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 min-h-12">{form.description || "Chưa có mô tả."}</p>

                  <div className="mt-5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>~ {form.estimatedTime || 10} phút</span>
                    <span>v{form.version || 1}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
};

export default Home;
