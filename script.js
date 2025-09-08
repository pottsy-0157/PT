// Dynamic navbar background on scroll
window.addEventListener("scroll", function () {
  const navbar = document.getElementById("navbar");
  if (navbar) {
    navbar.classList.toggle("scrolled", window.scrollY > 50);
  }
});

// Weekly planner / reminders
(function () {
  const grid = document.getElementById("weekGrid");
  const label = document.getElementById("weekLabel");
  const prev = document.getElementById("prevWeek");
  const next = document.getElementById("nextWeek");
  const toast = document.getElementById("reminderToast");
  if (!grid || !label || !prev || !next) return;

  const MS_DAY = 86400000;
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let anchor = new Date();

  function startOfWeek(d) {
    const date = new Date(d);
    const diff = date.getDate() - date.getDay(); // Sunday start
    return new Date(date.setDate(diff));
  }

  function formatShort(date) {
    return `${weekdays[date.getDay()]} ${date.getDate()}`;
  }

  // --- FULL WORKOUTS DATA ---
  const workoutsData = {
    "PUSH / CORE": `
      <p><strong>Warm-up</strong></p>
      <ul>
        <li>5–7 min mixed cardio + shoulder prep</li>
        <li>2 rounds: 10 band pull-aparts, 10 scap push-ups, 10 PVC pass-throughs</li>
      </ul>
      <p><strong>Strength – Push</strong></p>
      <ul>
        <li>Barbell Bench Press 5 x 5 @ 75–80%, 2–3 min rest</li>
        <li>Incline DB Press 3 x 10, 60–90s rest</li>
        <li>Seated DB Shoulder Press 3 x 10, 60–90s rest</li>
      </ul>
      <p><strong>Accessory</strong></p>
      <ul>
        <li>Superset x3: 12 Cable Flyes + 12 Triceps Rope Pushdowns</li>
      </ul>
      <p><strong>Core Circuit</strong></p>
      <ul>
        <li>3 rounds (60s work / 15s rest): Hollow Hold, Dead Bug, Side Plank L/R</li>
      </ul>
      <p><strong>Finisher</strong></p>
      <ul>
        <li>EMOM 6: 10 Push-ups + 20s Plank</li>
      </ul>`,

    "GRIP IT & RIP IT (ERGS)": `
      <p><strong>Warm-up</strong></p>
      <ul>
        <li>5 min rowing + mobility</li>
      </ul>
      <p><strong>Main</strong></p>
      <ul>
        <li>4x 500m rowing sprints @ max effort, 2 min rest</li>
        <li>3x 250m sprints, 1 min rest</li>
      </ul>
      <p><strong>Finisher</strong></p>
      <ul>
        <li>Grip farmer carries 3x 40m</li>
      </ul>`,

    "HYROX SATURDAY": `
      <p><strong>Warm-up</strong></p>
      <ul>
        <li>10 min general cardio + dynamic stretches</li>
      </ul>
      <p><strong>Main Circuit</strong></p>
      <ul>
        <li>1 km Run</li>
        <li>1000m SkiErg</li>
        <li>50 Burpees</li>
        <li>1000m Row</li>
        <li>50 Walking Lunges</li>
      </ul>
      <p><strong>Core</strong></p>
      <ul>
        <li>3 rounds Plank 60s, Side Plank 30s each side</li>
      </ul>`,

    "Hyrox Conditioning": `
      <p><strong>Warm-up</strong></p>
      <ul><li>5–10 min cardio + dynamic stretches</li></ul>
      <p><strong>Main</strong></p>
      <ul>
        <li>AMRAP 20 min: 10 Wall Balls, 15 KB Swings, 10 Burpees</li>
      </ul>`,

    "Pull / Back + Core": `
      <p><strong>Warm-up</strong></p>
      <ul><li>5 min rowing + shoulder prep</li></ul>
      <p><strong>Strength</strong></p>
      <ul>
        <li>Pull-ups 4x8</li>
        <li>Barbell Row 4x10</li>
      </ul>
      <p><strong>Core</strong></p>
      <ul><li>Hanging Leg Raises 3x12</li></ul>`,

    "Hyrox Strength": `
      <p><strong>Warm-up</strong></p>
      <ul><li>5–10 min light cardio</li></ul>
      <p><strong>Strength Circuit</strong></p>
      <ul>
        <li>Deadlift 5x5</li>
        <li>Front Squat 4x8</li>
        <li>Overhead Press 3x10</li>
      </ul>`,

    "Legs / Core": `
      <p><strong>Warm-up</strong></p>
      <ul><li>5–7 min bike + dynamic stretches</li></ul>
      <p><strong>Main</strong></p>
      <ul>
        <li>Squat 5x5</li>
        <li>Lunges 3x12 each leg</li>
        <li>Romanian Deadlift 3x10</li>
      </ul>
      <p><strong>Core</strong></p>
      <ul><li>Plank 60s x3, Side Plank 30s</li></ul>`,

    "Recovery / Mobility": `
      <p><strong>Recovery</strong></p>
      <ul>
        <li>Foam roll 10 min</li>
        <li>Stretching 15 min</li>
        <li>Optional light swim or walk</li>
      </ul>`
  };

  // --- Add session function ---
  function addSession(container, name, time, dayDate) {
    const pill = document.createElement("div");
    pill.className = "session-card";

    // Card header
    const header = document.createElement("div");
    header.className = "card-header";
    header.innerHTML = `<h3>${name}</h3><span class="spaces">YOU GOT THIS!</span>`;
    pill.appendChild(header);

    // Time
    const pTime = document.createElement("p");
    pTime.innerHTML = `<strong>${time} – ${(parseInt(time.split(":")[0])+1).toString().padStart(2,"0")}:${time.split(":")[1]} (UK)</strong>`;
    pill.appendChild(pTime);

    // Collapsible
    const collapsible = document.createElement("div");
    collapsible.className = "collapsible";
    collapsible.innerHTML = workoutsData[name] || "<p>No details available.</p>";
    pill.appendChild(collapsible);

    // Toggle collapsible
    pill.addEventListener("click", e => {
      if (!e.target.classList.contains("remind-btn") && !e.target.classList.contains("addcal-btn")) {
        collapsible.classList.toggle("open");
        collapsible.style.maxHeight = collapsible.classList.contains("open") ? collapsible.scrollHeight + "px" : "0px";
      }
    });

    // Remind button
    const btn = document.createElement("button");
    btn.className = "remind-btn";
    btn.textContent = "Remind";
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const dt = combineDateAndTime(dayDate, time);
      ensureNotificationPermission().then(allowed => {
        if (!allowed) {
          if (toast) toast.textContent = "Enable notifications to receive reminders.";
          setTimeout(() => { if (toast) toast.textContent = ""; }, 2000);
          return;
        }
        const rem = { name, time, when: dt.getTime() };
        storeReminder(rem);
        scheduleReminder(rem);
        if (toast) toast.textContent = `Reminder set for ${name} at ${formatTime(dt)}.`;
        setTimeout(() => { if (toast && toast.textContent.includes(name)) toast.textContent = ""; }, 2000);
      });
    });
    pill.appendChild(btn);

    // Add to calendar
    const addCal = document.createElement("button");
    addCal.className = "addcal-btn";
    addCal.textContent = "+ Calendar";
    addCal.addEventListener("click", e => {
      e.stopPropagation();
      const dt = combineDateAndTime(dayDate, time);
      downloadICS({ title: name, description: `${name} class`, start: dt, durationMinutes: 60 });
    });
    pill.appendChild(addCal);

    container.appendChild(pill);
  }

  // --- Combine date and time ---
  function combineDateAndTime(dayDate, hhmm) {
    const [hh, mm] = hhmm.split(":").map(v => parseInt(v, 10));
    const d = new Date(dayDate);
    d.setHours(hh, mm, 0, 0);
    return d;
  }

  // --- Other helper functions (ensureNotificationPermission, scheduleReminder, storeReminder, downloadICS, etc.) ---
  // Copy your existing ones from your current JS

  // --- Render function ---
  function render() {
    const start = startOfWeek(anchor);
    const end = new Date(start.getTime() + MS_DAY * 6);
    label.textContent = `${start.toLocaleDateString("en-GB")} - ${end.toLocaleDateString("en-GB")}`;
    grid.innerHTML = "";

    for (let i = 0; i < 7; i++) {
      const day = new Date(start.getTime() + MS_DAY * i);
      const dayEl = document.createElement("div");
      dayEl.className = "day-card";

      const header = document.createElement("div");
      header.className = "day-header";
      header.innerHTML = `<span>${formatShort(day)}</span>`;

      const sessions = document.createElement("div");
      sessions.className = "day-sessions";

      // Assign workouts per day
      switch(day.getDay()) {
        case 0: addSession(sessions, "Recovery / Mobility", "09:00", day); break;
        case 1: addSession(sessions, "Hyrox Conditioning", "06:00", day);
                addSession(sessions, "PUSH / CORE", "18:00", day); break;
        case 2: addSession(sessions, "GRIP IT & RIP IT (ERGS)", "06:00", day);
                addSession(sessions, "Pull / Back + Core", "18:00", day); break;
        case 3: addSession(sessions, "Hyrox Strength", "06:00", day);
                addSession(sessions, "Legs / Core", "18:00", day); break;
        case 4: addSession(sessions, "GRIP IT & RIP IT (ERGS)", "06:00", day);
                addSession(sessions, "PUSH / CORE", "18:00", day); break;
        case 5: addSession(sessions, "Hyrox Conditioning", "06:00", day);
                addSession(sessions, "GRIP IT & RIP IT (ERGS)", "18:00", day); break;
        case 6: addSession(sessions, "HYROX SATURDAY", "07:30", day); break;
      }

      dayEl.appendChild(header);
      dayEl.appendChild(sessions);
      grid.appendChild(dayEl);
    }
  }

  // --- Prev/Next week buttons ---
  prev.addEventListener("click", function () { anchor = new Date(anchor.getTime() - MS_DAY*7); render(); });
  next.addEventListener("click", function () { anchor = new Date(anchor.getTime() + MS_DAY*7); render(); });

  render();
})();

