# 🥋 Taekwondo High: Belt of Fury

An action roguelike martial arts beat 'em up web game in dynamic 2.5D. Start as a novice white belt in high school, execute authentic 3D-kinematic Taekwondo kicks, ascend 10 challenging floors, defeat formidable club bosses, and claim the mantle of Supreme Grandmaster under the morning sunrise!

---

## 🕹️ Controls

| Action | Primary Key | Secondary Key / Touch |
|---|---|---|
| **Move Left / Right** | `A` / `D` | `←` / `→` / Virtual D-pad |
| **🦘 High Mobility Jump** | **`SPACE` / `TAB`** | Touch `🦘` Button |
| **Front Snap Kick / Kick Heavy Desk** | `J` | Left Click |
| **Back Heel Thrust Kick (Dwi Chuk Chagi)** | `K` | Right Click |
| **🎯 Throw Ammo (Apples, Cacti, Books, Ninja Stars)** | **`G` / `T`** | Touch `🎯` Button |
| **Special 1 (Roundhouse / Side / Axe Kick / 540° Tornado)** | `L` | `E` / `C` |
| **Special 2 (Flying Thrust / Hook / Shockwave)** | `U` | `R` / `V` |
| **💥 Hadouken Surge (Pa-dong Gwon: Sapphire & Coral Energy Blast)** | **`H`** | **`Y`** / Touch `🌊` *(Red Belt & Black Belt)* |
| **🐉 Dragon Ultimate Overdrive (Golden Dragon Spirit + Wind & Leaves VFX)** | **`I`** | **`F`** / Touch `🐉` *(Black Belt)* |
| **Slide Step Dash (iFrames)** | `Shift` | Dash Button |
| **Grommet Parry Counter** | `Q` | Guard Button |
| **Pause Game** | `Escape` / `P` | - |

---

## ✨ Features & Mechanics

- **📏 Distinct Anatomical Hierarchy & Scale**:
  - **Supreme Final Boss (Lord Shin)**: Imposing **1.5× scale** (66px $\times$ 120px) towering over the arena.
  - **Elites & Bodyguards (Karate Captain, Kendo Master, Viper Baek, Iron Golem)**: Muscular **1.2× scale** (53px $\times$ 96px).
  - **Delinquents & Basic Students**: Standard **1.0× scale** (44px $\times$ 80px).
- **💥 Hadouken Surge (Pa-dong Gwon - Second Strongest Technique)**:
  - Unlocked at **Red Belt** prior to Dragon Finisher.
  - Channels 245 raw damage in an aerodynamic projectile composed of a blazing white core, radiant sapphire blue plasma rings, and vibrant coral-pinkish aura trails that pierce through enemy ranks!
- **🐉 Enhanced Dragon Overdrive with Wind & Emerald Leaf Vortex**:
  - The Black Belt ultimate summons the Majestic Eastern Golden Dragon alongside swirling high-velocity wind arcs and fluttering emerald and golden maple leaves across its path.
- **⚡ Seismic Toss Cataclysmic Tremor**:
  - Floor 10 Boss Lord Shin's grab-and-slam triggers violent screen shakes, slow-motion impact frames, and radial crater shockwaves.
- **🧱 Bricky Lego Physics Defeat Effect**:
  - When enemies and bosses are defeated, they instantly break apart and collapse into individual Lego-style toy bricks (head, torso blocks, limbs, hands, shoe pieces, and 1x1 studs).
  - Each plastic brick is simulated with realistic bouncing physics, elastic floor collisions, gravity, rotational spin, and contact drop shadows before settling!
- **🪑 Dynamic Interactive School Grounds**:
  - **Kickable Reading Desks**: Front snap kick heavy wooden study desks to launch them across the room, crushing rows of oncoming bullies and delinquents.
  - **Haphazard Throwable Ammo**: Pick up fresh red apples 🍎, prickly cactus pots 🌵, steel rulers 📏, sharpened pencils ✏️, heavy textbooks 📖, and rare lethal shurikens / ninja stars ⭐ to throw across the arena!
