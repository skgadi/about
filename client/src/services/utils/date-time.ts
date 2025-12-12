export const displayDateTime = (dateTimeStr: string | null | undefined | Date): string => {
  if (!dateTimeStr) {
    return '';
  }
  const dateObj = new Date(dateTimeStr);
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  return dateObj.toLocaleString();
};
