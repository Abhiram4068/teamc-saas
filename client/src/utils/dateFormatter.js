export const formatDate = (dateString, fallback = '--') => {
  if (!dateString) return fallback;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return fallback;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

export const formatDateTime = (dateString, fallback = '--') => {
  if (!dateString) return fallback;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return fallback;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};
