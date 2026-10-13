// Simplex noise by Ian McEwan / Stefan Gustavson (MIT), plus fbm helpers.
export const NOISE = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
    i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
    i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float fbm4(vec3 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) { sum += amp * snoise(p); p = p * 2.02 + 19.1; amp *= 0.5; }
  return sum;
}

float fbm6(vec3 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 6; i++) { sum += amp * snoise(p); p = p * 2.03 + 7.7; amp *= 0.5; }
  return sum;
}
`;

// Maps a full-screen quad's uv to the same sphere direction SphereGeometry uses,
// so baked equirectangular textures line up exactly with the mesh uvs.
const SPHERE_DIR = /* glsl */ `
#define PI 3.141592653589793
vec3 sphereDir(vec2 uv) {
  float phi = uv.x * 2.0 * PI;
  float theta = (1.0 - uv.y) * PI;
  return vec3(-cos(phi) * sin(theta), cos(theta), sin(phi) * sin(theta));
}
`;

const TERRAIN = /* glsl */ `
float terrain(vec3 p) {
  vec3 q = p + 0.38 * vec3(fbm4(p * 1.3 + 1.7), fbm4(p * 1.3 + 9.2), fbm4(p * 1.3 + 4.4));
  return fbm6(q * 1.55 + 3.0) + 0.16 * fbm4(p * 7.0 + 11.0);
}
`;

export const BAKE_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const SURFACE_BAKE = /* glsl */ `
varying vec2 vUv;
${NOISE}
${SPHERE_DIR}
${TERRAIN}
void main() {
  vec3 p = sphereDir(vUv);
  float h = terrain(p);
  float land = smoothstep(0.035, 0.06, h);
  float lat = abs(p.y);

  vec3 deep = vec3(0.006, 0.014, 0.07);
  vec3 shallow = vec3(0.016, 0.08, 0.2);
  vec3 ocean = mix(deep, shallow, smoothstep(-0.32, 0.045, h));

  vec3 low = vec3(0.04, 0.13, 0.11);
  vec3 dry = vec3(0.26, 0.17, 0.1);
  vec3 mid = vec3(0.17, 0.12, 0.2);
  vec3 high = vec3(0.42, 0.34, 0.4);
  float aridity = smoothstep(0.05, 0.45, fbm4(p * 2.2 + 31.0)) * (1.0 - smoothstep(0.35, 0.75, lat));
  vec3 ground = mix(low, dry, aridity);
  ground = mix(ground, mid, smoothstep(0.12, 0.32, h));
  ground = mix(ground, high, smoothstep(0.32, 0.55, h));
  ground = mix(ground, vec3(0.82, 0.84, 0.9), smoothstep(0.55, 0.7, h));

  vec3 color = mix(ocean, ground, land);
  float ice = smoothstep(0.8, 0.9, lat + 0.08 * fbm4(p * 6.0));
  color = mix(color, vec3(0.86, 0.9, 1.0), ice);

  gl_FragColor = vec4(color, (1.0 - land) * (1.0 - ice));
}
`;

export const CLOUDS_BAKE = /* glsl */ `
varying vec2 vUv;
${NOISE}
${SPHERE_DIR}
${TERRAIN}
void main() {
  vec3 p = sphereDir(vUv);
  float warp = fbm4(p * 3.0 + 5.0);
  float puffs = fbm6(p * 2.3 + 0.7 * warp + 11.0);
  float bands = fbm4(vec3(p.x * 2.0, p.y * 6.0, p.z * 2.0) + warp);
  float clouds = smoothstep(0.04, 0.5, puffs * 0.75 + bands * 0.45);

  float h = terrain(p);
  float land = smoothstep(0.035, 0.06, h);
  float coast = 1.0 - smoothstep(0.06, 0.25, h);
  float habitable = 1.0 - smoothstep(0.5, 0.78, abs(p.y));
  float clusters = smoothstep(0.08, 0.42, fbm4(p * 5.0 + 2.0));
  float n1 = 0.5 + 0.5 * snoise(p * 90.0);
  float n2 = 0.5 + 0.5 * snoise(p * 240.0);
  float sparkle = smoothstep(0.6, 0.92, n1 * 0.55 + n2 * 0.45);
  float cities = land * habitable * clusters * (0.3 + coast) * sparkle * 1.6;

  gl_FragColor = vec4(clouds, clamp(cities, 0.0, 1.0), 0.0, 1.0);
}
`;

export const NEBULA_BAKE = /* glsl */ `
varying vec2 vUv;
${NOISE}
${SPHERE_DIR}
void main() {
  vec3 p = sphereDir(vUv);
  float n1 = fbm6(p * 2.2 + 3.1);
  float n2 = fbm6(p * 4.2 - 7.3 + n1 * 0.9);
  float band = exp(-pow(p.y * 2.6 + n1 * 0.7, 2.0));
  float clouds = smoothstep(-0.15, 0.75, n2) * band;

  vec3 violet = vec3(0.16, 0.06, 0.4);
  vec3 teal = vec3(0.02, 0.18, 0.3);
  vec3 rose = vec3(0.42, 0.06, 0.22);
  vec3 color = mix(violet, teal, smoothstep(-0.4, 0.5, n1));
  color = mix(color, rose, smoothstep(0.15, 0.7, n2) * 0.55);
  color *= clouds * 0.42;
  color *= 1.0 - smoothstep(0.25, 0.7, fbm4(p * 9.0)) * 0.65 * band;
  color += vec3(0.003, 0.003, 0.01);

  gl_FragColor = vec4(color, 1.0);
}
`;

export const MOON_BAKE = /* glsl */ `
varying vec2 vUv;
${NOISE}
${SPHERE_DIR}
void main() {
  vec3 p = sphereDir(vUv);
  float base = fbm6(p * 3.0 + 2.0);
  float maria = smoothstep(0.0, 0.25, fbm4(p * 1.4 + 8.0));
  float ridges = pow(1.0 - abs(snoise(p * 9.0)), 8.0);
  float g = 0.34 + base * 0.2 - maria * 0.14 + ridges * 0.08;
  gl_FragColor = vec4(vec3(g) * vec3(1.0, 0.96, 0.93), 1.0);
}
`;

export const SPHERE_VERT = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vPosW;
void main() {
  vUv = uv;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vPosW = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const PLANET_FRAG = /* glsl */ `
