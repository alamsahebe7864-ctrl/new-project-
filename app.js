/**
 * StudentHub - Modern Student Productivity Dashboard
 * Pure Vanilla JavaScript implementation with LocalStorage persistence.
 */

// ===================================================================
// Default Sample Data (Populated on first launch)
// ===================================================================
const INITIAL_TASKS = [
  {
    id: "task_1",
    text: "Review Data Structures lecture notes & BST balance",
    subject: "Computer Science",
    priority: "high",
    dueDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    completed: false,
    createdAt: Date.now() - 3600000
  },
  {
    id: "task_2",
    text: "Solve Calculus assignment problems #12 to #20",
    subject: "Mathematics",
    priority: "high",
    dueDate: new Date(Date.now() + 172800000).toISOString().split("T")[0],
    completed: true,
    createdAt: Date.now() - 7200000
  },
  {
    id: "task_3",
    text: "Read Chapter 4 of Classical Mechanics (Oscillations)",
    subject: "Physics",
    priority: "medium",
    dueDate: new Date(Date.now() + 259200000).toISOString().split("T")[0],
    completed: false,
    createdAt: Date.now() - 10800000
  },
  {
    id: "task_4",
    text: "Draft outline for History term paper",
    subject: "History",
    priority: "low",
    dueDate: "",
    completed: false,
    createdAt: Date.now() - 14400000
  }
];

const INITIAL_GOALS = [
  {
    id: "goal_1",
    subject: "Computer Science",
    topic: "Master Dijkstra & BFS Shortest Path",
    minutes: 60,
    completed: true
  },
  {
    id: "goal_2",
    subject: "Mathematics",
    topic: "Taylor Series expansions & practice proofs",
    minutes: 45,
    completed: false
  },
  {
    id: "goal_3",
    subject: "Physics",
    topic: "Harmonic oscillators problem set",
    minutes: 45,
    completed: false
  }
];

const INITIAL_NOTES = [
  {
    id: "note_1",
    title: "Euler's Identity & Complex Numbers",
    body: "e^(i*pi) + 1 = 0 connects the five most fundamental numbers in mathematics (e, i, pi, 1, 0). Remember when evaluating complex roots!",
    color: "purple",
    pinned: true,
    createdAt: Date.now() - 10000000
  },
  {
    id: "note_2",
    title: "Exam Week Schedule & Deadlines",
    body: "• CS midterm: Thursday 10:00 AM\n• Math problem set submission: Friday midnight\n• Physics quiz: Monday 2:00 PM\nTake regular 5m breaks!",
    color: "blue",
    pinned: true,
    createdAt: Date.now() - 20000000
  },
  {
    id: "note_3",
    title: "Git Helpful Commands Cheatsheet",
    body: "git stash push -m 'wip'\ngit branch -a\ngit reset --soft HEAD~1\ngit checkout -b feature/name",
    color: "emerald",
    pinned: false,
    createdAt: Date.now() - 30000000
  }
];

const MOTIVATIONAL_QUOTES = [
  "Small daily efforts lead to monumental lifetime achievements.",
  "Deep focus is a superpower. Silence distractions and thrive.",
  "Don't practice until you get it right; practice until you can't get it wrong.",
  "Action cures anxiety. Take the first step on your study goal.",
  "You don't need to be extreme, just consistent."
];

// ===================================================================
// Application State
// ===================================================================
class AppState {
  constructor() {
    this.tasks = this.loadStorage("studenthub_tasks", INITIAL_TASKS);
    this.goals = this.loadStorage("studenthub_goals", INITIAL_GOALS);
    this.notes = this.loadStorage("studenthub_notes", INITIAL_NOTES);
    this.theme = localStorage.getItem("studenthub_theme") || "dark";
    this.soundEnabled = localStorage.getItem("studenthub_sound") !== "false";
    this.pomoSessionsCompleted = parseInt(localStorage.getItem("studenthub_pomo_count") || "3", 10);
    this.taskFilter = "all";
    this.taskSearch = "";
    this.notesSearch = "";
  }

  loadStorage(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.warn(`Error reading ${key} from localStorage, using fallback:`, e);
      return fallback;
    }
  }

  save(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error(`Error saving ${key} to localStorage:`, e);
    }
  }

  saveTasks() { this.save("studenthub_tasks", this.tasks); }
  saveGoals() { this.save("studenthub_goals", this.goals); }
  saveNotes() { this.save("studenthub_notes", this.notes); }
  savePomoCount() { localStorage.setItem("studenthub_pomo_count", this.pomoSessionsCompleted.toString()); }
  saveTheme() { localStorage.setItem("studenthub_theme", this.theme); }
  saveSound() { localStorage.setItem("studenthub_sound", this.soundEnabled.toString()); }

  resetToDefaults() {
    this.tasks = JSON.parse(JSON.stringify(INITIAL_TASKS));
    this.goals = JSON.parse(JSON.stringify(INITIAL_GOALS));
    this.notes = JSON.parse(JSON.stringify(INITIAL_NOTES));
    this.pomoSessionsCompleted = 3;
    this.saveTasks();
    this.saveGoals();
    this.saveNotes();
    this.savePomoCount();
  }
}

