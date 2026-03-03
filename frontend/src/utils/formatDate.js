/**
 * Vietnamese date formatting utilities
 * Supports various date formats for Vietnamese locale
 */

/**
 * Format date to Vietnamese format: dd/MM/yyyy
 * @param {string | Date} date - ISO date string or Date object
 * @returns {string} Formatted date string (dd/MM/yyyy)
 */
export const formatToVietnamese = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format date with full month name: dd tháng MM, yyyy
 * @param {string | Date} date - ISO date string or Date object
 * @returns {string} Formatted date string (e.g., "03 tháng 03, 2026")
 */
export const formatVietnameseLong = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();
    
    return `${day} tháng ${month}, ${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format date with full Vietnamese month name: dd Tháng Giêng, yyyy
 * @param {string | Date} date - ISO date string or Date object
 * @returns {string} Formatted date string (e.g., "03 Tháng Ba, 2026")
 */
export const formatVietnameseFullMonth = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    const monthNames = [
      'Tháng Một',
      'Tháng Hai',
      'Tháng Ba',
      'Tháng Tư',
      'Tháng Năm',
      'Tháng Sáu',
      'Tháng Bảy',
      'Tháng Tám',
      'Tháng Chín',
      'Tháng Mười',
      'Tháng Mười Một',
      'Tháng Mười Hai'
    ];
    
    const day = dateObj.getDate();
    const monthName = monthNames[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    
    return `${day} ${monthName}, ${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Parse Vietnamese date string to Date object
 * Supports formats: dd/MM/yyyy
 * @param {string} dateString - Vietnamese date string (dd/MM/yyyy)
 * @returns {Date | null} Date object or null if invalid
 */
export const parseVietnameseDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    const date = new Date(year, month - 1, day);
    
    // Validate the date
    if (isNaN(date.getTime()) || 
        date.getDate() !== day || 
        date.getMonth() !== month - 1 || 
        date.getFullYear() !== year) {
      return null;
    }
    
    return date;
  } catch (error) {
    console.error('Error parsing Vietnamese date:', error);
    return null;
  }
};

/**
 * Convert ISO date string (YYYY-MM-DD) to HTML input date value
 * @param {string} isoDate - ISO date string (YYYY-MM-DD)
 * @returns {string} HTML input date value (YYYY-MM-DD)
 */
export const toDateInputValue = (isoDate) => {
  if (!isoDate) return '';
  
  try {
    // If it's already YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
      return isoDate;
    }
    
    const dateObj = typeof isoDate === 'string' ? new Date(isoDate) : isoDate;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error converting to date input value:', error);
    return '';
  }
};

/**
 * Get age from birth date (for age calculation)
 * @param {string | Date} birthDate - Birth date
 * @returns {number} Age in years
 */
export const getAgeFromDate = (birthDate) => {
  if (!birthDate) return null;
  
  try {
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    
    if (isNaN(birth.getTime())) {
      return null;
    }
    
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age >= 0 ? age : null;
  } catch (error) {
    console.error('Error calculating age:', error);
    return null;
  }
};

/**
 * Export default as formatToVietnamese
 */
export default formatToVietnamese;