- **🦘 High Mobility Jump (Space & Tab)**: Leap over incoming attacks, execute airborne kicks (*Flying Side Kick, Axe Hammer, 540° Tornado*) in mid-air.
- **🥋 3D-Kinematic Motion Modeling**: Realistic procedural skeletal angles with depth foreshortening, hip rotations, and authentic Taekwondo chambering.
- **💖 Vitality Blessing**: Player passively regenerates **+20% Max HP every 3 seconds** to endure intense boss battles.
- **🏯 10-Floor Realistic School Environments & Boss Milestones**:
  - **Floor 1**: *Vandalized Entrance Lockers & Scattered Garbage*
  - **Floor 2**: *Cafeteria Clash (Lunch trays, apples & cactus pots)*
  - **Floor 3 [ELITE BOSS]**: *Bae Min-Jun (Karate Club Captain - 1.2× Scale)*
  - **Floor 4**: *Student Council Office (Executive Desks & Documents)*
  - **Floor 5**: *Library Sanctuary (Kickable Study Desks, Books, Pencils & rare Ninja Stars)*
  - **Floor 6 [ELITE BOSS]**: *Kang Tae-Sik (Kendo Sword Master - 1.2× Scale)*
  - **Floor 7**: *Science Laboratory (Lab benches, glassware & chemical puddles)*
  - **Floor 8**: *Dark 4th Floor Corridor & Infirmary (Emergency ward & stretchers)*
  - **Floor 9 [BODYGUARD BOSS]**: *The Rooftop Access Staircase (Viper Baek & Iron Golem - 1.2× Scale)*
  - **Floor 10 [SUPREME ROOFTOP BOSS]**: *Lord Shin (1.5× Scale Final Boss with Seismic Toss)*
- **🎸 Exhilarating Heavy Rock Boss Music & Floor-Distinct BGM**:
  - **Floors 3, 6, 9 & 10 (Boss Floors)**: High-octane heavy metal rock soundtrack featuring double-bass drums, crunchy distorted power-chord rhythm riffs, driving rock ride cymbals, and screaming lead guitar shred solos!
  - **Individual Normal Floors**: Unique procedural synthwave melodies tailored to each floor's atmosphere (Funky Cafeteria bass, Neo-Classical Student Council synth, Ambient Library arpeggios, and Industrial Cyberpunk Science Lab pulses).
- **🌅 Glorious Sunrise Victory Screen**: Defeat the final boss to witness the golden morning sun rise above the city horizon and ascend the throne as the new Supreme Ruler of Taekwondo High.

---

## 📁 Project Structure

```text
taekwondo-high/
├── index.html                  # Entry point HTML game
├── README.md                   # Project documentation & controls
├── AGENTS.md                   # Agent guidelines & architecture rules
├── assets/                     # Static media & assets
│   ├── audio/                  # SFX & Sound effects
│   └── images/                 # Sprites & icons
├── css/                        # Stylesheets
│   └── style.css               # Main game styles, HUD ammo pill & sunrise victory animations
├── js/                         # Game logic & modular engine
│   ├── core/
│   │   ├── game.js             # Game loop, 10-floor wave manager & dual jump controls
│   │   └── audio.js            # Synthesizer audio engine
│   ├── data/
│   │   └── moves.js            # Taekwondo moves, 3D motion kinematics & 10 floor configs
│   ├── entities/
│   │   ├── entities.js         # Player (3D skeletal motion & Tab jump), Mobs, Bosses & Vitality Regen
│   │   └── projectiles.js      # Projectiles, floor pickups & kickable heavy reading desks
│   └── world/
│       └── arena.js            # 2.5D arenas, messy school floors & Rooftop Sunrise View
└── docs/                       # Design notes
    └── GAME_DESIGN.md          # Mechanics, balancing & combat design
```
