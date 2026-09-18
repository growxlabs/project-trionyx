'use client';

import { useEffect, useRef } from 'react';

// Curved cloth sheets: cubic boundary curves, a displaced 3D surface and
// surface normals. The fold changes shape rather than translating rigid strips.
const VERTEX = `
precision highp float;
attribute vec2 a_position;
uniform float u_time;
uniform float u_mobile;
uniform float u_layer;
varying vec2 v_surface;
varying vec3 v_normal;
varying float v_depth;
varying vec2 v_pos;
vec2 bezier(vec2 a, vec2 b, vec2 c, vec2 d, float t) {
  float q = 1.0 - t;
  return q*q*q*a + 3.0*q*q*t*b + 3.0*q*t*t*c + t*t*t*d;
}
vec3 surface(vec2 uv) {
  float u = uv.x;
  float v = uv.y;
  float t = u_time * 0.32;
  float sway = sin(t + u_layer * 0.45);
  float curl = sin(t * 0.73 + 1.1 + u_layer * 0.6);
  vec2 left;
  vec2 right;
  if (u_mobile > 0.5) {
    // Dedicated art-directed mobile ribbon:
    // Enters upper-right behind menu button and header, flows gracefully down the right flank
    if (u_layer < 0.5) {
      // Layer 0: Wide ambient atmospheric veil
      left = bezier(vec2(0.20, -0.25), vec2(0.32 + 0.03 * sway, 0.22), vec2(0.48 + 0.04 * curl, 0.58), vec2(0.70, 1.15), v);
      right = bezier(vec2(1.10, -0.25), vec2(1.18, 0.20), vec2(1.24, 0.65), vec2(1.30, 1.25), v);
    } else if (u_layer < 1.5) {
      // Layer 1: Undercut shadow cavity for 3D depth
      left = bezier(vec2(0.34, -0.25), vec2(0.46 + 0.03 * sway, 0.25), vec2(0.58, 0.65), vec2(0.76, 1.18), v);
      right = bezier(vec2(1.12, -0.25), vec2(1.20 + 0.02 * curl, 0.24), vec2(1.25, 0.68), vec2(1.32, 1.25), v);
    } else if (u_layer < 2.5) {
      // Layer 2: Primary heroic Trionyx orange ribbon
      left = bezier(vec2(0.26, -0.25), vec2(0.40 + 0.03 * sway, 0.20), vec2(0.54 + 0.03 * curl, 0.56), vec2(0.74, 1.18), v);
      right = bezier(vec2(1.12, -0.25), vec2(1.20 + 0.02 * curl, 0.22), vec2(1.25 + 0.02 * sway, 0.66), vec2(1.32, 1.25), v);
    } else {
      // Layer 3: Front illuminated golden amber gleam ridge
      left = bezier(vec2(0.38, -0.25), vec2(0.50 + 0.02 * curl, 0.22), vec2(0.62 + 0.02 * sway, 0.60), vec2(0.80, 1.20), v);
      right = bezier(vec2(1.14, -0.25), vec2(1.22 + 0.02 * curl, 0.24), vec2(1.28 + 0.02 * sway, 0.68), vec2(1.34, 1.25), v);
    }
  } else {
    // Desktop ribbon: 100% unchanged
    if (u_layer < 0.5) {
      left = bezier(vec2(0.28,-0.30), vec2(0.36+0.045*sway,0.27), vec2(0.53+0.05*curl,0.46), vec2(0.96,0.99),v);
      right = bezier(vec2(0.81,-0.30), vec2(0.90,0.20), vec2(0.92,0.70),vec2(1.11,1.25),v);
    } else if (u_layer < 1.5) {
      left = bezier(vec2(0.77,-0.30),vec2(0.78+0.05*sway,0.20),vec2(0.94,0.70),vec2(0.94,1.25),v);
      right = bezier(vec2(0.85,-0.30),vec2(0.89+0.04*curl,0.25),vec2(0.96,0.68),vec2(1.15,1.20),v);
    } else if (u_layer < 2.5) {
      left = bezier(vec2(0.46,-0.30),vec2(0.48+0.04*sway,0.14),vec2(0.65+0.055*curl,0.42),vec2(0.91,0.87),v);
      right = bezier(vec2(0.76,-0.30),vec2(0.87+0.025*curl,0.20),vec2(0.89+0.025*sway,0.60),vec2(0.92,1.25),v);
    } else {
      left = bezier(vec2(0.70,-0.30),vec2(0.88+0.025*curl,0.22),vec2(0.95+0.025*sway,0.64),vec2(0.87,1.25),v);
      right = bezier(vec2(0.79,-0.30),vec2(0.94+0.028*curl,0.24),vec2(1.00+0.02*sway,0.65),vec2(0.94,1.25),v);
    }
  }
  vec2 p = mix(left,right,u);
  float envelope = sin(v*3.14159);
  float wave = sin(u*3.14159 + v*4.2 - t);
  float ripple = sin(u*6.283 + v*5.0 - t*1.3);
  p.y += sin(u*3.14159) * envelope * (0.075*wave + 0.035*curl);
  p.x += sin(u*3.14159) * envelope * 0.022*ripple;
  float z = 0.10*sin(u*3.14159)*envelope*wave;
  return vec3(p,z);
}
void main() {
  vec2 uv = a_position;
  vec3 p = surface(uv);
  vec3 du = surface(uv+vec2(0.001,0.0))-p;
  vec3 dv = surface(uv+vec2(0.0,0.001))-p;
  v_normal = normalize(cross(du,dv));
  v_depth = p.z;
  v_surface = uv;
  v_pos = p.xy;
  gl_Position = vec4(p.x*2.0-1.0,1.0-p.y*2.0,0.0,1.0);
}
`;

