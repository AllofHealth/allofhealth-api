import {
  formatDateToReadable,
  formatDateToStandard,
  calculateAge,
} from './date.utils';

describe('Date Utils', () => {
  describe('formatDateToReadable', () => {
    it('should format date to readable format with ordinal suffix', () => {
      const testDate = new Date('2025-02-24');
      const result = formatDateToReadable(testDate);
      expect(result).toBe('24th February, 2025');
    });

    it('should handle 1st correctly', () => {
      const testDate = new Date('2025-01-01');
      const result = formatDateToReadable(testDate);
      expect(result).toBe('1st January, 2025');
    });

    it('should handle 2nd correctly', () => {
      const testDate = new Date('2025-01-02');
      const result = formatDateToReadable(testDate);
      expect(result).toBe('2nd January, 2025');
    });

    it('should handle 3rd correctly', () => {
      const testDate = new Date('2025-01-03');
      const result = formatDateToReadable(testDate);
      expect(result).toBe('3rd January, 2025');
    });

    it('should handle 11th, 12th, 13th correctly (special cases)', () => {
      const testDate11 = new Date('2025-01-11');
      const testDate12 = new Date('2025-01-12');
      const testDate13 = new Date('2025-01-13');

      expect(formatDateToReadable(testDate11)).toBe('11th January, 2025');
      expect(formatDateToReadable(testDate12)).toBe('12th January, 2025');
      expect(formatDateToReadable(testDate13)).toBe('13th January, 2025');
    });

    it('should handle 21st, 22nd, 23rd correctly', () => {
      const testDate21 = new Date('2025-01-21');
      const testDate22 = new Date('2025-01-22');
      const testDate23 = new Date('2025-01-23');

      expect(formatDateToReadable(testDate21)).toBe('21st January, 2025');
      expect(formatDateToReadable(testDate22)).toBe('22nd January, 2025');
      expect(formatDateToReadable(testDate23)).toBe('23rd January, 2025');
    });

    it('should handle string input', () => {
      const result = formatDateToReadable('2025-12-25');
      expect(result).toBe('25th December, 2025');
    });

    it('should throw error for invalid date string', () => {
      expect(() => formatDateToReadable('invalid-date')).toThrow(
        'Invalid date provided',
      );
    });

    it('should throw error for invalid date object', () => {
      const invalidDate = new Date('invalid');
      expect(() => formatDateToReadable(invalidDate)).toThrow(
        'Invalid date provided',
      );
    });
  });

  describe('formatDateToStandard', () => {
    it('should format date to DD/MM/YYYY format', () => {
      const testDate = new Date('2025-02-24');
      const result = formatDateToStandard(testDate);
      expect(result).toBe('24/02/2025');
    });

    it('should pad single digit days and months', () => {
      const testDate = new Date('2025-01-05');
      const result = formatDateToStandard(testDate);
      expect(result).toBe('05/01/2025');
    });

    it('should handle string input', () => {
      const result = formatDateToStandard('2025-12-25');
      expect(result).toBe('25/12/2025');
    });

    it('should throw error for invalid date string', () => {
      expect(() => formatDateToStandard('invalid-date')).toThrow(
        'Invalid date provided',
      );
    });

    it('should throw error for invalid date object', () => {
      const invalidDate = new Date('invalid');
      expect(() => formatDateToStandard(invalidDate)).toThrow(
        'Invalid date provided',
      );
    });
  });

  describe('calculateAge', () => {
    it('should calculate correct age for birthday that has passed this year', () => {
      // Mock current date to 2025-06-15
      const mockDate = new Date('2025-06-15');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const dateOfBirth = new Date('2003-01-15');
      const result = calculateAge(dateOfBirth);
      expect(result).toBe('22 years');

      jest.restoreAllMocks();
    });

    it('should calculate correct age for birthday that has not passed this year', () => {
      // Mock current date to 2025-06-15
      const mockDate = new Date('2025-06-15');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const dateOfBirth = new Date('2003-08-15');
      const result = calculateAge(dateOfBirth);
      expect(result).toBe('21 years');

      jest.restoreAllMocks();
    });

    it('should calculate correct age for birthday today', () => {
      // Mock current date to 2025-06-15
      const mockDate = new Date('2025-06-15');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const dateOfBirth = new Date('2003-06-15');
      const result = calculateAge(dateOfBirth);
      expect(result).toBe('22 years');

      jest.restoreAllMocks();
    });

    it('should handle string input for date of birth', () => {
      // Mock current date to 2025-06-15
      const mockDate = new Date('2025-06-15');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const result = calculateAge('2000-01-01');
      expect(result).toBe('25 years');

      jest.restoreAllMocks();
    });

    it('should handle newborn (0 years)', () => {
      // Mock current date to 2025-06-15
      const mockDate = new Date('2025-06-15');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const dateOfBirth = new Date('2025-03-15');
      const result = calculateAge(dateOfBirth);
      expect(result).toBe('0 years');

      jest.restoreAllMocks();
    });

    it('should throw error for invalid date of birth string', () => {
      expect(() => calculateAge('invalid-date')).toThrow(
        'Invalid date of birth provided',
      );
    });

    it('should throw error for invalid date of birth object', () => {
      const invalidDate = new Date('invalid');
      expect(() => calculateAge(invalidDate)).toThrow(
        'Invalid date of birth provided',
      );
    });
  });
});
