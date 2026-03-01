import React, { useState } from 'react';
import { FileText, Heart, Scale, Activity, Thermometer, Baby } from 'lucide-react';
import Button from '../ui/Button';
import './FormTemplates.css';

/**
 * Pre-built form templates với conditional logic và calculations
 * Giúp admin tạo form nhanh chóng
 */
export const FormTemplates = ({ onSelectTemplate }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  const templates = [
    {
      id: 'bmi-assessment',
      name: 'Đánh giá chỉ số BMI',
      icon: <Scale size={24} />,
      description: 'Form tính BMI tự động từ cân nặng và chiều cao, phân loại mức độ',
      category: 'Sức khỏe cơ bản',
      color: '#3498db',
      structure: {
        formName: 'Đánh giá chỉ số BMI',
        description: 'Form tự động tính BMI và phân loại',
        category: 'HEALTH_ASSESSMENT',
        sections: [
          {
            sectionName: 'Thông tin cơ bản',
            questions: [
              {
                questionCode: 'DOB',
                questionText: 'Ngày sinh',
                questionType: 'DATE',
                required: true,
                questionOrder: 1
              },
              {
                questionCode: 'WEIGHT',
                questionText: 'Cân nặng',
                questionType: 'NUMBER',
                unit: 'kg',
                minValue: 20,
                maxValue: 300,
                required: true,
                questionOrder: 2
              },
              {
                questionCode: 'HEIGHT',
                questionText: 'Chiều cao',
                questionType: 'NUMBER',
                unit: 'cm',
                minValue: 50,
                maxValue: 250,
                required: true,
                questionOrder: 3
              }
            ]
          }
        ],
        calculations: [
          {
            type: 'AGE_FROM_DOB',
            outputField: 'CALCULATED_AGE',
            config: { dateField: 'DOB' }
          },
          {
            type: 'BMI',
            outputField: 'BMI_VALUE',
            config: { weightField: 'WEIGHT', heightField: 'HEIGHT' }
          }
        ]
      }
    },
    {
      id: 'diabetes-risk',
      name: 'Đánh giá nguy cơ Tiểu đường',
      icon: <Activity size={24} />,
      description: 'Form scoring với conditional logic, tính điểm rủi ro tiểu đường',
      category: 'Đánh giá rủi ro',
      color: '#e74c3c',
      structure: {
        formName: 'Đánh giá nguy cơ Tiểu đường',
        description: 'Screening nguy cơ tiểu đường type 2',
        category: 'RISK_ASSESSMENT',
        sections: [
          {
            sectionName: 'Thông tin cá nhân',
            questions: [
              {
                questionCode: 'AGE_GROUP',
                questionText: 'Bạn bao nhiêu tuổi?',
                questionType: 'SINGLE_CHOICE',
                options: 'Dưới 40 tuổi\n40-49 tuổi\n50-59 tuổi\n60 tuổi trở lên',
                points: 0,
                required: true,
                questionOrder: 1
              },
              {
                questionCode: 'BMI_RANGE',
                questionText: 'Chỉ số BMI của bạn?',
                questionType: 'SINGLE_CHOICE',
                options: 'Dưới 25\n25-30\nTrên 30',
                points: 0,
                required: true,
                questionOrder: 2
              }
            ]
          },
          {
            sectionName: 'Lối sống',
            questions: [
              {
                questionCode: 'EXERCISE',
                questionText: 'Bạn có tập thể dục thường xuyên không?',
                questionType: 'BOOLEAN',
                points: 0,
                required: true,
                questionOrder: 1
              },
              {
                questionCode: 'DIET',
                questionText: 'Bạn có ăn rau củ hàng ngày không?',
                questionType: 'BOOLEAN',
                points: 0,
                required: true,
                questionOrder: 2
              }
            ]
          },
          {
            sectionName: 'Tiền sử bệnh',
            questions: [
              {
                questionCode: 'FAMILY_HISTORY',
                questionText: 'Có người trong gia đình bị tiểu đường không?',
                questionType: 'BOOLEAN',
                points: 0,
                required: true,
                questionOrder: 1
              },
              {
                questionCode: 'MEDICATION_DETAILS',
                questionText: 'Nếu có, họ đang dùng thuốc gì?',
                questionType: 'TEXT',
                required: false,
                questionOrder: 2,
                displayCondition: JSON.stringify([{
                  conditionType: 'SHOW',
                  operators: 'AND',
                  conditions: [{
                    targetQuestion: 'FAMILY_HISTORY',
                    operator: 'equals',
                    value: 'true'
                  }]
                }])
              }
            ]
          }
        ],
        scoringRules: {
          riskLevels: [
            { level: 'Thấp', minScore: 0, maxScore: 3, color: '#27ae60' },
            { level: 'Trung bình', minScore: 4, maxScore: 7, color: '#f39c12' },
            { level: 'Cao', minScore: 8, maxScore: 999, color: '#e74c3c' }
          ]
        }
      }
    },
    {
      id: 'covid-screening',
      name: 'Sàng lọc COVID-19',
      icon: <Thermometer size={24} />,
      description: 'Form sàng lọc triệu chứng COVID với logic phức tạp',
      category: 'Khám sàng lọc',
      color: '#9b59b6',
      structure: {
        formName: 'Sàng lọc COVID-19',
        description: 'Phát hiện các triệu chứng nghi ngờ COVID-19',
        category: 'SCREENING',
        sections: [
          {
            sectionName: 'Triệu chứng',
            questions: [
              {
                questionCode: 'HAS_FEVER',
                questionText: 'Bạn có bị sốt không?',
                questionType: 'BOOLEAN',
                required: true,
                questionOrder: 1
              },
              {
                questionCode: 'TEMPERATURE',
                questionText: 'Nhiệt độ cơ thể (°C)',
                questionType: 'NUMBER',
                unit: '°C',
                minValue: 35,
                maxValue: 42,
                required: true,
                questionOrder: 2,
                displayCondition: JSON.stringify([{
                  conditionType: 'SHOW',
                  operators: 'AND',
                  conditions: [{
                    targetQuestion: 'HAS_FEVER',
                    operator: 'equals',
                    value: 'true'
                  }]
                }])
              },
              {
                questionCode: 'SYMPTOMS',
                questionText: 'Các triệu chứng khác (chọn tất cả)',
                questionType: 'MULTIPLE_CHOICE',
                options: 'Ho\nKhó thở\nMệt mỏi\nĐau họng\nMất vị giác/khứu giác\nĐau đầu',
                required: false,
                questionOrder: 3
              }
            ]
          }
        ]
      }
    },
    {
      id: 'pediatric-growth',
      name: 'Theo dõi tăng trưởng trẻ em',
      icon: <Baby size={24} />,
      description: 'Theo dõi cân nặng, chiều cao theo độ tuổi',
      category: 'Nhi khoa',
      color: '#1abc9c',
      structure: {
        formName: 'Theo dõi tăng trưởng trẻ em',
        description: 'Đánh giá phát triển thể chất trẻ em',
        category: 'PEDIATRIC',
        sections: [
          {
            sectionName: 'Thông tin trẻ',
            questions: [
              {
                questionCode: 'CHILD_DOB',
                questionText: 'Ngày sinh',
                questionType: 'DATE',
                required: true,
                questionOrder: 1
              },
              {
                questionCode: 'CHILD_WEIGHT',
                questionText: 'Cân nặng hiện tại',
                questionType: 'NUMBER',
                unit: 'kg',
                minValue: 2,
                maxValue: 100,
                required: true,
                questionOrder: 2
              },
              {
                questionCode: 'CHILD_HEIGHT',
                questionText: 'Chiều cao hiện tại',
                questionType: 'NUMBER',
                unit: 'cm',
                minValue: 40,
                maxValue: 200,
                required: true,
                questionOrder: 3
              }
            ]
          }
        ],
        calculations: [
          {
            type: 'AGE_FROM_DOB',
            outputField: 'CHILD_AGE_MONTHS',
            config: { dateField: 'CHILD_DOB' }
          }
        ]
      }
    },
    {
      id: 'cardiovascular-risk',
      name: 'Đánh giá rủi ro Tim mạch',
      icon: <Heart size={24} />,
      description: 'Tính điểm rủi ro tim mạch dựa trên nhiều yếu tố',
      category: 'Đánh giá rủi ro',
      color: '#e91e63',
      structure: {
        formName: 'Đánh giá rủi ro Tim mạch',
        description: 'Framingham Risk Score simplified',
        category: 'RISK_ASSESSMENT',
        sections: [
          {
            sectionName: 'Yếu tố nguy cơ',
            questions: [
              {
                questionCode: 'AGE',
                questionText: 'Tuổi',
                questionType: 'NUMBER',
                minValue: 18,
                maxValue: 120,
                required: true,
                questionOrder: 1
              },
              {
                questionCode: 'SMOKING',
                questionText: 'Bạn có hút thuốc không?',
                questionType: 'BOOLEAN',
                required: true,
                questionOrder: 2
              },
              {
                questionCode: 'BLOOD_PRESSURE',
                questionText: 'Huyết áp tâm thu (mmHg)',
                questionType: 'NUMBER',
                unit: 'mmHg',
                minValue: 80,
                maxValue: 200,
                required: true,
                questionOrder: 3
              },
              {
                questionCode: 'CHOLESTEROL',
                questionText: 'Cholesterol toàn phần (mg/dL)',
                questionType: 'NUMBER',
                unit: 'mg/dL',
                minValue: 100,
                maxValue: 400,
                required: true,
                questionOrder: 4
              }
            ]
          }
        ]
      }
    }
  ];
  
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template.id);
    if (onSelectTemplate) {
      onSelectTemplate(template.structure);
    }
  };
  
  return (
    <div className="form-templates">
      <div className="templates-header">
        <h3><FileText size={20} /> Mẫu Form có sẵn</h3>
        <p className="subtitle">Chọn mẫu để tạo form nhanh chóng với logic có sẵn</p>
      </div>
      
      <div className="templates-grid">
        {templates.map(template => (
          <div 
            key={template.id} 
            className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
            onClick={() => handleSelectTemplate(template)}
          >
            <div className="template-icon" style={{ backgroundColor: template.color }}>
              {template.icon}
            </div>
            <div className="template-content">
              <h4>{template.name}</h4>
              <span className="category-badge">{template.category}</span>
              <p className="description">{template.description}</p>
            </div>
            <div className="template-footer">
              <Button 
                variant="primary" 
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectTemplate(template);
                }}
              >
                Sử dụng mẫu này
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormTemplates;