const state = new AppState();

// ===================================================================
// Audio Synthesizer (Web Audio API - 100% Offline & Reliable)
// ===================================================================
class AudioHelper {
  constructor() {
    this.audioCtx = null;
    this.ambientNoiseNode = null;
    this.isAmbientPlaying = false;
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  // Play a pleasant double chime when timer completes
  playChime() {
    if (!state.soundEnabled) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      
      // Note 1: High crisp bell (523.25 Hz - C5)
      this.createBellTone(523.25, now, 0.45);
      // Note 2: Harmonious bell (659.25 Hz - E5)
      this.createBellTone(659.25, now + 0.15, 0.55);
      // Note 3: Resolving bell (783.99 Hz - G5)
      this.createBellTone(783.99, now + 0.3, 0.7);
    } catch (e) {
      console.warn("Audio chime error:", e);
    }
  }

  createBellTone(freq, startTime, duration) {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // White noise generator for focus ambient sound
  toggleAmbientWhiteNoise() {
    this.initContext();
    if (!this.audioCtx) return false;

    if (this.isAmbientPlaying) {
      if (this.ambientNoiseNode) {
        this.ambientNoiseNode.stop();
        this.ambientNoiseNode.disconnect();
        this.ambientNoiseNode = null;
      }
      this.isAmbientPlaying = false;
      return false;
    } else {
      const bufferSize = 2 * this.audioCtx.sampleRate;
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Generate soft pink/brown-ish noise
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.96 * b1 + white * 0.11;
        b2 = 0.86 * b2 + white * 0.25;
        output[i] = (b0 + b1 + b2) * 0.08;
      }

      const whiteNoise = this.audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Lowpass filter to make it relaxing rain/ocean like
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(700, this.audioCtx.currentTime);

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      whiteNoise.start(0);
      this.ambientNoiseNode = whiteNoise;
      this.isAmbientPlaying = true;
      return true;
    }
  }
}

const audio = new AudioHelper();

// ===================================================================
// Toast Notification System
// ===================================================================
function showToast(message, type = "info", iconClass = "fa-circle-info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${iconClass}"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "toastFadeOut 0.3s forwards";
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3200);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ===================================================================
// Clock, Date & Dynamic Greeting
// ===================================================================
function initClockAndGreeting() {
  const clockEl = document.getElementById("clockTime");
  const datePillEl = document.getElementById("currentDatePill");
  const greetingTitleEl = document.getElementById("greetingTitle");
  const dailyQuoteEl = document.getElementById("dailyQuote");

  function update() {
    const now = new Date();
    
    // Live clock format: 08:45:12 PM
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    // Formatted date: "Sunday, Oct 11, 2026"
    if (datePillEl) {
      const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
      datePillEl.textContent = `📅 ${now.toLocaleDateString(undefined, options)}`;
    }

    // Time-based dynamic greeting
    if (greetingTitleEl) {
      const hour = now.getHours();
      let greeting = "Good Evening";
      let icon = "🌙";

      if (hour >= 5 && hour < 12) {
        greeting = "Good Morning";
        icon = "☀️";
      } else if (hour >= 12 && hour < 17) {
        greeting = "Good Afternoon";
        icon = "🌤️";
      }

      greetingTitleEl.innerHTML = `${greeting}, <span class="gradient-text" id="studentNameDisplay">Scholar</span>! ${icon}`;
    }
  }

  // Quote rotation
  if (dailyQuoteEl) {
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    dailyQuoteEl.textContent = randomQuote;
  }

  update();
  setInterval(update, 1000);
}

// ===================================================================
// Theme Toggle & Mode Switching
// ===================================================================
function initTheme() {
  const root = document.documentElement;
  const themeBtn = document.getElementById("themeToggleBtn");

  // Apply initial theme
  root.setAttribute("data-theme", state.theme);

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const currentTheme = root.getAttribute("data-theme") || "dark";
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", newTheme);
      state.theme = newTheme;
      state.saveTheme();
      showToast(`Switched to ${newTheme} mode`, "info", newTheme === "dark" ? "fa-moon" : "fa-sun");
    });
  }
}

