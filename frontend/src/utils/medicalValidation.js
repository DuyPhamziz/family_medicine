/**
 * Medical validation rules for Vietnamese medical forms
 * Defines valid ranges, warning thresholds, and validation patterns
 */

// Medical value ranges: { min, max, warning: { min, max }, unit }
export const MEDICAL_RANGES = {
  // Huyết áp
  BLOOD_PRESSURE_SYSTOLIC: {
    min: 70,
    max: 250,
    warning: { min: 90, max: 140 },
    unit: 'mmHg',
    name: 'Huyết áp tâm thu',
    severity: 'critical'
  },
  BLOOD_PRESSURE_DIASTOLIC: {
    min: 40,
    max: 150,
    warning: { min: 60, max: 90 },
    unit: 'mmHg',
    name: 'Huyết áp tâm trương',
    severity: 'critical'
  },

  // Đường huyết
  GLUCOSE: {
    min: 0,
    max: 600,
    warning: { min: 70, max: 180 },
    unit: 'mg/dL',
    name: 'Đường huyết',
    severity: 'critical'
  },
  GLUCOSE_MMOL: {
    min: 0,
    max: 33.3,
    warning: { min: 3.9, max: 10 },
    unit: 'mmol/L',
    name: 'Đường huyết',
    severity: 'critical'
  },

  // Nhịp tim
  HEART_RATE: {
    min: 30,
    max: 220,
    warning: { min: 60, max: 100 },
    unit: 'bpm',
    name: 'Nhịp tim',
    severity: 'high'
  },

  // BMI
  BMI: {
    min: 10,
    max: 60,
    warning: { min: 18.5, max: 24.9 },
    unit: 'kg/m²',
    name: 'Chỉ số BMI',
    severity: 'medium',
    warningText: 'Ngoài phạm vi cân nặng lý tưởng (18.5-24.9)'
  },

  // Cân nặng
  WEIGHT: {
    min: 20,
    max: 250,
    unit: 'kg',
    name: 'Cân nặng',
    severity: 'low'
  },

  // Chiều cao
  HEIGHT: {
    min: 100,
    max: 230,
    unit: 'cm',
    name: 'Chiều cao',
    severity: 'low'
  },

  // Nhiệt độ
  TEMPERATURE: {
    min: 35,
    max: 42,
    warning: { min: 36.5, max: 37.5 },
    unit: '°C',
    name: 'Nhiệt độ',
    severity: 'high'
  },

  // Creatinine (mg/dL)
  CREATININE: {
    min: 0,
    max: 10,
    warning: { min: 0.7, max: 1.3 },
    unit: 'mg/dL',
    name: 'Creatinine',
    severity: 'high'
  },

  // Cholesterol (mg/dL)
  CHOLESTEROL: {
    min: 0,
    max: 500,
    warning: { min: 0, max: 200 },
    unit: 'mg/dL',
    name: 'Cholesterol',
    severity: 'medium'
  },

  // Triglycerides (mg/dL)
  TRIGLYCERIDES: {
    min: 0,
    max: 1000,
    warning: { min: 0, max: 150 },
    unit: 'mg/dL',
    name: 'Triglyceride',
    severity: 'medium'
  },

  // HDL (mg/dL)
  HDL: {
    min: 0,
    max: 100,
    warning: { min: 40, max: 999 },
    unit: 'mg/dL',
    name: 'HDL Cholesterol',
    severity: 'medium'
  },

  // LDL (mg/dL)
  LDL: {
    min: 0,
    max: 300,
    warning: { min: 0, max: 130 },
    unit: 'mg/dL',
    name: 'LDL Cholesterol',
    severity: 'medium'
  },

  // Hemoglobin (g/dL)
  HEMOGLOBIN: {
    min: 5,
    max: 20,
    warning: { min: 13.5, max: 17.5 }, // Nam
    unit: 'g/dL',
    name: 'Hemoglobin',
    severity: 'high'
  },

  // Hematocrit (%)
  HEMATOCRIT: {
    min: 20,
    max: 60,
    warning: { min: 40, max: 54 }, // Nam
    unit: '%',
    name: 'Hematocrit',
    severity: 'high'
  },

  // WBC (10^3/µL)
  WBC: {
    min: 1,
    max: 50,
    warning: { min: 4.5, max: 11 },
    unit: '10^3/µL',
    name: 'WBC',
    severity: 'high'
  },

  // Platelets (10^3/µL)
  PLATELETS: {
    min: 10,
    max: 1000,
    warning: { min: 150, max: 400 },
    unit: '10^3/µL',
    name: 'Tiểu cầu',
    severity: 'high'
  },

  // Tuổi
  AGE: {
    min: 0,
    max: 150,
    unit: 'năm',
    name: 'Tuổi'
  }
};

/**
 * Validation result object
 */
export const createValidationResult = (isValid, message = '', severity = 'info') => ({
  isValid,
  message,
  severity // 'info', 'warning', 'error'
});

/**
 * Validate a numeric value against medical ranges
 * @param {number} value - The value to validate
 * @param {string} validationKey - Key from MEDICAL_RANGES
 * @returns {Object} { isValid, message, severity, status }
 */
