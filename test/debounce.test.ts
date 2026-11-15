import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { debounce } from '../src/debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach((): void => {
    vi.useRealTimers();
  });

  it('should debounce a function', () => {
    const mockFn = vi.fn();
    const debounced = debounce(mockFn, 300);
    expect(typeof debounced).toBe('function');
  });

  it('does not call the function immediately ', (): void => {
    const mockFm = vi.fn();
    const debounced = debounce(mockFm, 300);
    debounced();
    expect(mockFm).not.toHaveBeenCalled();

    vi.advanceTimersByTime(299);
    expect(mockFm).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(mockFm).toHaveBeenCalledTimes(1);
  });

  it('reset timer on ever call ', (): void => {
    const mockFm = vi.fn();
    const debounced = debounce(mockFm, 300);
    debounced();
    vi.advanceTimersByTime(200);
    debounced();
    vi.advanceTimersByTime(200);
    debounced();
    vi.advanceTimersByTime(200);
    expect(mockFm).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(mockFm).toHaveBeenCalledTimes(1);
  });

  it('calls with last argument ', () => {
    const mockFm = vi.fn();
    const debounced = debounce(mockFm, 300);
    debounced('s');
    debounced('sp');
    debounced('spain');

    vi.advanceTimersByTime(300);
    expect(mockFm).toHaveBeenCalledTimes(1);
    expect(mockFm).toHaveBeenCalledWith('spain');
  });
});
