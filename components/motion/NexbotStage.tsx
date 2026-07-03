"use client";

import { useEffect, useRef } from "react";

/**
 * NEXBOT robot rendered in three.js (no Spline runtime, no watermark).
 * Geometry exported from the CC0 NEXBOT scene; the violet look — matte-black
 * body, violet rim glow, glowing violet eyes — is recreated here with
 * materials + lighting. The whole figure turns to follow the cursor with a
 * spring, plus idle look-around and breathing.
 */
export function NexbotStage({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const THREE = await import("three");
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
      const { MeshoptDecoder } = await import("three/examples/jsm/libs/meshopt_decoder.module.js");
      const el = ref.current;
      if (disposed || !el) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, el.clientWidth / el.clientHeight, 0.1, 100);
      camera.position.set(0, 0.1, 6);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(el.clientWidth, el.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      el.appendChild(renderer.domElement);

      // Lighting: dim base + soft white key + strong violet rim from behind +
      // violet uplight — this is what paints the violet edge glow of the design.
      scene.add(new THREE.AmbientLight(0xffffff, 0.35));
      const key = new THREE.DirectionalLight(0xffffff, 1.4);
      key.position.set(2, 4, 4);
      scene.add(key);
      const rimL = new THREE.DirectionalLight(0x8b5cf6, 4.2);
      rimL.position.set(-4, 2, -3);
      scene.add(rimL);
      const rimR = new THREE.DirectionalLight(0x7c3aed, 3.4);
      rimR.position.set(4, 1, -3);
      scene.add(rimR);
      const up = new THREE.PointLight(0x8b5cf6, 6, 12);
      up.position.set(0, -2.4, 1.5);
      scene.add(up);
      const faceGlow = new THREE.PointLight(0xa78bfa, 2.2, 6);
      faceGlow.position.set(0, 1.4, 2);
      scene.add(faceGlow);

      const group = new THREE.Group();
      scene.add(group);

      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      loader.load("/models/nexbot.glb", (gltf) => {
        if (disposed) return;
        const obj = gltf.scene;

        // Recolor every mesh to matte-black carbon with a faint violet emissive
        // so edges catch the rim light like the reference render.
        obj.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.material = new THREE.MeshStandardMaterial({
            color: 0x0a0a10,
            metalness: 0.55,
            roughness: 0.42,
            emissive: 0x2a1a5c,
            emissiveIntensity: 0.35,
          });
        });

        // Center horizontally, frame the upper body: drop the model so the
        // head/torso sit in view and the legs fall below the fold.
        const box = new THREE.Box3().setFromObject(obj);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        obj.position.x -= center.x;
        obj.position.z -= center.z;
        obj.position.y -= box.max.y - size.y * 0.14; // top of head near frame top
        group.add(obj);
      });

      const mouse = { x: 0, y: 0 };
      let lastMove = 0;
      const onMouse = (e: MouseEvent) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
        lastMove = performance.now();
      };
      window.addEventListener("mousemove", onMouse, { passive: true });

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const clock = new THREE.Clock();
      let raf = 0;
      const spring = { y: 0, x: 0, vy: 0, vx: 0 };
      const STIFF = 40;
      const DAMP = 11;
      let prev = 0;

      const tick = () => {
        const t = clock.getElapsedTime();
        const dt = Math.min(0.05, t - prev || 0.016);
        prev = t;
        const idle = performance.now() - lastMove > 2500;

        const targetY = idle ? Math.sin(t * 0.45) * 0.4 : mouse.x * 0.6;
        const targetX = idle ? Math.sin(t * 0.3) * 0.06 : mouse.y * 0.18;
        spring.vy += (STIFF * (targetY - spring.y) - DAMP * spring.vy) * dt;
        spring.y += spring.vy * dt;
        spring.vx += (STIFF * (targetX - spring.x) - DAMP * spring.vx) * dt;
        spring.x += spring.vx * dt;
        group.rotation.y = spring.y;
        group.rotation.x = spring.x;

        if (!reduced) {
          group.position.y = Math.sin(t * 1.3) * 0.025;
          const breathe = 1 + Math.sin(t * 2) * 0.004;
          group.scale.set(1, breathe, 1);
        }

        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };
      tick();

      const ro = new ResizeObserver(() => {
        camera.aspect = el.clientWidth / el.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(el.clientWidth, el.clientHeight);
      });
      ro.observe(el);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        window.removeEventListener("mousemove", onMouse);
        renderer.dispose();
        if (renderer.domElement.parentElement === el) el.removeChild(renderer.domElement);
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return <div ref={ref} className={className} aria-hidden />;
}
