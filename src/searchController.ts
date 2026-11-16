import { debounce } from './debounce.js';
import { searchCountries } from './searchCountries.js';
import type { MappedCountry } from './types.js';

function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name: string }).name === 'AbortError'
  );
}

export class SearchController {
  private currentController: AbortController | null = null;
  private debouncedSearch: (query: string) => void;

  constructor(
    private callbacks: {
      onResults: (data: MappedCountry[]) => void;
      onLoading: () => void;
      onError: (error: unknown) => void;
      onEmpty: () => void;
    },
    private debounceDelay: number = 300,
  ) {
    this.debouncedSearch = debounce((query: string) => {
      this.executeSearch(query);
    }, this.debounceDelay);
  }

  public updateQuery(query: string): void {
    if (this.currentController) {
      this.currentController.abort();
      this.currentController = null;
    }

    if (!query.trim()) {
      this.callbacks.onResults([]);
      return;
    }

    this.callbacks.onLoading();
    this.debouncedSearch(query);
  }

  private async executeSearch(query: string): Promise<void> {
    this.currentController = new AbortController();

    try {
      const results = await searchCountries(query, this.currentController.signal);

      if (results.length === 0) {
        this.callbacks.onEmpty();
      } else {
        this.callbacks.onResults(results);
      }
    } catch (error: unknown) {
      if (isAbortError(error)) return;

      this.callbacks.onError(error);
    }
  }
}
