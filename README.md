# 🧠 AI Avatar Training Simulator

An AI-powered interactive prototype that translates natural language commands into avatar animations within a simulated training environment.

This project demonstrates how users can communicate with a virtual avatar using simple human language, and how that input can be interpreted, mapped, and executed as meaningful actions — forming the foundation for intelligent training systems.

---

## 🌍 Overview

The AI Avatar Training Simulator allows users to type commands such as:

- "Walk to the table"
- "Point at the fire extinguisher"
- "Wave hello to the learner"
- "Show the correct safety posture"

The system interprets these instructions and triggers corresponding avatar actions, while also providing a short explanation of the action being performed.

This simulates how AI-driven avatars can be used in training environments to guide, demonstrate, and interact with learners.

---

## 🎯 Key Features

### 🗣️ Natural Language Interaction
- Accepts human-like commands
- Supports flexible phrasing

### 🤖 AI Command Interpretation
- Extracts intent (action) and target (object or direction)
- Converts input into structured data for processing
- Uses AI API (e.g., Gemini) for robust command understanding
- Smart fallback to a local parser if AI service is unavailable

### 🔄 Command → Behaviour Mapping
- Maps interpreted commands to predefined avatar actions
- Supports single actions and sequential multi-step commands

### 🧍 Avatar Animation Simulation
- Displays a 3D avatar performing actions
- Demonstrates realistic training behaviours

### 💬 Explanation Panel
- Shows numbered step-by-step breakdowns for each command:
  - Animation name
  - Target object
  - Duration
  - Description of the action

### 🎮 Camera & Scene Controls
- Rotate, zoom, and reset the view
- Enhances visibility of avatar actions

---

## ⚙️ How It Works

1. User enters a natural language command.
2. AI interprets the input and extracts the action and target.
3. Command is converted into a structured format.
4. The system maps the command to an animation or sequence.
5. The avatar performs the action.
6. A short explanation is displayed for each step.

---

## 🏗️ System Architecture

```text
User Input (Text Command)
       ↓
AI Interpretation Layer (Extracts action + target)
       ↓
Command Mapping Engine (Generates animation sequence)
       ↓
Animation Controller (Executes animations in order)
       ↓
Avatar & Scene Renderer (Displays avatar)
       ↓
Step-by-Step Explanation Layer (Shows animation name, target, duration, description)
````
⚙️ Setup Instructions
Clone the repository:
git clone https://github.com/Nokulungs/AI-Avatar-Training-Simulator.git
cd AI-Avatar-Training-Simulator
Open the project in a browser or a development environment that supports HTML/JS/3D rendering.
Ensure internet access for AI API calls (Gemini or equivalent).
Open index.html (or main entry file) to start the simulator.
Type commands in the input field and observe the avatar executing them.

##🛠️ APIs & Tools Used
AI Command API: Gemini (for natural language → structured action mapping)
Avatar Animations: Predefined 3D animations for walking, pointing, waving, bowing, and dancing
3D Rendering: Web-based 3D engine (e.g., Babylon.js / Three.js)
Command Fallback: Local keyword parser for offline or unavailable AI service
⚠️ Limitations
Limited command vocabulary; highly ambiguous commands may fail.
Text-only input; voice commands are not supported.
Only single-avatar interactions; no multi-avatar scenarios yet.
Simplified animations; advanced motion blending is not implemented.
AI API availability may affect response speed and reliability.

---