// ===================================================================
// Dashboard Metrics Calculation & Update
// ===================================================================
function updateDashboardMetrics() {
  // 1. Task Metrics
  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter(t => t.completed).length;
  const taskPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const statTasksCount = document.getElementById("statTasksCount");
  const statTasksBadge = document.getElementById("statTasksBadge");
  const statTasksProgress = document.getElementById("statTasksProgress");

  if (statTasksCount) statTasksCount.textContent = `${completedTasks}/${totalTasks}`;
  if (statTasksBadge) statTasksBadge.textContent = `${taskPercent}%`;
  if (statTasksProgress) statTasksProgress.style.width = `${taskPercent}%`;

  // 2. Study Goals Metrics
  const totalGoals = state.goals.length;
  const completedGoals = state.goals.filter(g => g.completed).length;
  const goalPercent = totalGoals === 0 ? 0 : Math.round((completedGoals / totalGoals) * 100);

  const totalMinutes = state.goals.reduce((acc, g) => acc + (Number(g.minutes) || 0), 0);
  const doneMinutes = state.goals.filter(g => g.completed).reduce((acc, g) => acc + (Number(g.minutes) || 0), 0);

  const statPlannerCount = document.getElementById("statPlannerCount");
  const statPlannerBadge = document.getElementById("statPlannerBadge");
  const statPlannerProgress = document.getElementById("statPlannerProgress");

  if (statPlannerCount) statPlannerCount.textContent = `${completedGoals}/${totalGoals}`;
  if (statPlannerBadge) statPlannerBadge.textContent = `${goalPercent}%`;
  if (statPlannerProgress) statPlannerProgress.style.width = `${goalPercent}%`;

  const totalStudyTimeDisplay = document.getElementById("totalStudyTimeDisplay");
  const plannerPercentText = document.getElementById("plannerPercentText");
  const plannerMainProgress = document.getElementById("plannerMainProgress");

  if (totalStudyTimeDisplay) totalStudyTimeDisplay.textContent = `${doneMinutes} / ${totalMinutes} mins done`;
  if (plannerPercentText) plannerPercentText.textContent = `${goalPercent}%`;
  if (plannerMainProgress) plannerMainProgress.style.width = `${goalPercent}%`;

  // 3. Pomodoro Metrics
  const statPomoCount = document.getElementById("statPomoCount");
  const statPomoTime = document.getElementById("statPomoTime");
  const pomoCompletedSessionCount = document.getElementById("pomoCompletedSessionCount");

  if (statPomoCount) statPomoCount.textContent = state.pomoSessionsCompleted.toString();
  if (statPomoTime) statPomoTime.textContent = `${state.pomoSessionsCompleted * 25}m focus`;
  if (pomoCompletedSessionCount) pomoCompletedSessionCount.textContent = state.pomoSessionsCompleted.toString();

  // Update Pomodoro dot indicators (up to 4 in current cycle)
  const dotsInCycle = (state.pomoSessionsCompleted % 4) || (state.pomoSessionsCompleted > 0 ? 4 : 0);
  for (let i = 1; i <= 4; i++) {
    const dot = document.getElementById(`pomoDot${i}`);
    if (dot) {
      if (i <= dotsInCycle) dot.classList.add("filled");
      else dot.classList.remove("filled");
    }
  }

  // 4. Notes Metrics
  const statNotesCount = document.getElementById("statNotesCount");
  const statNotesPinned = document.getElementById("statNotesPinned");
  const pinnedCount = state.notes.filter(n => n.pinned).length;

  if (statNotesCount) statNotesCount.textContent = state.notes.length.toString();
  if (statNotesPinned) statNotesPinned.textContent = `${pinnedCount} pinned`;
}

