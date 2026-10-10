function getDateFromDuration(duration) {
  const date = new Date();

  switch (duration) {
    case 'day':
      date.setDate(date.getDate() - 1);
      break;
    case 'week':
      date.setDate(date.getDate() - 7);
      break;
    case 'month':
      date.setMonth(date.getMonth() - 1);
      break;
    case 'year':
      date.setFullYear(date.getFullYear() - 1);
      break;
    default:
      date.setDate(date.getDate() - 7); // Padrão: última semana
  }

  return date.toISOString().split('T')[0];
}

module.exports = { getDateFromDuration };