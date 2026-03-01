import { useMemo, useState } from "react";
import { Activity, Brain, HeartPulse, ShieldAlert, Stethoscope } from "lucide-react";
import PublicLayout from "../../components/layout/PublicLayout";
import { scoringApi } from "../../api/formsApi";
import CalculatorHeader from "../../components/calculator/CalculatorHeader";
import InputCard from "../../components/calculator/InputCard";
import ResultCard from "../../components/calculator/ResultCard";
import ReferencesSection from "../../components/calculator/ReferencesSection";

const FORMULAS = [
  {
    key: "CHA2DS2_VASC",
    title: "CHA2DS2-VASc",
    description: "Nguy cơ đột quỵ ở bệnh nhân rung nhĩ",
    icon: HeartPulse,
    category: "Tim mạch",
    fields: [
      { name: "age", label: "Tuổi", type: "number", min: 0, max: 120 },
      { name: "congestiveHeartFailure", label: "Suy tim sung huyết", type: "boolean" },
      { name: "hypertension", label: "Tăng huyết áp", type: "boolean" },
      { name: "diabetes", label: "Diabetes", type: "boolean" },
      { name: "vascularDisease", label: "Bệnh mạch máu", type: "boolean" },
      { name: "strokeTiaThromboembolism", label: "Tiền sử đột quỵ/TIA/thuyên tắc", type: "boolean" },
      { name: "femaleSex", label: "Giới nữ", type: "boolean" }
    ]
  },
  {
    key: "WELLS_PE",
    title: "Wells Criteria (PE)",
    description: "Ước tính xác suất thuyên tắc phổi",
    icon: Activity,
    category: "Hô hấp",
    fields: [
      { name: "clinicalSignsDvt", label: "Clinical signs of DVT", type: "boolean" },
      { name: "peMostLikely", label: "PE is most likely diagnosis", type: "boolean" },
      { name: "heartRateOver100", label: "Heart rate > 100", type: "boolean" },
      { name: "immobilizationOrSurgery", label: "Immobilization/recent surgery", type: "boolean" },
      { name: "previousDvtPe", label: "Previous DVT/PE", type: "boolean" },
      { name: "hemoptysis", label: "Hemoptysis", type: "boolean" },
      { name: "malignancy", label: "Malignancy", type: "boolean" }
    ]
  },
  {
    key: "WELLS_DVT",
    title: "Wells Criteria (DVT)",
    description: "Ước tính xác suất huyết khối tĩnh mạch sâu",
    icon: Stethoscope,
    category: "Mạch máu",
    fields: [
      { name: "activeCancer", label: "Active cancer", type: "boolean" },
      { name: "paralysisImmobilization", label: "Paralysis/immobilization", type: "boolean" },
      { name: "bedriddenRecentSurgery", label: "Bedridden or recent surgery", type: "boolean" },
      { name: "localizedTenderness", label: "Localized tenderness", type: "boolean" },
      { name: "entireLegSwollen", label: "Entire leg swollen", type: "boolean" },
      { name: "calfSwelling3cm", label: "Calf swelling > 3 cm", type: "boolean" },
      { name: "pittingEdema", label: "Pitting edema", type: "boolean" },
      { name: "collateralSuperficialVeins", label: "Collateral superficial veins", type: "boolean" },
      { name: "previousDvt", label: "Previous DVT", type: "boolean" },
      { name: "alternativeDiagnosisAsLikely", label: "Alternative diagnosis as likely", type: "boolean" }
    ]
  },
  {
    key: "TIMI",
    title: "TIMI Risk Score",
    description: "Phân tầng nguy cơ hội chứng vành cấp",
    icon: ShieldAlert,
    category: "Tim mạch",
    fields: [
      { name: "age65OrOlder", label: "Age ≥ 65", type: "boolean" },
      { name: "threeOrMoreCadRiskFactors", label: "≥3 CAD risk factors", type: "boolean" },
      { name: "knownCadStenosis50", label: "Known CAD stenosis ≥ 50%", type: "boolean" },
      { name: "aspirinUseLast7Days", label: "Aspirin use in last 7 days", type: "boolean" },
      { name: "severeAnginaRecent", label: "≥2 angina episodes in 24h", type: "boolean" },
      { name: "stDeviation", label: "ST deviation", type: "boolean" },
      { name: "positiveCardiacMarkers", label: "Positive cardiac markers", type: "boolean" }
    ]
  },
  {
    key: "HEART",
    title: "HEART Score",
    description: "Phân tầng nguy cơ đau ngực tại cấp cứu",
    icon: HeartPulse,
    category: "Cấp cứu",
    fields: [
      { name: "history", label: "History (0-2)", type: "number", min: 0, max: 2 },
      { name: "ecg", label: "ECG (0-2)", type: "number", min: 0, max: 2 },
      { name: "age", label: "Age score (0-2)", type: "number", min: 0, max: 2 },
      { name: "riskFactors", label: "Risk factors (0-2)", type: "number", min: 0, max: 2 },
      { name: "troponin", label: "Troponin (0-2)", type: "number", min: 0, max: 2 }
    ]
  },
  {
    key: "SIRS",
    title: "SIRS Criteria",
    description: "Đánh giá đáp ứng viêm hệ thống",
    icon: Activity,
    category: "Nhiễm trùng",
    fields: [
      { name: "temperatureAbnormal", label: "Temperature abnormal", type: "boolean" },
      { name: "heartRateOver90", label: "Heart rate > 90", type: "boolean" },
      { name: "respiratoryRateOver20OrPaCO2Below32", label: "RR > 20 or PaCO2 < 32", type: "boolean" },
      { name: "wbcAbnormal", label: "WBC abnormal", type: "boolean" }
    ]
  },
  {
    key: "SOFA",
    title: "SOFA Score",
    description: "Đánh giá mức độ suy cơ quan",
    icon: Brain,
    category: "Hồi sức",
    fields: [
      { name: "respiration", label: "Respiration (0-4)", type: "number", min: 0, max: 4 },
      { name: "coagulation", label: "Coagulation (0-4)", type: "number", min: 0, max: 4 },
      { name: "liver", label: "Liver (0-4)", type: "number", min: 0, max: 4 },
      { name: "cardiovascular", label: "Cardiovascular (0-4)", type: "number", min: 0, max: 4 },
      { name: "cns", label: "CNS (0-4)", type: "number", min: 0, max: 4 },
      { name: "renal", label: "Renal (0-4)", type: "number", min: 0, max: 4 }
    ]
  },
  {
    key: "QSOFA",
    title: "qSOFA",
    description: "Thang điểm nhiễm trùng nhanh tại giường",
    icon: ShieldAlert,
    category: "Nhiễm trùng",
    fields: [
      { name: "alteredMentation", label: "Altered mentation", type: "boolean" },
      { name: "respiratoryRate22OrMore", label: "Respiratory rate ≥ 22", type: "boolean" },
      { name: "systolicBp100OrLess", label: "Systolic BP ≤ 100", type: "boolean" }
    ]
  },
  {
    key: "NIHSS",
    title: "NIH Stroke Scale",
    description: "Đánh giá mức độ thiếu hụt thần kinh do đột quỵ",
    icon: Brain,
    category: "Thần kinh",
    fields: [
      { name: "loc", label: "LOC score", type: "number", min: 0, max: 3 },
      { name: "bestGaze", label: "Best gaze", type: "number", min: 0, max: 2 },
      { name: "visual", label: "Visual fields", type: "number", min: 0, max: 3 },
      { name: "facialPalsy", label: "Facial palsy", type: "number", min: 0, max: 3 },
      { name: "motorArmLeft", label: "Motor arm left", type: "number", min: 0, max: 4 },
      { name: "motorArmRight", label: "Motor arm right", type: "number", min: 0, max: 4 }
    ]
  },
  {
    key: "CURB65",
    title: "CURB-65",
    description: "Đánh giá mức độ nặng viêm phổi",
    icon: Stethoscope,
    category: "Hô hấp",
    fields: [
      { name: "confusion", label: "Confusion", type: "boolean" },
      { name: "ureaOver7", label: "Urea > 7 mmol/L", type: "boolean" },
      { name: "respiratoryRate30OrMore", label: "Respiratory rate ≥ 30", type: "boolean" },
      { name: "lowBloodPressure", label: "Low blood pressure", type: "boolean" },
      { name: "age65OrOlder", label: "Age ≥ 65", type: "boolean" }
    ]
  }
];