// ===================================================================
// 1. SMART TO-DO LIST MODULE
// ===================================================================
function initTodoList() {
  const taskListEl = document.getElementById("taskList");
  const emptyStateEl = document.getElementById("taskEmptyState");
  const addTaskForm = document.getElementById("addTaskForm");
  const taskTextInput = document.getElementById("taskTextInput");
  const taskSubjectSelect = document.getElementById("taskSubjectSelect");
  const taskPrioritySelect = document.getElementById("taskPrioritySelect");
  const taskDueDateInput = document.getElementById("taskDueDateInput");
  const clearCompletedBtn = document.getElementById("clearCompletedTasksBtn");
  const searchInput = document.getElementById("taskSearchInput");

  const filterAllBtn = document.getElementById("filterAllBtn");
  const filterActiveBtn = document.getElementById("filterActiveBtn");
  const filterCompletedBtn = document.getElementById("filterCompletedBtn");

  const countAll = document.getElementById("countAllTasks");
  const countActive = document.getElementById("countActiveTasks");
  const countCompleted = document.getElementById("countCompletedTasks");

  // Render tasks
  function render() {
    const query = state.taskSearch.toLowerCase().trim();

    let filtered = state.tasks.filter(task => {
      // Filter by active/completed
      if (state.taskFilter === "active" && task.completed) return false;
      if (state.taskFilter === "completed" && !task.completed) return false;

      // Filter by search query
      if (query) {
        const matchesText = task.text.toLowerCase().includes(query);
        const matchesSubject = task.subject && task.subject.toLowerCase().includes(query);
        return matchesText || matchesSubject;
      }
      return true;
    });

    // Update filter counts
    if (countAll) countAll.textContent = state.tasks.length;
    if (countActive) countActive.textContent = state.tasks.filter(t => !t.completed).length;
    if (countCompleted) countCompleted.textContent = state.tasks.filter(t => t.completed).length;

    taskListEl.innerHTML = "";

    if (filtered.length === 0) {
      emptyStateEl.classList.remove("hidden");
    } else {
      emptyStateEl.classList.add("hidden");

      filtered.forEach(task => {
        const li = document.createElement("li");
        li.className = `task-item ${task.completed ? "completed" : ""}`;
        li.dataset.id = task.id;

        // Due date badge formatted
        let dueDateBadge = "";
        if (task.dueDate) {
          const due = new Date(task.dueDate);
          const isToday = new Date().toDateString() === due.toDateString();
          const isPast = due < new Date().setHours(0, 0, 0, 0);
          dueDateBadge = `
            <span class="badge badge-date ${isPast && !task.completed ? 'badge-high' : ''}">
              <i class="fa-regular fa-calendar"></i> ${isToday ? "Today" : task.dueDate}
            </span>
          `;
        }

        li.innerHTML = `
          <div class="task-left">
            <label class="custom-checkbox" aria-label="Mark task as complete">
              <input type="checkbox" class="task-check" ${task.completed ? "checked" : ""}>
              <span class="checkmark"></span>
            </label>
            <div class="task-details">
              <span class="task-text">${escapeHtml(task.text)}</span>
              <div class="task-tags">
                <span class="badge badge-${task.priority || 'medium'}">${task.priority || 'medium'}</span>
                <span class="badge badge-subject"><i class="fa-solid fa-tag"></i> ${escapeHtml(task.subject || 'General')}</span>
                ${dueDateBadge}
              </div>
            </div>
          </div>
          <div class="task-actions">
            <button class="btn-icon-danger delete-task-btn" title="Delete task" aria-label="Delete task">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        `;

        taskListEl.appendChild(li);
      });
    }

    updateDashboardMetrics();
  }

  // Event: Add Task
  if (addTaskForm) {
    addTaskForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = taskTextInput.value.trim();
      if (!text) {
        showToast("Please enter a task description", "warning", "fa-triangle-exclamation");
        taskTextInput.focus();
        return;
      }

      const newTask = {
        id: "task_" + Date.now(),
        text: text,
        subject: taskSubjectSelect.value || "General",
        priority: taskPrioritySelect.value || "medium",
        dueDate: taskDueDateInput.value || "",
        completed: false,
        createdAt: Date.now()
      };

      state.tasks.unshift(newTask);
      state.saveTasks();

      taskTextInput.value = "";
      taskDueDateInput.value = "";
      render();
      showToast("Task added successfully! 🎯", "success", "fa-circle-check");
    });
  }

  // Event: Check / Delete delegation
  taskListEl.addEventListener("click", (e) => {
    const taskItem = e.target.closest(".task-item");
    if (!taskItem) return;
    const taskId = taskItem.dataset.id;
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Checkbox clicked
    if (e.target.closest(".task-check")) {
      task.completed = !task.completed;
      state.saveTasks();
      render();
      if (task.completed) {
        showToast("Task marked as completed! 🌟", "success", "fa-check");
      }
      return;
    }

    // Delete button clicked
    if (e.target.closest(".delete-task-btn")) {
      state.tasks = state.tasks.filter(t => t.id !== taskId);
      state.saveTasks();
      render();
      showToast("Task removed", "info", "fa-trash-can");
      return;
    }
  });

  // Event: Clear completed tasks
  if (clearCompletedBtn) {
    clearCompletedBtn.addEventListener("click", () => {
      const initialCount = state.tasks.length;
      state.tasks = state.tasks.filter(t => !t.completed);
      const removedCount = initialCount - state.tasks.length;

      if (removedCount > 0) {
        state.saveTasks();
        render();
        showToast(`Cleared ${removedCount} completed task(s)`, "info", "fa-trash-can");
      } else {
        showToast("No completed tasks to clear", "warning", "fa-info");
      }
    });
  }

  // Filter Buttons
  const filterBtns = [filterAllBtn, filterActiveBtn, filterCompletedBtn];
  filterBtns.forEach(btn => {
    if (!btn) return;
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.taskFilter = btn.dataset.filter;
      render();
    });
  });

  // Search Input
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.taskSearch = e.target.value;
      render();
    });
  }

  render();
}

