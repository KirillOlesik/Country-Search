import type { RawCountry, MappedCountry } from './types';

export function mapCountryResponse(raw: RawCountry): MappedCountry {
  return {
    name: raw.name || 'Неизвестно',
    flag: raw.flag ?? '',
    flagUrl: raw.flags?.svg ?? raw.flags?.png ?? '',
    capital: raw.capital ?? '',
    region: raw.region ?? '',
    subregion: raw.subregion ?? '',
    population: raw.population ?? 0,
    area: raw.area ?? 0,
    borders: raw.borders ?? [],
    demonym: raw.demonym ?? '',
    nativeName: raw.nativeName ?? '',
    timezones: raw.timezones ?? [],

    languages: raw.languages?.map((lang) => lang.name) ?? [],

    currencies:
      raw.currencies?.map((curr) => (curr.symbol ? `${curr.name} (${curr.symbol})` : curr.name)) ??
      [],
  };
}
