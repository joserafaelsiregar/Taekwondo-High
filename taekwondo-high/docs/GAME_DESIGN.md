# 🥋 Taekwondo High: Game Design Document (GDD)

## 📌 Overview
- **Genre**: 2.5D Martial Arts Action Roguelike Beat 'em Up
- **Theme**: Korean High School Delinquents vs. Martial Arts Novice to Grandmaster
- **Perspective**: 2.5D Depth Plane with articulated 3D kinematic skeletal kicks

---

## 🥋 Combat System & Controls
- **Movements**:
  - Horizontal movement: `A` / `D` (or Arrow keys)
  - High Mobility Jump: `Space` / `Tab` (Air kicks supported)
  - Evasive Dash: `Shift` (with iFrames)
  - Parry Guard: `Q` (Deflect counter)
- **Attacks & Progression**:
  - Primary Kick (Front Snap / Ap Chagi): `J` / Left Click
  - Secondary Kick (Back Heel Thrust / Dwi Chuk Chagi): `K` / Right Click
  - Special Kick 1 (Roundhouse / Side / Axe Kick / 540° Tornado): `L` / `E`
  - Special Kick 2 (Flying Side / Hook / Kihap Shockwave): `U` / `R`
  - **Hadouken Surge (Pa-dong Gwon / 파동권)**: `H` / `Y` *(Red & Black Belt - 245 DMG, Sapphire & Coral-blue energy projectile)*
  - **Dragon Spirit Overdrive (Yong-ui Gyeok / 용의 격)**: `I` / `F` *(Black Belt - 310 DMG, Golden Dragon Spirit with Swirling Wind Arcs & Fluttering Emerald Leaves)*

---

## 📏 Scale & Character Visual Hierarchy
- **Supreme Rooftop Boss (Lord Shin)**: **1.5× Scale** ($66 \times 120$ px) — Towering physique, devastating reach, and seismic ground slams.
- **Elite Bosses & Bodyguards**: **1.2× Scale** ($53 \times 96$ px) — *Bae Min-Jun (Floor 3 Karate Captain)*, *Kang Tae-Sik (Floor 6 Kendo Master)*, *Viper Baek & Iron Golem (Floor 9 Bodyguards)*.
- **Standard Delinquents & Students**: **1.0× Scale** ($44 \times 80$ px) — Standard mobs, bullies, and kendo practitioners.

---

## 🏯 10-Floor Progression
1. **Floor 1**: Entrance Lockers & Messy Trash (School Bullies)
2. **Floor 2**: Cafeteria Clash (Delinquents & Bullies)
3. **Floor 3 [ELITE BOSS]**: Dojang Gym (*Bae Min-Jun - Karate Club Captain - 1.2× Scale*)
4. **Floor 4**: Student Council Chambers (Disciplinary Enforcers)
5. **Floor 5**: Library Sanctuary (Kendo Students & Delinquents)
6. **Floor 6 [ELITE BOSS]**: Kendo Martial Hall (*Kang Tae-Sik - Kendo Sword Master - 1.2× Scale*)
7. **Floor 7**: Science Lab (Heavy Enforcers)
8. **Floor 8**: Infirmary & Dark Corridor (Elite Enforcers)
9. **Floor 9 [BODYGUARD BOSS]**: Rooftop Access Staircase (*Viper Baek & Iron Golem - 1.2× Scale*)
10. **Floor 10 [SUPREME FINAL BOSS]**: Midnight Rooftop (*Lord Shin - 1.5× Scale with Seismic Toss Cataclysm*) $\rightarrow$ Sunrise Victory

