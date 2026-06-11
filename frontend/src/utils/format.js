// formatPrice has been moved to CurrencyContext (useCurrency hook)
// to support dynamic multi-currency conversions.
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};
