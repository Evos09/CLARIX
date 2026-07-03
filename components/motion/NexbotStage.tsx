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
      renderer.toneMappingExposure = 1.0;
      el.appendChild(renderer.domElement);

      // Dark scene, matte-black robot: only violet rim lights from behind/below
      // graze the edges (like the reference); the front stays near-black.
      scene.add(new THREE.AmbientLight(0xffffff, 0.12));
      const key = new THREE.DirectionalLight(0xffffff, 0.9);
      key.position.set(2, 4, 4);
      scene.add(key);
      const rimL = new THREE.DirectionalLight(0x8b5cf6, 6);
      rimL.position.set(-4, 2, -3);
      scene.add(rimL);
      const rimR = new THREE.DirectionalLight(0x7c3aed, 5);
      rimR.position.set(4, 1, -3);
      scene.add(rimR);
      const up = new THREE.PointLight(0x8b5cf6, 3.5, 12);
      up.position.set(0, -2.2, 1);
      scene.add(up);
      const faceGlow = new THREE.PointLight(0xa78bfa, 1.2, 5);
      faceGlow.position.set(0, 1.4, 2.2);
      scene.add(faceGlow);

      const group = new THREE.Group();
      scene.add(group);

      // Thin violet fresnel rim shared by all surfaces (subtle — an edge line,
      // not a wash). Injected into the standard shader.
      const rimColor = new THREE.Color(0x8b5cf6);
      const withRim = (m: InstanceType<typeof THREE.MeshStandardMaterial>, strength: number) => {
        m.onBeforeCompile = (shader) => {
          shader.uniforms.uRim = { value: rimColor };
          shader.uniforms.uRimS = { value: strength };
          shader.fragmentShader =
            "uniform vec3 uRim;\nuniform float uRimS;\n" +
            shader.fragmentShader.replace(
              "#include <emissivemap_fragment>",
              `#include <emissivemap_fragment>
              float fres = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vViewPosition)), 0.0, 1.0), 3.6);
              totalEmissiveRadiance += uRim * fres * uRimS;`,
            );
        };
        return m;
      };
      // Matte black body + glossy black-glass head.
      const bodyMaterial = withRim(
        new THREE.MeshStandardMaterial({ color: 0x050507, metalness: 0.25, roughness: 0.74 }),
        1.5,
      );
      const glassMaterial = withRim(
        new THREE.MeshStandardMaterial({ color: 0x090910, metalness: 0.95, roughness: 0.08 }),
        1.1,
      );

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
        const eyeTex = (() => {
          const cv = document.createElement("canvas");
          cv.width = 84;
          cv.height = 48;
          const cx = cv.getContext("2d")!;
          cx.fillStyle = "#e2d1ff";
          for (let i = 0; i < 7; i++)
            for (let j = 0; j < 4; j++) {
              cx.beginPath();
              cx.arc(12 + i * 10, 10 + j * 9, 2.6, 0, Math.PI * 2);
              cx.fill();
            }
          const t = new THREE.CanvasTexture(cv);
          t.colorSpace = THREE.SRGBColorSpace;
          return t;
        })();
        const eyeGeo = new THREE.PlaneGeometry(fSize.x * 0.12, fSize.x * 0.07);
        const eyePlaneMat = new THREE.MeshBasicMaterial({
          map: eyeTex,
          transparent: true,
          depthWrite: false,
          toneMapped: false,
        });
        const eyeY = fMin.y + fSize.y * 0.9;
        const eyeZ = full.max.z * 0.55; // sit near the visor front at eye height
        for (const sx of [-1, 1]) {
          const eye = new THREE.Mesh(eyeGeo, eyePlaneMat);
          eye.position.set(sx * fSize.x * 0.055, eyeY, eyeZ);
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
