import {
  advanceParticles,
  createParticles,
  getImagePlacement,
  getSamplingColumns,
} from './ascii-particles';
import type { Particle, PortraitPointer } from './ascii-particles';

const WIDTH = 480;
const COLUMNS = 112;
const GLYPHS = '.,:;i+*#%@';

class AsciiPortrait extends HTMLElement {
  private canvas!: HTMLCanvasElement;
  private context!: CanvasRenderingContext2D;
  private source!: HTMLImageElement;
  private particles: Particle[] = [];
  private pointer: PortraitPointer | null = null;
  private atlas = document.createElement('canvas');
  private height = 480;
  private glyphScale = 1;
  private frame = 0;
  private previousTime = 0;
  private entered = false;
  private visible = false;
  private reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  private finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  private events?: AbortController;
  private resizeObserver?: ResizeObserver;
  private visibilityObserver?: IntersectionObserver;
  private themeObserver?: MutationObserver;

  connectedCallback() {
    this.events = new AbortController();
    void this.initialize(this.events.signal);
  }

  disconnectedCallback() {
    this.events?.abort();
    this.resizeObserver?.disconnect();
    this.visibilityObserver?.disconnect();
    this.themeObserver?.disconnect();
    this.stop();
  }

  private async initialize(signal: AbortSignal) {
    const canvas = this.querySelector('canvas');
    const context = canvas?.getContext('2d');
    if (!canvas || !context || !this.dataset.source) return;
    this.canvas = canvas;
    this.context = context;
    const source = new Image();
    source.src = this.dataset.source;
    try {
      await source.decode();
    } catch {
      return;
    }
    if (signal.aborted) return;
    this.source = source;
    this.makeAtlas();
    this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this);
    this.visibilityObserver = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      if (this.visible) {
        if (!this.entered) {
          this.entered = true;
          if (!this.reducedMotion.matches) {
            for (const particle of this.particles) {
              const angle =
                Math.atan2(
                  particle.baseY - this.height / 2,
                  particle.baseX - WIDTH / 2
                ) +
                (Math.random() - 0.5);
              const radius =
                Math.hypot(
                  particle.baseX - WIDTH / 2,
                  particle.baseY - this.height / 2
                ) +
                120 +
                Math.random() * 240;
              particle.x = WIDTH / 2 + Math.cos(angle) * radius;
              particle.y = this.height / 2 + Math.sin(angle) * radius;
            }
          }
        }
        this.wake();
      } else {
        this.pointer = null;
        this.stop();
      }
    });
    this.visibilityObserver.observe(this);
    this.themeObserver = new MutationObserver(() => {
      this.makeAtlas();
      this.draw();
    });
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    this.addEventListener(
      'pointermove',
      (event) => {
        if (
          event.pointerType !== 'mouse' ||
          !this.finePointer.matches ||
          this.reducedMotion.matches
        )
          return;
        const bounds = this.getBoundingClientRect();
        this.pointer = {
          x: ((event.clientX - bounds.left) / bounds.width) * WIDTH,
          y: ((event.clientY - bounds.top) / bounds.height) * this.height,
          radius: 55,
        };
        this.wake();
      },
      { signal }
    );
    const release = () => {
      this.pointer = null;
      this.wake();
    };
    this.addEventListener('pointerleave', release, { signal });
    this.addEventListener('pointercancel', release, { signal });
    window.addEventListener('blur', release, { signal });
    document.addEventListener(
      'visibilitychange',
      () => {
        this.pointer = null;
        if (document.hidden) this.stop();
        else this.wake();
      },
      { signal }
    );
    this.reducedMotion.addEventListener(
      'change',
      () => {
        this.pointer = null;
        this.stop();
        for (const particle of this.particles) {
          particle.x = particle.baseX;
          particle.y = particle.baseY;
        }
        this.draw();
      },
      { signal }
    );
    this.finePointer.addEventListener('change', release, { signal });
  }

  private resize() {
    const bounds = this.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    this.stop();
    this.pointer = null;
    this.height = (WIDTH * bounds.height) / bounds.width;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(bounds.width * dpr);
    this.canvas.height = Math.round(bounds.height * dpr);
    this.context.setTransform(
      this.canvas.width / WIDTH,
      0,
      0,
      this.canvas.height / this.height,
      0,
      0
    );
    const sample = document.createElement('canvas');
    const columns = getSamplingColumns(bounds.width);
    this.glyphScale = COLUMNS / columns;
    sample.width = columns;
    sample.height = Math.max(
      1,
      Math.round(this.height / ((WIDTH / columns) * 1.25))
    );
    const context = sample.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    const { x, y, width, height } = getImagePlacement(
      this.source.naturalWidth,
      this.source.naturalHeight,
      WIDTH,
      this.height,
      this.dataset.fit === 'contain' ? 'contain' : 'cover'
    );
    context.scale(sample.width / WIDTH, sample.height / this.height);
    context.drawImage(this.source, x, y, width, height);
    this.particles = createParticles(
      context.getImageData(0, 0, sample.width, sample.height),
      WIDTH,
      this.height
    );
    this.draw();
    this.dataset.ready = '';
  }

  // Cache glyphs once per palette, rather than rasterizing thousands of strings per frame.
  private makeAtlas() {
    this.atlas.width = 16 * 16;
    this.atlas.height = 20;
    const context = this.atlas.getContext('2d');
    if (!context) return;
    const light = document.documentElement.dataset.theme === 'light';
    context.font = '13px monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = getComputedStyle(this)
      .getPropertyValue('--ascii-ink')
      .trim();
    for (let level = 0; level < 16; level++) {
      const tone = level / 15;
      const strength = Math.pow(light ? 1 - tone : tone, 0.65);
      context.globalAlpha = 0.4 + strength * 0.6;
      const glyph = GLYPHS[Math.round(strength * (GLYPHS.length - 1))];
      context.fillText(glyph, level * 16 + 8, 10);
    }
  }

  private draw() {
    this.context.clearRect(0, 0, WIDTH, this.height);
    for (const particle of this.particles) {
      const level = Math.min(15, Math.max(0, Math.round(particle.tone * 15)));
      this.context.drawImage(
        this.atlas,
        level * 16,
        0,
        16,
        20,
        particle.x - 4 * this.glyphScale,
        particle.y - 5 * this.glyphScale,
        8 * this.glyphScale,
        10 * this.glyphScale
      );
    }
  }

  private stop() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.previousTime = 0;
  }

  private wake() {
    if (
      this.frame ||
      !this.visible ||
      document.hidden ||
      this.reducedMotion.matches
    )
      return;
    this.frame = requestAnimationFrame(this.tick);
  }

  private tick = (time: number) => {
    this.frame = 0;
    const moving = advanceParticles(
      this.particles,
      this.pointer,
      this.previousTime ? time - this.previousTime : 1000 / 60
    );
    this.previousTime = time;
    this.draw();
    if (moving) this.wake();
    else this.previousTime = 0;
  };
}

if (!customElements.get('ascii-portrait')) {
  customElements.define('ascii-portrait', AsciiPortrait);
}
