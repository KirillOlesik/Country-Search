import { SearchController } from './searchController.js';
import type { MappedCountry } from './types.js';

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

const app = el('div', 'app');
const title = el('h1', 'title', 'Поиск стран');

const input = el('input', 'search-input');
input.type = 'text';
input.placeholder = 'Введите название страны (например, Spain)...';

const statusContainer = el('div', 'status-container');
const resultsContainer = el('div', 'results-grid');
const detailsContainer = el('div', 'details-container');
detailsContainer.style.display = 'none';

app.append(title, input, statusContainer, resultsContainer, detailsContainer);
document.body.appendChild(app);

// 2. Функции отрисовки
function showLoading() {
  statusContainer.textContent = 'Загрузка...';
  statusContainer.className = 'status loading';
  resultsContainer.replaceChildren(); // Безопасная очистка вместо innerHTML
  detailsContainer.style.display = 'none';
}

function showEmpty() {
  statusContainer.textContent = 'Ничего не найдено. Попробуйте другое название.';
  statusContainer.className = 'status empty';
  resultsContainer.replaceChildren();
  detailsContainer.style.display = 'none';
}

function showError(error: unknown) {
  // Тут мы можем проверить error, если это HttpError, и показать статус
  console.error('Error details:', error);

  statusContainer.textContent = 'Произошла ошибка при загрузке данных.';
  statusContainer.className = 'status error';
  resultsContainer.replaceChildren();

  const retryBtn = el('button', 'retry-btn', 'Повторить');
  retryBtn.onclick = () => {
    controller.updateQuery(input.value);
  };
  statusContainer.appendChild(retryBtn);
  detailsContainer.style.display = 'none';
}

function showResults(countries: MappedCountry[]) {
  statusContainer.textContent = '';
  statusContainer.className = 'status';
  resultsContainer.replaceChildren();
  detailsContainer.style.display = 'none';

  countries.forEach((country) => {
    const card = el('div', 'card');
    const flag = el('div', 'card-flag', country.flag || '🏳️');
    const name = el('h2', 'card-name', country.name);
    const capital = el('p', 'card-capital', `Столица: ${country.capital || 'Нет данных'}`);
    const region = el('p', 'card-region', `Регион: ${country.region}`);

    card.append(flag, name, capital, region);
    card.onclick = () => showDetails(country);
    resultsContainer.appendChild(card);
  });
}

function showDetails(country: MappedCountry) {
  detailsContainer.style.display = 'block';
  detailsContainer.replaceChildren();

  const closeBtn = el('button', 'close-btn', 'Закрыть');
  closeBtn.onclick = () => {
    detailsContainer.style.display = 'none';
  };

  const name = el('h2', '', `${country.name} (${country.nativeName})`);
  const area = el('p', '', `Площадь: ${country.area} км²`);
  const borders = el(
    'p',
    '',
    `Границы: ${country.borders.length ? country.borders.join(', ') : 'Нет'}`,
  );
  const languages = el(
    'p',
    '',
    `Языки: ${country.languages.length ? country.languages.join(', ') : 'Нет данных'}`,
  );
  const currencies = el(
    'p',
    '',
    `Валюты: ${country.currencies.length ? country.currencies.join(', ') : 'Нет данных'}`,
  );

  detailsContainer.append(closeBtn, name, area, borders, languages, currencies);
}

const controller = new SearchController({
  onResults: showResults,
  onLoading: showLoading,
  onError: showError,
  onEmpty: showEmpty,
});

// 4. Слушатель. Используем e.target instanceof, чтобы TypeScript сам понял тип
input.addEventListener('input', (e: Event) => {
  if (e.target instanceof HTMLInputElement) {
    controller.updateQuery(e.target.value);
  }
});
