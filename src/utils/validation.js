export const validateAcademicYear = (academicYear) => {
  if (!academicYear || !academicYear.match(/^\d{4}-\d{4}$/)) {
    return 'Academic year must be in YYYY-YYYY format (e.g. 2024-2025).';
  }

  const firstYear = parseInt(academicYear.substring(0, 4), 10);
  const secondYear = parseInt(academicYear.substring(5, 9), 10);

  if (secondYear !== firstYear + 1) {
    return 'Second year must be exactly first year + 1 (e.g. 2024-2025).';
  }

  if (firstYear < 2020 || firstYear > 2035) {
    return 'Academic year must be between 2020 and 2035.';
  }

  return null;
};
