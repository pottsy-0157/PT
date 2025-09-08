document.addEventListener("DOMContentLoaded", () => {
  // -----------------------------
  // Dynamic navbar background
  // -----------------------------
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 50);
  });

  // -----------------------------
  // Weekly planner / reminders
  // -----------------------------
  const grid = document.getElementById("weekGrid");
  const label = document.getElementById("weekLabel");
  const prev = document.getElementById("prevWeek");
  const next = document.getElementById("nextWeek");
  const toast = document.getElementById("reminderToast");
  if (grid && label && prev && next) {
    const MS_DAY = 86400000;
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let anchor = new Date();

    function startOfWeek(d) {
      const date = new Date(d);
      const diff = date.getDate() - date.getDay();
      return new Date(date.setDate(diff));
    }

    function formatShort(date) {
      return `${weekdays[date.getDay()]} ${date.getDate()}`;
    }

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
      case 0: // Sunday
        addSession(sessions, "Recovery / Mobility", "09:00", day);
        break;
      case 1: // Monday
        addSession(sessions, "Hyrox Conditioning", "06:00", day);
        addSession(sessions, "Push / Core", "18:00", day);
        break;
      case 2: // Tuesday
        addSession(sessions, "Grip It & Rip It (Ergs)", "06:00", day);
        addSession(sessions, "Pull / Back + Core", "18:00", day);
        break;
      case 3: // Wednesday
        addSession(sessions, "Hyrox Strength", "06:00", day);
        addSession(sessions, "Legs / Core", "18:00", day);
        break;
      case 4: // Thursday
        addSession(sessions, "Grip It & Rip It (Ergs)", "06:00", day);
        addSession(sessions, "Push / Core", "18:00", day);
        break;
      case 5: // Friday
        addSession(sessions, "Hyrox Conditioning", "06:00", day);
        addSession(sessions, "Grip It & Rip It (Ergs)", "18:00", day);
        break;
      case 6: // Saturday
        addSession(sessions, "Hyrox Saturday (Full Workout)", "07:30", day);
        break;
    }

    dayEl.appendChild(header);
    dayEl.appendChild(sessions);
    grid.appendChild(dayEl);
  }
}


    function addSession(container, name, time, dayDate) {
      const pill = document.createElement("div");
      pill.className = "session-pill";
      pill.innerHTML = `<span>${time} • ${name}</span>`;

      const btn = document.createElement("button");
      btn.className = "remind-btn";
      btn.textContent = "Remind";
      btn.addEventListener("click", () => {
        const dt = combineDateAndTime(dayDate, time);
        ensureNotificationPermission().then((allowed) => {
          if (!allowed) {
            if (toast) {
              toast.textContent = "Enable notifications to receive reminders.";
              setTimeout(() => (toast.textContent = ""), 2000);
            }
            return;
          }
          const rem = { name, time, when: dt.getTime() };
          storeReminder(rem);
          scheduleReminder(rem);
          if (toast) {
            toast.textContent = `Reminder set for ${name} at ${formatTime(dt)}.`;
            setTimeout(() => {
              if (toast.textContent.includes(name)) toast.textContent = "";
            }, 2000);
          }
        });
      });

      const addCal = document.createElement("button");
      addCal.className = "addcal-btn";
      addCal.textContent = "+ Calendar";
      addCal.addEventListener("click", () => {
        const dt = combineDateAndTime(dayDate, time);
        downloadICS({ title: name, description: `${name} class`, start: dt, durationMinutes: 60 });
      });

      pill.appendChild(btn);
      pill.appendChild(addCal);
      container.appendChild(pill);
    }

    function combineDateAndTime(dayDate, hhmm) {
      const [hh, mm] = hhmm.split(":").map((v) => parseInt(v, 10));
      const d = new Date(dayDate);
      d.setHours(hh, mm, 0, 0);
      return d; 
    }

    function formatTime(d) {
      return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
    }

    function ensureNotificationPermission() {
      return new Promise((resolve) => {
        if (!("Notification" in window)) return resolve(false);
        if (Notification.permission === "granted") return resolve(true);
        if (Notification.permission !== "denied") {
          Notification.requestPermission().then((perm) => resolve(perm === "granted"));
        } else resolve(false);
      });
    }

    function scheduleReminder(rem) {
      const delay = rem.when - Date.now();
      if (delay <= 0) return;
      setTimeout(() => {
        try { new Notification(rem.name, { body: `Starting at ${rem.time}` }); } catch {}
      }, Math.min(delay, 2147483647));
    }

    function storeReminder(rem) {
      const list = JSON.parse(localStorage.getItem("reminders") || "[]");
      list.push(rem);
      localStorage.setItem("reminders", JSON.stringify(list));
    }

    (function restore() {
      const list = JSON.parse(localStorage.getItem("reminders") || "[]");
      list.forEach((r) => scheduleReminder(r));
    })();

    function pad(n) { return n.toString().padStart(2, "0"); }
    function toICSDate(dt) {
      const y = dt.getUTCFullYear(), m = pad(dt.getUTCMonth() + 1), d = pad(dt.getUTCDate()), hh = pad(dt.getUTCHours()), mm = pad(dt.getUTCMinutes());
      return `${y}${m}${d}T${hh}${mm}00Z`;
    }
    function escapeICS(s) { return String(s).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;"); }
    function downloadICS({ title, description, start, durationMinutes }) {
      const end = new Date(start.getTime() + durationMinutes * 60000);
      const uid = `${start.getTime()}-${Math.random().toString(36).slice(2)}@elev8`;
      const ics = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ELEV8//Schedule//EN",
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${toICSDate(new Date())}`,
        `DTSTART:${toICSDate(start)}`,
        `DTEND:${toICSDate(end)}`,
        `SUMMARY:${escapeICS(title)}`,
        `DESCRIPTION:${escapeICS(description)}`,
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${title.replace(/\s+/g, "_")}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    }

    prev.addEventListener("click", () => { anchor = new Date(anchor.getTime() - MS_DAY * 7); render(); });
    next.addEventListener("click", () => { anchor = new Date(anchor.getTime() + MS_DAY * 7); render(); });

    render();
  }

  // -----------------------------
  // Hamburger menu toggle
  // -----------------------------
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("mobileNavLinks");
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => navLinks.classList.toggle("open"));
  }

  // -----------------------------
  // Workout collapsibles
  // -----------------------------
  document.querySelectorAll(".workoutTextWrapper").forEach(wrapper => {
    wrapper.style.maxHeight = "0px"; // collapsed
    const toggleBtn = wrapper.previousElementSibling.querySelector(".toggleWorkoutBtn");
    if (!toggleBtn) return;

    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.textContent = "Show workout";

    toggleBtn.addEventListener("click", () => {
      const isOpen = wrapper.classList.toggle("open");
      toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      toggleBtn.textContent = isOpen ? "Hide workout" : "Show workout";
      requestAnimationFrame(() => wrapper.style.maxHeight = isOpen ? wrapper.scrollHeight + "px" : "0px");
    });
  });

  // -----------------------------
  // Copy workout text
  // -----------------------------
  document.querySelectorAll(".copyWorkoutBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const wrapper = btn.closest(".workoutTextWrapper");
      if (!wrapper) return;
      const text = wrapper.innerText.trim();
      navigator.clipboard.writeText(text).then(() => {
        const original = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(() => (btn.textContent = original), 1200);
      });
    });
  });

  // -----------------------------
  // Subscribe form
  // -----------------------------
  const subscribeForm = document.getElementById("subscribeForm");
  const subscribeEmail = document.getElementById("subscribeEmail");
  const subscribeMessage = document.getElementById("subscribeMessage");
  if (subscribeForm && subscribeEmail && subscribeMessage) {
    subscribeForm.addEventListener("submit", e => {
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

  // -----------------------------
  // Auth & logs
  // -----------------------------
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
      return localStorage.getItem("userEmail") || null;
    }

    function renderLogs(email) {
      if (!logsTbody || !logsEmpty) return;
      logsTbody.innerHTML = "";
      const raw = localStorage.getItem(`user:${email}:logs`) || "[]";
      const logs = JSON.parse(raw);
      logs.sort((a, b) => b.date.localeCompare(a.date));

      if (statMonthCount) {
        const now = new Date();
        const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,"0")}`;
        statMonthCount.textContent = logs.filter(l => l.date.startsWith(ym)).length;
      }

      if (!logs.length) { logsEmpty.style.display = "block"; return; }
      logsEmpty.style.display = "none";

      logs.forEach((log, idx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${log.date}</td><td>${log.title}</td><td>${log.metric || ""}</td><td></td>`;
        const del = document.createElement("button");
        del.textContent = "Delete";
        del.className = "log-del";
        del.addEventListener("click", () => deleteLog(email, idx));
        tr.children[3].appendChild(del);
        logsTbody.appendChild(tr);
      });
    }

    function deleteLog(email, idx) {
      const key = `user:${email}:logs`;
      const list = JSON.parse(localStorage.getItem(key) || "[]");
      list.splice(idx, 1);
      localStorage.setItem(key, JSON.stringify(list));
      renderLogs(email);
    }

    if (loginForm && authEmail && authPassword) {
      loginForm.addEventListener("submit", e => {
        e.preventDefault();
        const email = authEmail.value.trim(), pwd = authPassword.value.trim();
        if (!email || !pwd) { if(authMessage) authMessage.textContent="Enter email and password."; return; }
        localStorage.setItem("userEmail", email);
        localStorage.setItem(`user:${email}:password`, pwd);
        window.location.href = "account.html";
      });
    }

    if (logoutBtn) logoutBtn.addEventListener("click", () => { localStorage.removeItem("userEmail"); window.location.href="login.html"; });

    if (logForm && logDate && logTitle) {
      const email = getUserKey();
      if (!email) { window.location.href="login.html"; return; }
      renderLogs(email);
      logForm.addEventListener("submit", e => {
        e.preventDefault();
        const date = logDate.value, title = logTitle.value.trim(), metric = logMetric ? logMetric.value.trim() : "";
        if (!date || !title) return;
        const key = `user:${email}:logs`;
        const list = JSON.parse(localStorage.getItem(key) || "[]");
        list.push({ date, title, metric });
        localStorage.setItem(key, JSON.stringify(list));
        renderLogs(email);
        logTitle.value = "";
        if (logMetric) logMetric.value = "";
      });
    }
  })();
});





