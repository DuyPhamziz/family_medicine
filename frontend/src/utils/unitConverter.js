/**
 * Unit conversion utilities for medical/clinical data
 * Supports common conversions for glucose, creatinine, BMI, temperature, weight, height, etc.
 */

/**
 * Unit conversion configurations
 * Format: { from: string, to: string, factor: number, formula?: function, inverse?: function }
 */
export const UNIT_CONVERSIONS = {
  // Glucose conversions
  'mg/dL_mmol/L': {
    from: 'mg/dL',
    to: 'mmol/L',
    factor: 0.0555,
    description: 'Glucose: mg/dL → mmol/L'
  },
  'mmol/L_mg/dL': {
    from: 'mmol/L',
    to: 'mg/dL',
    factor: 18.0182,
    description: 'Glucose: mmol/L → mg/dL'
  },

  // Creatinine conversions (common)
  'mg/dL_μmol/L': {
    from: 'mg/dL',
    to: 'μmol/L',
    factor: 88.4,
    description: 'Creatinine: mg/dL → μmol/L'
  },
  'μmol/L_mg/dL': {
    from: 'μmol/L',
    to: 'mg/dL',
    factor: 0.01131,
    description: 'Creatinine: μmol/L → mg/dL'
  },

  // Cholesterol conversions
  'mg/dL_mmol/L_chol': {
    from: 'mg/dL',
    to: 'mmol/L',
    factor: 0.02586,
    description: 'Cholesterol: mg/dL → mmol/L'
  },
  'mmol/L_mg/dL_chol': {
    from: 'mmol/L',
    to: 'mg/dL',
    factor: 38.67,
    description: 'Cholesterol: mmol/L → mg/dL'
  },

  // Weight conversions
  'kg_lbs': {
    from: 'kg',
    to: 'lbs',
    factor: 2.20462,
    description: 'Weight: kg → lbs'
  },
  'lbs_kg': {
    from: 'lbs',
    to: 'kg',
    factor: 0.453592,
    description: 'Weight: lbs → kg'
  },
  'kg_g': {
    from: 'kg',
    to: 'g',
    factor: 1000,
    description: 'Weight: kg → g'
  },
  'g_kg': {
    from: 'g',
    to: 'kg',
    factor: 0.001,
    description: 'Weight: g → kg'
  },

  // Height conversions
  'cm_inches': {
    from: 'cm',
    to: 'inches',
    factor: 0.393701,
    description: 'Height: cm → inches'
  },
  'inches_cm': {
    from: 'inches',
    to: 'cm',
    factor: 2.54,
    description: 'Height: inches → cm'
  },
  'cm_m': {
    from: 'cm',
    to: 'm',
    factor: 0.01,
    description: 'Height: cm → m'
  },
  'm_cm': {
    from: 'm',
    to: 'cm',
    factor: 100,
    description: 'Height: m → cm'
  },

  // Temperature conversions
  'C_F': {
    from: '°C',
    to: '°F',
    formula: (value) => (value * 9/5) + 32,
    description: 'Temperature: °C → °F'
  },
  'F_C': {
    from: '°F',
    to: '°C',
    formula: (value) => (value - 32) * 5/9,
    description: 'Temperature: °F → °C'
  },

  // Blood Pressure (mmHg is standard)
  'mmHg_kPa': {
    from: 'mmHg',
    to: 'kPa',
    factor: 0.133322,
    description: 'Blood Pressure: mmHg → kPa'
  },
  'kPa_mmHg': {
    from: 'kPa',
    to: 'mmHg',
    factor: 7.50062,
    description: 'Blood Pressure: kPa → mmHg'
  },

  // Hemoglobin conversions
  'g/dL_mmol/L_hgb': {
    from: 'g/dL',
    to: 'mmol/L',
    factor: 0.6206,
    description: 'Hemoglobin: g/dL → mmol/L'
  },
  'mmol/L_g/dL_hgb': {
    from: 'mmol/L',
    to: 'g/dL',
    factor: 1.6114,
    description: 'Hemoglobin: mmol/L → g/dL'
  },

  // Triglycerides conversions
  'mg/dL_mmol/L_trig': {
    from: 'mg/dL',
    to: 'mmol/L',
    factor: 0.01129,
    description: 'Triglycerides: mg/dL → mmol/L'
  },
  'mmol/L_mg/dL_trig': {
    from: 'mmol/L',
    to: 'mg/dL',
    factor: 88.57,
    description: 'Triglycerides: mmol/L → mg/dL'
  },
};

/**
 * Get available conversion options for a unit
 * @param {string} unit - The source unit
 * @returns {Array} Array of available conversions
 */
export const getAvailableConversions = (unit) => {
  return Object.values(UNIT_CONVERSIONS).filter(
    conv => conv.from === unit
  );
};

/**
 * Convert value from one unit to another
 * @param {number} value - The value to convert
 * @param {string} fromUnit - Source unit
 * @param {string} toUnit - Target unit
 * @returns {number | null} Converted value or null if conversion not found
 */
export const convertValue = (value, fromUnit, toUnit) => {
  if (!value && value !== 0) return null;
  if (fromUnit === toUnit) return value;

  const conversionKey = `${fromUnit}_${toUnit}`;
  const conversion = UNIT_CONVERSIONS[conversionKey];

  if (!conversion) {
    console.warn(`Conversion not found: ${conversionKey}`);
    return null;
  }

  try {
    let result;
    if (conversion.formula) {
      result = conversion.formula(parseFloat(value));
    } else if (conversion.factor) {
      result = parseFloat(value) * conversion.factor;
    } else {
      return null;
    }

    // Round to 2-4 decimal places depending on value size
    return Number(result.toFixed(value > 100 ? 2 : 4));
  } catch (error) {
    console.error(`Error converting ${value} from ${fromUnit} to ${toUnit}:`, error);
    return null;
  }
};

/**
 * Format converted value for display
 * @param {number} value - The value to format
 * @param {string} toUnit - Target unit
 * @returns {string} Formatted value with unit
 */
export const formatConvertedValue = (value, toUnit) => {
  if (!value && value !== 0) return '';
  
  const rounded = Number(value).toFixed(value > 100 ? 2 : 4).replace(/\.?0+$/, '');
  return `${rounded} ${toUnit}`;
};

/**
 * Get unit display label for medical purposes
 * @param {string} unit - Unit code
 * @returns {string} Display label
 */
export const getUnitLabel = (unit) => {
  const labels = {
    'mg/dL': 'mg/dL (miligram/deci-lít)',
    'mmol/L': 'mmol/L (millimol/lít)',
    'μmol/L': 'μmol/L (micromol/lít)',
    'g/dL': 'g/dL (gram/deci-lít)',
    'kg': 'kg (kilogram)',
    'lbs': 'lbs (pound)',
    'cm': 'cm (centimet)',
    'inches': 'inches (inch)',
    'm': 'm (mét)',
    '°C': '°C (độ Celsius)',
    '°F': '°F (độ Fahrenheit)',
    'mmHg': 'mmHg (millimet thủy ngân)',
    'kPa': 'kPa (kiloPascal)',
  };
  
  return labels[unit] || unit;
};

export default {
  UNIT_CONVERSIONS,
  getAvailableConversions,
  convertValue,
  formatConvertedValue,
  getUnitLabel,
};
