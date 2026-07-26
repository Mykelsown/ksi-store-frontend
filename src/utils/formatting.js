/**
 * Utility functions for consistent data formatting across the application
 */

/**
 * Format currency in Nigerian Naira
 * @param {number} amount - The amount to format
 * @param {boolean} showDecimals - Whether to show decimal places (default: true)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, showDecimals = true) => {
  const num = Number(amount) || 0;
  return num.toLocaleString(undefined, {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });
};

/**
 * Format price with Naira symbol
 * @param {number} price - The price to format
 * @param {boolean} showDecimals - Whether to show decimal places (default: false)
 * @returns {string} Formatted price with ₦ symbol
 */
export const formatPrice = (price, showDecimals = false) => {
  return `₦${formatCurrency(price, showDecimals)}`;
};

/**
 * Format rating with stars
 * @param {number} rating - The rating value (0-5)
 * @returns {string} Star representation
 */
export const formatRating = (rating) => {
  const rate = Math.floor(rating || 0);
  return "★".repeat(rate) + "☆".repeat(5 - rate);
};

/**
 * Format date to readable format
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

/**
 * Get first 8 characters of ID
 * @param {string} id - The ID to truncate
 * @returns {string} First 8 characters with # prefix
 */
export const formatOrderId = (id) => {
  return `#${(id || "N/A").slice(0, 8)}`;
};

/**
 * Format product name for display (truncate if too long)
 * @param {string} name - The product name
 * @param {number} maxLength - Maximum length (default: 50)
 * @returns {string} Formatted product name
 */
export const formatProductName = (name, maxLength = 50) => {
  if (!name) return "Product";
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength) + "...";
};

/**
 * Format brand name with fallback
 * @param {string} brand - The brand name
 * @returns {string} Formatted brand name
 */
export const formatBrand = (brand) => {
  return brand || "KSI";
};

/**
 * Format stock status
 * @param {number} stock - The stock amount
 * @returns {string} Formatted stock status
 */
export const formatStockStatus = (stock, lowStockThreshold = 10) => {
  const stck = Number(stock) || 0;
  if (stck <= 0) return "✗ Out of stock";
  if (stck <= lowStockThreshold) return `⚠ Only ${stck} left`;
  return `✓ ${stck} in stock`;
};

/**
 * Classify stock level for styling purposes
 * @param {number} stock - Current stock quantity
 * @param {number} lowStockThreshold - Threshold below which stock is "low"
 * @returns {"out"|"low"|"ok"} Stock status class
 */
export const getStockStatusClass = (stock, lowStockThreshold = 10) => {
  const stck = Number(stock) || 0;
  if (stck <= 0) return "out";
  if (stck <= lowStockThreshold) return "low";
  return "ok";
};

/**
 * Format review count
 * @param {number} count - The review count
 * @returns {string} Formatted review count
 */
export const formatReviewCount = (count) => {
  const cnt = Number(count) || 0;
  return `${cnt.toLocaleString()} review${cnt === 1 ? "" : "s"}`;
};

/**
 * Format quantity with label
 * @param {number} qty - The quantity
 * @returns {string} Formatted quantity
 */
export const formatQuantity = (qty) => {
  return `Qty: ${Number(qty) || 1}`;
};