const FRAGMENT = `
#extension GL_OES_standard_derivatives : enable
precision highp float;
uniform float u_mobile;
uniform float u_layer;
varying vec2 v_surface;
varying vec3 v_normal;
varying float v_depth;
varying vec2 v_pos;

vec3 contrast(in vec3 v, in float a) {
  return (v - 0.5) * a + 0.5;
}

void main() {
  float u = v_surface.x;
  float v = v_surface.y;
  vec3 color;
  if (u_layer < 0.5) {
    // Ambient veil: warm pearl to glowing tangerine
    color = mix(vec3(0.99, 0.90, 0.78), vec3(0.98, 0.46, 0.26), smoothstep(0.12, 0.94, v + u * 0.28));
    color = mix(color, vec3(1.0, 0.74, 0.52), pow(1.0 - u, 2.0) * 0.45);
  } else if (u_layer < 1.5) {
    // Undercut shadow cavity: deep crimson & warm amber
    color = mix(vec3(0.98, 0.52, 0.32), vec3(0.88, 0.24, 0.18), smoothstep(0.1, 0.95, v));
    color = mix(color, vec3(1.0, 0.70, 0.46), smoothstep(0.60, 1.0, u) * 0.75);
  } else if (u_layer < 2.5) {
    // Primary heroic Trionyx orange ribbon
    color = mix(vec3(1.0, 0.72, 0.18), vec3(0.95, 0.38, 0.12), smoothstep(0.18, 0.96, v + 0.22 * u));
    color += vec3(0.02, 0.05, 0.01) * sin(u * 3.14159);
  } else {
    // Front ribbon: Replaced dull cream with luminous warm golden amber & brand orange
    color = mix(vec3(1.0, 0.72, 0.34), vec3(0.96, 0.46, 0.18), pow(sin(u * 3.14159), 0.75));
    color = mix(color, vec3(0.98, 0.60, 0.26), v * 0.42);
    color = mix(color, vec3(0.90, 0.28, 0.18), smoothstep(0.65, 1.0, u) * 0.45);
  }
  vec3 n = normalize(v_normal);
  float light = abs(dot(n, normalize(vec3(-0.3, -0.45, 1.0))));
  color *= 0.86 + 0.18 * light;

  // Stripe-style specular clearcoat gleam on fold ridge
  vec3 halfDir = normalize(normalize(vec3(-0.3, -0.55, 0.75)) + vec3(0.0, 0.0, 1.0));
  float specularPeak = pow(max(0.0, dot(n, halfDir)), 26.0);
  color += vec3(0.18, 0.14, 0.10) * specularPeak;

  // Soft anisotropic metallic sheen & rim
  float sheen = pow(max(0.0, abs(dot(n, normalize(vec3(0.2, 0.65, 1.0))))), 14.0);
  color += vec3(0.08, 0.065, 0.04) * sheen;
  float rim = exp(-u * 90.0);
  color += vec3(0.085, 0.07, 0.045) * rim;
  color *= 1.0 - 0.045 * exp(-(1.0 - u) * 65.0);

  // Stripe's exact screen-space derivative anti-aliased striations
  #ifdef GL_OES_standard_derivatives
    vec2 dy = dFdy(v_surface);
    float dScale = clamp(abs(dy.y) * 450.0, 0.06, 0.45);
  #else
    float dScale = 0.20;
  #endif

  // Clean, combed longitudinal fibers running along ribbon path (zero crosshatching)
  float lineWave1 = abs(sin(v_surface.x * 240.0 + sin(v_surface.y * 16.0) * 1.2));
  float lineWave2 = abs(sin(v_surface.x * 480.0));
  float lineWave3 = abs(sin(v_surface.x * 120.0 + v_surface.y * 8.0));

  float thread1 = smoothstep(dScale, 0.0, lineWave1);
  float thread2 = smoothstep(dScale * 1.2, 0.0, lineWave2);
  float thread3 = smoothstep(dScale * 0.8, 0.0, lineWave3);

  float fibers = (thread1 * 0.048 + thread2 * 0.026 + thread3 * 0.038) * (0.35 + 0.65 * light);
  color *= 1.0 + fibers * 1.15;
  color += vec3(0.035, 0.025, 0.015) * fibers;

  // Subtle contrast curve for rich 3D depth
  color = contrast(color, 1.05);

  float feather = u_layer < 0.5 ? 0.075 : 0.028;
  if (u_mobile > 0.5) {
    feather = u_layer < 0.5 ? 0.32 : 0.16;
  }
  float alpha = smoothstep(0.0, feather, u) * (1.0 - smoothstep(0.965, 1.0, u));
  if (u_mobile > 0.5) {
    // Graceful bottom fade to eliminate abrupt horizontal cutoff above About section
    float bottomFade = smoothstep(1.0, 0.62, v_surface.y);
    alpha *= bottomFade;
    if (u_layer < 0.5) {
      alpha *= 0.65;
    } else {
      alpha *= 0.88;
    }
  } else {
    alpha *= 0.98;
  }
  gl_FragColor = vec4(color * alpha, alpha);
}
`;

