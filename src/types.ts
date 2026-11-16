export interface RawCountry {
  name: string;
  flag?: string;
  flags?: { png?: string; svg?: string };
  capital?: string;
  region?: string;
  subregion?: string;
  population?: number;
  area?: number;
  borders?: string[];
  demonym?: string;
  nativeName?: string;
  timezones?: string[];
  languages?: { name: string; iso639_1?: string; iso639_2?: string; nativeName?: string }[];
  currencies?: { code: string; name: string; symbol?: string }[];
}

export interface MappedCountry {
  name: string;
  flag: string;
  flagUrl: string;
  capital: string;
  region: string;
  subregion: string;
  population: number;
  area: number;
  borders: string[];
  demonym: string;
  nativeName: string;
  timezones: string[];
  languages: string[];
  currencies: string[];
}
