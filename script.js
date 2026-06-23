const statusButtons = document.querySelectorAll(".status-switch__button");
const statusPill = document.querySelector("#status-pill");
const contactLink = document.querySelector("#contact-link");
const copyButton = document.querySelector("#copy-contact");
const copyMessage = document.querySelector("#copy-message");
const updatedDate = document.querySelector("#updated-date");
const themeToggle = document.querySelector("#theme-toggle");
const themeToggleLabel = document.querySelector("#theme-toggle-label");

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

const today = new Date();
updatedDate.dateTime = today.toISOString();
updatedDate.textContent = today.toLocaleDateString("ru-RU", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});
