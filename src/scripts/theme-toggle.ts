type Theme = 'dark' | 'light';
type Texture = 'clean' | 'scanlines';

const themeStorageKey = 'kirshway-theme';
const textureStorageKey = 'kirshway-texture';
const root = document.documentElement;

const persist = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {}
};

const applyTheme = (theme: Theme) => {
  root.dataset.theme = theme;
  document
    .querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')
    .forEach((button) => {
      button.setAttribute('aria-pressed', String(theme === 'light'));
      button.dataset.themeState = theme;
    });
};

const applyTexture = (texture: Texture) => {
  root.dataset.texture = texture;
  document
    .querySelectorAll<HTMLButtonElement>('[data-texture-toggle]')
    .forEach((button) => {
      button.setAttribute('aria-pressed', String(texture === 'scanlines'));
      button.dataset.textureState = texture;
    });
};

const initThemeToggle = () => {
  // Layout selects the initial appearance before paint; synchronize the controls.
  applyTheme(root.dataset.theme === 'light' ? 'light' : 'dark');
  applyTexture(root.dataset.texture === 'scanlines' ? 'scanlines' : 'clean');

  document
    .querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';

        applyTheme(nextTheme);
        persist(themeStorageKey, nextTheme);
      });
    });

  document
    .querySelectorAll<HTMLButtonElement>('[data-texture-toggle]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        const nextTexture =
          root.dataset.texture === 'scanlines' ? 'clean' : 'scanlines';

        applyTexture(nextTexture);
        persist(textureStorageKey, nextTexture);
      });
    });
};

initThemeToggle();
