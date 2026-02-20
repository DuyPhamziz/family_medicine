import React, { useEffect, useMemo, useState } from "react";
import { logicAPI } from "../../../service/api-extended";

const CdssLogic = () => {
  const [variables, setVariables] = useState([]);
  const [formulas, setFormulas] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLogic = async () => {
      setLoading(true);
      setError("");
      try {
        const [variablesRes, formulasRes] = await Promise.allSettled([
          logicAPI.getAllVariables(),
          logicAPI.getAllFormulas(),
        ]);

        if (variablesRes.status === "fulfilled") {
          setVariables(variablesRes.value.data || []);
        }
        if (formulasRes.status === "fulfilled") {
          setFormulas(formulasRes.value.data || []);
        }

        if (
          variablesRes.status === "rejected" &&
          formulasRes.status === "rejected"
        ) {
          setError("Không thể tải dữ liệu logic CDSS. Vui lòng thử lại.");
        }
      } catch (err) {
        console.error("CDSS logic error:", err);
        setError("Không thể tải dữ liệu logic CDSS. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    loadLogic();
  }, []);

  const filteredVariables = useMemo(() => {
    if (!query) return variables;
    const lower = query.toLowerCase();
    return variables.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(lower)
    );
  }, [variables, query]);

  const filteredFormulas = useMemo(() => {
    if (!query) return formulas;
    const lower = query.toLowerCase();
    return formulas.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(lower)
    );
  }, [formulas, query]);

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
          <h1 className="text-3xl font-bold text-slate-900">Logic CDSS</h1>
          <p className="text-slate-500 mt-2">
            Quản lý biến, công thức và quy tắc đánh giá nguy cơ.
          </p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm biến hoặc công thức..."
          className="px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Biến lâm sàng</h2>
            <span className="text-xs font-semibold text-slate-500">
              {filteredVariables.length} biến
            </span>
          </div>
          {filteredVariables.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có biến.</p>
          ) : (
            <div className="space-y-4">
              {filteredVariables.slice(0, 6).map((item, index) => (
                <div
                  key={item.variableId || item.id || index}
                  className="border border-slate-100 rounded-2xl p-4"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {item.variableName || item.name || "Biến chưa đặt tên"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {item.variableCode || item.code || "Chưa có mã"}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    {item.unit || "Không có đơn vị"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Công thức</h2>
            <span className="text-xs font-semibold text-slate-500">
              {filteredFormulas.length} công thức
            </span>
          </div>
          {filteredFormulas.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có công thức.</p>
          ) : (
            <div className="space-y-4">
              {filteredFormulas.slice(0, 6).map((item, index) => (
                <div
                  key={item.formulaId || item.id || index}
                  className="border border-slate-100 rounded-2xl p-4"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {item.formulaName || item.name || "Công thức chưa đặt tên"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {item.formulaCode || item.code || "Chưa có mã"}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    {item.expression || item.logic || "Chưa có biểu thức"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CdssLogic;
