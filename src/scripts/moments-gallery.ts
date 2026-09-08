// Native scrolling works without this enhancement; JS only connects the controls.
document.querySelectorAll('[data-moments-gallery]').forEach((gallery) => {
  const track = gallery.querySelector<HTMLElement>('.photo-slides');
  const controls = gallery.querySelector<HTMLElement>('[data-photo-controls]');
  const counter = gallery.querySelector<HTMLElement>('[aria-live]');

  if (!track || !controls || !counter || track.children.length < 2) return;

  const total = track.children.length;
  const current = () => Math.round(track.scrollLeft / track.clientWidth);
  controls.hidden = false;
  track.addEventListener(
    'scroll',
    () => {
      const label = `${current() + 1} / ${total}`;
      if (counter.textContent !== label) counter.textContent = label;
    },
    { passive: true }
  );
  controls
    .querySelectorAll<HTMLButtonElement>('[data-step]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        const next = current() + Number(button.dataset.step);
        track.scrollTo({
          left: ((next + total) % total) * track.clientWidth,
          // Wrap directly instead of scrolling back through every photo.
          behavior: next < 0 || next >= total ? 'instant' : 'auto',
        });
      });
    });
});