// ===================================================================
// 2. DAILY STUDY PLANNER MODULE
// ===================================================================
function initStudyPlanner() {
  const goalsListEl = document.getElementById("goalsList");
  const emptyStateEl = document.getElementById("goalsEmptyState");
  const addGoalForm = document.getElementById("addGoalForm");
  const subjectInput = document.getElementById("goalSubjectInput");
  const topicInput = document.getElementById("goalTopicInput");
  const minutesInput = document.getElementById("goalMinutesInput");

  function render() {
    goalsListEl.innerHTML = "";

    if (state.goals.length === 0) {
      emptyStateEl.classList.remove("hidden");
    } else {
      emptyStateEl.classList.add("hidden");

      state.goals.forEach(goal => {
        const li = document.createElement("li");
        li.className = `goal-item ${goal.completed ? "completed" : ""}`;
        li.dataset.id = goal.id;

        li.innerHTML = `
          <div class="goal-left">
            <label class="custom-checkbox" aria-label="Mark goal as complete">
              <input type="checkbox" class="goal-check" ${goal.completed ? "checked" : ""}>
              <span class="checkmark"></span>
            </label>
            <div class="goal-info">
              <span class="goal-subject-tag"><i class="fa-solid fa-graduation-cap"></i> ${escapeHtml(goal.subject)}</span>
              <div class="goal-topic">${escapeHtml(goal.topic)}</div>
            </div>
          </div>
          <div class="goal-meta">
            <span class="goal-time-pill"><i class="fa-regular fa-clock"></i> ${goal.minutes}m</span>
            <button class="btn-icon-danger delete-goal-btn" title="Delete study goal" aria-label="Delete study goal">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        `;

        goalsListEl.appendChild(li);
      });
    }

    updateDashboardMetrics();
  }

  // Event: Add Study Goal
  if (addGoalForm) {
    addGoalForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const subject = subjectInput.value.trim();
      const topic = topicInput.value.trim();
      const minutes = parseInt(minutesInput.value, 10) || 30;

      if (!subject || !topic) {
        showToast("Please fill in both subject and topic", "warning", "fa-triangle-exclamation");
        return;
      }

      const newGoal = {
        id: "goal_" + Date.now(),
        subject,
        topic,
        minutes,
        completed: false
      };

      state.goals.push(newGoal);
      state.saveGoals();

      subjectInput.value = "";
      topicInput.value = "";
      minutesInput.value = "45";
      render();
      showToast("Study goal scheduled! 🚀", "success", "fa-bullseye");
    });
  }

  // Event: Check / Delete Goal delegation
  goalsListEl.addEventListener("click", (e) => {
    const goalItem = e.target.closest(".goal-item");
    if (!goalItem) return;
    const goalId = goalItem.dataset.id;
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;

    // Checkbox clicked
    if (e.target.closest(".goal-check")) {
      goal.completed = !goal.completed;
      state.saveGoals();
      render();
      if (goal.completed) {
        showToast(`Goal completed: +${goal.minutes} mins of deep study logged! 🎉`, "success", "fa-trophy");
      }
      return;
    }

    // Delete clicked
    if (e.target.closest(".delete-goal-btn")) {
      state.goals = state.goals.filter(g => g.id !== goalId);
      state.saveGoals();
      render();
      showToast("Study goal removed", "info", "fa-trash-can");
      return;
    }
  });

  render();
}