// Hamburger menu toggle for mobile
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("mobileNavLinks");
if (hamburger && navLinks) {
  hamburger.addEventListener("click", function () {
    navLinks.classList.toggle("open");
  });
}

// Utility: Get next weekday date with ordinal suffix
function getWeekdayDate(targetDay) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  let diff = targetDay - dayOfWeek;
  if (diff < 0) diff += 7;
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + diff);

  const options = {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  };
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

// Set dates for session cards
const dateMap = {
  "friday-date": 5, // Friday
  "saturday-date": 6, // Saturday
};
Object.entries(dateMap).forEach(([id, dayNum]) => {
  const el = document.getElementById(id);
  if (el) el.textContent = getWeekdayDate(dayNum);
});

// Example class start time (replace with dynamic values if needed)
const classStart = new Date("2025-09-05T06:00:00+01:00"); // 6:00 am BST, 5 Sept 2025

function formatClassTime(date) {
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/London",
  };
  return `Started: ${date
    .toLocaleDateString("en-GB", options)
    .replace(",", "")} at ${date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/London",
  })} BST`;
}

window.addEventListener("DOMContentLoaded", function () {
  const now = new Date();
  if (now >= classStart) {
    document.getElementById("bookingStatus").style.display = "block";
    document.getElementById("classStartedTime").textContent =
      formatClassTime(classStart);
  }
});

