# 🥋 Taekwondo High: Project Rules & Agent Instructions

Welcome to the **Taekwondo High: Belt of Fury** repository. This document sets development guidelines, architecture standards, conventions, and agent instructions for working on this 2.5D roguelike beat-'em-up codebase.

---

## 🏛️ Project Architecture & Hierarchy

```text
taekwondo-high/
├── index.html                      # Entry point canvas, HUD overlay & modals
├── README.md                       # Player guide, controls & game features
├── AGENTS.md                       # Developer & AI Agent instructions, rules & architecture
├── assets/                         # Static media resources
│   ├── audio/                      # Sound FX & background audio files
│   └── images/                     # Sprite artwork, UI textures & concept assets
├── css/                            # Styling & design system
│   └── style.css                   # Theme tokens, 2.5D HUD, animations & modals
├── js/                             # Modular JavaScript game engine
│   ├── core/                       # Game core systems & lifecycle
│   │   ├── game.js                 # Engine loop, 10-floor wave manager & input controller
│   │   └── audio.js                # Web Audio API procedural synthesizer
│   ├── data/                       # Configurations & game data
│   │   └── moves.js                # 3D motion kinematics, belts, perks & 10 floor definitions
│   ├── entities/                   # Game actors & visual systems
│   │   └── entities.js             # Player (3D skeletal kinematics), Enemy AI, Bosses & VFX
│   └── world/                      # Environment rendering & levels
│       └── arena.js                # 2.5D multi-plane backdrops, school floors & sunrise end view
└── docs/                           # Game design documents & notes
    └── GAME_DESIGN.md              # Combat mechanics, balancing & moveset design
```

---

## 📐 Core Engineering Standards & Guidelines

### 1. Separation of Concerns (SoC)
- **`js/core/`**: Handles the main game loop, frame timing (`dt`), canvas scaling, keyboard/touch input routing, and game state transitions (`playing`, `paused`, `perk_select`, `math_exam`, `victory`, `game_over`).
- **`js/data/`**: Pure data definitions (`MOVES_DATABASE`, `BELT_RANKS`, `STAGE_FLOORS_CONFIG`, `ROGUELIKE_PERKS`). Keep logic out of this folder.
- **`js/entities/`**: Articulated actors with procedural 3D skeletal rigs, collision hitboxes, state machines (`idle`, `walk`, `jump`, `attack`, `hitstun`, `ko`), and particle physics.
- **`js/world/`**: Procedural 2.5D canvas rendering, dynamic depth planes, floor debris, and atmospheric particle systems.
- **`css/`**: High visual polish, glassmorphism, responsive canvas scaling, and UI micro-animations.

### 2. Combat & Motion Kinematics Principles
- **Jump Mobility**: Jump is bound to `Space` and `Tab`. Jumping must allow full aerial maneuverability and aerial kicks without getting stuck.
- **Taekwondo Authenticity**: Every kick follows real WTF/ITF kinematics (knee chambering $\rightarrow$ hip rotation $\rightarrow$ extension with ball/heel/instep $\rightarrow$ snap recovery).
- **Floor Hierarchy**:
  - Floors 1 to 9 represent realistic, messy school interior rooms (Lockers, Cafeteria, Dojang Gym, Student Council, Library, Kendo Hall, Science Lab, Infirmary, and Rooftop Staircase).
  - **Floor 10 is the ONLY rooftop battle** in the game (Midnight final boss against Lord Shin).
  - Defeating Floor 10 triggers the full-canvas rooftop sunrise sequence.

### 3. Vitality & Player Balancing
- Maintain the passive vitality blessing (+20% Max HP every 3 seconds) unless explicitly adjusted.
- Authentic UTBK Pengetahuan Kuantitatif (PK) promotion trials (1 question scaling by difficulty per belt promotion) occur upon reaching belt XP thresholds.

---

## 🛠️ Developer Checklist Before Submitting Code
- [ ] No hardcoded absolute file paths in HTML/CSS/JS.
- [ ] Maintain responsive canvas scaling (16:9 aspect ratio container).
- [ ] Keep vanilla JavaScript clean, performant, and free from external heavy dependencies.
- [ ] Preserve audio engine procedural synthesizer fallbacks.