// ===================================================================
// 3. POMODORO FOCUS TIMER MODULE
// ===================================================================
function initPomodoroTimer() {
  const timeDisplay = document.getElementById("timerTimeDisplay");
  const statusDisplay = document.getElementById("timerCurrentStatus");
  const subtitleDisplay = document.getElementById("timerSubtitle");
  const progressRing = document.getElementById("timerProgressRing");
  const startPauseBtn = document.getElementById("timerStartPauseBtn");
  const playIcon = document.getElementById("timerPlayIcon");
  const playText = document.getElementById("timerPlayText");
  const resetBtn = document.getElementById("timerResetBtn");
  const skipBtn = document.getElementById("timerSkipBtn");
  const soundToggleBtn = document.getElementById("soundToggleBtn");
  const soundIcon = document.getElementById("soundIcon");
  const ambientNoiseBtn = document.getElementById("ambientWhiteNoiseBtn");
  const quickStartBtn = document.getElementById("quickStartTimerBtn");

  const modeWorkBtn = document.getElementById("modeWorkBtn");
  const modeShortBreakBtn = document.getElementById("modeShortBreakBtn");
  const modeLongBreakBtn = document.getElementById("modeLongBreakBtn");

  const MODE_TIMES = {
    work: 25 * 60,       // 25 minutes
    shortBreak: 5 * 60,  // 5 minutes
    longBreak: 15 * 60   // 15 minutes
  };

  const CIRCUMFERENCE = 2 * Math.PI * 110; // r = 110 in SVG => ~691.15
  if (progressRing) {
    progressRing.style.strokeDasharray = CIRCUMFERENCE;
    progressRing.style.strokeDashoffset = 0;
  }

  let currentMode = "work";
  let totalTime = MODE_TIMES.work;
  let timeLeft = totalTime;
  let timerInterval = null;
  let isRunning = false;

  function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    if (timeDisplay) timeDisplay.textContent = formatted;

    // Update document title for background tracking
    document.title = isRunning ? `(${formatted}) StudentHub` : `StudentHub - Student Productivity Dashboard`;

    // Radial ring animation
    if (progressRing) {
      const progressFraction = (totalTime - timeLeft) / totalTime;
      const offset = CIRCUMFERENCE * (1 - progressFraction);
      progressRing.style.strokeDashoffset = offset;
    }
  }

  function setMode(mode) {
    clearInterval(timerInterval);
    isRunning = false;
    currentMode = mode;
    totalTime = MODE_TIMES[mode];
    timeLeft = totalTime;

    // Update buttons
    [modeWorkBtn, modeShortBreakBtn, modeLongBreakBtn].forEach(b => {
      if (b) b.classList.remove("active");
    });

    if (mode === "work" && modeWorkBtn) modeWorkBtn.classList.add("active");
    if (mode === "shortBreak" && modeShortBreakBtn) modeShortBreakBtn.classList.add("active");
    if (mode === "longBreak" && modeLongBreakBtn) modeLongBreakBtn.classList.add("active");

    // Update UI status text
    if (statusDisplay && subtitleDisplay && progressRing) {
      if (mode === "work") {
        statusDisplay.textContent = "Focus Session";
        subtitleDisplay.textContent = "Stay dedicated. No distractions.";
        progressRing.style.stroke = "#8b5cf6";
      } else if (mode === "shortBreak") {
        statusDisplay.textContent = "Short Break";
        subtitleDisplay.textContent = "Rest your eyes, hydrate, and stretch.";
        progressRing.style.stroke = "#10b981";
      } else {
        statusDisplay.textContent = "Long Break";
        subtitleDisplay.textContent = "Recharge your mind with a longer rest.";
        progressRing.style.stroke = "#3b82f6";
      }
    }

    if (playIcon) playIcon.className = "fa-solid fa-play";
    if (playText) playText.textContent = mode === "work" ? "Start Focus" : "Start Break";

    updateDisplay();
  }

  function startTimer() {
    if (isRunning) return;
    isRunning = true;
    if (playIcon) playIcon.className = "fa-solid fa-pause";
    if (playText) playText.textContent = "Pause";

    timerInterval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
      } else {
        onTimerComplete();
      }
    }, 1000);
  }

  function pauseTimer() {
    if (!isRunning) return;
    clearInterval(timerInterval);
    isRunning = false;
    if (playIcon) playIcon.className = "fa-solid fa-play";
    if (playText) playText.textContent = "Resume";
  }

  function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = totalTime;
    if (playIcon) playIcon.className = "fa-solid fa-play";
    if (playText) playText.textContent = currentMode === "work" ? "Start Focus" : "Start Break";
    updateDisplay();
    showToast("Timer reset", "info", "fa-rotate-right");
  }

  function onTimerComplete() {
    clearInterval(timerInterval);
    isRunning = false;
    audio.playChime();

    if (currentMode === "work") {
      state.pomoSessionsCompleted++;
      state.savePomoCount();
      updateDashboardMetrics();
      showToast("🎉 Pomodoro session finished! Take a well-deserved break.", "success", "fa-bell");
      setMode("shortBreak");
    } else {
      showToast("🔔 Break time is up! Ready to dive back in?", "info", "fa-brain");
      setMode("work");
    }
  }

  // Event Listeners
  if (startPauseBtn) {
    startPauseBtn.addEventListener("click", () => {
      audio.initContext();
      if (isRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
    });
  }

  if (resetBtn) resetBtn.addEventListener("click", resetTimer);

  if (skipBtn) {
    skipBtn.addEventListener("click", () => {
      if (currentMode === "work") {
        setMode("shortBreak");
        showToast("Skipped to Short Break", "info", "fa-forward-step");
      } else {
        setMode("work");
        showToast("Skipped to Focus Session", "info", "fa-forward-step");
      }
    });
  }

  if (modeWorkBtn) modeWorkBtn.addEventListener("click", () => setMode("work"));
  if (modeShortBreakBtn) modeShortBreakBtn.addEventListener("click", () => setMode("shortBreak"));
  if (modeLongBreakBtn) modeLongBreakBtn.addEventListener("click", () => setMode("longBreak"));

  // Quick start from banner
  if (quickStartBtn) {
    quickStartBtn.addEventListener("click", () => {
      const pomodoroSection = document.getElementById("pomodoro-section");
      if (pomodoroSection) pomodoroSection.scrollIntoView({ behavior: "smooth" });
      setMode("work");
      startTimer();
    });
  }

  // Sound toggle
  function updateSoundIcon() {
    if (soundIcon) {
      soundIcon.className = state.soundEnabled ? "fa-solid fa-volume-high" : "fa-solid fa-volume-xmark";
    }
  }

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener("click", () => {
      state.soundEnabled = !state.soundEnabled;
      state.saveSound();
      updateSoundIcon();
      if (state.soundEnabled) {
        audio.playChime();
        showToast("Audio chime enabled", "info", "fa-volume-high");
      } else {
        showToast("Audio muted", "info", "fa-volume-xmark");
      }
    });
    updateSoundIcon();
  }

  // Ambient white noise toggle
  if (ambientNoiseBtn) {
    ambientNoiseBtn.addEventListener("click", () => {
      const isPlaying = audio.toggleAmbientWhiteNoise();
      if (isPlaying) {
        ambientNoiseBtn.classList.add("active");
        showToast("Ambient focus sound active 🌊", "info", "fa-water");
      } else {
        ambientNoiseBtn.classList.remove("active");
        showToast("Ambient sound stopped", "info", "fa-pause");
      }
    });
  }

  // Keyboard shortcut: Spacebar to start/pause timer if not typing
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
      if (isRunning) pauseTimer();
      else startTimer();
    }
  });

  setMode("work");
}

