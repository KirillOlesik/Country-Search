import { debounce } from './debounce.js';
import { searchCountries } from './searchCountries.js';
import type { MappedCountry } from './types.js';

export class SearchController {
  private currentController: AbortController | null = null;
  private debouncedSearch: (query: string) => void;

  constructor(
    private onResults: (data: MappedCountry[]) => void,
    private debounceDelay: number = 300,
  ) {
    this.debouncedSearch = debounce((query: string) => {
      this.executeSearch(query);
    }, this.debounceDelay);
  }

  public updateQuery(query: string): void {
    if (this.currentController) {
      this.currentController.abort();
    }

    if (!query.trim()) {
      this.onResults([]);
      return;
    }

    this.debouncedSearch(query);
  }

  private async executeSearch(query: string): Promise<void> {
    this.currentController = new AbortController();

    try {
      const results = await searchCountries(query, this.currentController.signal);
      this.onResults(results);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('Search error:', error);
    }
  }
}
