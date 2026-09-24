// High School Arenas Renderer (10 Detailed Floors, Messy School Environments, Rooftop Sunrise End Scene)

class ArenaManager {
    constructor() {
        this.currentFloor = 1;
        this.width = 1600;
        this.height = 700;
        this.groundY = 560; // baseline floor contact plane
        this.props = [];
        this.theme = 'entrance_hall';
        this.timeOfDay = 'day'; // 'day', 'sunset', 'night', 'midnight', 'sunrise'
        this.lightFlicker = 0;
        this.lightningTimer = 0;
        this.lightningFlash = 0;
        this.ambientParticles = [];
        this.initTheme(1);
    }

    initTheme(floor) {
        this.currentFloor = floor;
        this.ambientParticles = [];
        const floorCfg = window.STAGE_FLOORS_CONFIG[floor] || window.STAGE_FLOORS_CONFIG[1];
        this.theme = floorCfg.bgTheme;
        this.name = floorCfg.name;

        if (floor === 1) {
            // Floor 1: Messy Vandalized Entrance Lockers & Trash
            this.bgColor = '#1e293b';
            this.floorColor = '#cbd5e1'; // speckled concrete floor
            this.wallColor = '#0284c7';
            this.accentColor = '#38bdf8';
            this.timeOfDay = 'day';
            this.generateEntranceHallProps();
        } else if (floor === 2) {
            // Floor 2: Cafeteria Clash with tables, tray dispensers & scattered food
            this.bgColor = '#44403c';
            this.floorColor = '#78716c';
            this.wallColor = '#292524';
            this.accentColor = '#f59e0b';
            this.timeOfDay = 'day';
            this.generateCafeteriaProps();
        } else if (floor === 3) {
            // Floor 3: Elite Boss Karate Dojang Gym
            this.bgColor = '#27272a';
            this.floorColor = '#a16207'; // Polished timber floor
            this.wallColor = '#18181b';
            this.accentColor = '#ef4444';
            this.timeOfDay = 'afternoon';
            this.generateGymProps();
        } else if (floor === 4) {
            // Floor 4: Student Council Office Chambers (Desks, filing cabinets, chairs, banners, documents)
            this.bgColor = '#312e81';
            this.floorColor = '#1e1b4b'; // rich carpet/tiled floor
            this.wallColor = '#1e1b4b';
            this.accentColor = '#c084fc';
            this.timeOfDay = 'afternoon';
            this.generateCouncilRoomProps();
        } else if (floor === 5) {
            // Floor 5: High School Library Sanctuary (Bookshelves, study carrels, reading lamps)
            this.bgColor = '#292524';
            this.floorColor = '#451a03'; // mahogany wood floor
            this.wallColor = '#1c1917';
            this.accentColor = '#eab308';
            this.timeOfDay = 'sunset';
            this.generateLibraryProps();
        } else if (floor === '5.5' || floor === 5.5 || this.theme === 'nursery_rest') {
            // Sanctuary Intermission: Nursery & Health Clinic (Safe Rest Haven)
            this.bgColor = '#0f172a';
            this.floorColor = '#e2e8f0'; // Clean pastel vinyl floor
            this.wallColor = '#f8fafc';
            this.accentColor = '#38bdf8';
            this.timeOfDay = 'day';
            this.generateNurseryProps();
        } else if (floor === 6) {
            // Floor 6: [BOSS] Kendo Martial Training Hall (Weapon racks, wooden floors, calligraphy)
            this.bgColor = '#0f172a';
            this.floorColor = '#713f12';
            this.wallColor = '#020617';
            this.accentColor = '#38bdf8';
            this.timeOfDay = 'sunset';
            this.generateKendoHallProps();
        } else if (floor === 7) {
            // Floor 7: Science Lab (Flasks, fume hoods, sinks, periodic tables)
            this.bgColor = '#042f2e';
            this.floorColor = '#134e4a';
            this.wallColor = '#022c22';
            this.accentColor = '#2dd4bf';
            this.timeOfDay = 'twilight';
            this.generateScienceLabProps();
        } else if (floor === 8) {
            // Floor 8: Dark 4th Floor Corridor & Infirmary (Flickering lights, stretchers, eerie shadows)
            this.bgColor = '#09090b';
            this.floorColor = '#1e293b';
            this.wallColor = '#0f172a';
            this.accentColor = '#60a5fa';
            this.timeOfDay = 'night';
            this.generateDarkCorridorProps();
        } else if (floor === 9) {
            // Floor 9: [BOSS] The Rooftop Access Staircase (Emergency exit doors, security gates, heavy concrete steps)
            this.bgColor = '#1e1b4b';
            this.floorColor = '#0f172a';
            this.wallColor = '#312e81';
            this.accentColor = '#ec4899';
            this.timeOfDay = 'night';
            this.generateRooftopStairsProps();
        } else {
            // Floor 10: [FINAL BOSS - THE HEAD] Pitch Black Midnight Rooftop (Storm, Thunder, Blood Moon)
            this.bgColor = '#000000';
            this.floorColor = '#09090b';
            this.wallColor = '#000000';
            this.accentColor = '#e11d48';
            this.timeOfDay = 'midnight';
            this.generateMidnightRooftopProps();
        }

        // Spawn ambient atmospheric floating particles
        const count = floor === 10 ? 60 : 35;
        for (let i = 0; i < count; i++) {
            let pColor = '#cbd5e1';
            if (floor === 10) pColor = Math.random() < 0.5 ? '#e11d48' : '#7c3aed';
            else if (floor === 4) pColor = '#e0e7ff';
            else if (floor === 7) pColor = '#5eead4';

            this.ambientParticles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 20 + (floor === 10 ? -40 : (floor >= 8 ? 20 : 5)),
                vy: (Math.random() - 0.5) * 15 + (floor === 10 ? 60 : 0),
                size: Math.random() * 3 + 1,
                alpha: Math.random() * 0.7 + 0.2,
                color: pColor
            });
        }
    }

    // --- FLOOR 1: VANDALIZED MAIN LOCKERS & MESSY TRASH (Matches reference image) ---
    generateEntranceHallProps() {
        this.props = [];
        // Blue school lockers with vents and graffiti
        for (let x = 40; x < this.width - 40; x += 190) {
            this.props.push({
                type: 'vandalized_lockers',
                x, y: this.groundY - 170,
                width: 170, height: 170,
                color: '#0284c7',
                hasGraffiti: x % 380 === 0
            });
        }

        // Overturned Trash can overflowing with garbage (from reference)
        this.props.push({ type: 'trash_can', x: 260, y: this.groundY - 80, width: 60, height: 80 });
        this.props.push({ type: 'trash_can', x: 1050, y: this.groundY - 80, width: 60, height: 80 });

        // Scattered debris on floor: Books, soda cans, plastic bottles, water puddles, milk carton
        this.props.push({ type: 'spill_puddle', x: 420, y: this.groundY + 10, width: 85, height: 35, color: 'rgba(56, 189, 248, 0.45)' });
        this.props.push({ type: 'crushed_can', x: 480, y: this.groundY + 15, color: '#ef4444' });
        this.props.push({ type: 'open_book', x: 620, y: this.groundY + 8 });
        this.props.push({ type: 'soda_bottle', x: 740, y: this.groundY + 20, color: '#38bdf8' });
        this.props.push({ type: 'milk_carton', x: 880, y: this.groundY + 12 });
        this.props.push({ type: 'spill_puddle', x: 1200, y: this.groundY + 15, width: 110, height: 40, color: 'rgba(56, 189, 248, 0.45)' });
        this.props.push({ type: 'crushed_can', x: 1260, y: this.groundY + 20, color: '#eab308' });

        // Warning sign & banners
        this.props.push({ type: 'warning_sign', x: 150, y: this.groundY - 100, text: '⚠️ NO RUNNING' });
        this.props.push({ type: 'banner', x: 800, y: 120, text: '🏫 SUNGKYUN HIGH: RESTRICTED ZONE' });
    }

    // --- FLOOR 2: CAFETERIA CLASH ---
    generateCafeteriaProps() {
        this.props = [];
        for (let x = 100; x < this.width - 100; x += 340) {
            this.props.push({ type: 'cafeteria_table', x, y: this.groundY - 65, width: 190, height: 65 });
        }
        this.props.push({ type: 'snack_bar', x: 700, y: this.groundY - 150, width: 220, height: 150 });
        this.props.push({ type: 'spill_puddle', x: 500, y: this.groundY + 10, width: 90, height: 30, color: 'rgba(239, 68, 68, 0.35)' });
        this.props.push({ type: 'crushed_can', x: 540, y: this.groundY + 15, color: '#ef4444' });
        this.props.push({ type: 'milk_carton', x: 920, y: this.groundY + 18 });
    }

    // --- FLOOR 3: DOJANG GYM ---
    generateGymProps() {
        this.props = [];
        this.props.push({ type: 'tatami_ring', x: 250, y: this.groundY - 10, width: 1100, height: 20 });
        this.props.push({ type: 'punching_bag', x: 200, y: this.groundY - 180, swing: 0, swingSpeed: 0 });
        this.props.push({ type: 'punching_bag', x: 1400, y: this.groundY - 180, swing: 0, swingSpeed: 0 });
        this.props.push({ type: 'flag_taeguk', x: 800, y: 130, width: 180, height: 110 });
    }

    // --- FLOOR 4: STUDENT COUNCIL OFFICE CHAMBERS ---
    generateCouncilRoomProps() {
        this.props = [];
        // Executive Conference Table in the background
        this.props.push({ type: 'council_table', x: 450, y: this.groundY - 90, width: 700, height: 90 });
        // Executive Chairs
        for (let x = 480; x < 1120; x += 110) {
            this.props.push({ type: 'office_chair', x, y: this.groundY - 120, width: 45, height: 70 });
        }
        // Filing cabinets & bookshelves
        this.props.push({ type: 'filing_cabinet', x: 120, y: this.groundY - 170, width: 90, height: 170 });
        this.props.push({ type: 'filing_cabinet', x: 230, y: this.groundY - 170, width: 90, height: 170 });
        this.props.push({ type: 'filing_cabinet', x: 1380, y: this.groundY - 170, width: 90, height: 170 });
        // Disciplinary Committee Seal Banner
        this.props.push({ type: 'council_crest', x: 800, y: 150, radius: 65 });
        this.props.push({ type: 'scattered_papers', x: 600, y: this.groundY + 10 });
        this.props.push({ type: 'scattered_papers', x: 950, y: this.groundY + 15 });
    }

    // --- FLOOR 5: HIGH SCHOOL LIBRARY ---
    generateLibraryProps() {
        this.props = [];
        for (let x = 80; x < this.width - 80; x += 220) {
            this.props.push({ type: 'bookshelf', x, y: this.groundY - 185, width: 150, height: 185 });
        }
        this.props.push({ type: 'reading_desk', x: 400, y: this.groundY - 75, width: 160, height: 75 });
        this.props.push({ type: 'reading_desk', x: 1040, y: this.groundY - 75, width: 160, height: 75 });
        this.props.push({ type: 'open_book', x: 740, y: this.groundY + 12 });
    }

    // --- SANCTUARY: NURSERY & HEALTH CLINIC (Formal Medical Inspection & Rest Ward) ---
    generateNurseryProps() {
        this.props = [];
        // Examination Bed with sterile clean linen
        this.props.push({ type: 'examination_bed', x: 200, y: this.groundY - 85, width: 170, height: 85 });
        // Diagnostic Treadmill & Stress Test Unit
        this.props.push({ type: 'medical_treadmill', x: 420, y: this.groundY - 110, width: 110, height: 110 });
        // Illuminated X-Ray Lightbox Scanner
        this.props.push({ type: 'xray_lightbox', x: 620, y: 110, width: 130, height: 95 });
        // High School Health Ward Sign
        this.props.push({ type: 'formal_clinic_sign', x: 800, y: 80, text: 'SUNGKYUN HIGH HEALTH & CLINICAL WARD' });
        // Standing White Doctor/Nurse Labcoat Rack
        this.props.push({ type: 'labcoat_rack', x: 1000, y: this.groundY - 150, width: 45, height: 150 });
        // Antibiotics, Bandages & Medication Storage Cabinet
        this.props.push({ type: 'medicine_cabinet', x: 1180, y: this.groundY - 165, width: 110, height: 165 });
        // Wheeled Secondary Bed & IV Pole
        this.props.push({ type: 'infirmary_bed', x: 1370, y: this.groundY - 80, width: 160, height: 80 });
        this.props.push({ type: 'iv_drip', x: 1340, y: this.groundY - 160, width: 30, height: 160 });
    }

    // --- FLOOR 6: KENDO MARTIAL TRAINING HALL ---
    generateKendoHallProps() {
        this.props = [];
        this.props.push({ type: 'wooden_rack', x: 180, y: this.groundY - 150, width: 120, height: 150 });
        this.props.push({ type: 'wooden_rack', x: 1300, y: this.groundY - 150, width: 120, height: 150 });
        this.props.push({ type: 'calligraphy_scroll', x: 500, y: 130, text: '無念無想 (Clear Mind)' });
        this.props.push({ type: 'calligraphy_scroll', x: 1100, y: 130, text: '一刀兩斷 (Decisive Blade)' });
        this.props.push({ type: 'kendo_armor_stand', x: 800, y: this.groundY - 140, width: 70, height: 140 });
    }

    // --- FLOOR 7: SCIENCE LABORATORY ---
    generateScienceLabProps() {
        this.props = [];
        for (let x = 120; x < this.width - 120; x += 360) {
            this.props.push({ type: 'lab_bench', x, y: this.groundY - 90, width: 220, height: 90 });
        }
        this.props.push({ type: 'periodic_table', x: 800, y: 130, width: 260, height: 110 });
        this.props.push({ type: 'spill_puddle', x: 620, y: this.groundY + 10, width: 80, height: 25, color: 'rgba(45, 212, 191, 0.45)' });
    }

    // --- FLOOR 8: DARK CORRIDOR & INFIRMARY ---
    generateDarkCorridorProps() {
        this.props = [];
        this.props.push({ type: 'infirmary_bed', x: 200, y: this.groundY - 80, width: 180, height: 80 });
        this.props.push({ type: 'infirmary_bed', x: 1220, y: this.groundY - 80, width: 180, height: 80 });
        this.props.push({ type: 'iv_drip', x: 400, y: this.groundY - 160, width: 30, height: 160 });
        this.props.push({ type: 'flickering_sign', x: 800, y: 140, text: '⚠️ INFIRMARY - EMERGENCY WARD' });
    }

    // --- FLOOR 9: ROOFTOP ACCESS STAIRCASE (Guarded by Bodyguards) ---
    generateRooftopStairsProps() {
        this.props = [];
        // Massive heavy metal security staircase and exit doors
        this.props.push({ type: 'massive_staircase', x: 0, y: this.groundY - 260, width: 450, height: 260 });
        this.props.push({ type: 'rooftop_security_gate', x: 1150, y: this.groundY - 220, width: 280, height: 220 });
        this.props.push({ type: 'emergency_exit_light', x: 1290, y: this.groundY - 250 });
        this.props.push({ type: 'warning_sign', x: 750, y: this.groundY - 110, text: '⛔ ACCESS DENIED: ROOFTOP RESTRICTED' });
    }

    // --- FLOOR 10: MIDNIGHT ROOFTOP FINALE (The only Rooftop in the game) ---
    generateMidnightRooftopProps() {
        this.props = [];
        this.props.push({ type: 'chain_fence_dark', x: 0, y: this.groundY - 220, width: this.width, height: 220 });
        this.props.push({ type: 'radio_tower', x: 150, y: this.groundY - 320, width: 80, height: 320 });
        this.props.push({ type: 'broken_vent', x: 1350, y: this.groundY - 110, width: 140, height: 110 });
    }

    update(dt) {
        this.ambientParticles.forEach(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            if (p.x > this.width) p.x = 0;
            if (p.x < 0) p.x = this.width;
            if (p.y > this.groundY + 40) p.y = 20;
            if (p.y < 0) p.y = this.groundY;
        });

        if (this.currentFloor === 10) {
            this.lightningTimer -= dt;
            if (this.lightningTimer <= 0) {
                this.lightningFlash = Math.random() * 0.3 + 0.15;
                this.lightningTimer = Math.random() * 4.0 + 2.5;
                if (window.soundEngine && window.soundEngine.playWhoosh) {
                    window.soundEngine.playWhoosh(0.5, 1.8);
                }
            }
            if (this.lightningFlash > 0) {
                this.lightningFlash -= dt * 2.5;
            }
        }

        this.lightFlicker = Math.sin(Date.now() * 0.005) * 0.05 + 0.95;

        this.props.forEach(prop => {
            if (prop.type === 'punching_bag') {
                prop.swing += prop.swingSpeed * dt;
                prop.swingSpeed *= 0.97;
                if (Math.abs(prop.swing) > 0.01) {
                    prop.swing -= Math.sin(prop.swing) * dt * 4;
                }
            }
        });
    }

    renderBackground(ctx, camera) {
        ctx.save();

        if (this.currentFloor === 10) {
            // FLOOR 10: MIDNIGHT ROOFTOP SKY
            const skyGrad = ctx.createLinearGradient(0, 0, 0, this.groundY);
            skyGrad.addColorStop(0, '#000000');
            skyGrad.addColorStop(0.35, '#05020c');
            skyGrad.addColorStop(0.7, '#1e0522');
            skyGrad.addColorStop(1.0, '#38061e');
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, this.width, this.height);

            // Blood Moon
            const moonGlow = ctx.createRadialGradient(800, 160, 20, 800, 160, 160);
            moonGlow.addColorStop(0, 'rgba(239, 68, 68, 0.95)');
            moonGlow.addColorStop(0.3, 'rgba(168, 85, 247, 0.45)');
            moonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = moonGlow;
            ctx.fillRect(550, 0, 500, 360);

            ctx.fillStyle = '#fecdd3';
            ctx.beginPath();
            ctx.arc(800, 160, 48, 0, Math.PI * 2);
            ctx.fill();

            // Dark clouds
            ctx.fillStyle = 'rgba(15, 5, 29, 0.85)';
            for (let c = 0; c < 8; c++) {
                ctx.beginPath();
                ctx.ellipse(150 + c * 200, 110 + (c % 3) * 35, 170, 45, 0, 0, Math.PI * 2);
                ctx.fill();
            }

            // Lightning
            if (this.lightningFlash > 0) {
                ctx.fillStyle = `rgba(192, 132, 252, ${Math.min(0.6, this.lightningFlash)})`;
                ctx.fillRect(0, 0, this.width, this.height);
                ctx.strokeStyle = '#f8fafc';
                ctx.lineWidth = 3;
                ctx.shadowColor = '#c084fc';
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.moveTo(850, 0);
                ctx.lineTo(820, 90);
                ctx.lineTo(870, 150);
                ctx.lineTo(830, 260);
                ctx.lineTo(850, this.groundY);
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        } else if (this.currentFloor === 4) {
            // FLOOR 4: STUDENT COUNCIL OFFICE WALLPAPER & WOODEN PANELLING
            const wallGrad = ctx.createLinearGradient(0, 0, 0, this.groundY);
            wallGrad.addColorStop(0, '#1e1b4b');
            wallGrad.addColorStop(0.6, '#2e1065');
            wallGrad.addColorStop(1.0, '#18181b');
            ctx.fillStyle = wallGrad;
            ctx.fillRect(0, 0, this.width, this.height);

            // Wood panel wainscoting
            ctx.fillStyle = '#451a03';
            ctx.fillRect(0, this.groundY - 80, this.width, 80);
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 2;
            for (let px = 0; px < this.width; px += 60) {
                ctx.strokeRect(px, this.groundY - 80, 60, 80);
            }
        } else if (this.currentFloor === 9) {
            // FLOOR 9: ROOFTOP STAIRS NIGHT BACKDROP
            const wallGrad = ctx.createLinearGradient(0, 0, 0, this.groundY);
            wallGrad.addColorStop(0, '#09090b');
            wallGrad.addColorStop(0.5, '#1e1b4b');
            wallGrad.addColorStop(1.0, '#0f172a');
            ctx.fillStyle = wallGrad;
            ctx.fillRect(0, 0, this.width, this.height);
        } else {
            // STANDARD DETAILED SCHOOL INTERIOR WALL
            const wallGrad = ctx.createLinearGradient(0, 0, 0, this.groundY);
            wallGrad.addColorStop(0, this.wallColor);
            wallGrad.addColorStop(1, this.bgColor);
            ctx.fillStyle = wallGrad;
            ctx.fillRect(0, 0, this.width, this.height);

            // School hallway windows
            ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
            for (let w = 80; w < this.width; w += 280) {
                ctx.fillRect(w, 50, 120, 130);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
                ctx.strokeRect(w, 50, 120, 130);
                // Window mullions
                ctx.beginPath();
                ctx.moveTo(w + 60, 50); ctx.lineTo(w + 60, 180);
                ctx.moveTo(w, 115); ctx.lineTo(w + 120, 115);
                ctx.stroke();
            }
        }

        // Render Stage-Specific Detailed Props
        this.renderProps(ctx);

        // --- 2.5D PERSPECTIVE FLOOR PLANE ---
        const floorGrad = ctx.createLinearGradient(0, this.groundY, 0, this.height);
        floorGrad.addColorStop(0, this.floorColor);
        floorGrad.addColorStop(0.35, '#090d16');
        floorGrad.addColorStop(1, '#020617');
        ctx.fillStyle = floorGrad;
        ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);

        // Floor Tiles & Speckles
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        for (let py = this.groundY + 20; py < this.height; py += 25) {
            ctx.beginPath();
            ctx.moveTo(0, py);
            ctx.lineTo(this.width, py);
            ctx.stroke();
        }

        // Floor baseline neon trim
        ctx.strokeStyle = this.accentColor;
        ctx.lineWidth = 3;
        ctx.shadowColor = this.accentColor;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(0, this.groundY);
        ctx.lineTo(this.width, this.groundY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Render floor scatter debris (cans, puddles, paper, books)
        this.renderFloorDebris(ctx);

        // Ambient floating dust particles
        this.ambientParticles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        ctx.restore();
    }

    renderProps(ctx) {
        this.props.forEach(prop => {
            if (prop.type === 'vandalized_lockers') {
                // Metal Lockers with dual doors and vents
                ctx.fillStyle = prop.color;
                ctx.fillRect(prop.x, prop.y, prop.width, prop.height);
                ctx.strokeStyle = '#0369a1';
                ctx.lineWidth = 2.5;
                ctx.strokeRect(prop.x, prop.y, prop.width, prop.height);

                // Two columns of lockers
                for (let c = 0; c < 2; c++) {
                    const lx = prop.x + c * (prop.width / 2);
                    ctx.strokeRect(lx, prop.y, prop.width / 2, prop.height);
                    
                    // Air vents (top and bottom)
                    ctx.fillStyle = '#082f49';
                    for (let v = 0; v < 4; v++) {
                        ctx.fillRect(lx + 10, prop.y + 12 + v * 7, prop.width / 2 - 20, 3);
                        ctx.fillRect(lx + 10, prop.y + prop.height - 35 + v * 7, prop.width / 2 - 20, 3);
                    }
                    // Locker Handle
                    ctx.fillStyle = '#f8fafc';
                    ctx.fillRect(lx + prop.width / 2 - 12, prop.y + 70, 5, 22);
                }

                // Graffiti doodles
                if (prop.hasGraffiti) {
                    ctx.strokeStyle = '#f8fafc';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.arc(prop.x + 45, prop.y + 80, 10, 0, Math.PI * 2);
                    ctx.moveTo(prop.x + 45, prop.y + 90); ctx.lineTo(prop.x + 45, prop.y + 115);
                    ctx.moveTo(prop.x + 35, prop.y + 100); ctx.lineTo(prop.x + 55, prop.y + 100);
                    ctx.moveTo(prop.x + 45, prop.y + 115); ctx.lineTo(prop.x + 35, prop.y + 130);
                    ctx.moveTo(prop.x + 45, prop.y + 115); ctx.lineTo(prop.x + 55, prop.y + 130);
                    ctx.stroke();
                }
            } else if (prop.type === 'trash_can') {
                // Green overturned garbage can with spilled contents
                ctx.fillStyle = '#15803d';
                ctx.beginPath();
                ctx.roundRect(prop.x, prop.y, prop.width, prop.height, [8, 8, 4, 4]);
                ctx.fill();
                ctx.strokeStyle = '#14532d';
                ctx.lineWidth = 2.5;
                ctx.stroke();

                // Trash icon on can
                ctx.fillStyle = '#f8fafc';
                ctx.font = 'bold 16px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('🗑️', prop.x + prop.width / 2, prop.y + 45);

                // Overflowing paper & trash bags at top
                ctx.fillStyle = '#cbd5e1';
                ctx.beginPath();
                ctx.arc(prop.x + 18, prop.y - 6, 14, 0, Math.PI * 2);
                ctx.arc(prop.x + 42, prop.y - 8, 16, 0, Math.PI * 2);
                ctx.fill();
            } else if (prop.type === 'council_table') {
                ctx.fillStyle = '#78350f';
                ctx.fillRect(prop.x, prop.y, prop.width, prop.height);
                ctx.strokeStyle = '#451a03';
                ctx.lineWidth = 3;
                ctx.strokeRect(prop.x, prop.y, prop.width, prop.height);
                ctx.fillStyle = '#451a03';
                ctx.fillRect(prop.x + 10, prop.y + 10, prop.width - 20, prop.height - 20);
            } else if (prop.type === 'council_crest') {
                ctx.fillStyle = '#facc15';
                ctx.shadowColor = '#facc15';
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.arc(prop.x, prop.y, prop.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#1e1b4b';
                ctx.font = '900 24px "Outfit", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('⚖️ COUNCIL', prop.x, prop.y + 8);
            } else if (prop.type === 'bookshelf') {
                ctx.fillStyle = '#451a03';
                ctx.fillRect(prop.x, prop.y, prop.width, prop.height);
                ctx.strokeStyle = '#78350f';
                ctx.lineWidth = 2.5;
                ctx.strokeRect(prop.x, prop.y, prop.width, prop.height);

                // Book rows
                const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
                for (let r = 0; r < 4; r++) {
                    const ry = prop.y + 12 + r * 42;
                    ctx.fillStyle = '#292524';
                    ctx.fillRect(prop.x + 6, ry, prop.width - 12, 36);
                    for (let b = 0; b < 9; b++) {
                        ctx.fillStyle = colors[(r + b) % colors.length];
                        ctx.fillRect(prop.x + 8 + b * 15, ry + 4, 12, 32);
                    }
                }
            } else if (prop.type === 'massive_staircase') {
                // Steel staircase rising up to the rooftop
                ctx.fillStyle = '#1e293b';
                ctx.strokeStyle = '#475569';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(prop.x, prop.y + prop.height);
                for (let s = 0; s < 6; s++) {
                    const sx = prop.x + s * 70;
                    const sy = prop.y + prop.height - (s + 1) * 40;
                    ctx.lineTo(sx, sy);
                    ctx.lineTo(sx + 70, sy);
                }
                ctx.lineTo(prop.x + prop.width, prop.y);
                ctx.lineTo(prop.x + prop.width, prop.y + prop.height);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Yellow warning stripes on stairs
                ctx.fillStyle = '#facc15';
                for (let s = 0; s < 6; s++) {
                    const sx = prop.x + s * 70;
                    const sy = prop.y + prop.height - (s + 1) * 40;
                    ctx.fillRect(sx + 5, sy + 2, 60, 5);
                }
            } else if (prop.type === 'examination_bed') {
                // Formal medical inspection examination bed
                ctx.fillStyle = '#f8fafc';
                ctx.strokeStyle = '#0284c7';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(prop.x, prop.y, prop.width, 24, 4);
                ctx.fill();
                ctx.stroke();
                // Clean sterile pillow
                ctx.fillStyle = '#e0f2fe';
                ctx.fillRect(prop.x + 8, prop.y + 4, 32, 16);
                // Metal structure
                ctx.fillStyle = '#64748b';
                ctx.fillRect(prop.x + 12, prop.y + 24, 10, prop.height - 24);
                ctx.fillRect(prop.x + prop.width - 22, prop.y + 24, 10, prop.height - 24);
                ctx.fillRect(prop.x + 12, prop.y + prop.height - 12, prop.width - 24, 6);
            } else if (prop.type === 'medical_treadmill') {
                // Diagnostic Treadmill Unit
                ctx.fillStyle = '#1e293b';
                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 2;
                // Running belt base
                ctx.beginPath();
                ctx.roundRect(prop.x, prop.y + 70, prop.width, 35, 4);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(prop.x + 10, prop.y + 75, prop.width - 20, 18);
                // Handrails & Digital Monitor
                ctx.strokeStyle = '#94a3b8';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(prop.x + 20, prop.y + 70);
                ctx.lineTo(prop.x + 25, prop.y + 15);
                ctx.lineTo(prop.x + 50, prop.y + 15);
                ctx.stroke();
                // ECG monitor screen
                ctx.fillStyle = '#0284c7';
                ctx.fillRect(prop.x + 40, prop.y + 5, 30, 24);
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(prop.x + 44, prop.y + 17);
                ctx.lineTo(prop.x + 50, prop.y + 10);
                ctx.lineTo(prop.x + 56, prop.y + 24);
                ctx.lineTo(prop.x + 64, prop.y + 17);
                ctx.stroke();
            } else if (prop.type === 'xray_lightbox') {
                // Illuminated X-Ray Viewer Box with spine & ribcage
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(prop.x, prop.y, prop.width, prop.height);
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 3;
                ctx.strokeRect(prop.x, prop.y, prop.width, prop.height);
                // Glowing blue screen
                ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
                ctx.fillRect(prop.x + 6, prop.y + 6, prop.width - 12, prop.height - 12);
                // Skeletal X-Ray visual (ribcage & spine)
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(prop.x + prop.width / 2, prop.y + 12);
                ctx.lineTo(prop.x + prop.width / 2, prop.y + prop.height - 12);
                for (let ry = prop.y + 20; ry <= prop.y + prop.height - 25; ry += 12) {
                    ctx.moveTo(prop.x + prop.width / 2 - 24, ry);
                    ctx.lineTo(prop.x + prop.width / 2 + 24, ry);
                }
                ctx.stroke();
            } else if (prop.type === 'labcoat_rack') {
                // Coat stand with hanging medical labcoat
                ctx.fillStyle = '#475569';
                ctx.fillRect(prop.x + prop.width / 2 - 3, prop.y, 6, prop.height);
                ctx.fillRect(prop.x, prop.y + prop.height - 8, prop.width, 8);
                // White Labcoat
                ctx.fillStyle = '#f8fafc';
                ctx.strokeStyle = '#cbd5e1';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(prop.x + 4, prop.y + 18, prop.width - 8, 85, [6, 6, 10, 10]);
                ctx.fill();
                ctx.stroke();
                // Stethoscope on coat
                ctx.strokeStyle = '#0284c7';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(prop.x + prop.width / 2, prop.y + 35, 10, 0, Math.PI);
                ctx.stroke();
            } else if (prop.type === 'medicine_cabinet') {
                // Glass-fronted stainless steel medicine & antibiotic drawer cabinet
                ctx.fillStyle = '#1e293b';
                ctx.strokeStyle = '#64748b';
                ctx.lineWidth = 2.5;
                ctx.fillRect(prop.x, prop.y, prop.width, prop.height);
                ctx.strokeRect(prop.x, prop.y, prop.width, prop.height);
                // Shelves with colored pill bottles & syrup vials
                const bottleColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];
                for (let s = 0; s < 4; s++) {
                    const sy = prop.y + 14 + s * 38;
                    ctx.strokeStyle = '#475569';
                    ctx.lineWidth = 1.5;
                    ctx.strokeRect(prop.x + 8, sy, prop.width - 16, 30);
                    // Bottles on shelf
                    for (let b = 0; b < 4; b++) {
                        ctx.fillStyle = bottleColors[(s + b) % bottleColors.length];
                        ctx.fillRect(prop.x + 14 + b * 22, sy + 6, 12, 20);
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(prop.x + 16 + b * 22, sy + 2, 8, 4);
                    }
                }
            } else if (prop.type === 'formal_clinic_sign') {
                ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(prop.x - 240, prop.y, 480, 36, 6);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#f8fafc';
                ctx.font = 'bold 13px "Outfit", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(prop.text, prop.x, prop.y + 22);
            } else if (prop.type === 'banner') {
                ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
                ctx.fillRect(prop.x - 220, prop.y, 440, 38);
                ctx.strokeStyle = this.accentColor;
                ctx.lineWidth = 2;
                ctx.strokeRect(prop.x - 220, prop.y, 440, 38);
                ctx.fillStyle = '#f8fafc';
                ctx.font = '900 13px "Outfit", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(prop.text, prop.x, prop.y + 24);
            }
        });
    }

    renderFloorDebris(ctx) {
        this.props.forEach(prop => {
            if (prop.type === 'spill_puddle') {
                ctx.fillStyle = prop.color;
                ctx.beginPath();
                ctx.ellipse(prop.x, prop.y, prop.width / 2, prop.height / 2, 0, 0, Math.PI * 2);
                ctx.fill();
            } else if (prop.type === 'crushed_can') {
                ctx.fillStyle = prop.color;
                ctx.beginPath();
                ctx.roundRect(prop.x, prop.y, 16, 10, 3);
                ctx.fill();
            } else if (prop.type === 'open_book') {
                ctx.fillStyle = '#fef3c7';
                ctx.beginPath();
                ctx.moveTo(prop.x - 14, prop.y);
                ctx.lineTo(prop.x, prop.y - 6);
                ctx.lineTo(prop.x + 14, prop.y);
                ctx.lineTo(prop.x + 10, prop.y + 14);
                ctx.lineTo(prop.x, prop.y + 8);
                ctx.lineTo(prop.x - 10, prop.y + 14);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = '#d97706';
                ctx.stroke();
            } else if (prop.type === 'milk_carton') {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(prop.x, prop.y, 14, 18);
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(prop.x + 3, prop.y + 4, 8, 8);
            } else if (prop.type === 'scattered_papers') {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(prop.x, prop.y, 18, 24);
                ctx.fillRect(prop.x + 14, prop.y + 4, 16, 20);
            }
        });
    }

    // --- FULL CANVAS GLORIOUS SUNRISE ON THE SCHOOL ROOFTOP (Inspired by User Reference Image) ---
    renderSunriseEndScreen(ctx) {
        // Sky gradient: Intense glowing Amber & Golden Solar Dawn with deep orange horizon
        const skyGrad = ctx.createLinearGradient(0, 0, 0, this.groundY);
        skyGrad.addColorStop(0, '#ea580c');    // Rich fiery orange sky top
        skyGrad.addColorStop(0.3, '#f59e0b');  // Radiant golden amber
        skyGrad.addColorStop(0.55, '#fbbf24'); // Luminous warm yellow
        skyGrad.addColorStop(0.8, '#fef08a');  // Blinding solar haze
        skyGrad.addColorStop(1.0, '#f59e0b');  // Dense amber horizon band
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Towering Central Skyscraper (Empire State style) centered with blazing sun backlight
        const centerX = this.width / 2;
        const sunCenterY = this.groundY - 260;

        // Giant Solar Flare / Corona Halo behind the iconic spire tower
        const corona = ctx.createRadialGradient(centerX, sunCenterY, 40, centerX, sunCenterY, 520);
        corona.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        corona.addColorStop(0.2, 'rgba(254, 240, 138, 0.95)');
        corona.addColorStop(0.45, 'rgba(245, 158, 11, 0.7)');
        corona.addColorStop(0.75, 'rgba(234, 88, 12, 0.35)');
        corona.addColorStop(1.0, 'rgba(194, 65, 12, 0)');
        ctx.fillStyle = corona;
        ctx.beginPath();
        ctx.arc(centerX, sunCenterY, 520, 0, Math.PI * 2);
        ctx.fill();

        // High intensity blazing white-hot sun disc behind tower
        const innerSun = ctx.createRadialGradient(centerX, sunCenterY, 10, centerX, sunCenterY, 180);
        innerSun.addColorStop(0, '#ffffff');
        innerSun.addColorStop(0.6, '#fef08a');
        innerSun.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = innerSun;
        ctx.beginPath();
        ctx.arc(centerX, sunCenterY, 180, 0, Math.PI * 2);
        ctx.fill();

        // --- ICONIC METROPOLIS SILHOUETTES (Directly matching reference image) ---
        ctx.fillStyle = '#090704'; // Deep dramatic silhouette black

        // Left City Skyline Silhouettes
        ctx.fillRect(20, this.groundY - 140, 150, 140); // Broad MetLife style building
        ctx.fillRect(190, this.groundY - 170, 95, 170);
        ctx.fillRect(295, this.groundY - 210, 115, 210);
        ctx.fillRect(425, this.groundY - 160, 85, 160);

        // Slender Chrysler-style Spire in middle-left distance
        ctx.beginPath();
        ctx.moveTo(560, this.groundY);
        ctx.lineTo(560, this.groundY - 260);
        ctx.lineTo(570, this.groundY - 340);
        ctx.lineTo(571, this.groundY - 390); // Needle antenna
        ctx.lineTo(572, this.groundY - 340);
        ctx.lineTo(582, this.groundY - 260);
        ctx.lineTo(582, this.groundY);
        ctx.fill();

        // Right City Skyline Silhouettes
        ctx.fillRect(this.width - 520, this.groundY - 155, 90, 155);
        ctx.fillRect(this.width - 415, this.groundY - 190, 125, 190);
        ctx.fillRect(this.width - 275, this.groundY - 145, 110, 145);
        ctx.fillRect(this.width - 150, this.groundY - 175, 130, 175);

        // --- MASSIVE MONOLITHIC CENTRAL EMPIRE SKYSCRAPER & SPIRE (Reference Image Core) ---
        const bW = 190;
        const bBaseX = centerX - bW / 2;
        
        // Base Tier
        ctx.fillRect(bBaseX, this.groundY - 280, bW, 280);
        // Stepback Tier 2
        ctx.fillRect(centerX - 80, this.groundY - 370, 160, 90);
        // Stepback Tier 3
        ctx.fillRect(centerX - 65, this.groundY - 440, 130, 70);
        // Art Deco Crown Tier
        ctx.fillRect(centerX - 42, this.groundY - 485, 84, 45);
        // Spire Base Tower
        ctx.fillRect(centerX - 24, this.groundY - 525, 48, 40);
        // Spire Cone
        ctx.beginPath();
        ctx.moveTo(centerX - 18, this.groundY - 525);
        ctx.lineTo(centerX - 6, this.groundY - 580);
        ctx.lineTo(centerX + 6, this.groundY - 580);
        ctx.lineTo(centerX + 18, this.groundY - 525);
        ctx.fill();
        // Needle Spire Antenna reaching into zenith sky
        ctx.fillRect(centerX - 3, this.groundY - 640, 6, 60);
        ctx.fillRect(centerX - 1.5, this.groundY - 665, 3, 25);

        // Architectural window grid accents in tower silhouette
        ctx.fillStyle = 'rgba(254, 240, 138, 0.22)';
        for (let wy = this.groundY - 260; wy < this.groundY - 20; wy += 14) {
            for (let wx = bBaseX + 20; wx < bBaseX + bW - 20; wx += 16) {
                ctx.fillRect(wx, wy, 5, 8);
            }
        }
        for (let wy = this.groundY - 430; wy < this.groundY - 290; wy += 12) {
            for (let wx = centerX - 55; wx < centerX + 55; wx += 14) {
                ctx.fillRect(wx, wy, 4, 7);
            }
        }

        // Rooftop Baseline & Floor
        ctx.fillStyle = '#050302';
        ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);

        // Golden rim light on rooftop edge
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, this.groundY);
        ctx.lineTo(this.width, this.groundY);
        ctx.stroke();

        // Atmospheric drifting golden embers in sunrise haze
        const time = Date.now() * 0.001;
        for (let p = 0; p < 35; p++) {
            const px = ((p * 67 + time * 45) % this.width);
            const py = ((p * 39 + Math.sin(time + p) * 35) % (this.height - 100));
            ctx.fillStyle = '#fef08a';
            ctx.globalAlpha = 0.65;
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;
    }

    spawnInteractiveObjects(floor) {
        const desks = [];
        const items = [];
        const floorY = this.groundY - 10;

        if (floor === 1) {
            // Floor 1 (Lockers): Metal Trash Cans (kickable) & Locker Benches (kickable)
            desks.push(new window.KickableProp(450, floorY - 35, 'trash_can'));
            desks.push(new window.KickableProp(1150, floorY - 25, 'locker_bench'));

            items.push(new window.PickupItem(320, floorY - 15, 'apple'));
            items.push(new window.PickupItem(620, floorY - 15, 'pencil'));
            items.push(new window.PickupItem(880, floorY - 15, 'ruler'));
            items.push(new window.PickupItem(1350, floorY - 15, 'book'));
        } else if (floor === 2) {
            // Floor 2 (Cafeteria): Formica Dining Tables & Metal Food Tray Stacks
            desks.push(new window.KickableProp(400, floorY - 35, 'dining_table'));
            desks.push(new window.KickableProp(1100, floorY - 20, 'food_tray_stack'));

            items.push(new window.PickupItem(260, floorY - 15, 'apple'));
            items.push(new window.PickupItem(600, floorY - 15, 'cactus'));
            items.push(new window.PickupItem(850, floorY - 15, 'apple'));
            items.push(new window.PickupItem(1300, floorY - 15, 'apple'));
        } else if (floor === 3) {
            // Floor 3 (Gym/Dojo): Bouncing Basketballs & Rolling Rugby Balls (High bounce kick physics!)
            desks.push(new window.KickableProp(380, floorY - 20, 'basketball'));
            desks.push(new window.KickableProp(1120, floorY - 15, 'rugby_ball'));

            items.push(new window.PickupItem(300, floorY - 15, 'ninja_star'));
            items.push(new window.PickupItem(720, floorY - 15, 'ruler'));
            items.push(new window.PickupItem(1280, floorY - 15, 'ninja_star'));
        } else if (floor === 4) {
            // Floor 4 (Student Council): Executive Conference Desks & Rolling Swivel Chairs
            desks.push(new window.KickableProp(420, floorY - 35, 'council_desk'));
            desks.push(new window.KickableProp(1150, floorY - 38, 'swivel_chair'));

            items.push(new window.PickupItem(260, floorY - 15, 'cactus'));
            items.push(new window.PickupItem(650, floorY - 15, 'ruler'));
            items.push(new window.PickupItem(900, floorY - 15, 'pencil'));
            items.push(new window.PickupItem(1350, floorY - 15, 'ninja_star'));
        } else if (floor === 5) {
            // Floor 5 (Library): Reading Study Tables & Mobile Bookshelf Carts
            desks.push(new window.KickableProp(360, floorY - 35, 'reading_desk'));
            desks.push(new window.KickableProp(1180, floorY - 48, 'bookshelf_cart'));

            items.push(new window.PickupItem(220, floorY - 15, 'book'));
            items.push(new window.PickupItem(550, floorY - 15, 'ruler'));
            items.push(new window.PickupItem(820, floorY - 15, 'pencil'));
            items.push(new window.PickupItem(1380, floorY - 15, 'ninja_star'));
        } else if (floor === '5.5' || floor === 5.5 || this.theme === 'nursery_rest') {
            // Sanctuary Nursery: Restorative items & soothing clinic props
            items.push(new window.PickupItem(350, floorY - 15, 'apple'));
            items.push(new window.PickupItem(600, floorY - 15, 'apple'));
            items.push(new window.PickupItem(1050, floorY - 15, 'ninja_star'));
        } else if (floor === 6) {
            // Floor 6 (Kendo Hall): Wooden Weapon Racks & Kendo Armor Dummies
            desks.push(new window.KickableProp(380, floorY - 40, 'weapon_rack'));
            desks.push(new window.KickableProp(1150, floorY - 45, 'armor_dummy'));

            items.push(new window.PickupItem(280, floorY - 15, 'ninja_star'));
            items.push(new window.PickupItem(700, floorY - 15, 'ruler'));
            items.push(new window.PickupItem(1250, floorY - 15, 'ninja_star'));
        } else if (floor === 7) {
            // Floor 7 (Science Lab): Heavy Lab Benches & Rolling Chemical Carts
            desks.push(new window.KickableProp(400, floorY - 38, 'lab_bench'));
            desks.push(new window.KickableProp(1120, floorY - 35, 'chemical_cart'));

            items.push(new window.PickupItem(250, floorY - 15, 'cactus'));
            items.push(new window.PickupItem(680, floorY - 15, 'ruler'));
            items.push(new window.PickupItem(920, floorY - 15, 'pencil'));
            items.push(new window.PickupItem(1300, floorY - 15, 'apple'));
        } else if (floor === 8) {
            // Floor 8 (Infirmary / Dark Corridor): Wheeled Hospital Stretchers & Rolling IV Stands
            desks.push(new window.KickableProp(420, floorY - 30, 'infirmary_stretcher'));
            desks.push(new window.KickableProp(1150, floorY - 52, 'rolling_iv_stand'));

            items.push(new window.PickupItem(300, floorY - 15, 'apple'));
            items.push(new window.PickupItem(650, floorY - 15, 'apple'));
            items.push(new window.PickupItem(1000, floorY - 15, 'ruler'));
            items.push(new window.PickupItem(1320, floorY - 15, 'ninja_star'));
        } else if (floor === 9) {
            // Floor 9 (Rooftop Stairs): Metal Barricade Security Gates & Concrete Step Crates
            desks.push(new window.KickableProp(400, floorY - 42, 'security_gate'));
            desks.push(new window.KickableProp(1180, floorY - 28, 'concrete_crate'));

            items.push(new window.PickupItem(280, floorY - 15, 'ninja_star'));
            items.push(new window.PickupItem(750, floorY - 15, 'book'));
            items.push(new window.PickupItem(1280, floorY - 15, 'ninja_star'));
        } else if (floor === 10) {
            // Floor 10 (Midnight Rooftop): Industrial Air Duct Ventilation Fans & Steel Radio Crates
            desks.push(new window.KickableProp(380, floorY - 38, 'air_duct_fan'));
            desks.push(new window.KickableProp(1150, floorY - 30, 'steel_radio_crate'));

            items.push(new window.PickupItem(250, floorY - 15, 'ninja_star'));
            items.push(new window.PickupItem(650, floorY - 15, 'ninja_star'));
            items.push(new window.PickupItem(950, floorY - 15, 'ninja_star'));
            items.push(new window.PickupItem(1350, floorY - 15, 'ninja_star'));
        }

        return { desks, items };
    }
}

window.ArenaManager = ArenaManager;

