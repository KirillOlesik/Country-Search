import type { RawCountry, MappedCountry } from './types.js';
import { mapCountryResponse } from './mapCountryResponse.js';
import { HttpError } from './httpError.js';

export async function searchCountries(
  query: string,
  signal: AbortSignal,
  timeoutMs?: number,
): Promise<MappedCountry[]> {
  const finalSignal = timeoutMs
    ? AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)])
    : signal;

  const url = `https://countries.dev/name/${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    method: 'GET',
    signal: finalSignal,
  });
  if (response.status === 404) {
    return [];
  }
  if (!response.ok) {
    throw new HttpError(response.status);
  }
  const rawData = (await response.json()) as RawCountry[];
  return rawData.map(mapCountryResponse);
}
