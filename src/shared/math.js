export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export const lerp = (from, to, t) => from + (to - from) * t;

// Frame-rate independent smoothing factor for lerp().
export const damp = (lambda, dt) => 1 - Math.exp(-lambda * dt);

export const pad = (value, length = 2) => String(value).padStart(length, "0");