// ===================================================================
// 4. QUICK NOTES BOARD MODULE
// ===================================================================
function initNotesBoard() {
  const notesGridEl = document.getElementById("notesGrid");
  const emptyStateEl = document.getElementById("notesEmptyState");
  const toggleFormBtn = document.getElementById("toggleNoteFormBtn");
  const newNoteCard = document.getElementById("newNoteCard");
  const createNoteForm = document.getElementById("createNoteForm");
  const noteTitleInput = document.getElementById("noteTitleInput");
  const noteBodyInput = document.getElementById("noteBodyInput");
  const cancelNoteBtn = document.getElementById("cancelNoteBtn");
  const colorPickerEl = document.getElementById("noteColorPicker");
  const searchInput = document.getElementById("notesSearchInput");

  let selectedColor = "purple";

  // Color picker pills
  if (colorPickerEl) {
    colorPickerEl.addEventListener("click", (e) => {
      const pill = e.target.closest(".color-pill");
      if (!pill) return;
      colorPickerEl.querySelectorAll(".color-pill").forEach(p => p.classList.remove("selected"));
      pill.classList.add("selected");
      selectedColor = pill.dataset.color || "purple";
    });
  }

  // Toggle Form Visibility
  function setFormVisible(visible) {
    if (!newNoteCard) return;
    if (visible) {
      newNoteCard.classList.add("visible");
      noteTitleInput.focus();
    } else {
      newNoteCard.classList.remove("visible");
      noteTitleInput.value = "";
      noteBodyInput.value = "";
    }
  }

  if (toggleFormBtn) {
    toggleFormBtn.addEventListener("click", () => {
      const isVisible = newNoteCard.classList.contains("visible");
      setFormVisible(!isVisible);
    });
  }

  if (cancelNoteBtn) {
    cancelNoteBtn.addEventListener("click", () => setFormVisible(false));
  }

  // Render notes
  function render() {
    const query = state.notesSearch.toLowerCase().trim();

    let filtered = state.notes.filter(note => {
      if (!query) return true;
      return (
        note.title.toLowerCase().includes(query) ||
        note.body.toLowerCase().includes(query)
      );
    });

    // Pinned notes appear at top
    filtered.sort((a, b) => {
      if (a.pinned === b.pinned) return (b.createdAt || 0) - (a.createdAt || 0);
      return a.pinned ? -1 : 1;
    });

    notesGridEl.innerHTML = "";

    if (filtered.length === 0) {
      emptyStateEl.classList.remove("hidden");
    } else {
      emptyStateEl.classList.add("hidden");

      filtered.forEach(note => {
        const card = document.createElement("div");
        card.className = `note-card note-${note.color || 'purple'} ${note.pinned ? 'pinned' : ''}`;
        card.dataset.id = note.id;

        const dateStr = note.createdAt 
          ? new Date(note.createdAt).toLocaleDateString([], { month: "short", day: "numeric" }) 
          : "Saved";

        card.innerHTML = `
          <div class="note-header">
            <h4 class="note-title">${escapeHtml(note.title)}</h4>
            <button class="note-pin-btn ${note.pinned ? 'active' : ''}" title="${note.pinned ? 'Unpin note' : 'Pin note to top'}" aria-label="Pin note">
              <i class="fa-${note.pinned ? 'solid' : 'regular'} fa-thumbtack"></i>
            </button>
          </div>
          <p class="note-body">${escapeHtml(note.body)}</p>
          <div class="note-footer">
            <span class="note-date">${dateStr}</span>
            <div class="note-actions">
              <button class="note-action-btn copy-note-btn" title="Copy note text" aria-label="Copy note">
                <i class="fa-regular fa-copy"></i>
              </button>
              <button class="note-action-btn delete delete-note-btn" title="Delete note" aria-label="Delete note">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        `;

        notesGridEl.appendChild(card);
      });
    }

    updateDashboardMetrics();
  }

  // Event: Create Note
  if (createNoteForm) {
    createNoteForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = noteTitleInput.value.trim();
      const body = noteBodyInput.value.trim();

      if (!title || !body) {
        showToast("Please provide both title and content", "warning", "fa-triangle-exclamation");
        return;
      }

      const newNote = {
        id: "note_" + Date.now(),
        title,
        body,
        color: selectedColor,
        pinned: false,
        createdAt: Date.now()
      };

      state.notes.unshift(newNote);
      state.saveNotes();

      setFormVisible(false);
      render();
      showToast("Note saved to dashboard! 📝", "success", "fa-check");
    });
  }

  // Event: Notes Card Actions (Pin, Copy, Delete)
  notesGridEl.addEventListener("click", (e) => {
    const card = e.target.closest(".note-card");
    if (!card) return;
    const noteId = card.dataset.id;
    const note = state.notes.find(n => n.id === noteId);
    if (!note) return;

    // Pin Toggle
    if (e.target.closest(".note-pin-btn")) {
      note.pinned = !note.pinned;
      state.saveNotes();
      render();
      showToast(note.pinned ? "Note pinned to top 📌" : "Note unpinned", "info", "fa-thumbtack");
      return;
    }

    // Copy Content
    if (e.target.closest(".copy-note-btn")) {
      navigator.clipboard.writeText(`${note.title}\n\n${note.body}`)
        .then(() => showToast("Note copied to clipboard! 📋", "success", "fa-clipboard-check"))
        .catch(() => showToast("Could not copy note", "warning", "fa-triangle-exclamation"));
      return;
    }

    // Delete
    if (e.target.closest(".delete-note-btn")) {
      state.notes = state.notes.filter(n => n.id !== noteId);
      state.saveNotes();
      render();
      showToast("Note deleted", "info", "fa-trash-can");
      return;
    }
  });

  // Search Notes
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.notesSearch = e.target.value;
      render();
    });
  }

  render();
}

