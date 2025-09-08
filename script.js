// ---------------------------
// Navbar Scroll Effect
// ---------------------------
window.addEventListener("scroll", function () {
  const navbar = document.getElementById("navbar");
  if (navbar) {
    navbar.classList.toggle("scrolled", window.scrollY > 50);
  }
});

// ---------------------------
// Hamburger Menu Toggle
// ---------------------------
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("mobileNavLinks");
if (hamburger && navLinks) {
  hamburger.addEventListener("click", function () {
    navLinks.classList.toggle("open");
  });
}

// ---------------------------
// Dynamic Dates for Sessions
// ---------------------------
function getWeekdayDate(targetDay) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  let diff = targetDay - dayOfWeek;
  if (diff < 0) diff += 7;
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + diff);

  const options = { weekday: "short", day: "numeric", month: "short", year: "numeric" };
  let dateStr = targetDate.toLocaleDateString("en-GB", options);

  // Ordinal suffix
  const dayNum = targetDate.getDate();
  let suffix = "th";
  if (dayNum % 10 === 1 && dayNum !== 11) suffix = "st";
  else if (dayNum % 10 === 2 && dayNum !== 12) suffix = "nd";
  else if (dayNum % 10 === 3 && dayNum !== 13) suffix = "rd";
  dateStr = dateStr.replace(dayNum, `${dayNum}${suffix}`);

  return dateStr;
}

const dateMap = {
  "friday-date": 5,
  "saturday-date": 6,
};
Object.entries(dateMap).forEach(([id, dayNum]) => {
  const el = document.getElementById(id);
  if (el) el.textContent = getWeekdayDate(dayNum);
});

// ---------------------------
// Weekly Calendar View
// ---------------------------
let currentWeekStart = new Date();

