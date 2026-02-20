import React from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "../../components/layout/PublicLayout";

const Home = () => {
  const navigate = useNavigate();

  return (
    <PublicLayout>
      <section className="relative overflow-hidden px-4 py-16 md:px-12 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#e2e8f0,_#f8fafc_60%)]" />
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 bg-white/70 border border-slate-200 rounded-full px-4 py-2 text-sm font-semibold text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Nền tảng CDSS thế hệ mới cho y học gia đình
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight">
              Chăm sóc <span className="text-emerald-600">liên tục</span> cho
              từng gia đình
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
              Từ sàng lọc cộng đồng đến theo dõi ca bệnh, FamilyMed kết hợp
              dữ liệu, quy trình và guideline để bác sĩ ra quyết định nhanh,
              chính xác, có thể kiểm chứng.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/risk-tools")}
                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
              >
                Trải nghiệm công cụ
              </button>
              <button
                onClick={() => navigate("/guideline")}
                className="px-8 py-4 border-2 border-slate-200 text-slate-700 rounded-2xl font-bold text-lg hover:bg-white transition-all"
              >
                Xem guideline
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              {[
                { label: "Điểm khám", value: "120+" },
                { label: "Bác sĩ", value: "560+" },
                { label: "Chỉ số", value: "2.4M" },
                { label: "Hồ sơ", value: "180K" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/80 rounded-2xl border border-slate-100 p-4"
                >
                  <p className="text-2xl font-extrabold text-slate-900">
                    {stat.value}
                  </p>
                  <p className="text-xs uppercase tracking-widest text-slate-400">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 bg-emerald-500/10 rounded-[3rem] blur-3xl" />
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-6 relative">
              <img
                src="https://picsum.photos/seed/doctor/900/700"
                alt="Doctor"
                className="rounded-[2rem] w-full h-[420px] object-cover"
              />
              <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur rounded-2xl border border-slate-100 p-5">
                <p className="text-sm text-slate-500">CDSS Spotlight</p>
                <p className="text-lg font-bold text-slate-900">
                  Tự động phân tầng nguy cơ và gợi ý kế hoạch chăm sóc cá nhân.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 md:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400 mb-4">
              Giá trị cốt lõi
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Hệ sinh thái lâm sàng thống nhất, chuẩn hóa và dễ mở rộng.
            </h2>
            <p className="text-slate-600">
              Chuẩn hóa quy trình đánh giá, hiển thị dữ liệu theo ngữ cảnh và
              đồng bộ guideline mới nhất để bác sĩ tập trung vào bệnh nhân.
            </p>
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Tổng quan 360°",
                desc: "Theo dõi hồ sơ, lịch sử và can thiệp từ một màn hình.",
                icon: "🧭",
              },
              {
                title: "Chuẩn hóa guideline",
                desc: "Tự động cập nhật phác đồ theo bộ tiêu chí nội bộ.",
                icon: "📚",
              },
              {
                title: "Cảnh báo sớm",
                desc: "Phát hiện biến cố và dấu hiệu nguy cơ theo ngưỡng.",
                icon: "🚨",
              },
              {
                title: "Báo cáo thông minh",
                desc: "Hợp nhất dữ liệu định lượng, so sánh nhóm nguy cơ.",
                icon: "📈",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400 mb-4">
                Lộ trình triển khai
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900">
                Sẵn sàng triển khai tại phòng khám, bệnh viện và mạng lưới y tế.
              </h2>
            </div>
            <button
              onClick={() => navigate("/about")}
              className="px-6 py-3 bg-emerald-600 text-white rounded-full font-bold shadow-lg shadow-emerald-200"
            >
              Tìm hiểu thêm
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Chuẩn hóa dữ liệu",
                desc: "Mapping biểu mẫu, chuẩn hóa biến số và danh mục ICD.",
              },
              {
                step: "02",
                title: "Đồng bộ guideline",
                desc: "Thiết lập cây quyết định và ngưỡng cảnh báo.",
              },
              {
                step: "03",
                title: "Đào tạo đội ngũ",
                desc: "Hướng dẫn sử dụng, đánh giá hiệu suất và cải tiến.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="border border-slate-100 rounded-3xl p-6 bg-slate-50"
              >
                <p className="text-sm font-bold text-emerald-600">{item.step}</p>
                <h3 className="text-xl font-bold text-slate-900 mt-2">
                  {item.title}
                </h3>
                <p className="text-slate-600 mt-3">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 md:px-12">
        <div className="max-w-6xl mx-auto bg-slate-900 text-white rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-52 w-52 bg-emerald-400/30 rounded-full blur-3xl" />
          <div className="absolute left-0 bottom-0 h-52 w-52 bg-amber-400/20 rounded-full blur-3xl" />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Bắt đầu với một quy trình chuẩn hóa toàn hệ thống.
              </h2>
              <p className="text-slate-200">
                Khám phá bộ công cụ sàng lọc nguy cơ cộng đồng, guideline và
                kịch bản chăm sóc để đưa CDSS vào thực tế.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
              <button
                onClick={() => navigate("/risk-tools")}
                className="px-6 py-3 bg-white text-slate-900 rounded-full font-bold"
              >
                Công cụ cộng đồng
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-3 bg-emerald-500 text-white rounded-full font-bold"
              >
                Đăng nhập bác sĩ
              </button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Home;
