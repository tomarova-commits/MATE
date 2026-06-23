const statusButtons = document.querySelectorAll(".status-switch__button");
const statusPill = document.querySelector("#status-pill");
const contactLink = document.querySelector("#contact-link");
const copyButton = document.querySelector("#copy-contact");
const copyMessage = document.querySelector("#copy-message");
const updatedDate = document.querySelector("#updated-date");
const themeToggle = document.querySelector("#theme-toggle");
const themeToggleLabel = document.querySelector("#theme-toggle-label");
const headerShader = document.querySelector("#header-shader");

const statusText = {
  worked: {
    label: "Есть опыт работы",
    muted: false,
  },
  "not-worked": {
    label: "Еще не работали",
    muted: true,
  },
};

statusButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextStatus = button.dataset.status;
    const nextText = statusText[nextStatus];

    statusButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    statusPill.textContent = nextText.label;
    statusPill.classList.toggle("is-muted", nextText.muted);
  });
});

copyButton.addEventListener("click", async () => {
  const contact = contactLink.textContent.trim();

  try {
    await navigator.clipboard.writeText(contact);
    copyMessage.textContent = "Контакт скопирован";
  } catch {
    copyMessage.textContent = "Скопируйте контакт вручную";
  }

  window.setTimeout(() => {
    copyMessage.textContent = "";
  }, 2400);
});

function setTheme(theme) {
  const isDark = theme === "dark";

  document.documentElement.classList.toggle("dark", isDark);
  themeToggleLabel.textContent = isDark ? "L" : "D";
  localStorage.setItem("mate-theme", theme);
}

const savedTheme = localStorage.getItem("mate-theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
setTheme(savedTheme || (prefersDark ? "dark" : "light"));

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.classList.contains("dark") ? "light" : "dark";
  setTheme(nextTheme);
});

function initHeaderShader(canvas) {
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!gl || prefersReducedMotion) {
    return;
  }

  const vertexShaderSource = `
    attribute vec2 position;

    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentShaderSource = `
    precision highp float;

    uniform vec2 resolution;
    uniform float time;

    vec3 palette(float t) {
      vec3 pine = vec3(0.025, 0.115, 0.075);
      vec3 moss = vec3(0.130, 0.285, 0.150);
      vec3 fern = vec3(0.280, 0.530, 0.250);
      vec3 sage = vec3(0.560, 0.670, 0.460);

      vec3 first = mix(pine, moss, smoothstep(0.0, 0.45, t));
      vec3 second = mix(fern, sage, smoothstep(0.45, 1.0, t));
      return mix(first, second, smoothstep(0.28, 0.88, t));
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / resolution;
      vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);

      float waveA = sin((p.x * 2.1 + time * 0.42) + sin(p.y * 2.0) * 0.7);
      float waveB = sin((p.x * 3.4 - time * 0.27) + cos(p.y * 3.2 + time * 0.18));
      float waveC = sin(length(p * vec2(1.25, 0.72)) * 5.0 - time * 0.55);
      float ribbon = smoothstep(0.78, 0.08, abs(p.y + waveA * 0.16 + waveB * 0.07));
      float mist = 0.5 + 0.5 * waveC;
      float shade = clamp(uv.y * 0.50 + ribbon * 0.48 + mist * 0.20, 0.0, 1.0);

      vec3 color = palette(shade);
      color += vec3(0.025, 0.070, 0.035) * ribbon;
      color *= 0.72 + 0.28 * smoothstep(-0.92, 0.70, p.x);

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const compileShader = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  };

  const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );

  const positionLocation = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const resolutionLocation = gl.getUniformLocation(program, "resolution");
  const timeLocation = gl.getUniformLocation(program, "time");
  let animationFrame = 0;

  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(width * ratio));
    canvas.height = Math.max(1, Math.floor(height * ratio));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
  };

  const render = (timestamp) => {
    gl.uniform1f(timeLocation, timestamp * 0.001);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    animationFrame = requestAnimationFrame(render);
  };

  resize();
  render(0);
  window.addEventListener("resize", resize);

  return () => {
    window.removeEventListener("resize", resize);
    cancelAnimationFrame(animationFrame);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
  };
}

if (headerShader) {
  initHeaderShader(headerShader);
}

const today = new Date();
updatedDate.dateTime = today.toISOString();
updatedDate.textContent = today.toLocaleDateString("ru-RU", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});
