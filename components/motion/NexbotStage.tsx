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
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
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
      renderer.toneMappingExposure = 1.05;
      el.appendChild(renderer.domElement);

      // Studio reflection environment — this is what makes the metal read as
      // glossy/reflective chrome (the original NEXBOT look) instead of flat.
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

      // Neutral studio lighting — the original NEXBOT look (glossy metal with
      // white highlights, no colour tint).
      scene.add(new THREE.AmbientLight(0xffffff, 0.4));
      const key = new THREE.DirectionalLight(0xffffff, 2.6);
      key.position.set(2, 4, 4);
      scene.add(key);
      const rimL = new THREE.DirectionalLight(0xe6ebff, 3);
      rimL.position.set(-4, 2, -3);
      scene.add(rimL);
      const rimR = new THREE.DirectionalLight(0xe6ebff, 2.4);
      rimR.position.set(4, 1, -3);
      scene.add(rimR);
      const fill = new THREE.DirectionalLight(0xffffff, 0.8);
      fill.position.set(0, -1, 4);
      scene.add(fill);

      const group = new THREE.Group();
      scene.add(group);

      // Glossy dark-metal body + mirror-chrome head — the original NEXBOT look,
      // reflecting the neutral studio environment (no colour tint).
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x1c1c22,
        metalness: 0.9,
        roughness: 0.38,
        envMapIntensity: 1.0,
      });
      const glassMaterial = new THREE.MeshStandardMaterial({
        color: 0x0b0b10,
        metalness: 1,
        roughness: 0.06,
        envMapIntensity: 1.4,
      });

      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      loader.load("/models/nexbot.glb", (gltf) => {
        if (disposed) return;
        const obj = gltf.scene;

        // Whole-model bounds, to locate the eye band on the head.
        const full = new THREE.Box3().setFromObject(obj);
        const fMin = full.min.clone();
        const fSize = full.getSize(new THREE.Vector3());

        obj.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.geometry.computeBoundingBox();
          const bb = child.geometry.boundingBox!;
          const c = bb.getCenter(new THREE.Vector3());
          child.localToWorld(c);
          const ny = (c.y - fMin.y) / fSize.y; // 0 feet .. 1 head-top
          const size = bb.getSize(new THREE.Vector3());
          // The big shell up in the head band = the glass head; everything else
          // is the matte-black body.
          const isHead = ny > 0.82 && size.y > fSize.y * 0.06 && size.x > fSize.x * 0.12;
          child.material = isHead ? glassMaterial : bodyMaterial;
        });

        // Glowing violet dot-matrix eyes projected on the visor (the export's
        // real eyes hide under the glossy shell, so we add them as bright panels).
        // One compact 4x3 dot cluster per eye, sized and spaced to sit as two
        // distinct eyes on the face.
        const eyeTex = (() => {
          const cv = document.createElement("canvas");
          cv.width = 48;
          cv.height = 36;
          const cx = cv.getContext("2d")!;
          cx.fillStyle = "#eef0ff";
          for (let i = 0; i < 4; i++)
            for (let j = 0; j < 3; j++) {
              cx.beginPath();
              cx.arc(9 + i * 10, 8 + j * 10, 2.3, 0, Math.PI * 2);
              cx.fill();
            }
          const t = new THREE.CanvasTexture(cv);
          t.colorSpace = THREE.SRGBColorSpace;
          return t;
        })();
        const eyeGeo = new THREE.PlaneGeometry(fSize.x * 0.062, fSize.x * 0.047);
        const eyePlaneMat = new THREE.MeshBasicMaterial({
          map: eyeTex,
          transparent: true,
          depthWrite: false,
          toneMapped: false,
        });
        const eyeY = fMin.y + fSize.y * 0.902;
        const eyeZ = full.max.z * 0.58; // sit near the visor front at eye height
        for (const sx of [-1, 1]) {
          const eye = new THREE.Mesh(eyeGeo, eyePlaneMat);
          eye.position.set(sx * fSize.x * 0.058, eyeY, eyeZ);
          obj.add(eye);
        }

        // Center horizontally, frame the upper body.
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
