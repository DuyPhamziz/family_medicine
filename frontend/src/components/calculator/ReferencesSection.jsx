import React from 'react';
import { FileText, Link as LinkIcon } from 'lucide-react';

/**
 * ReferencesSection component
 * Displays medical references and citations related to the calculator
 */
const ReferencesSection = ({ references = [] }) => {
  if (!references || references.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-5 h-5 text-slate-600" />
        <h2 className="text-xl font-bold text-slate-900">Tài liệu tham khảo</h2>
      </div>

      <ol className="space-y-4">
        {references.map((ref, idx) => (
          <li
            key={idx}
            className="flex gap-4 text-sm text-slate-700 leading-relaxed"
          >
            <span className="text-emerald-600 font-bold min-w-6 text-right">
              {idx + 1}.
            </span>
            <div className="flex-1">
              <p className="text-slate-800 font-medium">
                {ref.title || ref.text || ref}
              </p>

              {typeof ref === 'object' && ref.authors && (
                <p className="text-slate-600 text-xs mt-1">
                  {typeof ref.authors === 'string'
                    ? ref.authors
                    : ref.authors.join(', ')}
                </p>
              )}

              {typeof ref === 'object' && ref.journal && (
                <p className="text-slate-600 text-xs mt-0.5">
                  <em>{ref.journal}</em>
                  {ref.year && ` (${ref.year})`}
                  {ref.pages && ` pp. ${ref.pages}`}
                </p>
              )}

              {typeof ref === 'object' && ref.url && (
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 font-medium text-xs mt-2 inline-flex items-center gap-1"
                >
                  <LinkIcon className="w-3 h-3" />
                  Đọc bài gốc
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 pt-6 border-t border-slate-200 text-xs text-slate-500">
        <p>
          Các tài liệu tham khảo này được cập nhật định kỳ để đảm bảo tính chính xác 
          của thông tin y tế.
        </p>
      </div>
    </section>
  );
};

export default ReferencesSection;
