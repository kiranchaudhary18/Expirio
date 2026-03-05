// Utility functions for the Expirio backend

/**
 * Calculate expiry status based on expiry date and reminder days
 * @param {Date} expiryDate - The date when item expires
 * @param {Number} reminderDays - Number of days before expiry to show reminder
 * @returns {String} - Status: 'expired', 'expiringSoon', or 'safe'
 */
const calculateExpiryStatus = (expiryDate, reminderDays = 1) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  if (expiry < today) {
    return 'expired';
  }

  const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry <= reminderDays) {
    return 'expiringSoon';
  }

  return 'safe';
};

/**
 * Calculate days until expiry
 * @param {Date} expiryDate - The date when item expires
 * @returns {Number} - Number of days until expiry
 */
const daysUntilExpiry = (expiryDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const timeDiff = expiry - today;
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};

/**
 * Format date to ISO string
 * @param {Date} date - Date to format
 * @returns {String} - Formatted date
 */
const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

/**
 * Calculate renewal status
 * @param {Date} renewalDate - The date of renewal
 * @param {Number} reminderDays - Number of days before renewal to show reminder
 * @returns {String} - Status: 'upcoming' or 'active'
 */
const calculateRenewalStatus = (renewalDate, reminderDays = 1) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const renewal = new Date(renewalDate);
  renewal.setHours(0, 0, 0, 0);

  const daysUntilRenewal = Math.ceil((renewal - today) / (1000 * 60 * 60 * 24));

  if (daysUntilRenewal <= reminderDays && daysUntilRenewal >= 0) {
    return 'upcoming';
  }

  return 'active';
};

module.exports = {
  calculateExpiryStatus,
  daysUntilExpiry,
  formatDate,
  calculateRenewalStatus
};
