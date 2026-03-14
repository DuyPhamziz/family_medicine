import { useMemo, useState } from 'react';

const slugify = (input) => {
  return (input || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
};

const normalizeRows = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row, index) => {
      if (typeof row === 'string') {
        return { key: slugify(row) || `row_${index + 1}`, label: row };
      }
      if (!row || typeof row !== 'object') return null;
      const label = row.label || row.name || row.value || `Disease ${index + 1}`;
      const key = row.key || slugify(label) || `row_${index + 1}`;
      return { ...row, key, label };
    })
    .filter(Boolean);
};

const normalizeColumns = (columns) => {
  if (!Array.isArray(columns)) return [];
  return columns
    .map((col, index) => {
      if (typeof col === 'string') {
        return { key: slugify(col) || `column_${index + 1}`, label: col };
      }
      if (!col || typeof col !== 'object') return null;
      const label = col.label || col.name || col.value || `Member ${index + 1}`;
      const key = col.key || slugify(label) || `column_${index + 1}`;
      return { ...col, key, label };
    })
    .filter(Boolean);
};

const normalizeValue = (value, question) => {
  const baseRows = normalizeRows(question?.rows || []);
  const baseColumns = normalizeColumns(question?.columns || []);

  const valueObj = value && typeof value === 'object' ? value : {};
  const extraRows = normalizeRows(valueObj.rows || []);
  const extraColumns = normalizeColumns(valueObj.columns || []);

  const rowsMap = new Map();
  [...baseRows, ...extraRows].forEach((row) => rowsMap.set(row.key, row));
  const columnsMap = new Map();
  [...baseColumns, ...extraColumns].forEach((col) => columnsMap.set(col.key, col));

  const matrixEntries = Array.isArray(valueObj.matrix) ? valueObj.matrix : [];

  return {
    rows: Array.from(rowsMap.values()),
    columns: Array.from(columnsMap.values()),
    matrix: matrixEntries,
  };
};

const getEntry = (matrix, rowKey, columnKey) => {
  return matrix.find((item) => item.row === rowKey && item.column === columnKey);
};