export function MeshGradientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'low-power' });
    if (!gl) return; // The warm section background remains legible without WebGL.
    gl.getExtension('OES_standard_derivatives');

    let frame = 0;
    let disposed = false;
    let visible = true;
    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    let shaders: WebGLShader[] = [];
    let timeLocation: WebGLUniformLocation | null = null;
    let layerLocation: WebGLUniformLocation | null = null;
    let mobileLocation: WebGLUniformLocation | null = null;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const started = performance.now();

    const vertices: number[] = [];
    const columns = 64;
    const rows = 120;
    const point = (x: number, y: number) => vertices.push(x / columns, y / rows);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        point(x, y); point(x + 1, y); point(x, y + 1);
        point(x, y + 1); point(x + 1, y); point(x + 1, y + 1);
      }
    }

    function release() {
      if (buffer) gl!.deleteBuffer(buffer);
      if (program) gl!.deleteProgram(program);
      shaders.forEach((shader) => gl!.deleteShader(shader));
      buffer = null;
      program = null;
      shaders = [];
    }

    function initialize() {
      const compile = (type: number, source: string) => {
        const shader = gl!.createShader(type);
        if (!shader) throw new Error('Could not allocate ribbon shader');
        shaders.push(shader);
        gl!.shaderSource(shader, source);
        gl!.compileShader(shader);
        if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) throw new Error(gl!.getShaderInfoLog(shader) || 'Ribbon shader failed');
        return shader;
      };
      try {
        program = gl!.createProgram();
        if (!program) throw new Error('Could not allocate ribbon program');
        gl!.attachShader(program, compile(gl!.VERTEX_SHADER, VERTEX));
        gl!.attachShader(program, compile(gl!.FRAGMENT_SHADER, FRAGMENT));
        gl!.linkProgram(program);
        if (!gl!.getProgramParameter(program, gl!.LINK_STATUS)) throw new Error(gl!.getProgramInfoLog(program) || 'Ribbon program failed to link');
        gl!.useProgram(program);
        buffer = gl!.createBuffer();
        if (!buffer) throw new Error('Could not allocate ribbon mesh');
        gl!.bindBuffer(gl!.ARRAY_BUFFER, buffer);
        gl!.bufferData(gl!.ARRAY_BUFFER, new Float32Array(vertices), gl!.STATIC_DRAW);
        const position = gl!.getAttribLocation(program, 'a_position');
        gl!.enableVertexAttribArray(position);
        gl!.vertexAttribPointer(position, 2, gl!.FLOAT, false, 0, 0);
        layerLocation = gl!.getUniformLocation(program, 'u_layer');
        gl!.enable(gl!.BLEND);
        gl!.blendFunc(gl!.ONE, gl!.ONE_MINUS_SRC_ALPHA);
        timeLocation = gl!.getUniformLocation(program, 'u_time');
        mobileLocation = gl!.getUniformLocation(program, 'u_mobile');
        gl!.clearColor(0, 0, 0, 0);
      } catch (error) {
        console.warn('Trionyx ribbon unavailable:', error);
        release();
      }
    }

    function draw(now: number) {
      if (disposed || !program || gl!.isContextLost()) return;
      gl!.uniform1f(timeLocation, motion.matches ? 0 : (now - started) / 1000);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      for (let layer = 0; layer < 4; layer++) {
        gl!.uniform1f(layerLocation, layer);
        gl!.drawArrays(gl!.TRIANGLES, 0, vertices.length / 2);
      }
    }

    function animate(now: number) {
      draw(now);
      if (!disposed && visible && !document.hidden && !motion.matches && program) frame = requestAnimationFrame(animate);
    }

    function resume() {
      cancelAnimationFrame(frame);
      if (visible && !document.hidden) {
        draw(performance.now());
        if (!motion.matches && program) frame = requestAnimationFrame(animate);
      }
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas!.width = Math.max(1, Math.round(rect.width * dpr));
      canvas!.height = Math.max(1, Math.round(rect.height * dpr));
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      if (program) gl!.uniform1f(mobileLocation, rect.width < 768 ? 1 : 0);
      draw(performance.now());
    }

    function lost(event: Event) {
      event.preventDefault();
      cancelAnimationFrame(frame);
    }
    function restored() {
      release();
      initialize();
      resize();
      resume();
    }

    initialize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      resume();
    });
    intersection.observe(canvas);
    motion.addEventListener('change', resume);
    document.addEventListener('visibilitychange', resume);
    canvas.addEventListener('webglcontextlost', lost);
    canvas.addEventListener('webglcontextrestored', restored);
    resize();
    resume();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      motion.removeEventListener('change', resume);
      document.removeEventListener('visibilitychange', resume);
      canvas.removeEventListener('webglcontextlost', lost);
      canvas.removeEventListener('webglcontextrestored', restored);
      release();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none" aria-hidden="true" />;
}