const defaultValuesFor = (formula) => {
  if (!formula) return {};
  return formula.fields.reduce((acc, field) => {
    acc[field.name] = field.type === "boolean" ? false : "";
    return acc;
  }, {});
};

const Scoring = () => {
  const [selectedKey, setSelectedKey] = useState(FORMULAS[0].key);
  const selectedFormula = useMemo(
    () => FORMULAS.find((item) => item.key === selectedKey),
    [selectedKey]
  );
  const [inputs, setInputs] = useState(() => defaultValuesFor(FORMULAS[0]));
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectFormula = (key) => {
    const formula = FORMULAS.find((item) => item.key === key);
    setSelectedKey(key);
    setInputs(defaultValuesFor(formula));
    setResult(null);
    setError(null);
  };

  const handleInputChange = (fieldName, value) => {
    setInputs((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const submit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const normalizedInputs = Object.entries(inputs).reduce((acc, [key, value]) => {
        if (typeof value === "boolean") {
          acc[key] = value;
        } else if (value === "") {
          acc[key] = 0;
        } else {
          acc[key] = Number(value);
        }
        return acc;
      }, {});

      const response = await scoringApi.compute({
        formula: selectedFormula.key,
        inputs: normalizedInputs
      });

      setResult(response);
    } catch (err) {
      setError(err?.message || "Không thể tính điểm. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setInputs(defaultValuesFor(selectedFormula));
    setResult(null);
    setError(null);
  };

  return (
    <PublicLayout>
      <section className="px-4 py-10 md:px-10 lg:px-16 bg-emerald-50/40 dark:bg-slate-950 min-h-[calc(100vh-84px)] transition-colors">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-8 md:p-10">
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-100">Công cụ lâm sàng</p>
            <h1 className="text-3xl md:text-4xl font-bold mt-3">Thư viện tính điểm nguy cơ</h1>
            <p className="text-emerald-50 mt-3 max-w-2xl">Chọn thang điểm, nhập dữ liệu lâm sàng và nhận kết quả diễn giải ngay lập tức.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Danh sách công thức</h2>
              <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
                {FORMULAS.map((formula) => {
                  const Icon = formula.icon;
                  const active = formula.key === selectedKey;
                  return (
                    <button
                      key={formula.key}
                      type="button"
                      onClick={() => selectFormula(formula.key)}
                      className={`w-full text-left rounded-2xl p-4 border transition-all ${
                        active
                          ? "bg-emerald-50 border-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-700"
                          : "bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md dark:bg-slate-900 dark:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                          <Icon size={16} className="text-slate-700 dark:text-slate-200" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{formula.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formula.description}</p>
                          <span className="inline-block mt-2 text-[11px] px-2 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{formula.category}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {/* Calculator Header */}
              <CalculatorHeader
                title={selectedFormula.title}
                description={selectedFormula.description}
                icon={selectedFormula.icon}
                category={selectedFormula.category}
              />

              {/* Input Card */}
              <InputCard
                fields={selectedFormula.fields}
                inputs={inputs}
                onChange={handleInputChange}
                onSubmit={submit}
                isLoading={isLoading}
                submitLabel={result ? "Tính toán lại" : "Tính điểm"}
                hasResult={!!result}
                onReset={handleReset}
                error={error}
              />

              {/* Result Card */}
              {result && (
                <>
                  <ResultCard
                    score={result.score}
                    interpretation={result.interpretation}
                    riskLevel={result.riskLevel}
                  />
                  <ReferencesSection references={selectedFormula.references || []} />
                </>
              )}

              {/* Error Display */}
              {error && (
                <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-5">
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Scoring;
