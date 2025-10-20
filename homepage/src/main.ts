import './style.css';
import { categories } from './__generated-samples';

declare const __APP_VERSION__: string;
declare const __APP_COMMIT_HASH__: string;

type Category = (typeof categories)[number];

type Entry = Category['items'][number];

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Не удалось найти контейнер #app');
}

const renderNav = (items: Category[]) =>
  `<nav>${items
    .map((category) => `<a href="#${category.id}">${category.label}</a>`)
    .join('')}</nav>`;

const renderCard = (entry: Entry) => `
  <a class="card" href="${entry.href}">
    <strong>${entry.title}</strong>
    <span class="desc">${entry.description}</span>
    <span class="path">samples/${entry.rel}</span>
  </a>
`;

const renderSection = (category: Category) => `
  <section id="${category.id}">
    <h2>${category.label} <span class="badge">${category.items.length}</span></h2>
    <div class="cards">
      ${category.items.map(renderCard).join('')}
    </div>
  </section>
`;

app.innerHTML = `
  <div class="layout">
    <header>
      <h1>ThreeRex.js</h1>
      <p class="lead">
        Коллекция минималистичных демо на Three.js. Выбирайте раздел, открывайте подкатегории и погружайтесь в WebGL-мир.
      </p>
      ${renderNav(categories)}
    </header>
    ${categories.map(renderSection).join('')}
    <footer class="build-meta">
      Сборка ${__APP_VERSION__} · коммит ${__APP_COMMIT_HASH__}
    </footer>
  </div>
`;
