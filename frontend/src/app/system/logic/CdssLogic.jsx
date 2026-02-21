import React, { useEffect, useMemo, useState } from "react";
import { logicAPI } from "../../../service/api-extended";

const CdssLogic = () => {
  const [variables, setVariables] = useState([]);
  const [formulas, setFormulas] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modal states
  const [variableModal, setVariableModal] = useState({ open: false, data: null });
  const [formulaModal, setFormulaModal] = useState({ open: false, data: null });

  const loadLogic = async () => {
    setLoading(true);
    setError("");
    try {
      const [variablesRes, formulasRes] = await Promise.allSettled([
        logicAPI.getAllVariables(),
        logicAPI.getAllFormulas(),
      ]);

      if (variablesRes.status === "fulfilled") {
        setVariables(variablesRes.value.data?.data || []);
      }
      if (formulasRes.status === "fulfilled") {
        setFormulas(formulasRes.value.data?.data || []);
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

  useEffect(() => {
    loadLogic();
  }, []);

  // Variable handlers
  const handleSaveVariable = async (data) => {
    try {
      if (variableModal.data) {
        await logicAPI.updateVariable(variableModal.data.variableId, data);
      } else {
        await logicAPI.createVariable(data);
      }
      setVariableModal({ open: false, data: null });
      loadLogic();
    } catch (err) {
      alert("Lỗi khi lưu biến: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteVariable = async (id) => {
    if (!window.confirm("Xóa biến này?")) return;
    try {
      await logicAPI.deleteVariable(id);
      loadLogic();
    } catch (err) {
      alert("Lỗi khi xóa: " + (err.response?.data?.message || err.message));
    }
  };

  // Formula handlers
  const handleSaveFormula = async (data) => {
    try {
      if (formulaModal.data) {
        await logicAPI.updateFormula(formulaModal.data.formulaId, data);
      } else {
        await logicAPI.createFormula(data);
      }
      setFormulaModal({ open: false, data: null });
      loadLogic();
    } catch (err) {
      alert("Lỗi khi lưu công thức: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteFormula = async (id) => {
    if (!window.confirm("Xóa công thức này?")) return;
    try {
      await logicAPI.deleteFormula(id);
      loadLogic();
    } catch (err) {
      alert("Lỗi khi xóa: " + (err.response?.data?.message || err.message));
    }
  };

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
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
        {/* Variables Section */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Biến lâm sàng</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500">
                {filteredVariables.length} biến
              </span>
              <button
                onClick={() => setVariableModal({ open: true, data: null })}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                + Thêm biến
              </button>
            </div>
          </div>
          {filteredVariables.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có biến.</p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredVariables.map((item) => (
                <div
                  key={item.variableId}
                  className="border border-slate-100 rounded-xl p-4 hover:border-emerald-200 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.variableName}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Mã: {item.variableCode || "N/A"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Đơn vị: {item.unit || "Không có"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setVariableModal({ open: true, data: item })}
                        className="text-sky-600 hover:text-sky-700 text-xs font-medium"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteVariable(item.variableId)}
                        className="text-rose-600 hover:text-rose-700 text-xs font-medium"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulas Section */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Công thức</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500">
                {filteredFormulas.length} công thức
              </span>
              <button
                onClick={() => setFormulaModal({ open: true, data: null })}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                + Thêm công thức
              </button>
            </div>
          </div>
          {filteredFormulas.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có công thức.</p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredFormulas.map((item) => (
                <div
                  key={item.formulaId}
                  className="border border-slate-100 rounded-xl p-4 hover:border-emerald-200 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.formulaName}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Mã: {item.formulaCode || "N/A"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 font-mono">
                        {item.expression || "Chưa có biểu thức"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFormulaModal({ open: true, data: item })}
                        className="text-sky-600 hover:text-sky-700 text-xs font-medium"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteFormula(item.formulaId)}
                        className="text-rose-600 hover:text-rose-700 text-xs font-medium"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Variable Modal */}
      {variableModal.open && (
        <VariableModal
          data={variableModal.data}
          onClose={() => setVariableModal({ open: false, data: null })}
          onSave={handleSaveVariable}
        />
      )}

      {/* Formula Modal */}
      {formulaModal.open && (
        <FormulaModal
          data={formulaModal.data}
          onClose={() => setFormulaModal({ open: false, data: null })}
          onSave={handleSaveFormula}
        />
      )}
    </div>
  );
};

// Variable Modal Component
const VariableModal = ({ data, onClose, onSave }) => {
  const [form, setForm] = useState({
    variableName: data?.variableName || "",
    variableCode: data?.variableCode || "",
    unit: data?.unit || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.variableName.trim()) {
      alert("Tên biến không được để trống");
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          {data ? "Sửa biến" : "Thêm biến mới"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tên biến <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.variableName}
              onChange={(e) => setForm({ ...form, variableName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="VD: Huyết áp tâm thu"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mã biến
            </label>
            <input
              type="text"
              value={form.variableCode}
              onChange={(e) => setForm({ ...form, variableCode: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="VD: SBP"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Đơn vị
            </label>
            <input
              type="text"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="VD: mmHg"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Formula Modal Component
const FormulaModal = ({ data, onClose, onSave }) => {
  const [form, setForm] = useState({
    formulaName: data?.formulaName || "",
    formulaCode: data?.formulaCode || "",
    expression: data?.expression || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.formulaName.trim()) {
      alert("Tên công thức không được để trống");
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          {data ? "Sửa công thức" : "Thêm công thức mới"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tên công thức <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.formulaName}
              onChange={(e) => setForm({ ...form, formulaName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="VD: Chỉ số BMI"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mã công thức
            </label>
            <input
              type="text"
              value={form.formulaCode}
              onChange={(e) => setForm({ ...form, formulaCode: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="VD: BMI"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Biểu thức
            </label>
            <textarea
              value={form.expression}
              onChange={(e) => setForm({ ...form, expression: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
              placeholder="VD: weight / (height * height)"
              rows="3"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CdssLogic;
