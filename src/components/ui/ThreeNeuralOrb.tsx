/**
 * Project HUSH - 3D Neural Attention Orb (Three.js)
 *
 * Implements a 3–12 part composite procedural model representing
 * Hush's attention-aware cognitive core.
 * Adheres strictly to Three.js PBR directives:
 * - RoomEnvironment + PMREMGenerator studio environment
 * - Dual warm key light + cool hemisphere fill
 * - Zero external asset 404 dependencies (all procedural canvas textures)
 * - Damped animation kinematics and pre-allocated vector scratchpads
 * - Full headless / WebGL fallback support
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type OrbAttentionState = 'idle' | 'listening' | 'evaluating' | 'speaking' | 'silent' | 'blocked';

interface ThreeNeuralOrbProps {
  state?: OrbAttentionState;
  className?: string;
  size?: 'compact' | 'normal' | 'hero';
  interactive?: boolean;
}

export const ThreeNeuralOrb: React.FC<ThreeNeuralOrbProps> = ({
  state = 'idle',
  className = '',
  size = 'normal',
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGlFailed, setWebGlFailed] = useState(false);
  const stateRef = useRef<OrbAttentionState>(state);
  stateRef.current = state;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Headless / browser capability check
    const isHeadless =
      typeof navigator !== 'undefined' &&
      (navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent));

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isHeadless,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch (err) {
      console.warn('WebGL init failed, using fallback visual', err);
      setWebGlFailed(true);
      return;
    }

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    renderer.setSize(width, height);
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isHeadless;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x08090d, 0.05);

    // Studio Environment map via RoomEnvironment & PMREMGenerator
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 5.2);

    // --- PROCEDURAL TEXTURES ---
    // 1. Procedural Radial Contact Shadow Texture
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const shadowCtx = shadowCanvas.getContext('2d')!;
    const shadowGrad = shadowCtx.createRadialGradient(64, 64, 10, 64, 64, 60);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    shadowGrad.addColorStop(0.5, 'rgba(10, 8, 25, 0.35)');
    shadowGrad.addColorStop(1, 'rgba(8, 9, 13, 0)');
    shadowCtx.fillStyle = shadowGrad;
    shadowCtx.fillRect(0, 0, 128, 128);

    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    shadowTexture.colorSpace = THREE.SRGBColorSpace;

    // 2. Procedural Core Noise / Energy Canvas Texture
    const coreCanvas = document.createElement('canvas');
    coreCanvas.width = 256;
    coreCanvas.height = 256;
    const coreCtx = coreCanvas.getContext('2d')!;
    const coreGrad = coreCtx.createRadialGradient(128, 128, 20, 128, 128, 128);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.3, '#9275FF');
    coreGrad.addColorStop(0.7, '#63D9FF');
    coreGrad.addColorStop(1, '#10131B');
    coreCtx.fillStyle = coreGrad;
    coreCtx.fillRect(0, 0, 256, 256);
    // Draw fine procedural lattice circles
    coreCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    coreCtx.lineWidth = 1.5;
    for (let r = 20; r < 120; r += 16) {
      coreCtx.beginPath();
      coreCtx.arc(128, 128, r, 0, Math.PI * 2);
      coreCtx.stroke();
    }
    const coreTexture = new THREE.CanvasTexture(coreCanvas);
    coreTexture.colorSpace = THREE.SRGBColorSpace;

    // --- LIGHTING RIG ---
    // Warm key light
    const keyLight = new THREE.DirectionalLight(0xffe2cc, 2.4);
    keyLight.position.set(3.5, 4.0, 3.5);
    scene.add(keyLight);

    // Cool rim light
    const rimLight = new THREE.DirectionalLight(0x63d9ff, 1.8);
    rimLight.position.set(-3.5, -1.0, -3.0);
    scene.add(rimLight);

    // Cool hemisphere fill
    const hemiLight = new THREE.HemisphereLight(0x9275ff, 0x08090d, 1.2);
    scene.add(hemiLight);

    // --- COMPOSITE 3-12 PART NEURAL ORB MODEL ---
    const orbGroup = new THREE.Group();
    scene.add(orbGroup);

    // Part 1: Central Glowing Nucleus (Attention Singularity)
    const nucleusGeo = new THREE.SphereGeometry(0.75, 32, 32);
    const nucleusMat = new THREE.MeshPhysicalMaterial({
      color: 0x9275ff,
      emissive: 0x41298c,
      emissiveIntensity: 0.8,
      metalness: 0.2,
      roughness: 0.25,
      map: coreTexture,
      transmission: 0.4,
      ior: 1.4,
      thickness: 0.8,
    });
    const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    orbGroup.add(nucleus);

    // Part 2: Inner Geodesic Attention Lattice (Wireframe)
    const latticeGeo = new THREE.IcosahedronGeometry(1.05, 1);
    const latticeMat = new THREE.MeshStandardMaterial({
      color: 0x63d9ff,
      emissive: 0x224c66,
      wireframe: true,
      roughness: 0.4,
      metalness: 0.8,
    });
    const lattice = new THREE.Mesh(latticeGeo, latticeMat);
    orbGroup.add(lattice);

    // Part 3: Equatorial Gyroscopic Gimbal Ring
    const ring1Geo = new THREE.TorusGeometry(1.42, 0.038, 16, 64);
    const ring1Mat = new THREE.MeshPhysicalMaterial({
      color: 0x9275ff,
      metalness: 0.95,
      roughness: 0.15,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    orbGroup.add(ring1);

    // Part 4: Inclined Polar Gimbal Ring
    const ring2Geo = new THREE.TorusGeometry(1.58, 0.032, 16, 64);
    const ring2Mat = new THREE.MeshPhysicalMaterial({
      color: 0x63d9ff,
      metalness: 0.92,
      roughness: 0.18,
      clearcoat: 0.8,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3;
    ring2.rotation.y = Math.PI / 4;
    orbGroup.add(ring2);

    // Part 5: Secondary Sensor Halo Ring
    const ring3Geo = new THREE.TorusGeometry(1.74, 0.024, 16, 64);
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: 0xa5b4fc,
      metalness: 0.85,
      roughness: 0.3,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.x = -Math.PI / 4;
    ring3.rotation.z = Math.PI / 6;
    orbGroup.add(ring3);

    // Part 6: Floating Orbital Attention Nodes (3 tiny sensor satellites)
    const satellitesGroup = new THREE.Group();
    orbGroup.add(satellitesGroup);

    const satGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const satMat1 = new THREE.MeshStandardMaterial({ color: 0x63d9ff, emissive: 0x38bdf8, emissiveIntensity: 1.2 });
    const satMat2 = new THREE.MeshStandardMaterial({ color: 0x9275ff, emissive: 0x818cf8, emissiveIntensity: 1.2 });
    const satMat3 = new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x10b981, emissiveIntensity: 1.0 });

    const sat1 = new THREE.Mesh(satGeo, satMat1);
    const sat2 = new THREE.Mesh(satGeo, satMat2);
    const sat3 = new THREE.Mesh(satGeo, satMat3);
    satellitesGroup.add(sat1, sat2, sat3);

    // Part 7: Ground Contact Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(3.6, 3.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.55;
    scene.add(shadowMesh);

    // Scratch vector variables to prevent GC churn in render loop
    const _targetRot = new THREE.Euler(0, 0, 0);
    const _mouse = new THREE.Vector2(0, 0);

    const onPointerMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      _mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    window.addEventListener('mousemove', onPointerMove, { passive: true });

    // Handle Resize
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop with exponential damping
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const tick = () => {
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      const currentState = stateRef.current;

      // Adjust dynamics based on attention state
      let speedMult = 1.0;
      let targetNucleusColor = 0x9275ff;
      let targetEmissiveIntensity = 0.8;
      let ringDilation = 1.0;

      if (currentState === 'speaking') {
        speedMult = 1.6;
        targetNucleusColor = 0x34d399; // mint green when permitted to speak
        targetEmissiveIntensity = 1.4;
        ringDilation = 1.08;
      } else if (currentState === 'blocked' || currentState === 'silent') {
        speedMult = 0.5;
        targetNucleusColor = 0x64748b; // cool slate / muted coral
        targetEmissiveIntensity = 0.45;
        ringDilation = 0.94;
      } else if (currentState === 'evaluating') {
        speedMult = 2.2;
        targetNucleusColor = 0x63d9ff; // cool cyan
        targetEmissiveIntensity = 1.2;
        ringDilation = 1.03;
      }

      // Smooth state color transitions
      nucleusMat.color.lerp(new THREE.Color(targetNucleusColor), delta * 4);
      nucleusMat.emissiveIntensity = THREE.MathUtils.damp(
        nucleusMat.emissiveIntensity,
        targetEmissiveIntensity,
        4,
        delta
      );

      // Smooth gimbal ring rotation
      ring1.rotation.z += 0.4 * delta * speedMult;
      ring1.rotation.x += 0.25 * delta * speedMult;

      ring2.rotation.y += 0.5 * delta * speedMult;
      ring2.rotation.z -= 0.3 * delta * speedMult;

      ring3.rotation.x -= 0.35 * delta * speedMult;
      ring3.rotation.y += 0.2 * delta * speedMult;

      // Subtle breath dilation
      const breath = 1.0 + Math.sin(elapsed * 2.0) * 0.03;
      orbGroup.scale.setScalar(ringDilation * breath);

      // Orbital satellites positions
      sat1.position.set(
        Math.cos(elapsed * 1.4 * speedMult) * 1.9,
        Math.sin(elapsed * 1.8 * speedMult) * 0.4,
        Math.sin(elapsed * 1.4 * speedMult) * 1.9
      );
      sat2.position.set(
        Math.cos(-elapsed * 1.1 * speedMult) * 2.1,
        Math.cos(elapsed * 1.5 * speedMult) * 0.7,
        Math.sin(-elapsed * 1.1 * speedMult) * 2.1
      );
      sat3.position.set(
        Math.sin(elapsed * 1.6 * speedMult) * 1.7,
        Math.cos(elapsed * 1.2 * speedMult) * 0.8,
        Math.cos(elapsed * 1.6 * speedMult) * 1.7
      );

      // Lattice counter-rotation
      lattice.rotation.y -= 0.15 * delta * speedMult;
      lattice.rotation.x += 0.1 * delta * speedMult;

      // Gentle interactive mouse parralax
      if (interactive) {
        _targetRot.y = _mouse.x * 0.35;
        _targetRot.x = -_mouse.y * 0.35;
        orbGroup.rotation.y = THREE.MathUtils.damp(orbGroup.rotation.y, _targetRot.y, 4, delta);
        orbGroup.rotation.x = THREE.MathUtils.damp(orbGroup.rotation.x, _targetRot.x, 4, delta);
      }

      // Vertical floating levitation
      orbGroup.position.y = Math.sin(elapsed * 1.5) * 0.08;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(tick);
    };

    // Pre-warm shader pipeline once
    renderer.compile(scene, camera);
    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('resize', onResize);

      // Clean disposal
      nucleusGeo.dispose();
      nucleusMat.dispose();
      latticeGeo.dispose();
      latticeMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      satGeo.dispose();
      satMat1.dispose();
      satMat2.dispose();
      satMat3.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTexture.dispose();
      coreTexture.dispose();
      renderer.dispose();

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [interactive]);

  if (webGlFailed) {
    return <SplineFallback state={state} className={className} />;
  }

  const heightClass =
    size === 'hero' ? 'h-64 sm:h-80 w-full' : size === 'compact' ? 'h-36 w-36' : 'h-48 sm:h-56 w-full';

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center overflow-hidden pointer-events-auto ${heightClass} ${className}`}
      data-testid="three-neural-orb"
    />
  );
};

export const SplineFallback: React.FC<{ state?: OrbAttentionState; className?: string }> = ({
  state = 'idle',
  className = '',
}) => {
  const getGlowColor = () => {
    switch (state) {
      case 'speaking':
        return 'from-emerald-500/30 via-cyan-500/20 to-purple-500/10 border-emerald-500/40';
      case 'silent':
      case 'blocked':
        return 'from-slate-600/30 via-purple-900/20 to-transparent border-slate-700/40';
      case 'evaluating':
        return 'from-cyan-500/30 via-violet-500/20 to-transparent border-cyan-500/40';
      default:
        return 'from-purple-600/30 via-cyan-500/20 to-transparent border-purple-500/30';
    }
  };

  return (
    <div className={`relative flex items-center justify-center h-48 w-full ${className}`}>
      {/* Outer ambient blur */}
      <div
        className={`absolute h-40 w-40 rounded-full bg-gradient-to-tr ${getGlowColor()} blur-2xl opacity-60 animate-pulse`}
      />
      {/* Outer ring */}
      <div className="relative h-32 w-32 rounded-full border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-950/40">
        {/* Mid ring */}
        <div className="h-24 w-24 rounded-full border border-cyan-400/40 flex items-center justify-center">
          {/* Inner core */}
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-violet-400 to-cyan-400 opacity-90 shadow-inner flex items-center justify-center">
            <div className="h-6 w-6 rounded-full bg-white/80 blur-xs" />
          </div>
        </div>
      </div>
    </div>
  );
};
