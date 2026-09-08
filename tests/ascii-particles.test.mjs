import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  advanceParticles,
  createParticles,
  getImagePlacement,
  getSamplingColumns,
} from '../src/scripts/ascii-particles.ts';

// Fixed desktop density produces subpixel glyphs and moire on small 1x displays.
test('a mobile portrait keeps at least two CSS pixels per glyph column', () => {
  const columns = getSamplingColumns(96);
  assert.ok(columns > 0 && 96 / columns >= 2);
  assert.ok(
    getSamplingColumns(250) > columns,
    'Larger portraits retain more detail'
  );
});

// Non-square ASCII cells must not stretch a square portrait into a narrow face.
test('contain preserves the source proportions in the final display coordinates', () => {
  assert.deepEqual(getImagePlacement(100, 100, 500, 250, 'contain'), {
    x: 125,
    y: 0,
    width: 250,
    height: 250,
  });
});

test('cover fills the display while preserving the existing photograph crop', () => {
  assert.deepEqual(getImagePlacement(100, 200, 100, 100, 'cover'), {
    x: 0,
    y: -47,
    width: 100,
    height: 200,
  });
});

// Losing the alpha mask would turn the illustration's empty background into a rectangle.
test('sampling omits transparent pixels but retains opaque dark hair and clothing', () => {
  const particles = createParticles(
    {
      width: 3,
      height: 1,
      data: new Uint8ClampedArray([
        255, 255, 255, 0, 0, 0, 0, 255, 255, 255, 255, 255,
      ]),
    },
    300,
    100
  );
  assert.equal(particles.length, 2);
  assert.deepEqual(
    particles.map(({ baseX, baseY }) => [baseX, baseY]),
    [
      [150, 50],
      [250, 50],
    ]
  );
  assert.equal(particles[0].tone, 0);
  assert.equal(particles[1].tone, 1);
});

const particle = (overrides = {}) => ({
  x: 110,
  y: 100,
  baseX: 100,
  baseY: 100,
  density: 10,
  tone: 0.5,
  ...overrides,
});

// A radial-only force would lose the reference's characteristic swirl.
test('a nearby pointer displaces glyphs both away from it and sideways', () => {
  const p = particle();
  advanceParticles([p], { x: 100, y: 100, radius: 55 }, 1000 / 60);
  assert.ok(p.x > 110);
  assert.notEqual(p.y, 100);
});

// A zero-length direction must not poison subsequent canvas positions with NaN.
test('a pointer directly over a glyph keeps particle coordinates finite', () => {
  const p = particle({ x: 100 });
  advanceParticles([p], { x: 100, y: 100, radius: 55 }, 1000 / 60);
  assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y));
});

// A frame-count based return would run twice as fast on a 120 Hz screen.
test('return speed is stable across display refresh rates', () => {
  const slow = particle({ x: 200, y: 200 });
  const fast = particle({ x: 200, y: 200 });
  for (let i = 0; i < 30; i++) advanceParticles([slow], null, 1000 / 60);
  for (let i = 0; i < 60; i++) advanceParticles([fast], null, 1000 / 120);
  assert.ok(Math.abs(slow.x - fast.x) < 0.01);
  assert.ok(Math.abs(slow.y - fast.y) < 0.01);
  assert.ok(slow.x < 110, 'The particle visibly approaches its origin');
});

// An endless return would keep scheduling animation frames after interaction ends.
test('particles settle exactly at their origins and report that animation can stop', () => {
  const p = particle({ x: 200, y: 50 });
  for (let i = 0; i < 240; i++) advanceParticles([p], null, 1000 / 60);
  assert.equal(advanceParticles([p], null, 1000 / 60), false);
  assert.equal(p.x, 100);
  assert.equal(p.y, 100);
});
