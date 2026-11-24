import { describe, expect, it } from 'vitest';
import { flagResult, formatResult, glucoseMgDlToMmolL, hba1cPercentToMmolMol } from '../src/index.js';

describe('hba1cPercentToMmolMol', () => {
  it.each([
    [5.0, 31],
    [5.7, 39],
    [6.5, 48],
    [7.0, 53],
    [10.0, 86],
  ])('converts %s %% to %s mmol/mol', (percent, mmolMol) => {
    expect(hba1cPercentToMmolMol(percent)).toBe(mmolMol);
  });

  it.each([2.9, 20.1, Number.NaN, Number.POSITIVE_INFINITY])('rejects %s', (percent) => {
    expect(() => hba1cPercentToMmolMol(percent)).toThrow(RangeError);
  });
});

describe('glucoseMgDlToMmolL', () => {
  it('converts mg/dL to mmol/L', () => {
    expect(glucoseMgDlToMmolL(90)).toBe(5);
    expect(glucoseMgDlToMmolL(126)).toBe(7);
  });

  it('rejects negative input', () => {
    expect(() => glucoseMgDlToMmolL(-1)).toThrow(RangeError);
  });

  it('includes the received value in the error message', () => {
    expect(() => glucoseMgDlToMmolL(-12)).toThrow('received: -12');
    expect(() => glucoseMgDlToMmolL(Number.NaN)).toThrow('received: NaN');
  });
});

describe('flagResult', () => {
  const range = { low: 3.9, high: 5.5, criticalLow: 2.5, criticalHigh: 25 };

  it.each([
    [2.0, 'CRITICAL_LOW'],
    [3.0, 'LOW'],
    [5.0, 'NORMAL'],
    [7.0, 'HIGH'],
    [30, 'CRITICAL_HIGH'],
  ] as const)('flags %s as %s', (value, flag) => {
    expect(flagResult(value, range)).toBe(flag);
  });
});

describe('formatResult', () => {
  it('formats a report line', () => {
    expect(formatResult('Glucose', 5.4, 'mmol/L', 'NORMAL')).toBe('Glucose: 5.4 mmol/L (NORMAL)');
  });
});
