import React from "react";
import PublicLayout from "../../components/layout/PublicLayout";

const Home = () => {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="px-4 py-16 md:px-12 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight">
            Chăm sóc <span className="text-teal-600">toàn diện</span> cho gia
            đình Việt
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
            Hệ thống quản lý Y học gia đình hiện đại, hỗ trợ theo dõi sức khỏe
            liên tục và ra quyết định lâm sàng thông minh (CDSS).
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="px-8 py-4 bg-teal-600 text-white rounded-2xl font-bold text-lg hover:bg-teal-700 transition-all shadow-xl shadow-teal-100">
              Khám phá ngay
            </button>
            <button className="px-8 py-4 border-2 border-slate-200 text-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all">
              Tài liệu chuyên môn
            </button>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-4 bg-teal-500/10 rounded-[3rem] blur-3xl group-hover:bg-teal-500/20 transition-all duration-700"></div>
          <img
            src="https://picsum.photos/seed/doctor/800/600"
            alt="Doctor"
            className="rounded-[2.5rem] shadow-2xl relative z-10 border-8 border-white group-hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
      </section>

      {/* Public Risk Calculator Tools */}
      <section className="bg-slate-50 px-4 py-20 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Công cụ sức khỏe cộng đồng
          </h2>
          <p className="text-slate-600">
            Tự kiểm tra các chỉ số sức khỏe cơ bản và nhận khuyến cáo từ đội ngũ
            y tế chuyên sâu.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              title: "Tính chỉ số BMI",
              icon: "📊",
              desc: "Kiểm tra tình trạng dinh dưỡng cơ thể.",
            },
            {
              title: "Nguy cơ Tim mạch",
              icon: "❤️",
              desc: "Đánh giá nguy cơ biến cố tim mạch trong 10 năm.",
            },
            {
              title: "Tầm soát Tiểu đường",
              icon: "🩺",
              desc: "Công cụ sàng lọc tiền đái tháo đường.",
            },
          ].map((tool, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group"
            >
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform">
                {tool.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {tool.title}
              </h3>
              <p className="text-slate-500 mb-6">{tool.desc}</p>
              <button className="text-teal-600 font-bold hover:underline">
                Sử dụng ngay →
              </button>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
};

export default Home;
