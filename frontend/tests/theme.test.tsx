import { describe, it, expect } from 'vitest';
import theme from '../src/theme';

describe('Theme Configuration', () => {
  it('should have a primary color defined', () => {
    expect(theme.palette.primary.main).toBeDefined();
    expect(theme.palette.primary.main).toBe('#1976d2');
  });

  it('should have a secondary color defined', () => {
    expect(theme.palette.secondary.main).toBeDefined();
    expect(theme.palette.secondary.main).toBe('#dc004e');
  });
});
