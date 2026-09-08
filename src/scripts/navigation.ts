const primaryNavigation =
  document.querySelector<HTMLElement>('[data-navigation]');
const toggle =
  primaryNavigation?.querySelector<HTMLButtonElement>('[popovertarget]');
const links = primaryNavigation?.querySelector<HTMLElement>('[popover]');

if (primaryNavigation && toggle && links) {
  const isOpen = () => 'hidePopover' in links && links.matches(':popover-open');
  const close = () => {
    if (isOpen()) links.hidePopover();
  };

  // CSS owns the layout; only dismiss a still-open popover across a breakpoint.
  window.matchMedia('(max-width: 639px)').addEventListener('change', close);
  primaryNavigation.addEventListener('focusout', (event) => {
    if (primaryNavigation.contains(event.relatedTarget as Node | null)) return;
    const hiddenControl =
      event.target instanceof HTMLElement &&
      !event.target.getClientRects().length;
    close();
    // A resize can hide the focused control. Continue at its visible counterpart.
    if (hiddenControl) {
      const next = toggle.getClientRects().length
        ? toggle
        : links.querySelector('a');
      next?.focus({ preventScroll: true });
    }
  });

  links.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (
        !isOpen() ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const target = document.getElementById(link.hash.slice(1));
      // Move focus out first, so closing the popover cannot scroll back to its button.
      target?.focus({ preventScroll: true });
      close();
    });
  });
}