// Show more / less sessions toggle
const toggleText = document.getElementById("toggleSessionsText");
const hiddenCards = document.querySelectorAll(".session-card.hidden");
let showingMore = false;
if (toggleText) {
  toggleText.addEventListener("click", function () {
    showingMore = !showingMore;
    hiddenCards.forEach((card) => {
      card.style.display = showingMore ? "block" : "none";
    });
    toggleText.textContent = showingMore ? "Show Less" : "Show More";
  });
}

document.querySelectorAll(".session-card").forEach((card) => {
  const dateStr = card.getAttribute("data-date");
  if (dateStr) {
    const date = new Date(dateStr);
    const options = { weekday: "long" };
    const day = date.toLocaleDateString("en-GB", options);
    const daySpan = card.querySelector(".session-day");
    if (daySpan) daySpan.textContent = day;
  }
});

document.querySelectorAll(".session-group").forEach((group) => {
  const dayNum = parseInt(group.getAttribute("data-day"), 10);
  const dateHeading = group.querySelector(".session-date");
  if (dateHeading) dateHeading.textContent = getWeekdayDate(dayNum);
});

// Workout page: copy and toggle logic (delegated; safe if elements absent)
window.addEventListener("DOMContentLoaded", function () {
  const copyBtn = document.getElementById("copyWorkoutBtn");
  const workoutText = document.getElementById("workoutText");
  if (copyBtn && workoutText) {
    copyBtn.addEventListener("click", function () {
      const text = workoutText.innerText.trim();
      if (!text) return;
      navigator.clipboard
        .writeText(text)
        .then(function () {
          const original = copyBtn.textContent;
          copyBtn.textContent = "Copied!";
          setTimeout(function () {
            copyBtn.textContent = original;
          }, 1200);
        })
        .catch(function () {
          const textarea = document.createElement("textarea");
          textarea.value = text;
          document.body.appendChild(textarea);
          textarea.select();
          try {
            document.execCommand("copy");
          } catch (e) {}
          document.body.removeChild(textarea);
        });
    });
  }

  const toggleBtn = document.getElementById("toggleWorkoutBtn");
  const wrapper = document.getElementById("workoutTextWrapper");
  const card = document.getElementById("workoutDetail");
  if (toggleBtn && wrapper) {
    // Initialize collapsed
    wrapper.style.maxHeight = "0px";
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.textContent = "Show workout";

    toggleBtn.addEventListener("click", function () {
      const isOpen = wrapper.classList.toggle("open");
      toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      toggleBtn.textContent = isOpen ? "Hide workout" : "Show workout";
      if (isOpen) {
        wrapper.style.maxHeight = wrapper.scrollHeight + "px";
        if (card) card.classList.add("expanded");
      } else {
        wrapper.style.maxHeight = "0px";
        if (card) card.classList.remove("expanded");
      }
    });
  }

  // Subscribe form
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
      // Simulate success
      subscribeMessage.textContent = "Thanks! You're subscribed.";
      subscribeMessage.style.color = "#9eff9e";
      subscribeEmail.value = "";
    });
  }
});

// Simple auth and tracker
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
        if (authMessage)
          authMessage.textContent = "Unable to store credentials.";
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

      // monthly count
      if (statMonthCount) {
        const now = new Date();
        const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
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














