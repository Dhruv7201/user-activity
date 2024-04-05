// DateUtils.js
const formatNumericDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const isCurrentMonth = (selectedDate) => {
  const today = new Date();
  return (
    selectedDate.getMonth() === today.getMonth() &&
    selectedDate.getFullYear() === today.getFullYear()
  );
};

export { formatNumericDate, isCurrentMonth };
