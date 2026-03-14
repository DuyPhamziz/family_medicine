import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, AlertCircle } from 'lucide-react';

const createConditionNode = () => ({
  kind: 'condition',
  id: `cond_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  questionCode: '',
  questionId: null,
  operator: 'equals',
  value: ''
});

const createGroupNode = (operator = 'AND', children) => ({
  kind: 'group',
  id: `grp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  operator,
  children: Array.isArray(children) && children.length > 0 ? children : [createConditionNode()]
});

const parseConditionTree = (raw) => {
  if (!raw) return createGroupNode('AND');

  if (Array.isArray(raw)) {
    if (raw.length === 0) return createGroupNode('AND');
    if (raw.length === 1) return parseConditionTree(raw[0]);
    return createGroupNode('AND', raw.map((item) => parseConditionTree(item)));
  }

  if (raw.rules) {
    return parseConditionTree(raw.rules);
  }

  if (Array.isArray(raw.AND)) {
    return createGroupNode('AND', raw.AND.map((item) => parseConditionTree(item)));
  }

  if (Array.isArray(raw.OR)) {
    return createGroupNode('OR', raw.OR.map((item) => parseConditionTree(item)));
  }

  if (Array.isArray(raw.conditions)) {
    const mode = String(raw.operators || 'AND').toUpperCase() === 'OR' ? 'OR' : 'AND';
    return createGroupNode(mode, raw.conditions.map((item) => parseConditionTree(item)));
  }

  if (raw.questionCode || raw.questionId) {
    return {
      ...createConditionNode(),
      questionCode: raw.questionCode || '',
      questionId: raw.questionId || null,
      operator: raw.operator || 'equals',
      value: raw.value ?? ''
    };
  }

  return createGroupNode('AND');
};

const serializeConditionTree = (node) => {
  if (!node) return null;

  if (node.kind === 'condition') {
    return {
      questionCode: node.questionCode,
      questionId: node.questionId,
      operator: node.operator || 'equals',
      value: node.value
    };
  }

  if (node.kind === 'group') {
    const children = (node.children || [])
      .map((child) => serializeConditionTree(child))
      .filter(Boolean);

    if (children.length === 0) return null;
    return node.operator === 'OR' ? { OR: children } : { AND: children };
  }

  return null;
};

const updateNodeById = (node, targetId, updater) => {
  if (!node) return node;
  if (node.id === targetId) return updater(node);

  if (node.kind === 'group') {
    return {
      ...node,
      children: (node.children || []).map((child) => updateNodeById(child, targetId, updater))
    };
  }

  return node;
};

const removeNodeById = (node, targetId) => {
  if (!node) return null;
  if (node.id === targetId) return null;

  if (node.kind === 'group') {
    const newChildren = (node.children || [])
      .map((child) => removeNodeById(child, targetId))
      .filter(Boolean);

    return {
      ...node,
      children: newChildren.length > 0 ? newChildren : [createConditionNode()]
    };
  }

  return node;
};

