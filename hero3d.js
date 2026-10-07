// Three.js hero background: a real football model spinning through a field of red embers.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const MODEL_URL = 'assets/american-football.glb';
const BALL_LENGTH = 7; // world units, long axis

const canvas = document.getElementById('bg3d');
const hero = document.getElementById('hero');
if (!canvas || !hero) throw new Error('hero canvas missing');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
} catch (err) {
  canvas.style.display = 'none';
  throw err;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x070708, 0.04);

const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
camera.position.set(0, 0, 11);

// --- Lighting: soft fill, a white key from above, red rims from the sides
scene.add(new THREE.AmbientLight(0xffffff, 0.9));
scene.add(new THREE.HemisphereLight(0xffffff, 0x3a0609, 1.4));
const key = new THREE.DirectionalLight(0xffffff, 4.5);
key.position.set(4, 6, 8);
scene.add(key);
const fill = new THREE.DirectionalLight(0xffd9c2, 1.6);
fill.position.set(-5, -2, 6);
scene.add(fill);
const rimL = new THREE.PointLight(0xe8141c, 140, 40);
rimL.position.set(-7, 2, 3);
scene.add(rimL);
const rimR = new THREE.PointLight(0xff5a2a, 100, 40);
rimR.position.set(7, -3, 4);
scene.add(rimR);

// --- Football model
const ballGroup = new THREE.Group();
ballGroup.rotation.z = -0.35;
scene.add(ballGroup);

new GLTFLoader().load(
  MODEL_URL,
  (gltf) => {
    const model = gltf.scene;
    // Center the model and scale its long axis to BALL_LENGTH
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = BALL_LENGTH / Math.max(size.x, size.y, size.z);
    model.position.sub(center).multiplyScalar(s);
    model.scale.setScalar(s);
    model.traverse((o) => {
      if (o.isMesh && o.material) {
        o.material.envMapIntensity = 1;
        o.material.needsUpdate = true;
      }
    });
    ballGroup.add(model);
  },
  undefined,
  (err) => console.warn('Football model failed to load; showing embers only.', err)
);

// --- Embers: additive red/orange points drifting upward
const COUNT = 1100;
const positions = new Float32Array(COUNT * 3);
const speeds = new Float32Array(COUNT);
const SPREAD = { x: 22, y: 14, z: 16 };
for (let i = 0; i < COUNT; i++) {
  positions[i * 3] = (Math.random() - 0.5) * SPREAD.x;
  positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD.y;
  positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD.z - 2;
  speeds[i] = 0.004 + Math.random() * 0.012;
}
const emberGeo = new THREE.BufferGeometry();
emberGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const emberSprite = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,120,90,1)');
  grad.addColorStop(0.35, 'rgba(232,20,28,0.8)');
  grad.addColorStop(1, 'rgba(232,20,28,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
})();

const embers = new THREE.Points(
  emberGeo,
  new THREE.PointsMaterial({
    map: emberSprite,
    size: 0.28,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
);
scene.add(embers);

// --- Sizing
function resize() {
  const w = hero.clientWidth;
  const h = hero.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

// --- Mouse / touch parallax
const target = { x: 0, y: 0 };
window.addEventListener('pointermove', (e) => {
  target.x = (e.clientX / window.innerWidth - 0.5) * 2;
  target.y = (e.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

// --- Animate
const clock = new THREE.Clock();
function frame() {
  const t = clock.getElapsedTime();

  // Spin around the ball's long axis, with a slow tumble and gentle float
  ballGroup.rotation.x = t * 0.6;
  ballGroup.rotation.y = Math.sin(t * 0.25) * 0.35;
  ballGroup.position.y = Math.sin(t * 0.8) * 0.25;

  const pos = emberGeo.attributes.position.array;
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3 + 1] += speeds[i];
    pos[i * 3] += Math.sin(t + i) * 0.0015;
    if (pos[i * 3 + 1] > SPREAD.y / 2) pos[i * 3 + 1] = -SPREAD.y / 2;
  }
  emberGeo.attributes.position.needsUpdate = true;

  camera.position.x += (target.x * 1.2 - camera.position.x) * 0.04;
  camera.position.y += (-target.y * 0.8 - camera.position.y) * 0.04;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
  if (!reduceMotion) requestAnimationFrame(frame);
}
frame();
