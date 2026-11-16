import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchCountries } from '../src/searchCountries';
import { HttpError } from '../src/httpError';
import type { RawCountry } from '../src/types';

const rawSpain: RawCountry = {
  name: 'Spain',
  capital: 'Madrid',
  currencies: [{ code: 'EUR', name: 'Euro', symbol: '€' }],
};

describe('searchCountries', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('успешный запрос: делает GET на нужный URL и маппит данные', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [rawSpain],
    } as Response);

    const result = await searchCountries('Spain', new AbortController().signal);

    expect(fetch).toHaveBeenCalledWith(
      'https://countries.dev/name/Spain',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(result[0].name).toBe('Spain');
    expect(result[0].currencies).toEqual(['Euro (€)']);
  });

  it('404: возвращает пустой массив (нет совпадений)', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 404 } as Response);

    const result = await searchCountries('Unknown', new AbortController().signal);
    expect(result).toEqual([]);
  });

  it('500: бросает HttpError', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 500 } as Response);

    await expect(searchCountries('Spain', new AbortController().signal)).rejects.toThrow(HttpError);
  });

  it('пробрасывает AbortError при отмене', async () => {
    vi.mocked(fetch).mockRejectedValue(new DOMException('Aborted', 'AbortError'));

    await expect(searchCountries('Spain', new AbortController().signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
  });
});
