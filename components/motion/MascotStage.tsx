"use client";

import { useEffect, useRef } from "react";

/**
 * Renders the CLARIX mascot (public/models/clarix-mascot.glb) with three.js:
 * transparent canvas, cursor-follow "listening" rotation with idle look-around
 * wander, breathing, and a periodic playful wobble. three.js is imported
 * dynamically so it never lands in the main bundle.
 */
export function MascotStage({ className }: { className?: string }) {
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
      const camera = new THREE.PerspectiveCamera(35, el.clientWidth / el.clientHeight, 0.1, 50);
      camera.position.set(0, 0.05, 2.6);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(el.clientWidth, el.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      el.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, 1.15));
      const key = new THREE.DirectionalLight(0xffffff, 2.4);
      key.position.set(2, 4, 3);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x8b5cf6, 1.6); // violet rim light
      rim.position.set(-3, 1, -2);
      scene.add(rim);

      const group = new THREE.Group();
      scene.add(group);

      // Shared uniforms driving the procedural limb rig (shader-space "bones":
      // vertices in each limb region rotate around a pivot with smooth falloff —
      // the model has no skeleton, so we bend it on the GPU).
      const waveUniform = { value: 0 }; // raised (waving) arm
      const armRUniform = { value: 0 }; // lower arm
      const legLUniform = { value: 0 };
      const legRUniform = { value: 0 };

      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      loader.load("/models/clarix-mascot.glb", (gltf) => {
        if (disposed) return;
        const obj = gltf.scene;
        const box = new THREE.Box3().setFromObject(obj);
        const center = box.getCenter(new THREE.Vector3());
        obj.position.sub(center); // center the figure on the origin

        obj.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          const geo = child.geometry as InstanceType<typeof THREE.BufferGeometry>;
          geo.computeBoundingBox();
          const bb = geo.boundingBox;
          if (!bb) return;
          const bbMin = bb.min.clone();
          const bbSize = bb.max.clone().sub(bb.min);
          const mat = child.material as InstanceType<typeof THREE.MeshStandardMaterial>;
          mat.onBeforeCompile = (shader) => {
            shader.uniforms.uWave = waveUniform;
            shader.uniforms.uArmR = armRUniform;
            shader.uniforms.uLegL = legLUniform;
            shader.uniforms.uLegR = legRUniform;
            shader.uniforms.uBBMin = { value: bbMin };
            shader.uniforms.uBBSize = { value: bbSize };
            // Shared region math: weight per limb + its pivot, blended into one rotation.
            const limbGlsl = `
                    vec3 n01 = (position - uBBMin) / uBBSize;
                    float wAL = (1.0 - smoothstep(0.08, 0.24, n01.x)) * smoothstep(0.35, 0.52, n01.y) * (1.0 - smoothstep(0.80, 0.92, n01.y));
                    float wAR = smoothstep(0.78, 0.94, n01.x) * smoothstep(0.22, 0.34, n01.y) * (1.0 - smoothstep(0.55, 0.68, n01.y));
                    float wLeg = 1.0 - smoothstep(0.10, 0.20, n01.y);
                    float wLL = wLeg * (1.0 - smoothstep(0.45, 0.55, n01.x));
                    float wLR = wLeg * smoothstep(0.45, 0.55, n01.x);
                    float ang = uWave * wAL + uArmR * wAR + uLegL * wLL + uLegR * wLR;
                    vec2 pv = uBBMin.xy + vec2(0.28, 0.52) * uBBSize.xy;
                    if (wAR > 0.001) pv = uBBMin.xy + vec2(0.72, 0.50) * uBBSize.xy;
                    if (wLL > 0.001) pv = uBBMin.xy + vec2(0.40, 0.24) * uBBSize.xy;
                    if (wLR > 0.001) pv = uBBMin.xy + vec2(0.60, 0.24) * uBBSize.xy;`;
            shader.vertexShader =
              "uniform float uWave;\nuniform float uArmR;\nuniform float uLegL;\nuniform float uLegR;\nuniform vec3 uBBMin;\nuniform vec3 uBBSize;\n" +
              shader.vertexShader
                .replace(
                  "#include <beginnormal_vertex>",
                  `#include <beginnormal_vertex>
                  {
                    ${limbGlsl}
                    float c = cos(ang); float s = sin(ang);
                    objectNormal.xy = vec2(c * objectNormal.x - s * objectNormal.y, s * objectNormal.x + c * objectNormal.y);
                  }`,
                )
                .replace(
                  "#include <begin_vertex>",
                  `#include <begin_vertex>
                  {
                    ${limbGlsl}
                    vec2 p = transformed.xy - pv;
                    float c = cos(ang); float s = sin(ang);
                    transformed.xy = vec2(c * p.x - s * p.y, s * p.x + c * p.y) + pv;
                  }`,
                );
          };
          mat.needsUpdate = true;
        });

        group.add(obj);
      });

      const mouse = { x: 0, y: 0 };
      let lastMouseMove = 0;
      const onMouse = (e: MouseEvent) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
        lastMouseMove = performance.now();
      };
      window.addEventListener("mousemove", onMouse, { passive: true });

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const clock = new THREE.Clock();
      let raf = 0;

      // Critically-damped springs (position + velocity) — the fluid, slightly
      // overshooting motion you get from Spline scenes, instead of a flat lerp.
      const spring = { y: 0, x: 0, px: 0, vy: 0, vx: 0, vpx: 0 };
      const STIFF = 42;
      const DAMP = 11;
      let prev = 0;

      const tick = () => {
        const t = clock.getElapsedTime();
        const dt = Math.min(0.05, t - prev || 0.016);
        prev = t;
        const idle = performance.now() - lastMouseMove > 2500;

        // Cursor-follow when active; slow "look around the room" wander when idle.
        const targetY = idle ? Math.sin(t * 0.5) * 0.38 : mouse.x * 0.7;
        const targetX = idle ? Math.sin(t * 0.33) * 0.1 : mouse.y * 0.28;
        const targetPX = idle ? 0 : mouse.x * 0.08; // subtle lean toward the cursor

        spring.vy += (STIFF * (targetY - spring.y) - DAMP * spring.vy) * dt;
        spring.y += spring.vy * dt;
        spring.vx += (STIFF * (targetX - spring.x) - DAMP * spring.vx) * dt;
        spring.x += spring.vx * dt;
        spring.vpx += (STIFF * (targetPX - spring.px) - DAMP * spring.vpx) * dt;
        spring.px += spring.vpx * dt;

        group.rotation.y = spring.y;
        group.rotation.x = spring.x;
        group.position.x = spring.px;

        // Scroll-reactive camera: dolly back slightly as the page scrolls over him.
        const scrollN = Math.min(1, window.scrollY / (window.innerHeight * 0.9));
        camera.position.z = 2.6 + scrollN * 0.5;
        camera.position.y = 0.05 + scrollN * 0.12;

        if (!reduced) {
          // Gentle bob + breathing.
          group.position.y = Math.sin(t * 1.4) * 0.03;
          const breathe = 1 + Math.sin(t * 2.1) * 0.006;
          group.scale.set(1, breathe, 1);
          // Periodic playful wobble + a touch of spring-velocity tilt for fluidity.
          const burst = Math.max(0, Math.sin(t * 0.55)) ** 10;
          group.rotation.z = burst * Math.sin(t * 13) * 0.06 - spring.vy * 0.04;
          // Limbs: constant gentle sway + an enthusiastic full-body jig in bursts —
          // waving arm leads, the other arm counters, legs kick alternately.
          const waveBurst = Math.max(0, Math.sin(t * 0.55)) ** 6;
          waveUniform.value = Math.sin(t * 1.8) * 0.05 + waveBurst * Math.sin(t * 7) * 0.3;
          armRUniform.value = -Math.sin(t * 1.8 + 0.9) * 0.04 - waveBurst * Math.sin(t * 7 + 1.6) * 0.14;
          const jig = waveBurst * Math.sin(t * 8) * 0.1;
          legLUniform.value = jig + Math.sin(t * 1.1) * 0.015;
          legRUniform.value = -jig - Math.sin(t * 1.1) * 0.015;
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
