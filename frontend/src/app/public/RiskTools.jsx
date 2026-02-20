import React, { useMemo, useState } from "react";
import PublicLayout from "../../components/layout/PublicLayout";

const RiskTools = () => {
  const [bmiData, setBmiData] = useState({ heightCm: "", weightKg: "" });
  const [whrData, setWhrData] = useState({ heightCm: "", waistCm: "" });
  const [bmrData, setBmrData] = useState({
    age: "",
    heightCm: "",
    weightKg: "",
    sex: "male",
  });

  const bmiResult = useMemo(() => {
    const heightM = Number(bmiData.heightCm) / 100;
    const weight = Number(bmiData.weightKg);
    if (!heightM || !weight) {
      return null;
    }
    const bmi = weight / (heightM * heightM);
    const rounded = Number(bmi.toFixed(1));
    let label = "Bình thường";
    if (rounded < 18.5) label = "Gầy";
    else if (rounded < 25) label = "Bình thường";
    else if (rounded < 30) label = "Thừa cân";
    else label = "Béo phì";

    return { value: rounded, label };
  }, [bmiData]);

  const whtrResult = useMemo(() => {
    const height = Number(whrData.heightCm);
    const waist = Number(whrData.waistCm);
    if (!height || !waist) {
      return null;
    }
    const ratio = waist / height;
    const rounded = Number(ratio.toFixed(2));
    let label = "Nguy cơ thấp";
    if (rounded >= 0.6) label = "Nguy cơ cao";
    else if (rounded >= 0.5) label = "Nguy cơ tăng";

    return { value: rounded, label };
  }, [whrData]);

  const bmrResult = useMemo(() => {
    const age = Number(bmrData.age);
    const height = Number(bmrData.heightCm);
    const weight = Number(bmrData.weightKg);
    if (!age || !height || !weight) {
      return null;
    }
    const base = 10 * weight + 6.25 * height - 5 * age;
    const bmr = bmrData.sex === "male" ? base + 5 : base - 161;
    return Math.round(bmr);
  }, [bmrData]);

  return (
    <PublicLayout>
      <section className="px-4 py-16 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400 mb-4">
                Công cụ cộng đồng
              </p>
              <h1 className="font-display text-4xl md:text-6xl font-extrabold text-slate-900 mb-6">
                Tự đánh giá chỉ số cơ bản và theo dõi nguy cơ sớm.
              </h1>
              <p className="text-lg text-slate-600">
                Các công cụ này chỉ mang tính tham khảo và không thay thế tư vấn
                y tế. Hãy liên hệ bác sĩ nếu cần đánh giá chuyên sâu.
              </p>
            </div>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-6">
              <img
                src="https://picsum.photos/seed/health/900/700"
                alt="Health tools"
                className="rounded-[2rem] w-full h-[380px] object-cover"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Chỉ số BMI
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-600">
                    Chiều cao (cm)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={bmiData.heightCm}
                    onChange={(e) =>
                      setBmiData((prev) => ({
                        ...prev,
                        heightCm: e.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="170"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600">
                    Cân nặng (kg)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={bmiData.weightKg}
                    onChange={(e) =>
                      setBmiData((prev) => ({
                        ...prev,
                        weightKg: e.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="60"
                  />
                </div>
              </div>
              <div className="mt-6 bg-slate-50 rounded-2xl p-4">
                {bmiResult ? (
                  <>
                    <p className="text-sm text-slate-500">BMI</p>
                    <p className="text-3xl font-extrabold text-slate-900">
                      {bmiResult.value}
                    </p>
                    <p className="text-sm font-semibold text-emerald-600">
                      {bmiResult.label}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">
                    Nhập đủ thông tin để xem kết quả.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Tỷ lệ vòng eo / chiều cao
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-600">
                    Chiều cao (cm)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={whrData.heightCm}
                    onChange={(e) =>
                      setWhrData((prev) => ({
                        ...prev,
                        heightCm: e.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="170"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600">
                    Vòng eo (cm)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={whrData.waistCm}
                    onChange={(e) =>
                      setWhrData((prev) => ({
                        ...prev,
                        waistCm: e.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="78"
                  />
                </div>
              </div>
              <div className="mt-6 bg-slate-50 rounded-2xl p-4">
                {whtrResult ? (
                  <>
                    <p className="text-sm text-slate-500">Tỷ lệ</p>
                    <p className="text-3xl font-extrabold text-slate-900">
                      {whtrResult.value}
                    </p>
                    <p className="text-sm font-semibold text-amber-600">
                      {whtrResult.label}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">
                    Nhập đủ thông tin để xem kết quả.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Nhu cầu năng lượng cơ bản (BMR)
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-slate-600">
                      Tuổi
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={bmrData.age}
                      onChange={(e) =>
                        setBmrData((prev) => ({
                          ...prev,
                          age: e.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="32"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-600">
                      Giới tính
                    </label>
                    <select
                      value={bmrData.sex}
                      onChange={(e) =>
                        setBmrData((prev) => ({
                          ...prev,
                          sex: e.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600">
                    Chiều cao (cm)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={bmrData.heightCm}
                    onChange={(e) =>
                      setBmrData((prev) => ({
                        ...prev,
                        heightCm: e.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="170"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600">
                    Cân nặng (kg)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={bmrData.weightKg}
                    onChange={(e) =>
                      setBmrData((prev) => ({
                        ...prev,
                        weightKg: e.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="60"
                  />
                </div>
              </div>
              <div className="mt-6 bg-slate-50 rounded-2xl p-4">
                {bmrResult ? (
                  <>
                    <p className="text-sm text-slate-500">BMR (kcal/ngày)</p>
                    <p className="text-3xl font-extrabold text-slate-900">
                      {bmrResult}
                    </p>
                    <p className="text-sm text-slate-500">
                      Giá trị ước tính theo công thức Mifflin-St Jeor.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">
                    Nhập đủ thông tin để xem kết quả.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 bg-white rounded-3xl border border-slate-100 p-6 text-sm text-slate-500">
            Lưu ý: Các chỉ số trên chỉ hỗ trợ tự đánh giá, không thay thế chẩn
            đoán y khoa. Vui lòng trao đổi với bác sĩ để có hướng dẫn chính xác.
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default RiskTools;
