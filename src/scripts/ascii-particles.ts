export type Particle = {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  density: number;
  tone: number;
};

export type PortraitPointer = {
  x: number;
  y: number;
  radius: number;
};

export function getSamplingColumns(displayWidth: number): number {
  return Math.max(32, Math.min(112, Math.floor(displayWidth / 2.2)));
}

export function getImagePlacement(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  fit: 'cover' | 'contain'
) {
  const scale = (fit === 'contain' ? Math.min : Math.max)(
    targetWidth / sourceWidth,
    targetHeight / sourceHeight
  );
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  return {
    x: (targetWidth - width) / 2,
    y: (targetHeight - height) * (fit === 'contain' ? 0.5 : 0.47),
    width,
    height,
  };
}

export function createParticles(
  pixels: Pick<ImageData, 'data' | 'width' | 'height'>,
  width: number,
  height: number
): Particle[] {
  const particles: Particle[] = [];
  for (let row = 0; row < pixels.height; row++) {
    for (let col = 0; col < pixels.width; col++) {
      const offset = (row * pixels.width + col) * 4;
      if (pixels.data[offset + 3] < 128) continue;
      const x = ((col + 0.5) / pixels.width) * width;
      const y = ((row + 0.5) / pixels.height) * height;
      const tone =
        (pixels.data[offset] * 2126 +
          pixels.data[offset + 1] * 7152 +
          pixels.data[offset + 2] * 722) /
        2550000;
      particles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        tone,
        density: 5 + ((col * 7 + row * 11) % 16),
      });
    }
  }
  return particles;
}

// Exponential return matches the reference's feel without depending on refresh rate.
export function advanceParticles(
  particles: Particle[],
  pointer: PortraitPointer | null,
  elapsedMs: number
): boolean {
  const frames = Math.min(Math.max(elapsedMs, 0), 50) / (1000 / 60);
  let moving = false;
  for (const particle of particles) {
    const dx = particle.x - (pointer?.x ?? 0);
    const dy = particle.y - (pointer?.y ?? 0);
    const distance = Math.hypot(dx, dy);
    if (pointer && distance < pointer.radius) {
      const nx = distance > 0.01 ? dx / distance : 1;
      const ny = distance > 0.01 ? dy / distance : 0;
      const force = (1 - distance / pointer.radius) * particle.density * frames;
      particle.x += (nx + ny * 1.5) * force;
      particle.y += (ny - nx * 1.5) * force;
      moving = true;
    } else {
      const amount = -Math.expm1(-frames / (particle.density * 0.85));
      particle.x += (particle.baseX - particle.x) * amount;
      particle.y += (particle.baseY - particle.y) * amount;
      if (
        Math.hypot(particle.x - particle.baseX, particle.y - particle.baseY) <
        0.08
      ) {
        particle.x = particle.baseX;
        particle.y = particle.baseY;
      } else {
        moving = true;
      }
    }
  }
  return moving;
}
