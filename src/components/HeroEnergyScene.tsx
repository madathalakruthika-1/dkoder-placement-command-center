import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArrowDownRight, ArrowRight, AudioLines, Code2, Flame, MousePointer2, Sparkles, Target, Zap } from 'lucide-react';

type Point = { x: number; y: number; age: number; speed: number };
type Particle = { x: number; y: number; z: number; size: number; phase: number };
type Burst = { x: number; y: number; started: number };
type Props = { selectedCompany: string; missionPulse: number; onBuildMission: () => void };

const accents: Record<string, string> = {
  Amazon: '#d6fa50', Microsoft: '#86c9ff', Google: '#a58aff', Apple: '#d8e1f4', Meta: '#75baff', NVIDIA: '#9cff70', Adobe: '#ff8d9d',
  TCS: '#87d5ff', Infosys: '#9f8bff', Wipro: '#bb8cff', Accenture: '#c195ff', Zoho: '#ffad7b',
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const hexRgb = (hex: string) => {
  const value = hex.replace('#', '');
  return { r: parseInt(value.slice(0, 2), 16), g: parseInt(value.slice(2, 4), 16), b: parseInt(value.slice(4, 6), 16) };
};

function makeVertices() {
  const phi = (1 + Math.sqrt(5)) / 2;
  const raw = [
    [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
    [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
    [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1],
  ];
  const radius = Math.sqrt(1 + phi * phi);
  return raw.map(([x, y, z]) => ({ x: x / radius, y: y / radius, z: z / radius }));
}

const VERTICES = makeVertices();
const EDGES: [number, number][] = [];
for (let i = 0; i < VERTICES.length; i += 1) {
  for (let j = i + 1; j < VERTICES.length; j += 1) {
    const a = VERTICES[i];
    const b = VERTICES[j];
    if (Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < 1.06) EDGES.push([i, j]);
  }
}

export default function HeroEnergyScene({ selectedCompany, missionPulse, onBuildMission }: Props) {
  const shellRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const pointRef = useRef({ x: 0, y: 0, nx: 0, ny: 0, speed: 0, inside: false, lastX: 0, lastY: 0, lastTime: 0 });
  const accent = useRef('#d6fa50');
  const burstRef = useRef<Burst | null>(null);
  const driveTimeoutRef = useRef<number | null>(null);
  const webglRef = useRef(false);
  const [driveActive, setDriveActive] = useState(false);
  const [webglAvailable, setWebglAvailable] = useState(true);

  useEffect(() => {
    accent.current = accents[selectedCompany] ?? '#ad91ff';
    shellRef.current?.style.setProperty('--energy-accent', accent.current);
  }, [selectedCompany]);

  useEffect(() => {
    if (!missionPulse) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    burstRef.current = { x: canvas.clientWidth * 0.62, y: canvas.clientHeight * 0.48, started: performance.now() };
    setDriveActive(true);
    const timeout = window.setTimeout(() => setDriveActive(false), 3600);
    return () => window.clearTimeout(timeout);
  }, [missionPulse]);

  useEffect(() => {
    const shell = shellRef.current;
    const trailCanvas = canvasRef.current;
    if (!shell || !trailCanvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.className = 'energy-webgl';
      renderer.domElement.setAttribute('aria-hidden', 'true');
      shell.insertBefore(renderer.domElement, trailCanvas);
    } catch {
      webglRef.current = false;
      setWebglAvailable(false);
      return;
    }

    webglRef.current = true;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0, 8.2);
    const root = new THREE.Group();
    scene.add(root);
    scene.add(new THREE.AmbientLight(0x9285c7, 1.25));
    const keyLight = new THREE.PointLight(0xd6fa50, 15, 10, 2);
    keyLight.position.set(2.1, 1.8, 3.2);
    root.add(keyLight);
    const coolLight = new THREE.PointLight(0x668dff, 17, 11, 2);
    coolLight.position.set(-2.4, -1.1, 2.3);
    root.add(coolLight);

    const core = new THREE.Group();
    root.add(core);
    const crystalGeometry = new THREE.IcosahedronGeometry(1.55, 1);
    const crystalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x6e48a2,
      emissive: 0x301666,
      emissiveIntensity: 0.42,
      metalness: 0.65,
      roughness: 0.2,
      transmission: 0.22,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      flatShading: true,
      depthWrite: false,
    });
    const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
    core.add(crystal);

    const wireMaterial = new THREE.LineBasicMaterial({ color: 0xd6fa50, transparent: true, opacity: 0.76 });
    const wire = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.57, 1)), wireMaterial);
    core.add(wire);
    const innerWireMaterial = new THREE.LineBasicMaterial({ color: 0xae88ff, transparent: true, opacity: 0.62 });
    const innerWire = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.17, 1)), innerWireMaterial);
    innerWire.rotation.set(0.34, 0.52, 0.18);
    core.add(innerWire);
    const outerWireMaterial = new THREE.LineBasicMaterial({ color: 0x67ceff, transparent: true, opacity: 0.38 });
    const outerWire = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.83, 0)), outerWireMaterial);
    outerWire.rotation.set(-0.2, 0.35, 0.55);
    core.add(outerWire);

    const glowMaterial = new THREE.MeshBasicMaterial({ color: 0x8a63ed, transparent: true, opacity: 0.22, side: THREE.BackSide, depthWrite: false });
    const glow = new THREE.Mesh(new THREE.SphereGeometry(1.1, 24, 24), glowMaterial);
    core.add(glow);

    const haloCanvas = document.createElement('canvas');
    haloCanvas.width = 128;
    haloCanvas.height = 128;
    const haloContext = haloCanvas.getContext('2d');
    if (haloContext) {
      const haloGradient = haloContext.createRadialGradient(64, 64, 1, 64, 64, 64);
      haloGradient.addColorStop(0, 'rgba(255,255,255,1)');
      haloGradient.addColorStop(0.08, 'rgba(214,250,80,0.95)');
      haloGradient.addColorStop(0.27, 'rgba(169,128,255,0.48)');
      haloGradient.addColorStop(1, 'rgba(111,110,255,0)');
      haloContext.fillStyle = haloGradient;
      haloContext.fillRect(0, 0, 128, 128);
    }
    const haloTexture = new THREE.CanvasTexture(haloCanvas);
    const haloMaterial = new THREE.SpriteMaterial({ map: haloTexture, color: 0xd6fa50, transparent: true, opacity: 0.84, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
    const coreHalo = new THREE.Sprite(haloMaterial);
    coreHalo.scale.set(2.4, 2.4, 1);
    core.add(coreHalo);
    const innerCore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.22, 1),
      new THREE.MeshBasicMaterial({ color: 0xf8f5ff, transparent: true, opacity: 0.94 }),
    );
    core.add(innerCore);

    const pointCount = window.innerWidth < 600 ? 210 : window.innerWidth < 1000 ? 360 : 580;
    const positions = new Float32Array(pointCount * 3);
    const pointColors = new Float32Array(pointCount * 3);
    for (let index = 0; index < pointCount; index += 1) {
      const u = Math.random();
      const v = Math.random();
      const theta = Math.PI * 2 * u;
      const phi = Math.acos(2 * v - 1);
      const radius = 0.25 + Math.pow(Math.random(), 0.62) * 0.88;
      positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[index * 3 + 1] = radius * Math.cos(phi);
      positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      const color = new THREE.Color(index % 6 === 0 ? 0xd6fa50 : index % 2 === 0 ? 0x78ccff : 0xc3a9ff);
      pointColors[index * 3] = color.r;
      pointColors[index * 3 + 1] = color.g;
      pointColors[index * 3 + 2] = color.b;
    }
    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pointGeometry.setAttribute('color', new THREE.BufferAttribute(pointColors, 3));
    const pointMaterial = new THREE.PointsMaterial({ size: 0.037, vertexColors: true, transparent: true, opacity: 0.98, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
    const corePoints = new THREE.Points(pointGeometry, pointMaterial);
    core.add(corePoints);

    const ringGroup = new THREE.Group();
    root.add(ringGroup);
    const orbitMaterials = [0xa981ff, 0xd6fa50, 0x61caff].map((color) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false }));
    const orbit1 = new THREE.Mesh(new THREE.TorusGeometry(2.12, 0.006, 3, 128), orbitMaterials[0]);
    orbit1.rotation.set(1.05, 0.25, 0.2);
    const orbit2 = new THREE.Mesh(new THREE.TorusGeometry(2.32, 0.004, 3, 128), orbitMaterials[1]);
    orbit2.rotation.set(0.48, 1.22, 0.1);
    const orbit3 = new THREE.Mesh(new THREE.TorusGeometry(1.94, 0.004, 3, 128), orbitMaterials[2]);
    orbit3.rotation.set(1.42, -0.42, 0.65);
    ringGroup.add(orbit1, orbit2, orbit3);

    const ambientCount = window.innerWidth < 600 ? 90 : 150;
    const ambientPositions = new Float32Array(ambientCount * 3);
    const ambientColors = new Float32Array(ambientCount * 3);
    for (let i = 0; i < ambientCount; i += 1) {
      ambientPositions[i * 3] = (Math.random() - 0.5) * 11;
      ambientPositions[i * 3 + 1] = (Math.random() - 0.5) * 6.5;
      ambientPositions[i * 3 + 2] = (Math.random() - 0.5) * 5 - 1;
      const color = new THREE.Color(i % 4 === 0 ? 0xd6fa50 : i % 3 === 0 ? 0x8f6af2 : 0x82cfff);
      ambientColors[i * 3] = color.r;
      ambientColors[i * 3 + 1] = color.g;
      ambientColors[i * 3 + 2] = color.b;
    }
    const ambientGeometry = new THREE.BufferGeometry();
    ambientGeometry.setAttribute('position', new THREE.BufferAttribute(ambientPositions, 3));
    ambientGeometry.setAttribute('color', new THREE.BufferAttribute(ambientColors, 3));
    const ambientMaterial = new THREE.PointsMaterial({ size: 0.018, vertexColors: true, transparent: true, opacity: 0.62, blending: THREE.AdditiveBlending, depthWrite: false });
    const ambientPoints = new THREE.Points(ambientGeometry, ambientMaterial);
    scene.add(ambientPoints);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hue = new THREE.Color();
    const pointer = pointRef.current;
    const resize = () => {
      const rect = shell.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = width < 600 ? 9.4 : width < 1000 ? 8.7 : 8.2;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 600 ? 1.2 : 1.5));
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(shell);
    resize();

    let request = 0;
    let elapsed = 0;
    let pulseStrength = 0;
    const animate = (now: number) => {
      elapsed += reducedMotion ? 0.0008 : 0.003;
      const width = shell.clientWidth || 1;
      const height = shell.clientHeight || 1;
      const targetX = pointer.inside ? pointer.nx * 0.22 : 0;
      const targetY = pointer.inside ? -pointer.ny * 0.2 : 0;
      root.rotation.y += ((targetX + elapsed * 0.16) - root.rotation.y) * 0.035;
      root.rotation.x += (targetY + Math.sin(elapsed * 0.55) * 0.045 - root.rotation.x) * 0.035;
      const pointerX = pointer.inside ? (pointer.x / width - 0.62) * 5.6 : 0;
      const pointerY = pointer.inside ? -(pointer.y / height - 0.47) * 3.4 : 0;
      core.position.x += (pointerX - core.position.x) * 0.024;
      core.position.y += (pointerY - core.position.y) * 0.024;
      wire.rotation.y += 0.0018 * (reducedMotion ? 0.15 : 1);
      wire.rotation.x += 0.001 * (reducedMotion ? 0.15 : 1);
      innerWire.rotation.y -= 0.0022 * (reducedMotion ? 0.15 : 1);
      innerWire.rotation.z += 0.0013 * (reducedMotion ? 0.15 : 1);
      outerWire.rotation.x += 0.0009 * (reducedMotion ? 0.15 : 1);
      outerWire.rotation.z -= 0.0012 * (reducedMotion ? 0.15 : 1);
      corePoints.rotation.y = -elapsed * 0.4 + pointer.nx * 0.1;
      corePoints.rotation.x = elapsed * 0.23 + pointer.ny * 0.08;
      ringGroup.rotation.y += 0.0014 * (reducedMotion ? 0.15 : 1);
      ringGroup.rotation.z -= 0.0008 * (reducedMotion ? 0.15 : 1);
      ambientPoints.rotation.y = Math.sin(elapsed * 0.13) * 0.035 + pointer.nx * 0.015;
      ambientPoints.rotation.x = pointer.ny * 0.014;
      hue.set(accent.current);
      wireMaterial.color.copy(hue);
      keyLight.color.copy(hue);
      orbitMaterials[1].color.copy(hue);
      haloMaterial.color.copy(hue);

      const burst = burstRef.current;
      if (burst) {
        const progress = (now - burst.started) / (reducedMotion ? 700 : 1400);
        if (progress >= 1) burstRef.current = null;
        else pulseStrength = Math.max(pulseStrength, Math.sin(progress * Math.PI) * 0.21);
      }
      pulseStrength *= 0.94;
      const scale = 1 + pulseStrength + pointer.speed * 0.018;
      core.scale.setScalar(scale);
      crystalMaterial.emissiveIntensity = 0.42 + (pointer.inside ? 0.2 : 0) + pulseStrength * 2;
      wireMaterial.opacity = 0.7 + (pointer.speed > 0.4 ? 0.2 : 0) + pulseStrength;
      glowMaterial.opacity = 0.1 + pulseStrength * 0.6 + (pointer.inside ? 0.035 : 0);
      keyLight.intensity = 12 + pointer.speed * 6 + pulseStrength * 32;
      ambientMaterial.opacity = 0.54 + Math.sin(elapsed * 1.2) * 0.08;
      renderer.render(scene, camera);
      request = window.requestAnimationFrame(animate);
    };
    request = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(request);
      if (driveTimeoutRef.current !== null) window.clearTimeout(driveTimeoutRef.current);
      resizeObserver.disconnect();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments || object instanceof THREE.Points) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      haloTexture.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      webglRef.current = false;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const shell = shellRef.current;
    if (!canvas || !shell) return;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) {
      setWebglAvailable(false);
      return;
    }

    const ctx = context;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const trail: Point[] = [];
    let particles: Particle[] = [];
    let width = 1;
    let height = 1;
    let frame = 0;
    let previousTime = 0;
    let active = true;

    const resize = () => {
      const rect = shell.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, width < 600 ? 1.25 : 1.7);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = reducedMotion ? 55 : width < 600 ? 115 : width < 1000 ? 175 : 260;
      particles = Array.from({ length: count }, () => ({ x: Math.random() * width, y: Math.random() * height, z: Math.random(), size: 0.35 + Math.random() * 1.35, phase: Math.random() * Math.PI * 2 }));
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(shell);
    resize();

    const onMove = (event: PointerEvent) => {
      const rect = shell.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const pointer = pointRef.current;
      const now = performance.now();
      const dt = Math.max(10, now - (pointer.lastTime || now - 16));
      const dx = x - pointer.lastX;
      const dy = y - pointer.lastY;
      pointer.speed = clamp(Math.hypot(dx, dy) / dt, 0, 2.4);
      pointer.x = x;
      pointer.y = y;
      pointer.nx = (x / width - 0.5) * 2;
      pointer.ny = (y / height - 0.5) * 2;
      pointer.lastX = x;
      pointer.lastY = y;
      pointer.lastTime = now;
      pointer.inside = true;
      if (!isTouch) {
        const cursor = cursorRef.current;
        if (cursor) cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-4px, -3px) rotate(${clamp(dx * 0.25, -8, 8)}deg)`;
      }
      if (Math.hypot(dx, dy) > 1.5) trail.push({ x, y, age: 0, speed: pointer.speed });
      if (trail.length > (width < 600 ? 25 : 42)) trail.shift();
    };
    const onLeave = () => {
      pointRef.current.inside = false;
      pointRef.current.speed = 0;
    };
    const onClick = (event: MouseEvent) => {
      const rect = shell.getBoundingClientRect();
      burstRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top, started: performance.now() };
    };
    shell.addEventListener('pointermove', onMove, { passive: true });
    shell.addEventListener('pointerleave', onLeave, { passive: true });
    shell.addEventListener('click', onClick);

    const draw = (time: number) => {
      if (!active) return;
      const dt = Math.min(32, time - (previousTime || time));
      previousTime = time;
      const rgb = hexRgb(accent.current);
      const p = pointRef.current;
      const motion = reducedMotion ? 0.16 : 1;
      ctx.clearRect(0, 0, width, height);

      const wash = ctx.createRadialGradient(width * 0.64, height * 0.47, 5, width * 0.64, height * 0.47, Math.min(width, height) * 0.76);
      wash.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},0.09)`);
      wash.addColorStop(0.42, 'rgba(107,68,157,0.07)');
      wash.addColorStop(1, 'rgba(7,6,14,0)');
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, width, height);

      // Sparse, depth-layered ambient dust; pointer velocity bends nearby particles.
      for (const particle of particles) {
        particle.phase += dt * 0.00035 * motion;
        let x = particle.x + Math.sin(particle.phase) * 3;
        let y = particle.y + Math.cos(particle.phase * 0.8) * 2;
        if (p.inside && p.speed > 0.03) {
          const dx = x - p.x;
          const dy = y - p.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 130 && distance > 1) {
            const force = (1 - distance / 130) * p.speed * 0.13;
            x += (dx / distance) * force;
            y += (dy / distance) * force;
          }
        }
        const alpha = 0.16 + (Math.sin(particle.phase) + 1) * 0.13;
        ctx.fillStyle = particle.phase % 3 > 2 ? `rgba(197,167,255,${alpha})` : `rgba(220,229,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, particle.size * (0.65 + particle.z * 0.55), 0, Math.PI * 2);
        ctx.fill();
      }

      // Cursor-threaded luminous ribbons with a curved, slowly fading tail.
      for (const point of trail) point.age += dt * (0.035 + point.speed * 0.012);
      while (trail.length && trail[0].age > 1) trail.shift();
      if (trail.length > 2) {
        const ribbons = [
          { color: '255,255,255', width: 1.3, shift: -4 },
          { color: `${rgb.r},${rgb.g},${rgb.b}`, width: 2.8, shift: 0 },
          { color: '158,119,255', width: 5.2, shift: 6 },
          { color: '104,216,255', width: 1.4, shift: 10 },
        ];
        for (const ribbon of ribbons) {
          ctx.beginPath();
          trail.forEach((point, index) => {
            const next = trail[Math.min(index + 1, trail.length - 1)];
            const dx = next.x - point.x;
            const dy = next.y - point.y;
            const length = Math.max(1, Math.hypot(dx, dy));
            const nx = -dy / length;
            const ny = dx / length;
            const x = point.x + nx * ribbon.shift;
            const y = point.y + ny * ribbon.shift;
            if (index === 0) ctx.moveTo(x, y);
            else {
              const previous = trail[index - 1];
              const px = previous.x - (previous.y - point.y) / length * ribbon.shift;
              const py = previous.y + (previous.x - point.x) / length * ribbon.shift;
              ctx.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2);
            }
          });
          const fade = Math.max(0, 1 - trail[trail.length - 1].age);
          ctx.strokeStyle = `rgba(${ribbon.color},${fade * (ribbon.color === '255,255,255' ? 0.65 : 0.36)})`;
          ctx.lineWidth = ribbon.width + p.speed * (ribbon.width > 2 ? 1.5 : 0.4);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.shadowColor = `rgba(${ribbon.color},${fade * 0.82})`;
          ctx.shadowBlur = ribbon.width > 2 ? 17 + p.speed * 15 : 7;
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        const tail = trail[trail.length - 1];
        if (p.speed > 0.18 && Math.random() < p.speed * 0.38) {
          particles.push({ x: tail.x + (Math.random() - 0.5) * 18, y: tail.y + (Math.random() - 0.5) * 18, z: 0.5, size: 0.6 + Math.random(), phase: Math.random() * Math.PI * 2 });
          if (particles.length > (width < 600 ? 145 : 290)) particles.shift();
        }
      }

      // Canvas fallback geometry is used only when WebGL cannot initialize.
      if (!webglRef.current) {
      const centerX = width * (width < 600 ? 0.64 : 0.655) + p.nx * 13;
      const centerY = height * 0.47 + p.ny * 9;
      const radius = Math.min(height * (width < 600 ? 0.245 : 0.285), width * 0.255, 205);
      const idle = time * 0.00019 * motion;
      const tiltY = idle + p.nx * 0.34;
      const tiltX = Math.sin(idle * 0.74) * 0.2 + p.ny * 0.25;
      const project = (x: number, y: number, z: number, scale = 1) => {
        const a = x * Math.cos(tiltY) - z * Math.sin(tiltY);
        const c = x * Math.sin(tiltY) + z * Math.cos(tiltY);
        const b = y * Math.cos(tiltX) - c * Math.sin(tiltX);
        const d = y * Math.sin(tiltX) + c * Math.cos(tiltX);
        const perspective = 3.7 / (3.7 - d * 0.62);
        return { x: centerX + a * radius * perspective * scale, y: centerY + b * radius * perspective * scale, z: d };
      };
      const coreGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.25);
      coreGlow.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},0.22)`);
      coreGlow.addColorStop(0.28, 'rgba(116,80,222,0.12)');
      coreGlow.addColorStop(1, 'rgba(75,85,180,0)');
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      const layers = [
        { scale: 1, rotation: 0, color: `rgba(${rgb.r},${rgb.g},${rgb.b},0.82)`, width: 1.35, glow: 13 },
        { scale: 0.79, rotation: time * 0.00011 * motion + 0.7, color: 'rgba(181,145,255,0.65)', width: 0.75, glow: 8 },
        { scale: 1.18, rotation: -time * 0.00008 * motion + 1.1, color: 'rgba(107,202,255,0.43)', width: 0.65, glow: 6 },
      ];
      for (const layer of layers) {
        const points = VERTICES.map((vertex) => {
          const x = vertex.x * Math.cos(layer.rotation) - vertex.z * Math.sin(layer.rotation);
          const z = vertex.x * Math.sin(layer.rotation) + vertex.z * Math.cos(layer.rotation);
          return project(x, vertex.y, z, layer.scale);
        });
        ctx.strokeStyle = layer.color;
        ctx.lineWidth = layer.width;
        ctx.shadowColor = layer.color;
        ctx.shadowBlur = layer.glow;
        for (const [from, to] of EDGES) {
          const a = points[from];
          const b = points[to];
          ctx.globalAlpha = clamp(0.47 + (a.z + b.z + 2) * 0.12, 0.3, 0.9);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }

      // A dense but bounded luminous point field gives the crystal a living interior.
      const coreCount = width < 600 ? 125 : 240;
      for (let i = 0; i < coreCount; i += 1) {
        const angle = i * 2.399963 + time * 0.00015 * motion;
        const radial = Math.sqrt((i + 0.5) / coreCount) * radius * 0.58;
        const z = Math.sin(angle * 2.17 + i) * radius * 0.23;
        const localX = Math.cos(angle) * radial;
        const localY = Math.sin(angle) * radial;
        const point = project(localX / radius, localY / radius, z / radius, 0.78);
        const twinkle = 0.32 + (Math.sin(time * 0.002 + i * 1.73) + 1) * 0.31;
        ctx.fillStyle = i % 7 === 0 ? `rgba(${rgb.r},${rgb.g},${rgb.b},${twinkle})` : `rgba(138,193,255,${twinkle})`;
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = i % 7 === 0 ? 8 : 4;
        ctx.beginPath();
        ctx.arc(point.x, point.y, i % 5 === 0 ? 1.5 : 0.85, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      }

      // Ambient energy arcs keep the scene cinematic even before pointer movement.
      for (let ribbon = 0; ribbon < 3; ribbon += 1) {
        const phase = time * 0.00024 * motion + ribbon * 0.8;
        const startX = width * (0.43 + ribbon * 0.055);
        const startY = height * (0.78 - ribbon * 0.045);
        const endX = width * (0.94 - ribbon * 0.015);
        const endY = height * (0.25 + ribbon * 0.1);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.bezierCurveTo(width * (0.65 + Math.sin(phase) * 0.025), height * (0.98 - ribbon * 0.08), width * (0.78 + Math.cos(phase) * 0.03), height * (0.26 + ribbon * 0.05), endX, endY);
        ctx.strokeStyle = ribbon === 0 ? `rgba(${rgb.r},${rgb.g},${rgb.b},0.19)` : ribbon === 1 ? 'rgba(151,113,255,0.14)' : 'rgba(90,202,255,0.11)';
        ctx.lineWidth = ribbon === 0 ? 1.5 : 1;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 12;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      const burst = burstRef.current;
      if (burst) {
        const progress = (time - burst.started) / (reducedMotion ? 620 : 1350);
        if (progress >= 1) burstRef.current = null;
        else {
          const ease = 1 - (1 - progress) ** 3;
          for (let ring = 0; ring < 3; ring += 1) {
            const r = ease * (55 + ring * 22);
            ctx.beginPath();
            ctx.arc(burst.x, burst.y, r, 0, Math.PI * 2);
            ctx.strokeStyle = ring === 0 ? `rgba(${rgb.r},${rgb.g},${rgb.b},${(1 - progress) * 0.8})` : `rgba(173,137,255,${(1 - progress) * 0.55})`;
            ctx.lineWidth = ring === 0 ? 2 : 1;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 14;
            ctx.stroke();
          }
          for (let spark = 0; spark < 24; spark += 1) {
            const angle = spark * (Math.PI * 2 / 24) + progress * 1.7;
            const distance = ease * (45 + (spark % 4) * 10);
            ctx.fillStyle = spark % 2 ? `rgba(${rgb.r},${rgb.g},${rgb.b},${1 - progress})` : `rgba(174,144,255,${1 - progress})`;
            ctx.beginPath();
            ctx.arc(burst.x + Math.cos(angle) * distance, burst.y + Math.sin(angle) * distance, (1 - progress) * 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.shadowBlur = 0;
        }
      }
      p.speed *= 0.92;
      frame = window.requestAnimationFrame(draw);
    };
    frame = window.requestAnimationFrame(draw);

    return () => {
      active = false;
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      shell.removeEventListener('pointermove', onMove);
      shell.removeEventListener('pointerleave', onLeave);
      shell.removeEventListener('click', onClick);
      trail.length = 0;
      particles = [];
    };
  }, []);

  const triggerEnergyDrive = () => {
    const canvas = canvasRef.current;
    burstRef.current = { x: (canvas?.clientWidth ?? 0) * 0.62, y: (canvas?.clientHeight ?? 0) * 0.48, started: performance.now() };
    setDriveActive(true);
    if (driveTimeoutRef.current !== null) window.clearTimeout(driveTimeoutRef.current);
    driveTimeoutRef.current = window.setTimeout(() => {
      setDriveActive(false);
      driveTimeoutRef.current = null;
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1200 : 3600);
  };

  return (
    <div className={`hero-energy${driveActive ? ' energy-drive-active' : ''}${webglAvailable ? '' : ' energy-fallback'}`} ref={shellRef}>
      <canvas ref={canvasRef} className="energy-canvas" aria-hidden="true" />
      <div className="energy-vignette" aria-hidden="true" />
      <div className="energy-technical energy-technical-top" aria-hidden="true">DK / PLACEMENT INTELLIGENCE<br />FIELD NODE — {selectedCompany.toUpperCase()}<br />SIGNAL 0{Math.round(68 + (selectedCompany.length % 3) * 7)}.8 · SYNC LOCAL</div>
      <div className="energy-technical energy-technical-bottom" aria-hidden="true">DSA <i>↗</i> PRACTICE <i>↗</i> PROGRESS<br />CAREER PREP / SYSTEM 01</div>
      <div className="energy-target-tag"><span><Target size={13} /></span><div><small>ACTIVE TARGET</small><b>{selectedCompany}</b></div><i /></div>
      <button type="button" className="energy-core-trigger" onClick={triggerEnergyDrive} aria-label="Activate Dkoder Energy Drive, your career journey starts here"><span className="core-trigger-pulse" /><span className="core-trigger-icon"><Zap size={18} fill="currentColor" /></span><span className="core-trigger-label">DKODER<br />ENERGY DRIVE</span><span className="core-trigger-hint"><MousePointer2 size={12} /> CLICK TO IGNITE</span></button>
      <div className="energy-float energy-float-xp"><Zap size={13} /> +180 XP <small>MISSION PREVIEW</small></div>
      <div className="energy-float energy-float-track"><Code2 size={14} /><span>DSA <i>72%</i></span><AudioLines size={14} /><span>MOCK <i>READY</i></span></div>
      <div className={`energy-cursor${pointRef.current.inside ? ' is-active' : ''}`} ref={cursorRef} aria-hidden="true"><MousePointer2 size={27} fill="white" /><span /></div>
      <div className={`energy-drive-message${driveActive ? ' is-visible' : ''}`} aria-live="polite"><span><Sparkles size={14} /> DKODER ENERGY DRIVE</span><strong>YOUR CAREER JOURNEY<br />STARTS HERE.</strong><button type="button" onClick={onBuildMission}>Choose your target <ArrowRight size={14} /></button></div>
      {!webglAvailable && <div className="energy-fallback-label">Motion preview · accessible static fallback</div>}
      <span className="energy-selected-caption"><Flame size={11} /> PREPARATION LIGHT / {selectedCompany.toUpperCase()}</span>
      <button className="energy-touch-hint" type="button" onClick={triggerEnergyDrive}><Sparkles size={13} /> Tap to ignite <ArrowDownRight size={13} /></button>
    </div>
  );
}