uniform sampler2D uSurface;
uniform sampler2D uClouds;
uniform vec3 uSunDir;
uniform float uCloudOffset;
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vPosW;

void main() {
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vPosW);
  vec3 L = normalize(uSunDir);
  float NdL = dot(N, L);
  float NdV = max(dot(N, V), 0.0);

  vec4 surface = texture2D(uSurface, vUv);
  float clouds = texture2D(uClouds, vUv + vec2(uCloudOffset, 0.0)).r;
  float cities = texture2D(uClouds, vUv).g;

  float diffuse = max(NdL, 0.0);
  float terminator = smoothstep(-0.08, 0.22, NdL);

  vec3 color = surface.rgb * (diffuse * 1.7 + 0.01);

  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), 90.0) * surface.a;
  color += vec3(1.0, 0.8, 0.58) * spec * terminator * 1.6;

  vec3 cloudLit = vec3(0.95, 0.96, 1.0) * (diffuse * 1.5 + 0.012);
  color = mix(color, cloudLit, clouds * 0.85);

  float night = 1.0 - smoothstep(-0.22, 0.04, NdL);
  color += vec3(1.0, 0.58, 0.26) * cities * night * (1.0 - clouds * 0.85) * 1.5;

  float rim = pow(1.0 - NdV, 3.0);
  float dusk = pow(1.0 - abs(NdL), 5.0);
  vec3 haze = mix(vec3(0.24, 0.5, 1.0), vec3(1.0, 0.46, 0.2), dusk);
  color += haze * rim * smoothstep(-0.3, 0.5, NdL) * 1.3;

  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export const ATMOSPHERE_FRAG = /* glsl */ `
uniform vec3 uSunDir;
uniform float uEdge;
uniform float uIntensity;
varying vec3 vNormalW;
varying vec3 vPosW;

void main() {
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vPosW);
  vec3 L = normalize(uSunDir);

  float depth = clamp(-dot(N, V) / uEdge, 0.0, 1.0);
  float glow = pow(depth, 2.4);
  float lit = dot(N, L);
  float forward = pow(max(dot(-V, L), 0.0), 8.0);

  vec3 day = vec3(0.3, 0.58, 1.0);
  vec3 dusk = vec3(1.0, 0.5, 0.22);
  vec3 color = mix(day, dusk, smoothstep(0.45, -0.05, lit));
  color = mix(color, vec3(1.0, 0.85, 0.62), forward);

  float light = smoothstep(-0.35, 0.35, lit) + forward * 3.0;
  gl_FragColor = vec4(color * glow * light * uIntensity, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export const STARS_VERT = /* glsl */ `
attribute float aSize;
attribute float aPhase;
attribute vec3 aColor;
uniform float uTime;
uniform float uPixelRatio;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float twinkle = 0.7 + 0.3 * sin(uTime * (0.6 + aPhase * 1.8) + aPhase * 40.0);
  gl_PointSize = aSize * uPixelRatio * (0.85 + 0.15 * twinkle);
  vColor = aColor;
  vAlpha = twinkle;
}
`;

export const DUST_VERT = /* glsl */ `
attribute float aSize;
attribute float aPhase;
attribute vec3 aColor;
uniform float uTime;
uniform float uPixelRatio;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec3 p = position;
  p.y += sin(uTime * 0.2 + aPhase * 20.0) * 0.4;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * uPixelRatio * (60.0 / -mv.z);
  vColor = aColor;
  vAlpha = 0.45 * smoothstep(4.0, 18.0, -mv.z);
}
`;

export const POINTS_FRAG = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float core = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(vColor * pow(core, 2.2) * vAlpha, 1.0);
}
`;

export const WARP_VERT = /* glsl */ `
attribute float aEnd;
uniform float uWarp;
uniform float uOffset;
uniform float uLength;
varying float vAlpha;
void main() {
  vec3 p = position;
  float range = 420.0;
  p.z = mod(p.z + uOffset, range) - range - 2.0;
  p.z += aEnd * uLength * uWarp;
  vAlpha = aEnd * smoothstep(-range, -range * 0.6, p.z);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

export const WARP_FRAG = /* glsl */ `
uniform float uWarp;
uniform vec3 uColor;
varying float vAlpha;
void main() {
  gl_FragColor = vec4(uColor * vAlpha * uWarp, 1.0);
}
`;
