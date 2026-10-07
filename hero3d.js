// Three.js hero background: a wireframe football spinning through a field of red embers.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

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

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x070708, 0.045);

const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
camera.position.set(0, 0, 11);

// --- Football: an elongated sphere rendered as glowing red wire + faint inner shell
const ballGroup = new THREE.Group();
const ballGeo = new THREE.SphereGeometry(2.4, 18, 12);
ballGeo.scale(1.75, 1, 1);

const wire = new THREE.LineSegments(
  new THREE.EdgesGeometry(ballGeo, 1),
  new THREE.LineBasicMaterial({ color: 0xe8141c, transparent: true, opacity: 0.75 })
);
ballGroup.add(wire);

const shell = new THREE.Mesh(
  ballGeo,
  new THREE.MeshBasicMaterial({ color: 0x3a0609, transparent: true, opacity: 0.35, side: THREE.BackSide })
);
ballGroup.add(shell);

// Laces: a seam line plus short cross-stitches along the top of the ball
const laceMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
const seam = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(-1.6, 2.42, 0), new THREE.Vector3(1.6, 2.42, 0),
]);
ballGroup.add(new THREE.Line(seam, laceMat));
for (let i = -1.2; i <= 1.2; i += 0.4) {
  const stitch = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(i, 2.45, -0.35), new THREE.Vector3(i, 2.45, 0.35),
  ]);
  ballGroup.add(new THREE.Line(stitch, laceMat));
}
ballGroup.rotation.z = -0.35;
scene.add(ballGroup);

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
  return new THREE.CanvasTexture(c);
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

  ballGroup.rotation.y = t * 0.35;
  ballGroup.rotation.x = Math.sin(t * 0.4) * 0.25;
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