export const MatrixDiseaseQuestion = ({ question, value, onChange, disabled, readOnly }) => {
  const [newMember, setNewMember] = useState({ label: '', birth_year: '', relationship: '' });
  const [newDiseaseLabel, setNewDiseaseLabel] = useState('');

  const normalized = useMemo(() => normalizeValue(value, question), [value, question]);
  const hasRows = normalized.rows.length > 0;
  const hasColumns = normalized.columns.length > 0;
  // MATRIX_FAMILY_DISEASE is always user-input mode.
  const allowAdditionalColumn = true;
  const allowAdditionalRow = true;
  const missingParts = [];
  if (!hasRows) missingParts.push('benh');
  if (!hasColumns) missingParts.push('thanh vien gia dinh');

  const setCellValue = (rowKey, columnKey, hasDisease, diagnosisYear, isDeceased = false) => {
    const nextMatrix = [...normalized.matrix];
    const index = nextMatrix.findIndex((item) => item.row === rowKey && item.column === columnKey);

    if (!hasDisease && (diagnosisYear === null || diagnosisYear === undefined || diagnosisYear === '') && !isDeceased) {
      if (index >= 0) nextMatrix.splice(index, 1);
    } else {
      const nextEntry = {
        row: rowKey,
        column: columnKey,
        has_disease: Boolean(hasDisease),
      };
      if (diagnosisYear !== null && diagnosisYear !== undefined && diagnosisYear !== '') {
        nextEntry.year = Number(diagnosisYear);
      }
      if (isDeceased) {
        nextEntry.is_deceased = true;
      }

      if (index >= 0) {
        nextMatrix[index] = nextEntry;
      } else {
        nextMatrix.push(nextEntry);
      }
    }

    onChange({
      rows: normalized.rows,
      columns: normalized.columns,
      matrix: nextMatrix,
    });
  };

  const addMember = () => {
    const label = (newMember.label || '').trim();
    if (!label) return;

    const key = slugify(label) || `member_${Date.now()}`;
    if (normalized.columns.some((item) => item.key === key)) return;

    const nextColumns = [
      ...normalized.columns,
      {
        key,
        label,
        birth_year: newMember.birth_year === '' ? null : Number(newMember.birth_year),
        relationship: (newMember.relationship || '').trim() || null,
      },
    ];

    onChange({
      rows: normalized.rows,
      columns: nextColumns,
      matrix: normalized.matrix,
    });

    setNewMember({ label: '', birth_year: '', relationship: '' });
  };

  const addDisease = () => {
    const label = (newDiseaseLabel || '').trim();
    if (!label) return;

    const key = slugify(label) || `disease_${Date.now()}`;
    if (normalized.rows.some((item) => item.key === key)) return;

    const nextRows = [...normalized.rows, { key, label }];
    onChange({
      rows: nextRows,
      columns: normalized.columns,
      matrix: normalized.matrix,
    });

    setNewDiseaseLabel('');
  };

  const canEdit = !(disabled || readOnly);

  return (
    <div className="space-y-4">
      {missingParts.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {`Chua co ${missingParts.join(' va ')}. Nguoi dung co the them truc tiep khi dien bieu mau.`}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Benh</th>
              {normalized.columns.map((column) => (
                <th key={column.key} className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase min-w-[220px]">
                  <div className="font-semibold text-slate-800 normal-case">{column.label}</div>
                  {column.birth_year ? <div className="text-[11px] text-slate-500 normal-case">Nam sinh: {column.birth_year}</div> : null}
                  {column.relationship ? <div className="text-[11px] text-slate-500 normal-case">Quan he: {column.relationship}</div> : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {normalized.rows.map((row) => (
              <tr key={row.key} className="border-t border-slate-100 align-top">
                <td className="px-3 py-3 text-sm font-medium text-slate-700">{row.label}</td>
                {normalized.columns.map((column) => {
                  const entry = getEntry(normalized.matrix, row.key, column.key);
                  const checked = Boolean(entry?.has_disease);
                  const isDeceased = Boolean(entry?.is_deceased);
                  const yearValue = entry?.year ?? '';

                  return (
                    <td key={`${row.key}-${column.key}`} className="px-3 py-3">
                      <div className="space-y-2">
                        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={!canEdit}
                            onChange={(e) => setCellValue(row.key, column.key, e.target.checked, e.target.checked ? yearValue : null, isDeceased)}
                          />
                          Có bệnh
                        </label>
                        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={isDeceased}
                            disabled={!canEdit}
                            onChange={(e) => setCellValue(row.key, column.key, checked, yearValue, e.target.checked)}
                          />
                          Đã mất
                        </label>
                      </div>
                      {checked && !isDeceased && (
                        <input
                          type="number"
                          min="1900"
                          max="2100"
                          value={yearValue}
                          disabled={!canEdit}
                          onChange={(e) => setCellValue(row.key, column.key, true, e.target.value === '' ? null : Number(e.target.value), isDeceased)}
                          placeholder="Năm mắc"
                          className="mt-2 w-full px-2 py-2 border border-slate-300 rounded text-sm"
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {allowAdditionalColumn && (
        <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
          <p className="text-sm font-semibold text-slate-700 mb-2">Them thanh vien khac</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input
              value={newMember.label}
              onChange={(e) => setNewMember((prev) => ({ ...prev, label: e.target.value }))}
              placeholder="Ten"
              className="px-3 py-2 border border-slate-300 rounded text-sm"
              disabled={!canEdit}
            />
            <input
              type="number"
              value={newMember.birth_year}
              onChange={(e) => setNewMember((prev) => ({ ...prev, birth_year: e.target.value }))}
              placeholder="Nam sinh"
              className="px-3 py-2 border border-slate-300 rounded text-sm"
              disabled={!canEdit}
            />
            <input
              value={newMember.relationship}
              onChange={(e) => setNewMember((prev) => ({ ...prev, relationship: e.target.value }))}
              placeholder="Quan he"
              className="px-3 py-2 border border-slate-300 rounded text-sm"
              disabled={!canEdit}
            />
            <button
              type="button"
              onClick={addMember}
              disabled={!canEdit}
              className="px-4 py-2 rounded bg-emerald-600 text-white text-sm font-semibold shadow-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Thêm thành viên
            </button>
          </div>
        </div>
      )}

      {allowAdditionalRow && (
        <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
          <p className="text-sm font-semibold text-slate-700 mb-2">Them benh khac</p>
          <div className="flex gap-2">
            <input
              value={newDiseaseLabel}
              onChange={(e) => setNewDiseaseLabel(e.target.value)}
              placeholder="Nhap ten benh"
              className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
              disabled={!canEdit}
            />
            <button
              type="button"
              onClick={addDisease}
              disabled={!canEdit}
              className="px-4 py-2 rounded bg-sky-600 text-white text-sm font-semibold shadow-md hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Thêm bệnh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
