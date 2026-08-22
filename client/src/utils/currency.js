/**
 * Indian locale currency and phone formatters
 */

/**
 * Format a number as Indian Rupees (₹)
 * e.g. 984000 → ₹9,84,000
 */
export const formatINR = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

/**
 * Format a number as Indian Rupees with no symbol prefix, just commas
 * e.g. 984000 → 9,84,000
 */
export const formatINRNum = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '0';
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

/**
 * Quick helper to display ₹ + Indian formatted number
 */
export const rupee = (amount) => `₹${formatINRNum(amount)}`;
