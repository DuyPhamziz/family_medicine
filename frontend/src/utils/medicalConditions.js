/**
 * Medical History utilities
 * Common medical conditions for Vietnamese medical forms
 */

// Common medical conditions grouped by category
export const MEDICAL_CONDITIONS = {
  CARDIOVASCULAR: [
    { id: 'HTN', label: 'Tăng huyết áp (Hypertension)', value: 'high_blood_pressure' },
    { id: 'IHD', label: 'Bệnh tim thiếu máu cơ (Ischemic Heart Disease)', value: 'ischemic_heart_disease' },
    { id: 'AF', label: 'Rối loạn nhịp tim (Atrial Fibrillation)', value: 'atrial_fibrillation' },
    { id: 'CVA', label: 'Đột quỵ (Stroke/CVA)', value: 'stroke' },
    { id: 'CHF', label: 'Suy tim (Heart Failure)', value: 'heart_failure' },
  ],
  ENDOCRINE: [
    { id: 'DM1', label: 'Bệnh tiểu đường type 1', value: 'diabetes_type_1' },
    { id: 'DM2', label: 'Bệnh tiểu đường type 2', value: 'diabetes_type_2' },
    { id: 'HYP', label: 'Rối loạn tuyến giáp (Thyroid disorder)', value: 'thyroid_disorder' },
  ],
  RESPIRATORY: [
    { id: 'COPD', label: 'Bệnh phổi tắc nghẽn mạn tính (COPD)', value: 'copd' },
    { id: 'ASTHMA', label: 'Hen suyễn (Asthma)', value: 'asthma' },
    { id: 'TB', label: 'Lao (Tuberculosis)', value: 'tuberculosis' },
  ],
  HEPATIC: [
    { id: 'CIRRHOSIS', label: 'Xơ gan (Liver Cirrhosis)', value: 'liver_cirrhosis' },
    { id: 'HEPATITIS', label: 'Viêm gan (Hepatitis)', value: 'hepatitis' },
  ],
  RENAL: [
    { id: 'CKD', label: 'Bệnh thận mạn tính (Chronic Kidney Disease)', value: 'chronic_kidney_disease' },
    { id: 'ESRD', label: 'Suy thận cuối kỳ (ESRD)', value: 'end_stage_renal_disease' },
  ],
  NEUROLOGICAL: [
    { id: 'EPILEPSY', label: 'Động kinh (Epilepsy)', value: 'epilepsy' },
    { id: 'PD', label: 'Bệnh Parkinson', value: 'parkinsons' },
    { id: 'DEMENTIA', label: 'Mất trí nhớ (Dementia)', value: 'dementia' },
  ],
  PSYCHIATRIC: [
    { id: 'DEPRESSION', label: 'Trầm cảm (Depression)', value: 'depression' },
    { id: 'ANXIETY', label: 'Lo âu (Anxiety)', value: 'anxiety' },
    { id: 'BIPOLAR', label: 'Rối loạn lưỡng cực (Bipolar Disorder)', value: 'bipolar_disorder' },
  ],
  CANCER: [
    { id: 'CANCER_GI', label: 'Ung thư đường tiêu hóa', value: 'gastrointestinal_cancer' },
    { id: 'CANCER_LUNG', label: 'Ung thư phổi (Lung Cancer)', value: 'lung_cancer' },
    { id: 'CANCER_BREAST', label: 'Ung thư vú (Breast Cancer)', value: 'breast_cancer' },
    { id: 'CANCER_OTHER', label: 'Ung thư khác', value: 'other_cancer' },
  ],
  MUSCULOSKELETAL: [
    { id: 'ARTHRITIS', label: 'Viêm khớp (Arthritis)', value: 'arthritis' },
    { id: 'OSTEOPOROSIS', label: 'Loãng xương (Osteoporosis)', value: 'osteoporosis' },
    { id: 'BACK_PAIN', label: 'Đau lưng (Back Pain)', value: 'back_pain' },
  ],
  ALLERGIES: [
    { id: 'FOOD_ALLERGY', label: 'Dị ứng thức ăn (Food Allergy)', value: 'food_allergy' },
    { id: 'DRUG_ALLERGY', label: 'Dị ứng thuốc (Drug Allergy)', value: 'drug_allergy' },
    { id: 'ENVIRONMENTAL', label: 'Dị ứng môi trường (Environmental Allergy)', value: 'environmental_allergy' },
  ],
  OTHER: [
    { id: 'BLEEDING', label: 'Rối loạn chảy máu (Bleeding Disorder)', value: 'bleeding_disorder' },
    { id: 'INFECTION', label: 'Bệnh nhiễm trùng HIV/AIDS', value: 'hiv_aids' },
  ]
};

/**
 * Flatten all conditions into a single array
 * @returns {Array} Array of all conditions
 */
export const getAllConditions = () => {
  const allConditions = [];
  Object.values(MEDICAL_CONDITIONS).forEach(category => {
    allConditions.push(...category);
  });
  return allConditions;
};

/**
 * Get condition by ID
 * @param {string} conditionId - Condition ID
 * @returns {Object | null} Condition object or null
 */
export const getConditionById = (conditionId) => {
  for (const category of Object.values(MEDICAL_CONDITIONS)) {
    const found = category.find(c => c.id === conditionId);
    if (found) return found;
  }
  return null;
};

/**
 * Get condition category
 * @param {string} conditionId - Condition ID
 * @returns {string | null} Category name or null
 */
export const getConditionCategory = (conditionId) => {
  for (const [category, conditions] of Object.entries(MEDICAL_CONDITIONS)) {
    if (conditions.some(c => c.id === conditionId)) {
      return category;
    }
  }
  return null;
};

/**
 * Format medical history for display
 * @param {Array} selectedConditions - Array of selected condition IDs
 * @returns {string} Formatted string
 */
export const formatMedicalHistory = (selectedConditions) => {
  if (!selectedConditions || selectedConditions.length === 0) {
    return 'Không có tiền sử bệnh';
  }
  
  const labels = selectedConditions
    .map(id => {
      const condition = getConditionById(id);
      return condition ? condition.label : id;
    })
    .filter(Boolean);
  
  return labels.join('; ');
};

export default {
  MEDICAL_CONDITIONS,
  getAllConditions,
  getConditionById,
  getConditionCategory,
  formatMedicalHistory,
};
