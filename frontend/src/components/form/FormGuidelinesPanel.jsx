import { useState } from 'react';
import { Info, FileText, Link as LinkIcon, AlertCircle, ChevronDown } from 'lucide-react';

/**
 * Guidelines/Notes panel for public forms
 * Displays helpful information, links, and notes for form users
 */
export const FormGuidelinesPanel = ({ guidelines, formTitle }) => {
  const [expanded, setExpanded] = useState(true);

  // If no guidelines provided, show default helpful text
  const defaultGuidelines = {
    title: 'Hướng dẫn sử dụng',
    items: [
      {
        type: 'note',
        icon: 'info',
        title: 'Thông tin cần thiết',
        content: 'Vui lòng điền đầy đủ các trường có dấu (*)',
        color: 'blue'
      },
      {
        type: 'note',
        icon: 'alert',
        title: 'Tính chính xác',
        content: 'Hãy cung cấp thông tin chính xác để bác sĩ có thể đánh giá tốt nhất.',
        color: 'amber'
      },
      {
        type: 'note',
        icon: 'info',
        title: 'Thời gian xử lý',
        content: 'Bác sĩ sẽ xem xét hồ sơ của bạn trong vòng 24-48 giờ.',
        color: 'green'
      }
    ]
  };

  const displayGuidelines = guidelines && guidelines.items && guidelines.items.length > 0 
    ? guidelines 
    : defaultGuidelines;

  const getIconComponent = (iconType) => {
    const iconProps = "w-5 h-5";
    switch (iconType) {
      case 'info':
        return <Info className={iconProps} />;
      case 'link':
        return <LinkIcon className={iconProps} />;
      case 'alert':
        return <AlertCircle className={iconProps} />;
      case 'file':
        return <FileText className={iconProps} />;
      default:
        return <Info className={iconProps} />;
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-900',
      amber: 'bg-amber-50 border-amber-200 text-amber-900',
      green: 'bg-green-50 border-green-200 text-green-900',
      red: 'bg-red-50 border-red-200 text-red-900',
      purple: 'bg-purple-50 border-purple-200 text-purple-900',
    };
    return colors[color] || colors.blue;
  };

  const getIconColor = (color) => {
    const colors = {
      blue: 'text-blue-600',
      amber: 'text-amber-600',
      green: 'text-green-600',
      red: 'text-red-600',
      purple: 'text-purple-600',
    };
    return colors[color] || colors.blue;
  };

  if (!displayGuidelines || !displayGuidelines.items || displayGuidelines.items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 lg:col-span-1">
      {/* Sticky Panel */}
      <div className="sticky top-24 bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        {/* Panel Header */}
        <div 
          onClick={() => setExpanded(!expanded)}
          className="bg-gradient-to-r from-blue-50 to-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-800">
              {displayGuidelines.title || 'Hướng dẫn sử dụng'}
            </h3>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-slate-600 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </div>

        {/* Panel Content */}
        {expanded && (
          <div className="divide-y divide-slate-200">
            {displayGuidelines.items.map((item, index) => (
              <div key={index} className="p-5">
                {item.type === 'link' && item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block rounded-lg border ${getColorClasses(item.color || 'blue')} p-4 hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 mt-1 ${getIconColor(item.color || 'blue')}`}>
                        {getIconComponent(item.icon || 'link')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-1">
                          {item.title}
                        </h4>
                        {item.content && (
                          <p className="text-sm opacity-90">
                            {item.content}
                          </p>
                        )}
                        <div className="text-xs mt-2 font-medium opacity-75">
                          Nhấp để mở ↗
                        </div>
                      </div>
                    </div>
                  </a>
                ) : (
                  <div className={`rounded-lg border ${getColorClasses(item.color || 'blue')} p-4`}>
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 mt-0.5 ${getIconColor(item.color || 'blue')}`}>
                        {getIconComponent(item.icon || 'info')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-1">
                          {item.title}
                        </h4>
                        {item.content && (
                          <p className="text-sm opacity-90 leading-relaxed">
                            {item.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
