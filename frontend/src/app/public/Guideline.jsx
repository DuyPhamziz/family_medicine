import React from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "../../components/layout/PublicLayout";

const Guideline = () => {
  const navigate = useNavigate();

  const guidelineGroups = [
    {
      title: "Tim mạch và chuyển hóa",
      items: [
        "Chẩn đoán tăng huyết áp theo phân tầng nguy cơ",
        "Quản lý nguy cơ tim mạch 10 năm",
        "Hướng dẫn hỗ trợ bệnh nhân đái tháo đường",
      ],
    },
    {
      title: "Hô hấp và cơ xương khớp",
      items: [
        "Đánh giá hen và COPD tại tuyến cơ sở",
        "Hướng dẫn quản lý viêm khớp dạng thấp",
        "Theo dõi hô hấp theo thang điểm CAT",
      ],
    },
    {
      title: "Tâm lý và sức khỏe cộng đồng",
      items: [
        "Sàng lọc trầm cảm và rối loạn lo âu",
        "Đánh giá chất lượng giấc ngủ",
        "Chỉ số nguy cơ cho bệnh nhân hậu Covid",
      ],
    },
  ];

  return (
    <PublicLayout>
      <section className="px-4 py-16 md:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400 mb-4">
              Guideline
            </p>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold text-slate-900 mb-6">
              Bộ guideline chuẩn hóa cho bác sĩ Y học gia đình.
            </h1>
            <p className="text-lg text-slate-600">
              Cập nhật các phác đồ tham chiếu, quy trình sàng lọc và kế hoạch
              theo dõi cần thiết để ra quyết định nhanh và nhất quán.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-3 bg-slate-900 text-white rounded-full font-bold"
              >
                Đăng nhập để truy cập đầy đủ
              </button>
              <button
                onClick={() => navigate("/about")}
                className="px-6 py-3 border border-slate-200 rounded-full font-bold text-slate-700"
              >
                Về chúng tôi
              </button>
            </div>
          </div>
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-6">
            <img
              src="https://picsum.photos/seed/guideline/900/700"
              alt="Guideline"
              className="rounded-[2rem] w-full h-[380px] object-cover"
            />
          </div>
        </div>
      </section>

      <section className="px-4 py-20 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {guidelineGroups.map((group) => (
              <div
                key={group.title}
                className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm"
              >
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  {group.title}
                </h3>
                <ul className="space-y-3 text-slate-600 text-sm">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-900 text-white px-4 py-20 md:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Tích hợp guideline vào quy trình khám.
            </h2>
            <p className="text-slate-200">
              Cá nhân hóa theo phòng khám, thống nhất ngưỡng cảnh báo và theo dõi
              tiến trình theo nhóm nguy cơ.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 bg-emerald-500 text-white rounded-full font-bold"
            >
              Đăng nhập hệ thống
            </button>
            <button
              onClick={() => navigate("/risk-tools")}
              className="px-6 py-3 bg-white text-slate-900 rounded-full font-bold"
            >
              Công cụ cộng đồng
            </button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Guideline;
