import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SearchController } from '../src/searchController';

describe('SearchController — Race Condition', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('не перезаписывает свежий результат устаревшим ответом', async () => {
    vi.mocked(fetch).mockImplementation((url, init) => {
      const query = (url as string).split('/').pop();

      return new Promise((resolve, reject) => {
        const delay = query === 'spain' ? 100 : 500;

        const timer = setTimeout(() => {
          resolve({
            ok: true,
            json: async () => [{ name: query }],
          } as Response);
        }, delay);

        init?.signal?.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
    });

    const onResultsMock = vi.fn();
    const engine = new SearchController(onResultsMock, 300);

    engine.updateQuery('sp');
    vi.advanceTimersByTime(300);
    engine.updateQuery('spain');
    vi.advanceTimersByTime(300);
    vi.advanceTimersByTime(100);

    expect(onResultsMock).toHaveBeenLastCalledWith([{ name: 'spain' }]);
    expect(onResultsMock).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(400);
    expect(onResultsMock).toHaveBeenCalledTimes(1);
    expect(onResultsMock).not.toHaveBeenCalledWith([{ name: 'sp' }]);
  });
});
