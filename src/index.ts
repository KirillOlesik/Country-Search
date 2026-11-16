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
const header = el('header', 'header');
header.append(
  el('h1', 'title', 'Поиск стран'),
  el('p', 'subtitle', 'Введите название на английском, например: France, Japan, Brazil'),
);

const searchWrapper = el('div', 'search-wrapper');
const input = el('input', 'search-input');
input.type = 'text';
input.placeholder = 'Начните печатать...';
input.autocomplete = 'off';
searchWrapper.appendChild(input);

const statusContainer = el('div', 'status-container');
const resultsContainer = el('div', 'results-grid');

const modalOverlay = el('div', 'modal-overlay');
const modalContent = el('div', 'modal-content');
modalOverlay.addEventListener('click', (e: MouseEvent) => {
  if (e.target === modalOverlay) {
    modalOverlay.style.display = 'none';
  }
});
modalOverlay.appendChild(modalContent);
modalOverlay.style.display = 'none';

app.append(header, searchWrapper, statusContainer, resultsContainer, modalOverlay);
document.body.appendChild(app);

function showLoading() {
  statusContainer.textContent = '';
  resultsContainer.replaceChildren();
  modalOverlay.style.display = 'none';

  for (let i = 0; i < 8; i++) {
    const skeleton = el('div', 'card skeleton');
    skeleton.append(
      el('div', 'skeleton-img'),
      el('div', 'skeleton-text title'),
      el('div', 'skeleton-text line'),
    );
    resultsContainer.appendChild(skeleton);
  }
}

function showEmpty() {
  statusContainer.textContent = 'По вашему запросу ничего не найдено';
  statusContainer.className = 'status-container empty';
  resultsContainer.replaceChildren();
  modalOverlay.style.display = 'none';
}

function showError(error: unknown) {
  console.error(error);
  statusContainer.textContent = 'Ошибка загрузки данных. Проверьте интернет.';
  statusContainer.className = 'status-container error';
  resultsContainer.replaceChildren();
  modalOverlay.style.display = 'none';

  const retryBtn = el('button', 'retry-btn', 'Попробовать снова');
  retryBtn.onclick = () => controller.updateQuery(input.value);
  statusContainer.appendChild(retryBtn);
}

function showResults(countries: MappedCountry[]) {
  statusContainer.textContent = '';
  statusContainer.className = 'status-container';
  resultsContainer.replaceChildren();
  modalOverlay.style.display = 'none';

  countries.forEach((country) => {
    const card = el('div', 'card');

    const flagImg = el('img', 'card-flag');
    flagImg.src = country.flagUrl || 'https://flagcdn.com/w320/un.png';
    flagImg.alt = country.name;
    flagImg.loading = 'lazy';

    const name = el('h2', 'card-name', country.name);
    const capital = el('p', 'card-info', `Столица: ${country.capital || '—'}`);
    const region = el('p', 'card-info', `Регион: ${country.region}`);

    card.append(flagImg, name, capital, region);
    card.onclick = () => showDetails(country);
    resultsContainer.appendChild(card);
  });
}

function showDetails(country: MappedCountry) {
  modalOverlay.style.display = 'flex';
  modalContent.replaceChildren();

  const closeBtn = el('button', 'close-btn', '✕');
  closeBtn.onclick = () => (modalOverlay.style.display = 'none');

  const headerDiv = el('div', 'modal-header');
  const flagImg = el('img', 'modal-flag');
  flagImg.src = country.flagUrl || 'https://flagcdn.com/w320/un.png';

  const titleDiv = el('div');
  titleDiv.append(el('h2', '', country.name), el('p', 'native-name', country.nativeName));
  headerDiv.append(flagImg, titleDiv);

  const grid = el('div', 'details-grid');
  grid.append(
    el('p', '', ` Население: ${country.population.toLocaleString('ru-RU')}`),
    el('p', '', ` Площадь: ${country.area.toLocaleString('ru-RU')} км²`),
    el(
      'p',
      '',
      ` Языки: ${country.languages.length ? country.languages.join(', ') : 'Нет данных'}`,
    ),
    el(
      'p',
      '',
      ` Валюты: ${country.currencies.length ? country.currencies.join(', ') : 'Нет данных'}`,
    ),
    el('p', '', ` Границы: ${country.borders.length ? country.borders.join(', ') : 'Нет'}`),
  );

  modalContent.append(closeBtn, headerDiv, grid);
}

const controller = new SearchController({
  onResults: showResults,
  onLoading: showLoading,
  onError: showError,
  onEmpty: showEmpty,
});

input.addEventListener('input', (e: Event) => {
  if (e.target instanceof HTMLInputElement) {
    controller.updateQuery(e.target.value);
  }
});
