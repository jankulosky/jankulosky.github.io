import * as THREE from "three";
import { gsap } from "gsap";
import { clamp, damp, lerp } from "../../shared/math";
import {
  ATMOSPHERE_FRAG,
  BAKE_VERT,
  CLOUDS_BAKE,
  DUST_VERT,
  MOON_BAKE,
  NEBULA_BAKE,
  PLANET_FRAG,
  POINTS_FRAG,
  SPHERE_VERT,
  STARS_VERT,
  SURFACE_BAKE,
  WARP_FRAG,
  WARP_VERT,
} from "./shaders";

const PLANET_RADIUS = 10;
const ATMOSPHERE_RADIUS = PLANET_RADIUS * 1.11;
const SUN_DIR = new THREE.Vector3(-0.35, 0.42, -1).normalize();
const SUN_DISTANCE = 520;
const UP = new THREE.Vector3(0, 1, 0);

const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

// Camera pose per section; `shift` slides the subject sideways (fraction of the viewport, + = right).
const POSES = {
  home: { pos: v3(0, 1, 16.5), target: v3(-2, 24.9, -4), shift: 0 },
  about: { pos: v3(-30, 5, 6), target: v3(0, 0, 0), shift: 0.25 },
  work: { pos: v3(50, 15, 34), target: v3(8, -4, -4), shift: 0 },
  skills: { pos: v3(26, 2, -22), target: v3(70, 14, -60), shift: 0.2 },
  experience: { pos: v3(-4, -21, -31), target: v3(0, 0, 0), shift: 0.25 },
  testimonial: { pos: v3(-29, 17, -13), target: v3(0, 0, 0), shift: -0.22 },
  contact: {
    pos: SUN_DIR.clone().multiplyScalar(-40).add(v3(7, -5.5, 0)),
    target: v3(0, 0, 0),
    shift: 0,
  },
};

const smoothstep = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