function getWeekStart(date) {
  const day = date.getDay();
  const monday = new Date(date);
  const diff = (day === 0 ? -6 : 1) - day;
  monday.setDate(date.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function renderWeek(date) {
  const weekStart = getWeekStart(date);
  currentWeekStart = new Date(weekStart);
  const weekGrid = document.getElementById("weekGrid");
  const weekLabel = document.getElementById("weekLabel");
  if (!weekGrid || !weekLabel) return;

  weekGrid.innerHTML = "";
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);

    const div = document.createElement("div");
    div.className = "day-cell";
    div.innerHTML = `<strong>${days[i]}</strong><br>${d.getDate()}/${d.getMonth() + 1}`;
    weekGrid.appendChild(div);
  }

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekLabel.innerText = `${weekStart.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })} - ${weekEnd.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

function autoUpdateWeek() {
  const today = new Date();
  const sunday = new Date(getWeekStart(today));
  sunday.setDate(sunday.getDate() + 6);

  if (today > sunday) {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }
  renderWeek(currentWeekStart);
}

const prevBtn = document.getElementById("prevWeek");
const nextBtn = document.getElementById("nextWeek");
if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    renderWeek(currentWeekStart);
  });
}
if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    renderWeek(currentWeekStart);
  });
}

autoUpdateWeek();

// ---------------------------
// Reminder Toasts
// ---------------------------
function showReminder(message) {
  const toast = document.getElementById("reminderToast");
  if (!toast) return;
  toast.innerText = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}
setTimeout(() => showReminder("Don’t forget your workout tomorrow!"), 2000);

// ---------------------------
// Workout Page Copy / Toggle
// ---------------------------
window.addEventListener("DOMContentLoaded", function () {
  const copyBtn = document.getElementById("copyWorkoutBtn");
  const workoutText = document.getElementById("workoutText");
  if (copyBtn && workoutText) {
    copyBtn.addEventListener("click", function () {
      const text = workoutText.innerText.trim();
      if (!text) return;
      navigator.clipboard.writeText(text).then(
        () => {
          const original = copyBtn.textContent;
          copyBtn.textContent = "Copied!";
          setTimeout(() => (copyBtn.textContent = original), 1200);
        },
        () => {
          const textarea = document.createElement("textarea");
          textarea.value = text;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
        }
      );
    });
  }

  const toggleBtn = document.getElementById("toggleWorkoutBtn");
  const wrapper = document.getElementById("workoutTextWrapper");
  const card = document.getElementById("workoutDetail");
  if (toggleBtn && wrapper) {
    wrapper.style.maxHeight = "0px";
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.textContent = "Show workout";

    toggleBtn.addEventListener("click", function () {
      const isOpen = wrapper.classList.toggle("open");
      toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      toggleBtn.textContent = isOpen ? "Hide workout" : "Show workout";
      wrapper.style.maxHeight = isOpen ? wrapper.scrollHeight + "px" : "0px";
      if (card) card.classList.toggle("expanded", isOpen);
    });
  }

  // Newsletter Subscribe
  const subscribeForm = document.getElementById("subscribeForm");
  const subscribeEmail = document.getElementById("subscribeEmail");
  const subscribeMessage = document.getElementById("subscribeMessage");
  if (subscribeForm && subscribeEmail && subscribeMessage) {
    subscribeForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = subscribeEmail.value.trim();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!valid) {
        subscribeMessage.textContent = "Please enter a valid email.";
        subscribeMessage.style.color = "#ff6b6b";
        return;
      }
      subscribeMessage.textContent = "Thanks! You're subscribed.";
      subscribeMessage.style.color = "#9eff9e";
      subscribeEmail.value = "";
    });
  }
});

// ---------------------------
// Simple Auth + Workout Logs
// ---------------------------
(function () {
  const loginForm = document.getElementById("loginForm");
  const authEmail = document.getElementById("authEmail");
  const authPassword = document.getElementById("authPassword");
  const authMessage = document.getElementById("authMessage");
  const logoutBtn = document.getElementById("logoutBtn");
  const logForm = document.getElementById("logForm");
  const logDate = document.getElementById("logDate");
  const logTitle = document.getElementById("logTitle");
  const logMetric = document.getElementById("logMetric");
  const logsTbody = document.getElementById("logsTbody");
  const logsEmpty = document.getElementById("logsEmpty");
  const statMonthCount = document.getElementById("statMonthCount");

  function getUserKey() {
    try {
      return localStorage.getItem("userEmail") || null;
    } catch {
      return null;
    }
  }

  if (loginForm && authEmail && authPassword) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = authEmail.value.trim();
      const pwd = authPassword.value.trim();
      if (!email || !pwd) {
        if (authMessage) authMessage.textContent = "Enter email and password.";
        return;
      }
      try {
        localStorage.setItem("userEmail", email);
        localStorage.setItem(`user:${email}:password`, pwd);
        window.location.href = "account.html";
      } catch {
        if (authMessage) authMessage.textContent = "Unable to store credentials.";
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      try {
        localStorage.removeItem("userEmail");
      } catch {}
      window.location.href = "login.html";
    });
  }

  function renderLogs(email) {
    if (!logsTbody || !logsEmpty) return;
    logsTbody.innerHTML = "";
    try {
      const raw = localStorage.getItem(`user:${email}:logs`) || "[]";
      const logs = JSON.parse(raw);
      logs.sort((a, b) => b.date.localeCompare(a.date));

      if (statMonthCount) {
        const now = new Date();
        const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const count = logs.filter((l) => (l.date || "").startsWith(ym)).length;
        statMonthCount.textContent = String(count);
      }

      if (logs.length === 0) {
        logsEmpty.style.display = "block";
        return;
      }
      logsEmpty.style.display = "none";

      logs.forEach((log, idx) => {
        const tr = document.createElement("tr");
        const tdDate = document.createElement("td");
        const tdTitle = document.createElement("td");
        const tdMetric = document.createElement("td");
        const tdAct = document.createElement("td");
        tdDate.textContent = log.date;
        tdTitle.textContent = log.title;
        tdMetric.textContent = log.metric || "";
        const del = document.createElement("button");
        del.className = "log-del";
        del.textContent = "Delete";
        del.addEventListener("click", function () {
          deleteLog(email, idx);
        });
        tdAct.appendChild(del);
        tr.appendChild(tdDate);
        tr.appendChild(tdTitle);
        tr.appendChild(tdMetric);
        tr.appendChild(tdAct);
        logsTbody.appendChild(tr);
      });
    } catch {}
  }

  function deleteLog(email, index) {
    try {
      const key = `user:${email}:logs`;
      const list = JSON.parse(localStorage.getItem(key) || "[]");
      list.splice(index, 1);
      localStorage.setItem(key, JSON.stringify(list));
      renderLogs(email);
    } catch {}
  }

  if (logForm && logDate && logTitle) {
    const email = getUserKey();
    if (!email) {
      window.location.href = "login.html";
      return;
    }
    renderLogs(email);
    logForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const date = logDate.value;
      const title = logTitle.value.trim();
      const metric = logMetric ? logMetric.value.trim() : "";
      if (!date || !title) return;
      try {
        const key = `user:${email}:logs`;
        const list = JSON.parse(localStorage.getItem(key) || "[]");
        list.push({ date, title, metric });
        localStorage.setItem(key, JSON.stringify(list));
        renderLogs(email);
        logTitle.value = "";
        if (logMetric) logMetric.value = "";
      } catch {}
    });
  }
})();

// ---------------------------
// Fix Workout Links (lowercase)
// ---------------------------
document.querySelectorAll(".session-card a, .session-card").forEach((card) => {
  if (card.tagName === "A") {
    card.href = card.href.replace(/\.html/i, ".html").toLowerCase();
  } else if (card.getAttribute("onclick")) {
    let link = card.getAttribute("onclick").match(/'([^']+)'/)[1];
    link = link.toLowerCase();
    card.setAttribute("onclick", `window.location.href='${link}'`);
  }
});