export const validateMedicalValue = (value, validationKey) => {
  if (value === null || value === undefined || value === '') {
    return createValidationResult(true); // Empty is valid (optional)
  }

  const range = MEDICAL_RANGES[validationKey];
  if (!range) {
    return createValidationResult(true); // Unknown key, skip validation
  }

  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    return createValidationResult(false, `${range.name}: Vui lòng nhập số hợp lệ`, 'error');
  }

  // Check absolute limits
  if (numValue < range.min || numValue > range.max) {
    return createValidationResult(
      false,
      `${range.name}: Giá trị ngoài phạm vi cho phép (${range.min}-${range.max} ${range.unit})`,
      'error'
    );
  }

  // Check warning range
  if (range.warning) {
    const { min: warnMin, max: warnMax } = range.warning;
    if (numValue < warnMin || numValue > warnMax) {
      return createValidationResult(
        true,
        `⚠️ ${range.warningText || `${range.name} bất thường (${warnMin}-${warnMax} ${range.unit})`}`,
        'warning'
      );
    }
  }

  return createValidationResult(true);
};

/**
 * Email validation
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return createValidationResult(true);
  return createValidationResult(
    emailRegex.test(email),
    'Email không hợp lệ',
    'error'
  );
};

/**
 * Phone validation (Vietnamese format)
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^(0|\+?84)[1-9]\d{8,9}$/;
  if (!phone) return createValidationResult(true);
  return createValidationResult(
    phoneRegex.test(phone),
    'Số điện thoại không hợp lệ',
    'error'
  );
};

/**
 * ID card validation (Vietnamese format)
 */
export const validateIDCard = (id) => {
  if (!id) return createValidationResult(true);
  const idRegex = /^\d{9}$|^\d{12}$/; // 9 digits (old) or 12 digits (new)
  return createValidationResult(
    idRegex.test(id),
    'CCCD/CMND không hợp lệ',
    'error'
  );
};

/**
 * Date validation
 */
export const validateDate = (dateString) => {
  if (!dateString) return createValidationResult(true);
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return createValidationResult(false, 'Ngày tháng không hợp lệ', 'error');
  }

  // Check if date is in future
  if (date > new Date()) {
    return createValidationResult(false, 'Ngày không được trong tương lai', 'error');
  }

  return createValidationResult(true);
};

/**
 * Get validation rules for a given field based on metadata
 * Used by admin when creating questions
 */
export const getValidationByFieldType = (fieldType) => {
  const rules = {
    GLUCOSE_MG_DL: MEDICAL_RANGES.GLUCOSE,
    GLUCOSE_MMOL_L: MEDICAL_RANGES.GLUCOSE_MMOL,
    BLOOD_PRESSURE_SYS: MEDICAL_RANGES.BLOOD_PRESSURE_SYSTOLIC,
    BLOOD_PRESSURE_DIA: MEDICAL_RANGES.BLOOD_PRESSURE_DIASTOLIC,
    HEART_RATE: MEDICAL_RANGES.HEART_RATE,
    TEMPERATURE: MEDICAL_RANGES.TEMPERATURE,
    BMI: MEDICAL_RANGES.BMI,
    WEIGHT: MEDICAL_RANGES.WEIGHT,
    HEIGHT: MEDICAL_RANGES.HEIGHT,
    CHOLESTEROL: MEDICAL_RANGES.CHOLESTEROL,
    TRIGLYCERIDES: MEDICAL_RANGES.TRIGLYCERIDES,
    HEMOGLOBIN: MEDICAL_RANGES.HEMOGLOBIN,
    CREATININE: MEDICAL_RANGES.CREATININE
  };

  return rules[fieldType] || null;
};

/**
 * Generate validation message with color coding
 */
export const getValidationStyles = (severity) => {
  const styles = {
    error: 'text-red-600 bg-red-50 border-l-4 border-red-600',
    warning: 'text-yellow-700 bg-yellow-50 border-l-4 border-yellow-600',
    info: 'text-blue-700 bg-blue-50 border-l-4 border-blue-600',
    success: 'text-green-700 bg-green-50 border-l-4 border-green-600'
  };
  return styles[severity] || styles.info;
};

/**
 * Blood pressure classification (Vietnamese guidelines)
 */
export const classifyBloodPressure = (systolic, diastolic) => {
  const sys = parseFloat(systolic);
  const dia = parseFloat(diastolic);

  if (isNaN(sys) || isNaN(dia)) return null;

  if (sys < 120 && dia < 80) return { classification: 'Bình thường', color: 'green' };
  if (sys < 130 && dia < 80) return { classification: 'Elevated', color: 'yellow' };
  if ((sys >= 130 && sys < 140) || (dia >= 80 && dia < 90)) {
    return { classification: 'Cao huyết áp giai đoạn 1', color: 'orange' };
  }
  if (sys >= 140 || dia >= 90) return { classification: 'Cao huyết áp giai đoạn 2', color: 'red' };
  if (sys > 180 || dia > 120) return { classification: 'Crisis (N/A)', color: 'darkred' };

  return null;
};

/**
 * BMI classification (WHO)
 */
export const classifyBMI = (bmi) => {
  const value = parseFloat(bmi);
  if (isNaN(value)) return null;

  if (value < 18.5) return { classification: 'Gầy', color: 'blue' };
  if (value < 25) return { classification: 'Bình thường', color: 'green' };
  if (value < 30) return { classification: 'Thừa cân', color: 'orange' };
  if (value < 35) return { classification: 'Béo phì độ 1', color: 'red' };
  if (value < 40) return { classification: 'Béo phì độ 2', color: 'red' };
  return { classification: 'Béo phì độ 3', color: 'darkred' };
};

export default {
  MEDICAL_RANGES,
  validateMedicalValue,
  validateEmail,
  validatePhone,
  validateIDCard,
  validateDate,
  getValidationByFieldType,
  getValidationStyles,
  classifyBloodPressure,
  classifyBMI
};