const makeGlowTexture = () => {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.07, "rgba(255,247,232,0.95)");
  gradient.addColorStop(0.2, "rgba(255,196,128,0.4)");
  gradient.addColorStop(0.5, "rgba(255,140,70,0.1)");
  gradient.addColorStop(1, "rgba(255,120,60,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const makeStreakTexture = () => {
  const width = 512;
  const height = 32;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const horizontal = ctx.createLinearGradient(0, 0, width, 0);
  horizontal.addColorStop(0, "rgba(255,255,255,0)");
  horizontal.addColorStop(0.5, "rgba(255,255,255,1)");
  horizontal.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = horizontal;
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "destination-in";
  const vertical = ctx.createLinearGradient(0, 0, 0, height);
  vertical.addColorStop(0, "rgba(0,0,0,0)");
  vertical.addColorStop(0.5, "rgba(0,0,0,1)");
  vertical.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = vertical;
  ctx.fillRect(0, 0, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

export default class OrbitScene {
  constructor(container, { onIntroDone } = {}) {
    this.container = container;
    this.onIntroDone = onIntroDone;
    this.mobile = window.innerWidth < 768;
    this.disposables = [];
    this.state = { warp: 1, intro: 0 };
    this.pointer = new THREE.Vector2();
    this.pointerTarget = new THREE.Vector2();
    this.anchors = [{ key: "home", y: 0 }];
    this.time = 0;
    this.warpOffset = 0;
    this.moonAngle = 2.2;
    this.tmpPos = new THREE.Vector3();
    this.tmpTarget = new THREE.Vector3();
    this.tmpDir = new THREE.Vector3();
    this.tmpRight = new THREE.Vector3();
    this.tmpUp = new THREE.Vector3();
    this.tmpA = new THREE.Vector3();

    this.initRenderer();
    this.bakeTextures();
    this.buildSky();
    this.buildPlanet();
    this.buildMoon();
    this.buildBelt();
    this.buildSun();
    this.buildWarp();

    const pose = this.samplePose(0);
    this.camPos = pose.pos.clone();
    this.camTarget = pose.target.clone();
    this.shift = pose.shift;

    this.onResize = this.onResize.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.tick = this.tick.bind(this);
    window.addEventListener("resize", this.onResize);
    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    this.onResize(true);
    this.playIntro();
    this.lastTime = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  initRenderer() {
    const canvas = document.createElement("canvas");
    canvas.className = "orbit__canvas";
    this.container.appendChild(canvas);
    this.canvas = canvas;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.mobile ? 1.5 : 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x020108, 1);
    this.renderer = renderer;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 3000);
    this.scene.add(this.camera);
  }

  bake(fragmentShader, width, height) {
    const target = new THREE.WebGLRenderTarget(width, height, {
      colorSpace: THREE.SRGBColorSpace,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      depthBuffer: false,
    });
    target.texture.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    const material = new THREE.ShaderMaterial({
      vertexShader: BAKE_VERT,
      fragmentShader,
      depthTest: false,
      depthWrite: false,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    const scene = new THREE.Scene();
    scene.add(quad);
    this.renderer.setRenderTarget(target);
    this.renderer.render(scene, new THREE.Camera());
    this.renderer.setRenderTarget(null);
    quad.geometry.dispose();
    material.dispose();
    this.disposables.push(target);
    return target.texture;
  }

  bakeTextures() {
    const w = this.mobile ? 1024 : 2048;
    const h = w / 2;
    this.textures = {
      surface: this.bake(SURFACE_BAKE, w, h),
      clouds: this.bake(CLOUDS_BAKE, w, h),
      nebula: this.bake(NEBULA_BAKE, w, h),
      moon: this.bake(MOON_BAKE, 512, 256),
    };
  }

  buildSky() {
    const sky = new THREE.Group();
    sky.rotation.set(0.35, 0, 0.55);
    this.scene.add(sky);

    const nebula = new THREE.Mesh(
      new THREE.SphereGeometry(1200, 64, 32),
      new THREE.MeshBasicMaterial({
        map: this.textures.nebula,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    );
    nebula.renderOrder = -10;
    sky.add(nebula);

    const pointsMaterial = (vertexShader, extraUniforms = {}) =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: POINTS_FRAG,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: this.renderer.getPixelRatio() },
          ...extraUniforms,
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

    const makePoints = (count, place) => {
      const positions = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      const phases = new Float32Array(count);
      const colors = new Float32Array(count * 3);
      const point = new THREE.Vector3();
      const color = new THREE.Color();
      for (let i = 0; i < count; i += 1) {
        place(point, color, i);
        positions.set([point.x, point.y, point.z], i * 3);
        colors.set([color.r, color.g, color.b], i * 3);
        sizes[i] = color.userSize;
        phases[i] = Math.random();
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
      geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
      geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
      return geometry;
    };

    const starGeometry = makePoints(this.mobile ? 2600 : 5200, (point, color) => {
      point.randomDirection();
      if (Math.random() < 0.45) {
        point.y *= 0.22;
        point.normalize();
      }
      point.multiplyScalar(650 + Math.random() * 350);
      const t = Math.random();
      if (t < 0.14) color.setRGB(1, 0.8, 0.6);
      else if (t < 0.45) color.setRGB(0.72, 0.82, 1);
      else color.setRGB(1, 1, 1);
      color.userSize = 1 + Math.pow(Math.random(), 7) * 4.5;
    });
    this.starsMaterial = pointsMaterial(STARS_VERT);
    sky.add(new THREE.Points(starGeometry, this.starsMaterial));

    const dustGeometry = makePoints(this.mobile ? 400 : 900, (point, color) => {
      point.randomDirection().multiplyScalar(16 + Math.random() * 140);
      color.setRGB(0.75, 0.82, 1);
      color.userSize = 0.6 + Math.random();
    });
    this.dustMaterial = pointsMaterial(DUST_VERT);
    this.scene.add(new THREE.Points(dustGeometry, this.dustMaterial));
  }

  buildPlanet() {
    const tilt = new THREE.Group();
    tilt.rotation.z = 0.24;
    this.scene.add(tilt);

    this.planetUniforms = {
      uSurface: { value: this.textures.surface },
      uClouds: { value: this.textures.clouds },
      uSunDir: { value: SUN_DIR },
      uCloudOffset: { value: 0 },
    };
    this.planet = new THREE.Mesh(
      new THREE.SphereGeometry(PLANET_RADIUS, 160, 80),
      new THREE.ShaderMaterial({
        vertexShader: SPHERE_VERT,
        fragmentShader: PLANET_FRAG,
        uniforms: this.planetUniforms,
      }),
    );
    this.planet.rotation.y = 2.4;
    tilt.add(this.planet);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(ATMOSPHERE_RADIUS, 96, 48),
      new THREE.ShaderMaterial({
        vertexShader: SPHERE_VERT,
        fragmentShader: ATMOSPHERE_FRAG,
        uniforms: {
          uSunDir: { value: SUN_DIR },
          uEdge: {
            value: Math.sqrt(1 - (PLANET_RADIUS / ATMOSPHERE_RADIUS) ** 2),
          },
          uIntensity: { value: 1.7 },
        },
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    this.scene.add(atmosphere);
  }

  buildMoon() {
    this.moon = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 64, 32),
      new THREE.MeshStandardMaterial({
        map: this.textures.moon,
        roughness: 1,
        metalness: 0,
      }),
    );
    this.scene.add(this.moon);
    this.placeMoon();
  }

  placeMoon() {
    const radius = 16.5;
    const inclination = 0.42;
    const a = this.moonAngle;
    this.moon.position.set(
      Math.cos(a) * radius,
      Math.sin(a) * radius * Math.sin(inclination),
      Math.sin(a) * radius * Math.cos(inclination),
    );
    this.moon.rotation.y = a * 0.5;
  }

  buildBelt() {
    const count = this.mobile ? 160 : 360;
    const geometry = new THREE.IcosahedronGeometry(1, 1);
    const position = geometry.attributes.position;
    const vertex = new THREE.Vector3();
    for (let i = 0; i < position.count; i += 1) {
      vertex.fromBufferAttribute(position, i);
      const bump =
        1 +
        0.32 * Math.sin(vertex.x * 3.1 + vertex.y * 1.7) * Math.cos(vertex.z * 2.3 - vertex.x * 1.1) +
        0.12 * Math.sin(vertex.y * 7 + vertex.z * 5);
      vertex.multiplyScalar(bump);
      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    geometry.computeVertexNormals();

    const mesh = new THREE.InstancedMesh(
      geometry,
      new THREE.MeshStandardMaterial({
        color: 0x8b8079,
        roughness: 0.95,
        metalness: 0.05,
        flatShading: true,
      }),
      count,
    );
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 42 + (Math.random() + Math.random()) * 7.5;
      dummy.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 2.4,
        Math.sin(angle) * radius,
      );
      dummy.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      const size = 0.18 + Math.pow(Math.random(), 3) * 1.1;
      dummy.scale.set(
        size * (0.7 + Math.random() * 0.6),
        size * (0.7 + Math.random() * 0.6),
        size * (0.7 + Math.random() * 0.6),
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    const group = new THREE.Group();
    group.rotation.set(0.32, 0, -0.14);
    group.add(mesh);
    this.scene.add(group);
    this.belt = mesh;
  }

  buildSun() {
    const glow = makeGlowTexture();
    const streak = makeStreakTexture();
    this.sunPos = SUN_DIR.clone().multiplyScalar(SUN_DISTANCE);

    const sprite = (map, color, { depthTest = true, opacity = 1 } = {}) => {
      const item = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map,
          color,
          opacity,
          depthTest,
          depthWrite: false,
          transparent: true,
          blending: THREE.AdditiveBlending,
        }),
      );
      item.position.copy(this.sunPos);
      item.renderOrder = depthTest ? 0 : 10;
      this.scene.add(item);
      return item;
    };

    const core = sprite(glow, 0xfff4e6);
    core.scale.setScalar(30);
    this.sunHalo = sprite(glow, 0xff9a52, { depthTest: false, opacity: 0.5 });
    this.sunHalo.scale.setScalar(320);
    this.sunStreak = sprite(streak, 0xffd6a8, { depthTest: false, opacity: 0.7 });
    this.sunStreak.scale.set(560, 12, 1);

    const light = new THREE.DirectionalLight(0xfff1de, 2.6);
    light.position.copy(SUN_DIR).multiplyScalar(100);
    this.scene.add(light);
    this.scene.add(new THREE.AmbientLight(0x5866ff, 0.08));
  }

  buildWarp() {
    const count = this.mobile ? 380 : 720;
    const positions = new Float32Array(count * 6);
    const ends = new Float32Array(count * 2);
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.pow(Math.random(), 0.6) * 60;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = -Math.random() * 420;
      positions.set([x, y, z, x, y, z], i * 6);
      ends[i * 2 + 1] = 1;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aEnd", new THREE.BufferAttribute(ends, 1));
    this.warpUniforms = {
      uWarp: { value: this.state.warp },
      uOffset: { value: 0 },
      uLength: { value: 90 },
      uColor: { value: new THREE.Color(0.72, 0.84, 1) },
    };
    const lines = new THREE.LineSegments(
      geometry,
      new THREE.ShaderMaterial({
        vertexShader: WARP_VERT,
        fragmentShader: WARP_FRAG,
        uniforms: this.warpUniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    lines.frustumCulled = false;
    this.camera.add(lines);
  }

  /** Section elements in document order; each must have an id with a pose. */
  setAnchors(elements) {
    const anchors = elements
      .filter((element) => POSES[element.id])
      .map((element) => ({
        key: element.id,
        y: Math.max(
          0,
          element.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3,
        ),
      }))
      .sort((a, b) => a.y - b.y);
    if (!anchors.length) return;
    anchors[0].y = 0;
    this.anchors = anchors;
    if (anchors.length > 1) {
      this.posCurve = new THREE.CatmullRomCurve3(
        anchors.map((anchor) => POSES[anchor.key].pos.clone()),
        false,
        "centripetal",
      );
      this.targetCurve = new THREE.CatmullRomCurve3(
        anchors.map((anchor) => POSES[anchor.key].target.clone()),
        false,
        "centripetal",
      );
    }
  }

  samplePose(scrollY) {
    const { anchors } = this;
    if (anchors.length < 2 || !this.posCurve) {
      const pose = POSES[anchors[0].key];
      this.tmpPos.copy(pose.pos);
      this.tmpTarget.copy(pose.target);
      return { pos: this.tmpPos, target: this.tmpTarget, shift: pose.shift };
    }
    let i = 0;
    while (i < anchors.length - 2 && scrollY >= anchors[i + 1].y) i += 1;
    const from = anchors[i];
    const to = anchors[i + 1];
    let t = clamp((scrollY - from.y) / Math.max(1, to.y - from.y), 0, 1);
    t = t * t * (3 - 2 * t);
    const u = (i + t) / (anchors.length - 1);
    this.posCurve.getPoint(u, this.tmpPos);
    this.targetCurve.getPoint(u, this.tmpTarget);
    let shift = lerp(POSES[from.key].shift, POSES[to.key].shift, t);

    if (this.portrait) {
      const pullBack = i === 0 ? lerp(1, 1.35, t) : 1.35;
      this.tmpPos.sub(this.tmpTarget).multiplyScalar(pullBack).add(this.tmpTarget);
      shift = 0;
    }
    return { pos: this.tmpPos, target: this.tmpTarget, shift };
  }

  playIntro() {
    this.introTimeline = gsap
      .timeline()
      .to(this.state, { intro: 1, duration: 3.4, ease: "power3.out" }, 0)
      .to(this.state, { warp: 0, duration: 2.8, ease: "power2.out" }, 0.15)
      .call(() => this.onIntroDone && this.onIntroDone(), null, 1.9);
  }

  warpPulse() {
    gsap.killTweensOf(this.state, "warp");
    gsap
      .timeline()
      .to(this.state, { warp: 1, duration: 0.9, ease: "power2.in" })
      .to(this.state, { warp: 0, duration: 2.4, ease: "power3.out" }, "+=0.9");
  }

  onPointerMove(event) {
    this.pointerTarget.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -((event.clientY / window.innerHeight) * 2 - 1),
    );
  }

  onResize(force = false) {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    const touch = window.matchMedia("(pointer: coarse)").matches;
    // Ignore mobile URL-bar height jitter to avoid re-allocating buffers while scrolling.
    if (
      force !== true &&
      touch &&
      width === this.width &&
      Math.abs(height - this.height) < 160
    ) {
      return;
    }
    this.width = width;
    this.height = height;
    this.portrait = width / height < 0.9;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    const ratio = this.renderer.getPixelRatio();
    this.starsMaterial.uniforms.uPixelRatio.value = ratio;
    this.dustMaterial.uniforms.uPixelRatio.value = ratio;
  }

  updateSun() {
    const camera = this.camera.position;
    const toSun = this.tmpA.subVectors(this.sunPos, camera).normalize();
    const along = -camera.dot(toSun);
    let visibility = 1;
    if (along > 0) {
      const closest = Math.sqrt(Math.max(0, camera.lengthSq() - along * along));
      visibility = smoothstep(PLANET_RADIUS * 0.985, ATMOSPHERE_RADIUS * 1.03, closest);
    }
    this.sunHalo.material.opacity = 0.16 + 0.42 * visibility;
    this.sunStreak.material.opacity = 0.75 * visibility;
  }

  tick(now) {
    this.frame = requestAnimationFrame(this.tick);
    const dt = clamp((now - this.lastTime) / 1000, 0, 0.05);
    this.lastTime = now;
    this.time += dt;

    const pose = this.samplePose(window.scrollY);
    const ease = damp(2.6, dt);
    this.camPos.lerp(pose.pos, ease);
    this.camTarget.lerp(pose.target, ease);
    this.shift += (pose.shift - this.shift) * ease;
    this.pointer.lerp(this.pointerTarget, damp(3, dt));

    const camera = this.camera;
    this.tmpDir.subVectors(this.camTarget, this.camPos).normalize();
    this.tmpRight.crossVectors(this.tmpDir, UP).normalize();
    this.tmpUp.crossVectors(this.tmpRight, this.tmpDir).normalize();
    camera.position
      .copy(this.camPos)
      .addScaledVector(this.tmpRight, this.pointer.x * 0.9)
      .addScaledVector(this.tmpUp, this.pointer.y * 0.6)
      .addScaledVector(this.tmpDir, -70 * (1 - this.state.intro));
    camera.lookAt(this.camTarget);
    camera.fov = 50 + 26 * this.state.warp;
    camera.setViewOffset(
      this.width,
      this.height,
      -this.shift * this.width,
      0,
      this.width,
      this.height,
    );

    this.planet.rotation.y += dt * 0.012;
    this.planetUniforms.uCloudOffset.value += dt * 0.0016;
    this.moonAngle += dt * 0.045;
    this.placeMoon();
    this.belt.rotation.y += dt * 0.006;
    this.starsMaterial.uniforms.uTime.value = this.time;
    this.dustMaterial.uniforms.uTime.value = this.time;

    this.warpOffset += dt * 900 * this.state.warp;
    this.warpUniforms.uWarp.value = this.state.warp;
    this.warpUniforms.uOffset.value = this.warpOffset;

    this.updateSun();
    this.renderer.render(this.scene, camera);
  }

  dispose() {
    cancelAnimationFrame(this.frame);
    if (this.introTimeline) this.introTimeline.kill();
    gsap.killTweensOf(this.state);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("pointermove", this.onPointerMove);
    this.scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
          if (material.map) material.map.dispose();
          material.dispose();
        });
      }
    });
    this.disposables.forEach((item) => item.dispose());
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.canvas.remove();
  }
}
