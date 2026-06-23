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
  const ctx = canvas.getContext("2d");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!ctx) {
    return;
  }

  const waves = [
    {
      color: "rgba(221, 245, 185, 0.96)",
      glow: "rgba(139, 205, 111, 0.42)",
      width: 2.8,
      amp: 30,
      freq: 1.18,
      speed: 0.0011,
      y: 0.38,
    },
    {
      color: "rgba(151, 219, 126, 0.82)",
      glow: "rgba(84, 165, 82, 0.34)",
      width: 2.2,
      amp: 44,
      freq: 1.62,
      speed: -0.00086,
      y: 0.52,
    },
    {
      color: "rgba(234, 247, 201, 0.58)",
      glow: "rgba(188, 231, 143, 0.28)",
      width: 1.5,
      amp: 22,
      freq: 2.35,
      speed: 0.00128,
      y: 0.29,
    },
  ];

  let animationFrame = 0;
  let width = 0;
  let height = 0;
  let ratio = 1;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const render = (timestamp) => {
    ctx.clearRect(0, 0, width, height);

    const background = ctx.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, "#06210e");
    background.addColorStop(0.42, "#1c5525");
    background.addColorStop(0.72, "#4f8740");
    background.addColorStop(1, "#061a0c");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = "screen";

    waves.forEach((wave, index) => {
      const phase = timestamp * wave.speed + index * 1.7;
      const baseY = height * wave.y;
      const path = new Path2D();

      for (let x = -24; x <= width + 24; x += 8) {
        const progress = x / width;
        const y =
          baseY +
          Math.sin(progress * Math.PI * 2 * wave.freq + phase) * wave.amp +
          Math.sin(progress * Math.PI * 4.2 + phase * 0.7) * wave.amp * 0.32;

        if (x === -24) {
          path.moveTo(x, y);
        } else {
          path.lineTo(x, y);
        }
      }

      ctx.strokeStyle = wave.glow;
      ctx.lineWidth = wave.width * 7;
      ctx.lineCap = "round";
      ctx.shadowBlur = 28;
      ctx.shadowColor = wave.glow;
      ctx.stroke(path);

      ctx.strokeStyle = wave.color;
      ctx.lineWidth = wave.width;
      ctx.lineCap = "round";
      ctx.shadowBlur = 18;
      ctx.shadowColor = wave.color;
      ctx.stroke(path);
    });

    ctx.globalCompositeOperation = "source-over";
    ctx.shadowBlur = 0;

    if (!prefersReducedMotion) {
      animationFrame = requestAnimationFrame(render);
    }
  };

  resize();
  render(0);
  window.addEventListener("resize", resize);

  return () => {
    window.removeEventListener("resize", resize);
    cancelAnimationFrame(animationFrame);
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
