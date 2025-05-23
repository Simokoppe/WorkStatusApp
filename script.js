// Aggiorna orario, percentuali e immagini di stato
function updateTime() {
  const now = new Date();
  const formattedDate = getFormattedDate(now);
  const weekNumber = getWeekNumber(now);

  // Mostra orario, giorno e settimana
  document.getElementById("time").textContent = now.toLocaleTimeString("it-IT", { hour12: false });
  document.getElementById("day").textContent = formattedDate;
  document.getElementById("week").textContent = `${weekNumber}° settimana`;

  // Calcola percentuali settimana e giornata
  const weekPercent = calculateWorkWeekPercent(now);
  const dayPercent = calculateDayPercent(now);

  // Aggiorna barra e testo settimana
  document.getElementById("percentage").textContent = `${weekPercent}%`;
  const progressWeek = document.getElementById("progress-fill-week");
  progressWeek.style.width = `${weekPercent}%`;
  progressWeek.style.backgroundColor = getBarColor(weekPercent);
  document.getElementById("status-img-week").src = `assets/${getImageForPercentWeek(weekPercent)}`;

  // Aggiorna barra e testo giornata
  document.getElementById("daily-percentage").textContent = `${dayPercent}%`;
  const progressDay = document.getElementById("progress-fill-day");
  progressDay.style.width = `${dayPercent}%`;
  progressDay.style.backgroundColor = getBarColor(dayPercent);
  document.getElementById("status-img-day").src = `assets/${getImageForPercentDay(dayPercent)}`;
}

// Formatta la data (es. "Lunedì 19 Maggio 2025")
function getFormattedDate(date) {
  const giorni = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
  const mesi = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
  return `${giorni[date.getDay()]} ${date.getDate()} ${mesi[date.getMonth()]} ${date.getFullYear()}`;
}

// Calcola il numero della settimana dell'anno
function getWeekNumber(date) {
  const firstJan = new Date(date.getFullYear(), 0, 1);
  const millisInDay = 86400000;
  return Math.ceil(((date - firstJan) / millisInDay + firstJan.getDay() + 1) / 7);
}

// Calcola percentuale giornata lavorativa (9-13 pausa 13-14, 14-18)
function calculateDayPercent(date) {
  const day = date.getDay();
  if (day === 0 || day === 6) return 0; // weekend

  const start = 9 * 60;
  const lunchStart = 13 * 60;
  const lunchEnd = 14 * 60;
  const end = 18 * 60;

  let current = date.getHours() * 60 + date.getMinutes();
  if (current < start) current = start;
  if (current > end) current = end;

  let worked = current - start;
  if (current > lunchStart) {
    worked -= Math.min(current, lunchEnd) - lunchStart;
  }

  const total = (end - start) - (lunchEnd - lunchStart);
  const value = (worked / total) * 100;
  return Number.isInteger(value) ? value : Number(value.toFixed(2));
}

// Calcola percentuale settimana lavorativa (5 giorni da 0% a 100%)
function calculateWorkWeekPercent(date) {
  const day = date.getDay();
  if (day === 0 || day === 6) return 0;

  const start = 9 * 60;
  const lunchStart = 13 * 60;
  const lunchEnd = 14 * 60;
  const end = 18 * 60;

  let current = date.getHours() * 60 + date.getMinutes();
  if (current < start) current = start;
  if (current > end) current = end;

  let worked = current - start;
  if (current > lunchStart) {
    worked -= Math.min(current, lunchEnd) - lunchStart;
  }

  const total = (end - start) - (lunchEnd - lunchStart);
  const dailyPercent = (worked / total) * 100;
  const rawValue = ((day - 1) * 100 + dailyPercent) / 5;
  return Number.isInteger(rawValue) ? rawValue : Number(rawValue.toFixed(2));
}

// Restituisce immagine per percentuale settimana
function getImageForPercentWeek(p) {
  if ([20, 40, 60, 80].includes(p)) return "casa.png";
  if ([10, 30, 50, 70, 90].includes(p)) return "cibo.png";
  if (p === 100) return "festa.png";
  if (p < 33) return "faccina_triste.png";
  if (p < 69) return "faccina_felice.png";
  if (p >= 69 && p < 70) return "smirk.png";
  return "faccina_cuore.png";
}

// Restituisce immagine per percentuale giornata
function getImageForPercentDay(p) {
  if (p === 100) return "casa.png";
  if (p < 30) return "faccina_triste.png";
  if (p === 50) return "cibo.png";
  if (p < 69) return "faccina_felice.png";
  if (p >= 69 && p < 70) return "smirk.png";
  return "faccina_cuore.png";
}

// Colore barra in base alla percentuale
function getBarColor(p) {
  if (p < 34) return "#ee6c6c";
  if (34 <= p && p < 69) return "#eebc6c";
  return "#62d162";
}

// Tema chiaro/scuro
const themeToggleBtn = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

function setTheme(dark) {
  if (dark) {
    document.body.classList.add("dark");
    themeIcon.textContent = "🌙";
    themeIcon.title = "Tema scuro";
  } else {
    document.body.classList.remove("dark");
    themeIcon.textContent = "☀️";
    themeIcon.title = "Tema chiaro";
  }
}

themeToggleBtn.addEventListener("click", () => {
  const darkModeOn = document.body.classList.contains("dark");
  setTheme(!darkModeOn);
});

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
  setTheme(e.matches);
});

// METEO
async function fetchWeather() {
  const apiKey = "afd17550727fcd20ec89ba2302c5293e";
  const city = "San Nicolò a Trebbia,IT";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=it`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Errore meteo");
    const data = await res.json();

    const temperature = Math.round(data.main.temp);
    const iconCode = data.weather[0].icon;

    // Capitalizza la prima lettera della descrizione
    const rawDescription = data.weather[0].description;
    const description = rawDescription.charAt(0).toUpperCase() + rawDescription.slice(1);

    const weatherHTML = `
      <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${description}" title="${description}" style="vertical-align: middle; height: 32px;">
      <span style="font-size: 1.1em;">${temperature}°C - ${description}</span>
    `;
    document.getElementById("weather").innerHTML = weatherHTML;
  } catch (err) {
    console.error("Errore nel recupero meteo:", err);
    document.getElementById("weather").textContent = "⚠️ Meteo non disponibile";
  }
}

// Inizializzazione
document.addEventListener("DOMContentLoaded", () => {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(prefersDark);
  updateTime();
  setInterval(updateTime, 1000);

  fetchWeather(); // subito all’avvio
  setInterval(fetchWeather, 60 * 60 * 1000); // ogni ora
});
