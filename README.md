# StudentHub - Modern Student Productivity Dashboard 🎓⚡

StudentHub is a sleek, responsive, and beginner-friendly productivity website built entirely with **HTML5, CSS3, and Vanilla JavaScript**. It requires zero dependencies, zero build steps, and no backend or paid API keys.

---

## 🌟 Key Features

1. **Dashboard Overview & Dynamic Greeting**:
   - Time-sensitive greeting (Morning / Afternoon / Evening) with live ticking clock and date.
   - Live statistic cards: Tasks completion %, Daily study goal progress %, Pomodoro sessions count, and Saved notes.
2. **Smart To-Do List**:
   - Add tasks with custom Subjects (Computer Science, Math, Physics, etc.), Priority levels (🔥 High, ⚡ Medium, 🌱 Low), and Due Dates.
   - Filter by All, Active, or Completed tasks.
   - Instant search filtering.
   - Quick "Clear Done" action to tidy up completed items.
3. **Daily Study Planner**:
   - Track planned study milestones and estimated study durations.
   - Interactive progress bar calculating percentage of total daily study minutes achieved.
4. **Pomodoro Focus Timer**:
   - Scientific 25-minute study intervals with 5-minute short breaks and 15-minute long breaks.
   - Glowing circular SVG countdown ring with live tab title updates.
   - Synthesized Web Audio API bell chime (100% offline, no external audio files required).
   - Relaxing ambient focus noise toggle.
   - Keyboard shortcut: Press `Spacebar` to start/pause.
5. **Quick Notes Board**:
   - Sticky note cards with custom color themes (Purple, Blue, Emerald, Rose, Amber).
   - Pin important notes to the top.
   - Real-time search filter and one-click copy to clipboard.
6. **Dark & Light Mode Toggle**:
   - Premium dark theme featuring deep violet and cyber-blue gradients.
   - High-contrast crisp light theme.
   - Preference saved automatically.
7. **Complete LocalStorage Persistence**:
   - All tasks, study goals, notes, timer stats, and theme preferences remain saved even when you refresh or close the browser.
   - Pre-populated sample data on first launch with a "Reset Demo Data" option.

---

## 🚀 How to Run the Website Locally

There are two super easy ways to run StudentHub:

### Option 1: Direct File Open (Zero Setup)
Simply navigate to the project folder and double-click `index.html`, or right-click `index.html` and choose **Open with > Chrome / Edge / Firefox**.

### Option 2: Lightweight Local Web Server (Recommended)
You can serve the folder using any standard lightweight local HTTP server:

#### Using Python (built into most systems):
```bash
# In the project directory:
python -m http.server 8000
```
Then open your browser to [http://localhost:8000](http://localhost:8000).

#### Using Node.js (npx):
```bash
npx serve .
```
or
```bash
npx live-server
```

---

## 📂 Project Structure

```
antigarveti/
│
├── index.html       # Clean, semantic HTML5 structure and layout
├── style.css        # Modern CSS with custom properties, glassmorphism, responsive grids
├── app.js           # Vanilla JavaScript logic, Web Audio synthesizer, and LocalStorage state
└── README.md        # Documentation and quick start guide
```

---

## 🎨 Technology Stack
- **HTML5**: Semantic tags, accessibility attributes, and SEO metadata.
- **Vanilla CSS3**: Modern CSS variables, Glassmorphism backdrop-filter, flexbox & CSS grid, micro-animations.
- **Vanilla JavaScript (ES6+)**: Modular state management, Web Audio API chime & pink noise synthesizer, LocalStorage API.
- **Font Awesome 6 & Google Fonts (Outfit & Plus Jakarta Sans)**: High-resolution typography and crisp icons via CDN.
