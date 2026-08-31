import { describe, it, expect } from 'vitest'
import { formatLocalDateTime, formatLocalTime, formatLocalDate, formatDateOnly } from '../date'

describe('date utilities', () => {
  describe('formatLocalDateTime', () => {
    it('formats ISO string to local date and time', () => {
    const result = formatLocalDateTime('2026-08-31T10:00:00.000Z')
    // Проверяем наличие даты и времени независимо от разделителя
    expect(result).toMatch(/\d{2}\.\d{2}\.\d{4}/) // дата
    expect(result).toMatch(/\d{2}:\d{2}/) // время
    })

    it('returns "—" for empty input', () => {
      expect(formatLocalDateTime('')).toBe('—')
      expect(formatLocalDateTime(null)).toBe('—')
      expect(formatLocalDateTime(undefined)).toBe('—')
    })

    it('returns "—" for invalid date', () => {
      expect(formatLocalDateTime('invalid')).toBe('—')
    })

    it('respects custom options', () => {
    const result = formatLocalDateTime('2026-08-31T10:00:00.000Z', { hour12: false })
    expect(result).toMatch(/\d{2}\.\d{2}\.\d{4}/)
    expect(result).toMatch(/\d{2}:\d{2}/)
    })
  })

  describe('formatLocalTime', () => {
    it('formats ISO string to local time only', () => {
      const result = formatLocalTime('2026-08-31T10:00:00.000Z')
      expect(result).toMatch(/\d{2}:\d{2}/)
    })

    it('returns "—" for empty input', () => {
      expect(formatLocalTime('')).toBe('—')
      expect(formatLocalTime(null)).toBe('—')
    })
  })

  describe('formatLocalDate', () => {
    it('formats ISO string to local date only', () => {
      const result = formatLocalDate('2026-08-31T10:00:00.000Z')
      expect(result).toMatch(/\d{2}\.\d{2}\.\d{4}/)
    })

    it('returns "—" for empty input', () => {
      expect(formatLocalDate('')).toBe('—')
    })
  })

  describe('formatDateOnly', () => {
    it('formats YYYY-MM-DD to DD.MM.YYYY', () => {
      expect(formatDateOnly('2026-08-31')).toBe('31.08.2026')
    })

    it('returns "—" for empty input', () => {
      expect(formatDateOnly('')).toBe('—')
      expect(formatDateOnly(null)).toBe('—')
    })

    it('returns original string for invalid format', () => {
      expect(formatDateOnly('2026/08/31')).toBe('2026/08/31')
    })
  })
})