// ===================================================================
// Navigation, Jump Buttons & Mobile Menu
// ===================================================================
function initNavigation() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const navLinks = document.getElementById("navLinks");
  const jumpToTodoBtn = document.getElementById("jumpToTodoBtn");
  const resetSampleDataBtn = document.getElementById("resetSampleDataBtn");

  // Mobile menu toggle
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("mobile-open");
    });

    // Close menu when clicking link on mobile
    navLinks.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("mobile-open");
      });
    });
  }

  // Jump to Todo button
  if (jumpToTodoBtn) {
    jumpToTodoBtn.addEventListener("click", () => {
      const todoSection = document.getElementById("todo-section");
      if (todoSection) {
        todoSection.scrollIntoView({ behavior: "smooth" });
        const input = document.getElementById("taskTextInput");
        if (input) setTimeout(() => input.focus(), 400);
      }
    });
  }

  // Active link scroll highlight
  const sections = document.querySelectorAll("section[id]");
  window.addEventListener("scroll", () => {
    let current = "";
    const scrollY = window.pageYOffset;

    sections.forEach(sec => {
      const sectionHeight = sec.offsetHeight;
      const sectionTop = sec.offsetTop - 120;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = sec.getAttribute("id");
      }
    });

    if (navLinks) {
      navLinks.querySelectorAll(".nav-link").forEach(a => {
        a.classList.remove("active");
        if (a.getAttribute("href") === `#${current}`) {
          a.classList.add("active");
        }
      });
    }
  });

  // Reset Demo Data
  if (resetSampleDataBtn) {
    resetSampleDataBtn.addEventListener("click", () => {
      if (confirm("Restore original demo tasks, study planner, and sample notes?")) {
        state.resetToDefaults();
        // Re-initialize modules
        initTodoList();
        initStudyPlanner();
        initNotesBoard();
        showToast("Demo data successfully restored!", "success", "fa-arrows-rotate");
      }
    });
  }
}

// ===================================================================
// Bootstrap App on DOMContentLoaded
// ===================================================================
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initClockAndGreeting();
  initTodoList();
  initStudyPlanner();
  initPomodoroTimer();
  initNotesBoard();
  initNavigation();
  updateDashboardMetrics();
});
