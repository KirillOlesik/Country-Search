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
      const delay = query === 'spain' ? 100 : 500;

      return new Promise((resolve, reject) => {
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
    const onLoadingMock = vi.fn();
    const onErrorMock = vi.fn();
    const onEmptyMock = vi.fn();

    const engine = new SearchController(
      {
        onResults: onResultsMock,
        onLoading: onLoadingMock,
        onError: onErrorMock,
        onEmpty: onEmptyMock,
      },
      300,
    );

    engine.updateQuery('sp');
    await vi.advanceTimersByTimeAsync(300);

    engine.updateQuery('spain');
    await vi.advanceTimersByTimeAsync(300);
    await vi.advanceTimersByTimeAsync(100);

    expect(onResultsMock).toHaveBeenCalledTimes(1);
    expect(onResultsMock).toHaveBeenLastCalledWith([expect.objectContaining({ name: 'spain' })]);

    await vi.advanceTimersByTimeAsync(400);

    expect(onResultsMock).toHaveBeenCalledTimes(1);
  });
});