export const ConditionalRuleBuilder = ({ questions = [], value = [], onChange }) => {
  const parseFromValue = () => {
    if (!value || value.length === 0) return createGroupNode('AND');

    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      return parseConditionTree(parsed);
    } catch {
      return createGroupNode('AND');
    }
  };

  const [rootNode, setRootNode] = useState(parseFromValue());

  useEffect(() => {
    setRootNode(parseFromValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(value)]);

  const emitChange = (tree) => {
    const serialized = serializeConditionTree(tree);
    if (!serialized) {
      onChange([]);
      return;
    }

    onChange([
      {
        conditionType: 'SHOW',
        rules: serialized
      }
    ]);
  };

  const updateTree = (nextTree) => {
    setRootNode(nextTree);
    emitChange(nextTree);
  };

  const addConditionToGroup = (groupId) => {
    const next = updateNodeById(rootNode, groupId, (node) => {
      if (node.kind !== 'group') return node;
      return { ...node, children: [...(node.children || []), createConditionNode()] };
    });
    updateTree(next);
  };

  const addNestedGroupToGroup = (groupId) => {
    const next = updateNodeById(rootNode, groupId, (node) => {
      if (node.kind !== 'group') return node;
      return { ...node, children: [...(node.children || []), createGroupNode('AND')] };
    });
    updateTree(next);
  };

  const removeNode = (nodeId) => {
    const next = removeNodeById(rootNode, nodeId) || createGroupNode('AND');
    updateTree(next);
  };

  const updateCondition = (nodeId, field, fieldValue) => {
    const next = updateNodeById(rootNode, nodeId, (node) => {
      if (node.kind !== 'condition') return node;

      if (field === 'questionCode') {
        const selectedQ = questions.find((q) => q.questionCode === fieldValue);
        return {
          ...node,
          questionCode: fieldValue,
          questionId: selectedQ?.questionId || null
        };
      }

      return { ...node, [field]: fieldValue };
    });

    updateTree(next);
  };

  const updateGroupOperator = (nodeId, operator) => {
    const mode = operator === 'OR' ? 'OR' : 'AND';
    const next = updateNodeById(rootNode, nodeId, (node) => {
      if (node.kind !== 'group') return node;
      return { ...node, operator: mode };
    });
    updateTree(next);
  };

  const applyExampleAorBandC = () => {
    const next = createGroupNode('OR', [
      createConditionNode(),
      createGroupNode('AND', [createConditionNode(), createConditionNode()])
    ]);
    updateTree(next);
  };

  const getQuestionType = (questionCode) => {
    const q = questions.find((x) => x.questionCode === questionCode);
    return q?.questionType || 'TEXT';
  };

  const getQuestionOptions = (questionCode) => {
    const q = questions.find((x) => x.questionCode === questionCode);
    if (!q || q.questionType !== 'SINGLE_CHOICE') return [];

    try {
      const options = JSON.parse(q.options || '[]');
      return Array.isArray(options) ? options : [];
    } catch {
      return [];
    }
  };

  const renderNode = (node, depth = 0, isRoot = false) => {
    if (node.kind === 'condition') {
      const questionType = getQuestionType(node.questionCode);
      const options = getQuestionOptions(node.questionCode);

      return (
        <div key={node.id} className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Điều kiện</span>
            <button
              type="button"
              onClick={() => removeNode(node.id)}
              className="rounded p-1 text-red-500 hover:bg-red-50"
              title="Xóa điều kiện"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-12 sm:col-span-5">
              <select
                value={node.questionCode || ''}
                onChange={(e) => updateCondition(node.id, 'questionCode', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn câu hỏi --</option>
                {questions.map((q) => (
                  <option key={q.questionId} value={q.questionCode}>
                    {q.questionCode} - {q.questionText?.slice(0, 40)}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-12 sm:col-span-3">
              <select
                value={node.operator || 'equals'}
                onChange={(e) => updateCondition(node.id, 'operator', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="equals">Bằng</option>
                <option value="not_equals">Khác</option>
                {questionType === 'NUMBER' && (
                  <>
                    <option value="greaterThan">Lớn hơn</option>
                    <option value="lessThan">Nhỏ hơn</option>
                    <option value="greaterThanOrEqual">{">="}</option>
                    <option value="lessThanOrEqual">{"<="}</option>
                  </>
                )}
                <option value="in">Trong</option>
              </select>
            </div>

            <div className="col-span-12 sm:col-span-4">
              {options.length > 0 ? (
                <select
                  value={node.value || ''}
                  onChange={(e) => updateCondition(node.id, 'value', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn giá trị --</option>
                  {options.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={questionType === 'NUMBER' ? 'number' : 'text'}
                  value={node.value || ''}
                  onChange={(e) => updateCondition(node.id, 'value', e.target.value)}
                  placeholder="Nhập giá trị..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          </div>
        </div>
      );
    }

    const borderClass = depth % 2 === 0 ? 'border-blue-200 bg-blue-50/40' : 'border-emerald-200 bg-emerald-50/40';

    return (
      <div key={node.id} className={`rounded-xl border p-3 ${borderClass}`}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Nhóm điều kiện</span>
          <select
            value={node.operator}
            onChange={(e) => updateGroupOperator(node.id, e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700"
          >
            <option value="AND">AND (TẤT CẢ đúng)</option>
            <option value="OR">OR (1 điều kiện đúng)</option>
          </select>

          <button
            type="button"
            onClick={() => addConditionToGroup(node.id)}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
          >
            <Plus className="h-3 w-3" /> Điều kiện
          </button>

          <button
            type="button"
            onClick={() => addNestedGroupToGroup(node.id)}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
          >
            <Plus className="h-3 w-3" /> Nhóm con
          </button>

          {!isRoot && (
            <button
              type="button"
              onClick={() => removeNode(node.id)}
              className="ml-auto inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100"
            >
              <Trash2 className="h-3 w-3" /> Xóa nhóm
            </button>
          )}
        </div>

        <div className="space-y-2 pl-2">
          {(node.children || []).map((child) => renderNode(child, depth + 1, false))}
        </div>
      </div>
    );
  };

  const hasNoConditions = !rootNode || rootNode.kind !== 'group' || (rootNode.children || []).length === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-600" />
          <h4 className="font-semibold text-slate-800">Điều kiện hiển thị</h4>
        </div>
        <button
          type="button"
          onClick={applyExampleAorBandC}
          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
        >
          Mẫu A OR (B AND C)
        </button>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
        <div className="flex gap-2">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div>
            <p className="font-semibold">Cách hoạt động</p>
            <p>• Không có điều kiện {'->'} câu hỏi luôn hiển thị.</p>
            <p>• Bạn có thể lồng nhóm điều kiện để tạo biểu thức tổng quát, ví dụ: <strong>A OR (B AND C)</strong>.</p>
          </div>
        </div>
      </div>

      {hasNoConditions ? (
        <div className="rounded-lg border-2 border-dashed border-slate-300 p-8 text-center">
          <EyeOff className="mx-auto mb-3 h-12 w-12 text-slate-400" />
          <p className="mb-3 text-slate-600">Chưa có điều kiện. Câu hỏi sẽ luôn hiển thị.</p>
          <button
            type="button"
            onClick={() => updateTree(createGroupNode('AND'))}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Tạo điều kiện đầu tiên
          </button>
        </div>
      ) : (
        renderNode(rootNode, 0, true)
      )}
    </div>
  );
};

export default ConditionalRuleBuilder;
