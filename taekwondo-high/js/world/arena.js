// High School Arenas Renderer (10 Detailed Floors, Messy School Environments, Rooftop Sunrise End Scene)

// Ensure CanvasRenderingContext2D.prototype.roundRect is safely available across all browsers/webviews
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
        if (!radii) radii = 0;
        let r = typeof radii === 'number' ? radii : (Array.isArray(radii) ? radii[0] : 0);
        r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
        this.beginPath();
        this.moveTo(x + r, y);
        this.lineTo(x + w - r, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r);
        this.lineTo(x + w, y + h - r);
        this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.lineTo(x + r, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r);
        this.lineTo(x, y + r);
        this.quadraticCurveTo(x, y, x + r, y);
        this.closePath();
        return this;
    };
}

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

        // --- IDLE LIVELY BACKGROUND SCENERY ANIMATIONS (Floors 1 to 8 only; disabled on Nursery/Healing Station & Floors 9-10) ---
        const isHealingStation = this.currentFloor === '5.5' || this.currentFloor === 5.5 || this.theme === 'nursery_rest';
        if (this.currentFloor < 9 && !isHealingStation) {
            this.renderIdleSchoolLife(ctx);
        }

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

    renderIdleSchoolLife(ctx) {
        // Boss floors 9 & 10 and the Sanctuary Healing Station remain peaceful/serious with no playful background animations
        const isHealingStation = this.currentFloor === '5.5' || this.currentFloor === 5.5 || this.theme === 'nursery_rest';
        if (this.currentFloor >= 9 || isHealingStation) return;

        const time = Date.now() * 0.001;
        const baseY = this.groundY;
        const floor = Math.floor(this.currentFloor) || 1;

        // =========================================================================
        // COHERENT ANATOMICAL SKELETAL RIG DRAWING UTILITY
        // Matches the body proportions, anatomical joints, patella bumps, deltoids,
        // and movement kinematics of the foreground active fighters
        // =========================================================================
        const drawAnatomicalChar = (x, y, facing, opt = {}) => {
            ctx.save();
            ctx.translate(x, y);
            const charScale = opt.scale || 1.0;
            ctx.scale(facing * charScale, charScale);

            const {
                bodyColor = '#0284c7',
                pantsColor = '#1e293b',
                skinColor = '#fed7aa',
                hairColor = '#0f172a',
                hairStyle = 'spiky', // 'spiky', 'pompadour', 'sidepart', 'curly', 'bald', 'twin_tails', 'bandana', 'slick_elder'
                animState = 'idle',   // 'idle', 'run', 'walk', 'cheer', 'laugh', 'point', 'throw', 'boxing', 'arms_crossed', 'smoking_lean', 'eat', 'read', 'guitar', 'phone', 'sleep', 'kendo_practice', 'cheerleader'
                animPhase = 0,
                isTeacher = false,
                hasTie = false,
                hasBeard = false,
                hasGlasses = false,
                isAngry = false,
                lean = 0,
                throwProgress = 0
            } = opt;

            const walkCycle = Math.sin(animPhase);
            const bob = (animState === 'run' || animState === 'walk')
                ? Math.abs(walkCycle) * 6
                : Math.sin(time * 3 + x) * 2;

            ctx.rotate(lean);

            // Ground Contact Shadow (Anatomical Radial Gradient)
            ctx.save();
            const shadowGrad = ctx.createRadialGradient(0, 78, 2, 0, 78, 24 * charScale);
            shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
            shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = shadowGrad;
            ctx.beginPath();
            ctx.ellipse(0, 78, 24 * charScale, 7 * charScale, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // --- LEGS & PANTS (Articulated Thigh, Patella Condyle Ridge, Calf & Ankle Malleolus) ---
            ctx.fillStyle = pantsColor;
            ctx.strokeStyle = '#020617';
            ctx.lineWidth = 2.4;
            ctx.lineJoin = 'round';

            let legSwing1 = 0;
            let legSwing2 = 0;
            if (animState === 'run') {
                legSwing1 = walkCycle * 22;
                legSwing2 = -walkCycle * 22;
            } else if (animState === 'walk') {
                legSwing1 = walkCycle * 14;
                legSwing2 = -walkCycle * 14;
            }

            // Left Leg (Back Leg)
            ctx.beginPath();
            ctx.moveTo(-12 - legSwing1 * 0.7, 44 - bob);
            ctx.lineTo(-1 - legSwing1 * 0.7, 44 - bob);
            ctx.lineTo(0 - legSwing1 * 0.8, 59 - bob);
            ctx.lineTo(1 - legSwing1 * 0.85, 63 - bob); // Patella ridge
            ctx.lineTo(-1 - legSwing1 * 0.9, 67 - bob);
            ctx.lineTo(0 - legSwing1, 75 - bob);
            ctx.lineTo(-2 - legSwing1, 78 - bob); // Lateral malleolus
            ctx.lineTo(-13 - legSwing1, 78 - bob);
            ctx.lineTo(-15 - legSwing1, 74 - bob);
            ctx.lineTo(-13 - legSwing1 * 0.8, 62 - bob);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Right Leg (Front Leg)
            ctx.beginPath();
            ctx.moveTo(2 + legSwing2 * 0.7, 44 - bob);
            ctx.lineTo(13 + legSwing2 * 0.7, 44 - bob);
            ctx.lineTo(14 + legSwing2 * 0.8, 59 - bob);
            ctx.lineTo(16 + legSwing2 * 0.85, 63 - bob); // Patella ridge
            ctx.lineTo(14 + legSwing2 * 0.9, 67 - bob);
            ctx.lineTo(15 + legSwing2, 75 - bob);
            ctx.lineTo(13 + legSwing2, 78 - bob); // Malleolus
            ctx.lineTo(2 + legSwing2, 78 - bob);
            ctx.lineTo(0 + legSwing2, 74 - bob);
            ctx.lineTo(2 + legSwing2 * 0.8, 62 - bob);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Shoes (Articulated athletic sneakers / formal shoes)
            ctx.fillStyle = isTeacher ? '#09090b' : '#f8fafc';
            ctx.fillRect(-15 - legSwing1, 74 - bob, 17, 7);
            ctx.fillRect(0 + legSwing2, 74 - bob, 17, 7);
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 1.8;
            ctx.strokeRect(-15 - legSwing1, 74 - bob, 17, 7);
            ctx.strokeRect(0 + legSwing2, 74 - bob, 17, 7);

            // --- TORSO (Broad Athletic Shoulders, Clavicle Contour & Tapered Waist) ---
            const torsoGrad = ctx.createLinearGradient(-18, 14 - bob, 18, 48 - bob);
            torsoGrad.addColorStop(0, bodyColor);
            torsoGrad.addColorStop(1, '#0f172a');
            ctx.fillStyle = isTeacher ? '#334155' : torsoGrad;
            ctx.strokeStyle = '#020617';
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(-18, 14 - bob);
            ctx.quadraticCurveTo(0, 11 - bob, 18, 14 - bob); // Shoulders
            ctx.lineTo(16, 48 - bob);
            ctx.lineTo(-16, 48 - bob);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Teacher Formal Vest / Suit Collar & Necktie
            if (isTeacher || hasTie) {
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.moveTo(-7, 14 - bob);
                ctx.lineTo(0, 32 - bob);
                ctx.lineTo(7, 14 - bob);
                ctx.closePath();
                ctx.fill();

                // Crimson Red Teacher Necktie
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.moveTo(-3, 16 - bob);
                ctx.lineTo(3, 16 - bob);
                ctx.lineTo(4, 38 - bob);
                ctx.lineTo(0, 44 - bob);
                ctx.lineTo(-4, 38 - bob);
                ctx.closePath();
                ctx.fill();
            }

            // --- HEAD & HAIR (Articulated Face with Expressive Features) ---
            ctx.save();
            ctx.translate(0, 4 - bob);
            ctx.fillStyle = skinColor;
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, 13, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Hairstyle / Aging features
            if (hairStyle === 'bald') {
                // Shiny bald head with elder hair fringe
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.ellipse(-3, -6, 4, 2, -Math.PI / 6, 0, Math.PI * 2);
                ctx.fill();
                // Grey side hair fringe
                ctx.fillStyle = '#64748b';
                ctx.beginPath();
                ctx.arc(-11, 2, 5, 0, Math.PI * 2);
                ctx.arc(11, 2, 5, 0, Math.PI * 2);
                ctx.fill();
            } else if (hairStyle === 'slick_elder') {
                ctx.fillStyle = '#334155';
                ctx.beginPath();
                ctx.arc(0, -4, 14, Math.PI * 0.85, Math.PI * 2.15);
                ctx.fill();
            } else if (hairStyle === 'pompadour') {
                ctx.fillStyle = hairColor;
                ctx.beginPath();
                ctx.arc(-2, -6, 12, Math.PI * 0.8, Math.PI * 2.2);
                ctx.lineTo(10, -10);
                ctx.closePath();
                ctx.fill();
            } else if (hairStyle === 'spiky') {
                ctx.fillStyle = hairColor;
                ctx.beginPath();
                ctx.moveTo(-13, -2);
                ctx.lineTo(-16, -12);
                ctx.lineTo(-8, -10);
                ctx.lineTo(-4, -18);
                ctx.lineTo(4, -12);
                ctx.lineTo(10, -16);
                ctx.lineTo(14, -4);
                ctx.closePath();
                ctx.fill();
            } else if (hairStyle === 'twin_tails') {
                ctx.fillStyle = hairColor;
                ctx.beginPath();
                ctx.arc(0, -4, 13, Math.PI * 0.9, Math.PI * 2.1);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(-12, 0, 6, 0, Math.PI * 2);
                ctx.arc(12, 0, 6, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = hairColor;
                ctx.beginPath();
                ctx.arc(0, -4, 13, Math.PI * 0.85, Math.PI * 2.15);
                ctx.fill();
            }

            // Glasses
            if (hasGlasses) {
                ctx.strokeStyle = '#020617';
                ctx.lineWidth = 1.8;
                ctx.strokeRect(1, -2, 7, 5);
                ctx.beginPath();
                ctx.moveTo(-2, 0); ctx.lineTo(1, 0);
                ctx.stroke();
            }

            // Teacher Elder Mustache / Beard & Eyebrows
            if (hasBeard || hasGlasses || isTeacher) {
                ctx.fillStyle = isTeacher ? '#475569' : '#0f172a';
                ctx.beginPath();
                ctx.roundRect(1, 4, 8, 3.5, 1.5); // Mustache
                ctx.fill();
                // Wrinkles
                ctx.strokeStyle = '#94a3b8';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(-4, -8); ctx.lineTo(4, -8);
                ctx.stroke();
            }

            // Eyes
            ctx.fillStyle = isAngry ? '#ef4444' : '#0f172a';
            ctx.beginPath();
            ctx.ellipse(5, 0, 3, 2.5, 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // --- ARMS & POSED KINEMATICS ---
            ctx.fillStyle = bodyColor;
            ctx.strokeStyle = '#020617';
            ctx.lineWidth = 2.4;
            ctx.lineJoin = 'round';

            // 1. Teacher Waving Yardstick / Ruler Chase
            if (animState === 'ruler_chase') {
                // Left arm pumping forward
                ctx.beginPath();
                ctx.moveTo(-8, 18 - bob);
                ctx.lineTo(-18, 30 - bob);
                ctx.lineTo(-12, 42 - bob);
                ctx.stroke();

                // Right arm raised holding wooden school yardstick
                ctx.beginPath();
                ctx.moveTo(8, 18 - bob);
                ctx.lineTo(20, 6 - bob);
                ctx.lineTo(26, -6 - bob);
                ctx.stroke();

                // Golden Oak Teaching Ruler
                ctx.strokeStyle = '#facc15';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(24, -4 - bob);
                ctx.lineTo(44, -26 - bob + Math.sin(time * 16) * 6);
                ctx.stroke();
            }
            // 2. Running Student Flailing Arms in Laughter
            else if (animState === 'run') {
                const flail = Math.sin(animPhase * 1.5) * 12;
                ctx.beginPath();
                ctx.moveTo(-8, 18 - bob);
                ctx.lineTo(-20, 10 - bob + flail);
                ctx.moveTo(8, 18 - bob);
                ctx.lineTo(20, 10 - bob - flail);
                ctx.stroke();
            }
            // 3. Disrespectful Arms Crossed Posture (Delinquent Partner)
            else if (animState === 'arms_crossed') {
                // Left & right arms folded firmly over the chest
                ctx.fillStyle = bodyColor;
                ctx.beginPath();
                ctx.roundRect(-16, 22 - bob, 32, 12, [5, 5, 8, 8]);
                ctx.fill();
                ctx.stroke();

                // Forearm fold crease
                ctx.strokeStyle = '#020617';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-12, 28 - bob);
                ctx.lineTo(12, 28 - bob);
                ctx.stroke();

                // Tucked hands with finger knuckles
                ctx.fillStyle = skinColor;
                ctx.beginPath();
                ctx.arc(-14, 27 - bob, 4, 0, Math.PI * 2);
                ctx.arc(14, 27 - bob, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
            // 4. Cheering Friends
            else if (animState === 'cheer') {
                const wave = Math.sin(time * 12 + x) * 6;
                ctx.beginPath();
                ctx.moveTo(-8, 18 - bob);
                ctx.lineTo(-18, 4 - bob + wave);
                ctx.lineTo(-14, -8 - bob + wave);
                ctx.moveTo(8, 18 - bob);
                ctx.lineTo(18, 4 - bob - wave);
                ctx.lineTo(14, -8 - bob - wave);
                ctx.stroke();
            }
            // 5. Pointing & Laughing
            else if (animState === 'point') {
                ctx.beginPath();
                ctx.moveTo(-8, 18 - bob);
                ctx.lineTo(-14, 30 - bob);
                ctx.moveTo(8, 18 - bob);
                ctx.lineTo(24, 18 - bob);
                ctx.lineTo(32, 17 - bob);
                ctx.stroke();
            }
            // 6. Stomach Laughing
            else if (animState === 'laugh') {
                const shake = Math.sin(time * 20) * 3;
                ctx.beginPath();
                ctx.moveTo(-8, 18 - bob);
                ctx.lineTo(-3, 30 - bob + shake);
                ctx.moveTo(8, 18 - bob);
                ctx.lineTo(3, 30 - bob + shake);
                ctx.stroke();
            }
            // 7. Paper Thrower
            else if (animState === 'throw') {
                ctx.beginPath();
                ctx.moveTo(-7, 18 - bob);
                ctx.lineTo(-14, 32 - bob);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(7, 18 - bob);
                if (throwProgress < 0.4) {
                    ctx.lineTo(0, 4 - bob);
                    ctx.lineTo(-8, 0 - bob);
                } else {
                    ctx.lineTo(18, 6 - bob);
                    ctx.lineTo(28, 14 - bob);
                }
                ctx.stroke();
            }
            // 8. Martial Arts Sparring / Boxing
            else if (animState === 'boxing') {
                const jab = Math.sin(time * 14) * 8;
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(-8, 18 - bob);
                ctx.lineTo(6, 16 - bob);
                ctx.lineTo(18 + jab, 16 - bob);
                ctx.moveTo(8, 18 - bob);
                ctx.lineTo(14, 22 - bob);
                ctx.lineTo(20 - jab * 0.5, 24 - bob);
                ctx.stroke();
            }
            // 9. Ramen eating
            else if (animState === 'eat') {
                ctx.beginPath();
                ctx.moveTo(-8, 18 - bob);
                ctx.lineTo(-2, 26 - bob);
                ctx.lineTo(4, 24 - bob);
                ctx.moveTo(8, 18 - bob);
                ctx.lineTo(6, 26 - bob);
                ctx.stroke();
                // Ramen bowl
                ctx.fillStyle = '#f87171';
                ctx.beginPath();
                ctx.arc(4, 24 - bob, 7, 0, Math.PI);
                ctx.fill();
            }
            // 10. Study Cramming Book
            else if (animState === 'read') {
                ctx.beginPath();
                ctx.moveTo(-8, 18 - bob);
                ctx.lineTo(-3, 24 - bob);
                ctx.moveTo(8, 18 - bob);
                ctx.lineTo(3, 24 - bob);
                ctx.stroke();
                // Open Textbook
                ctx.fillStyle = '#38bdf8';
                ctx.beginPath();
                ctx.roundRect(-6, 20 - bob, 12, 9, 1);
                ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-5, 21 - bob, 4, 7);
                ctx.fillRect(1, 21 - bob, 4, 7);
            }
            // 11. Acoustic/Electric Guitar Shredder (Floor 3/6/8)
            else if (animState === 'guitar') {
                const strum = Math.sin(time * 16) * 4;
                // Neck fretting left hand
                ctx.beginPath();
                ctx.moveTo(-8, 18 - bob);
                ctx.lineTo(-22, 12 - bob);
                ctx.lineTo(-30, 6 - bob);
                ctx.stroke();
                // Right strumming hand
                ctx.beginPath();
                ctx.moveTo(8, 18 - bob);
                ctx.lineTo(2, 22 - bob + strum);
                ctx.lineTo(8, 28 - bob + strum);
                ctx.stroke();

                // Guitar Body & Neck
                ctx.fillStyle = '#dc2626';
                ctx.strokeStyle = '#991b1b';
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.ellipse(8, 24 - bob, 12, 8, -0.4, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.strokeStyle = '#78350f';
                ctx.lineWidth = 3.5;
                ctx.beginPath();
                ctx.moveTo(4, 22 - bob);
                ctx.lineTo(-34, 4 - bob);
                ctx.stroke();
            }
            // 12. Smartphone Scrolling Delinquent (Floor 1/2/4)
            else if (animState === 'phone') {
                ctx.beginPath();
                ctx.moveTo(-8, 18 - bob);
                ctx.lineTo(-2, 26 - bob);
                ctx.moveTo(8, 18 - bob);
                ctx.lineTo(4, 24 - bob);
                ctx.stroke();
                // Glowing phone screen
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(0, 18 - bob, 8, 13);
                ctx.fillStyle = '#38bdf8';
                ctx.shadowColor = '#38bdf8';
                ctx.shadowBlur = 6;
                ctx.fillRect(1, 19 - bob, 6, 11);
                ctx.shadowBlur = 0;
            }
            // 13. Slumped Sleeping Student (Floor 4/5/8)
            else if (animState === 'sleep') {
                // Head drooped resting on crossed arms
                ctx.fillStyle = bodyColor;
                ctx.beginPath();
                ctx.roundRect(-14, 24 - bob, 28, 14, [4, 4, 6, 6]);
                ctx.fill();
                ctx.stroke();
            }
            // 14. Shinai Kendo Sword Practice (Floor 6)
            else if (animState === 'kendo_practice') {
                const slash = Math.sin(time * 8) * 12;
                ctx.beginPath();
                ctx.moveTo(-8, 18 - bob);
                ctx.lineTo(4, 8 - bob + slash * 0.3);
                ctx.moveTo(8, 18 - bob);
                ctx.lineTo(12, 10 - bob + slash * 0.3);
                ctx.stroke();
                // Bamboo Shinai
                ctx.strokeStyle = '#fef08a';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(8, 10 - bob + slash * 0.3);
                ctx.lineTo(28 + slash, -18 - bob + slash * 0.5);
                ctx.stroke();
            }
            // 15. Delinquent Spray Paint Graffiti Tagging (Floor 2/3)
            else if (animState === 'graffiti_tagger') {
                const sprayWiggle = Math.sin(time * 24) * 4;
                ctx.beginPath();
                ctx.moveTo(-8, 18 - bob);
                ctx.lineTo(-14, 28 - bob);
                ctx.moveTo(8, 18 - bob);
                ctx.lineTo(16, 12 - bob);
                ctx.lineTo(24 + sprayWiggle, 8 - bob);
                ctx.stroke();
                // Neon spray paint can
                ctx.fillStyle = '#06b6d4';
                ctx.fillRect(23 + sprayWiggle, 4 - bob, 7, 13);
                ctx.fillStyle = '#f43f5e';
                ctx.fillRect(24 + sprayWiggle, 1 - bob, 4, 3); // Spray nozzle
                // Spray mist cloud
                ctx.fillStyle = 'rgba(6, 182, 212, 0.45)';
                ctx.beginPath();
                ctx.arc(36 + sprayWiggle, 2 - bob, 6 + Math.sin(time * 12) * 3, 0, Math.PI * 2);
                ctx.fill();
            }
            // 16. Default Idle
            else {
                ctx.beginPath();
                ctx.moveTo(-8, 18 - bob);
                ctx.lineTo(-14, 34 - bob);
                ctx.moveTo(8, 18 - bob);
                ctx.lineTo(14, 34 - bob);
                ctx.stroke();
            }

            ctx.restore();
        };

        // =========================================================================
        // DYNAMIC SWITCHING IDLE ANIMATIONS (FLOOR 1 TO 8 - PURE ENGLISH DIALOGUE)
        // =========================================================================

        // --- ANIMATION 1: BALD TEACHER CHASING 5 STUDENTS (Active on Floor 1 & 5) ---
        // Older, taller teacher (1.25x scale, suit & tie, glasses, mustache) chasing 5 distinct students
        if (floor === 1 || floor === 5) {
            const chaseLoop = (time * 150) % (this.width + 900) - 350;
            const studentsConfig = [
                { offset: 0,   color: '#0284c7', pants: '#1e293b', hair: '#0f172a', style: 'spiky',      phaseOff: 0.0, shout: '😂 CANNOT CATCH ME!' },
                { offset: 55,  color: '#16a34a', pants: '#1e293b', hair: '#ca8a04', style: 'curly',      phaseOff: 1.2, shout: '🏃‍♂️ TOO SLOW, SIR!' },
                { offset: 110, color: '#ea580c', pants: '#0f172a', hair: '#1e1b4b', style: 'pompadour', phaseOff: 2.1, shout: '' },
                { offset: 165, color: '#ec4899', pants: '#1e293b', hair: '#b45309', style: 'twin_tails', phaseOff: 3.0, shout: '💨 RUN FASTER!' },
                { offset: 220, color: '#7c3aed', pants: '#0f172a', hair: '#0f172a', style: 'sidepart',   phaseOff: 4.1, shout: '' }
            ];
            const teacherX = chaseLoop - 350;

            // Draw 5 Chased Students
            studentsConfig.forEach(st => {
                const sx = chaseLoop - st.offset;
                if (sx > -60 && sx < this.width + 60) {
                    const runP = time * 18 + st.phaseOff;
                    drawAnatomicalChar(sx, baseY - 78, 1, {
                        bodyColor: st.color,
                        pantsColor: st.pants,
                        hairColor: st.hair,
                        hairStyle: st.style,
                        animState: 'run',
                        animPhase: runP,
                        scale: 0.95
                    });
                    if (st.shout) {
                        ctx.fillStyle = '#fef08a';
                        ctx.font = 'bold 11px "Outfit", sans-serif';
                        ctx.fillText(st.shout, sx - 25, baseY - 90);
                    }
                }
            });

            // Draw Older, Bigger Bald Teacher Chasing with Yardstick
            if (teacherX > -100 && teacherX < this.width + 100) {
                const tLeg = time * 15;
                drawAnatomicalChar(teacherX, baseY - 92, 1, {
                    bodyColor: '#334155',
                    pantsColor: '#0f172a',
                    hairStyle: 'bald',
                    isTeacher: true,
                    hasGlasses: true,
                    hasBeard: true,
                    isAngry: true,
                    animState: 'ruler_chase',
                    animPhase: tLeg,
                    scale: 1.25 // Slightly bigger & older authority figure
                });
                ctx.fillStyle = '#f87171';
                ctx.font = '900 12px "Outfit", sans-serif';
                ctx.fillText('💢 HALT RIGHT THERE, DETENTION!!', teacherX - 45, baseY - 105);
            }
        }

        // --- ANIMATION 2: DISRESPECTFUL SMOKING DUO (Active on Floor 1, 4, 7) ---
        // 1 Sitting slouched smoker + 1 Standing partner with arms crossed in disrespect
        if (floor === 1 || floor === 4 || floor === 7) {
            const sitX = 210;
            const sitY = baseY - 14;
            ctx.save();

            // Floor Contact Shadow for Crate & Sitting Delinquent
            ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
            ctx.beginPath();
            ctx.ellipse(sitX + 12, sitY + 2, 28, 7, 0, 0, Math.PI * 2);
            ctx.fill();

            // Overturned school storage box / crate
            ctx.fillStyle = '#b45309';
            ctx.beginPath();
            ctx.roundRect(sitX - 22, sitY - 26, 26, 26, 3);
            ctx.fill();
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // --- SMOKER 1 (Sitting Slouched on Ground / Crate) ---
            ctx.save();
            ctx.translate(sitX, sitY);

            // Extended lazy straight leg
            ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 9; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(-2, -6); ctx.lineTo(26, -2); ctx.lineTo(44, -1); ctx.stroke();
            ctx.fillStyle = '#e2e8f0'; ctx.beginPath(); ctx.ellipse(44, -2, 6, 4, 0.2, 0, Math.PI * 2); ctx.fill();

            // Raised knee with attitude
            ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 9.5;
            ctx.beginPath(); ctx.moveTo(2, -6); ctx.lineTo(16, -28); ctx.lineTo(22, -1); ctx.stroke();
            ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.ellipse(23, -1, 6, 4, 0, 0, Math.PI * 2); ctx.fill();

            // Slouched dark jacket
            ctx.fillStyle = '#1e1b4b'; ctx.beginPath(); ctx.roundRect(-14, -38, 22, 34, [8, 8, 4, 4]); ctx.fill();
            ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(-8, -34, 10, 22, 2); ctx.fill();

            // Gold chain
            ctx.strokeStyle = '#eab308'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(-3, -28, 5, 0.2, Math.PI - 0.2); ctx.stroke();

            // Head & Smirking expression (Head center at x: -2, y: -48, radius: 11)
            ctx.fillStyle = '#fed7aa'; ctx.beginPath(); ctx.arc(-2, -48, 11, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#eab308'; // Blonde Delinquent Hair
            ctx.beginPath(); ctx.arc(-3, -52, 11, Math.PI * 0.75, Math.PI * 2.2); ctx.lineTo(8, -50); ctx.lineTo(4, -43); ctx.lineTo(-8, -46); ctx.fill();

            ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(1, -48); ctx.lineTo(7, -46); ctx.stroke(); // Smirking eye
            ctx.beginPath(); ctx.moveTo(2, -43); ctx.quadraticCurveTo(5, -44, 7, -41); ctx.stroke(); // Mouth crease

            // Arms & Lit cigarette - Anatomically positioned directly in front of the mouth at (6, -42)
            ctx.strokeStyle = '#1e1b4b'; ctx.lineWidth = 6; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(-10, -32); ctx.lineTo(-24, -22); ctx.lineTo(-24, -8); ctx.stroke(); // Resting left arm

            ctx.strokeStyle = '#fed7aa'; ctx.lineWidth = 5;
            ctx.beginPath(); ctx.moveTo(-2, -30); ctx.lineTo(10, -32); ctx.lineTo(7, -41); ctx.stroke(); // Right arm holding cigarette to lips

            // Cigarette shaft & cherry burning tip directly emerging from mouth at (6, -42)
            ctx.fillStyle = '#f59e0b'; ctx.fillRect(6, -43.5, 4, 3); // Filter
            ctx.fillStyle = '#ffffff'; ctx.fillRect(10, -43.5, 9, 3); // Paper tube
            ctx.fillStyle = '#ef4444'; ctx.fillRect(19, -43.5, 3, 3); // Burning cherry tip
            ctx.shadowColor = '#f43f5e'; ctx.shadowBlur = 8;
            ctx.beginPath(); ctx.arc(21, -42, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;

            ctx.fillStyle = '#94a3b8'; ctx.font = 'italic bold 10px "Outfit", sans-serif';
            ctx.fillText('...tch 🚬', -14, -64);

            // Billowing smoke puffs rising from cigarette tip at (21, -42)
            for (let s = 0; s < 5; s++) {
                const sProg = (time * 0.6 + s * 0.28) % 1.5;
                const sx = 22 + sProg * 28 + Math.sin(time * 2.2 + s * 1.5) * 6;
                const sy = -44 - sProg * 58;
                const sAlpha = Math.max(0, 1 - sProg / 1.4) * 0.5;
                ctx.fillStyle = `rgba(226, 232, 240, ${sAlpha})`;
                ctx.beginPath(); ctx.arc(sx, sy, 3 + sProg * 9, 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
            ctx.restore();

            // --- SMOKER 2 (Standing Partner Leaning Against Lockers with Arms Folded) ---
            const standX = sitX + 70;
            drawAnatomicalChar(standX, baseY - 82, -1, {
                bodyColor: '#431407', // Dark rebel bomber jacket
                pantsColor: '#0f172a',
                skinColor: '#fed7aa',
                hairColor: '#b45309',
                hairStyle: 'pompadour',
                animState: 'arms_crossed', // Disrespectful folded arms
                lean: 0.08, // Leaning back on lockers
                scale: 1.05
            });

            // Smoker 2 Cigarette in Mouth & Smoke Trail (Aligned with head at drawAnatomicalChar center)
            // Head is at y: 4 - bob relative to center; facing -1 puts mouth at roughly x: -7, y: 3
            ctx.save();
            ctx.translate(standX, baseY - 82);
            const cigMouthX = -6;
            const cigMouthY = 3;
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(cigMouthX - 3, cigMouthY - 1.5, 3, 2.5); // Filter in mouth
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(cigMouthX - 11, cigMouthY - 1.5, 8, 2.5); // Cigarette body
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(cigMouthX - 14, cigMouthY - 1.5, 3, 2.5); // Lit cherry
            ctx.shadowColor = '#f43f5e';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(cigMouthX - 14, cigMouthY - 0.25, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            for (let s = 0; s < 4; s++) {
                const sProg = (time * 0.5 + s * 0.3) % 1.4;
                const sx = (cigMouthX - 14) - sProg * 20 + Math.sin(time * 2.0 + s) * 5;
                const sy = (cigMouthY - 1) - sProg * 45;
                const sAlpha = Math.max(0, 1 - sProg / 1.3) * 0.45;
                ctx.fillStyle = `rgba(226, 232, 240, ${sAlpha})`;
                ctx.beginPath();
                ctx.arc(sx, sy, 2.5 + sProg * 6, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = '#cbd5e1';
            ctx.font = 'bold 10px "Outfit", sans-serif';
            ctx.fillText('Whatever... 🚬', -26, -14);
            ctx.restore();
        }

        // --- ANIMATION 3: PAPER BASKETBALL GAME (Active on Floor 1, 3, 6) ---
        if (floor === 1 || floor === 3 || floor === 6) {
            const throwerX = 1200;
            const binX = 1380;
            const binY = baseY - 14;
            const tCycle = 4.0;
            const tTime = time % tCycle;

            // Stainless Steel Trash Bin
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.beginPath(); ctx.ellipse(binX + 16, binY, 20, 6, 0, 0, Math.PI * 2); ctx.fill();
            const binGrad = ctx.createLinearGradient(binX, binY - 45, binX + 32, binY);
            binGrad.addColorStop(0, '#94a3b8'); binGrad.addColorStop(0.4, '#e2e8f0'); binGrad.addColorStop(1, '#475569');
            ctx.fillStyle = binGrad; ctx.strokeStyle = '#334155'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.roundRect(binX, binY - 45, 32, 45, [4, 4, 6, 6]); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#cbd5e1'; ctx.beginPath(); ctx.ellipse(binX + 16, binY - 45, 17, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.ellipse(binX + 16, binY - 45, 13, 3.5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#22c55e'; ctx.font = '900 12px "Outfit", sans-serif'; ctx.fillText('♻️', binX + 9, binY - 18);
            ctx.restore();

            const isAiming = tTime < 0.6;
            const isRelease = tTime >= 0.6 && tTime < 1.0;

            drawAnatomicalChar(throwerX, baseY - 80, 1, {
                bodyColor: '#7c3aed',
                pantsColor: '#0f172a',
                hairColor: '#1e1b4b',
                hairStyle: 'pompadour',
                animState: 'throw',
                throwProgress: isAiming ? 0.2 : 0.8,
                lean: isAiming ? -0.08 : 0.1
            });

            // Friends Cheering & Pointing
            drawAnatomicalChar(throwerX + 48, baseY - 80, 1, {
                bodyColor: '#ea580c', pantsColor: '#1e293b', hairColor: '#78350f',
                hairStyle: 'spiky', animState: 'cheer'
            });

            drawAnatomicalChar(binX + 50, baseY - 80, -1, {
                bodyColor: '#059669', pantsColor: '#0f172a', hairColor: '#0f172a',
                hairStyle: 'sidepart', animState: 'point'
            });

            drawAnatomicalChar(binX + 90, baseY - 80, -1, {
                bodyColor: '#dc2626', pantsColor: '#1e293b', hairColor: '#eab308',
                hairStyle: 'curly', animState: 'laugh'
            });

            // Paper Flight Trajectory
            if (tTime >= 0.6 && tTime <= 2.8) {
                const flightProg = (tTime - 0.6) / 1.6;
                let pX, pY;
                if (flightProg <= 1.0) {
                    pX = (throwerX + 24) + flightProg * (binX + 16 - (throwerX + 24));
                    const arcHeight = Math.sin(flightProg * Math.PI) * 110;
                    pY = (baseY - 55) - arcHeight + flightProg * 5;
                } else {
                    const bounceProg = (tTime - 2.2) / 0.6;
                    pX = binX + 16 + Math.sin(bounceProg * Math.PI) * 4;
                    pY = (baseY - 50) + Math.abs(Math.sin(bounceProg * Math.PI * 2)) * 6;
                }
                ctx.save();
                ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.2;
                ctx.beginPath(); ctx.arc(pX, pY, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                ctx.restore();
            }

            if (tTime >= 2.0 && tTime < 3.8) {
                const isSwish = Math.floor(time / tCycle) % 2 === 0;
                ctx.fillStyle = isSwish ? '#facc15' : '#38bdf8';
                ctx.font = '900 11px "Outfit", sans-serif';
                ctx.fillText(isSwish ? '🔥 3-POINTER! SWISH!' : '🤣 COMPLETELY MISSED!', binX - 25, baseY - 94);
            }
        }

        // --- ANIMATION 4: CAFETERIA FOOD FIGHT (Active on Floor 2) ---
        if (floor === 2) {
            const tableX = 750;
            ctx.save();
            ctx.fillStyle = '#0284c7';
            ctx.beginPath(); ctx.roundRect(tableX - 35, baseY - 46, 90, 8, 3); ctx.fill();
            ctx.fillStyle = '#64748b';
            ctx.fillRect(tableX - 30, baseY - 38, 6, 24);
            ctx.fillRect(tableX + 44, baseY - 38, 6, 24);

            drawAnatomicalChar(tableX - 15, baseY - 78, 1, {
                bodyColor: '#f97316', pantsColor: '#1e293b', hairColor: '#0f172a',
                hairStyle: 'spiky', animState: 'eat'
            });

            const fCycle = 2.5;
            const fProg = (time % fCycle) / fCycle;
            drawAnatomicalChar(tableX + 45, baseY - 78, -1, {
                bodyColor: '#8b5cf6', pantsColor: '#0f172a', hairColor: '#b45309',
                hairStyle: 'curly', animState: 'throw', throwProgress: fProg
            });

            if (fProg > 0.3 && fProg < 0.85) {
                const mProg = (fProg - 0.3) / 0.55;
                const mX = (tableX + 35) - mProg * 65;
                const mY = (baseY - 55) - Math.sin(mProg * Math.PI) * 40;
                ctx.fillStyle = '#b91c1c';
                ctx.beginPath(); ctx.arc(mX, mY, 4.5, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#ef4444'; ctx.fillRect(mX + 4, mY - 1, 8, 2);
            }

            ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 11px "Outfit", sans-serif';
            ctx.fillText('🍜 FLYING DUMPLING ATTACK!', tableX - 45, baseY - 96);
            ctx.restore();
        }

        // --- ANIMATION 5: DOJO SPARRING (Active on Floor 3 & 6) ---
        if (floor === 3 || floor === 6) {
            const dojoX = 820;
            drawAnatomicalChar(dojoX, baseY - 80, 1, {
                bodyColor: '#ffffff', pantsColor: '#0f172a', hairColor: '#0f172a',
                hairStyle: 'bandana', animState: 'boxing'
            });

            drawAnatomicalChar(dojoX + 75, baseY - 80, -1, {
                bodyColor: '#ffffff', pantsColor: '#0f172a', hairColor: '#ca8a04',
                hairStyle: 'spiky', animState: 'boxing'
            });

            ctx.fillStyle = '#f43f5e'; ctx.font = '900 11px "Outfit", sans-serif';
            ctx.fillText('🥋 FOCUS & STRIKE!!', dojoX + 4, baseY - 96);
        }

        // --- ANIMATION 6: LOCKER BUCKET TRAP (Active on Floor 4 & 7) ---
        if (floor === 4 || floor === 7) {
            const prankX = 860;
            const pCycle = 3.5;
            const pProg = (time % pCycle);

            drawAnatomicalChar(prankX - 50, baseY - 80, 1, {
                bodyColor: '#10b981', pantsColor: '#1e293b', hairColor: '#0f172a',
                hairStyle: 'pompadour', animState: 'laugh'
            });

            drawAnatomicalChar(prankX + 20, baseY - 80, -1, {
                bodyColor: '#6366f1', pantsColor: '#0f172a', hairColor: '#eab308',
                hairStyle: 'sidepart', animState: 'idle'
            });

            if (pProg > 1.8 && pProg < 3.2) {
                const dropProg = Math.min(1.0, (pProg - 1.8) / 0.6);
                const bY = (baseY - 130) + dropProg * 75;
                ctx.save();
                ctx.fillStyle = '#38bdf8';
                ctx.beginPath(); ctx.roundRect(prankX + 12, bY, 18, 16, 2); ctx.fill();
                if (dropProg >= 0.95) {
                    ctx.fillStyle = '#67e8f9';
                    for (let d = 0; d < 6; d++) {
                        const dx = prankX + 21 + Math.sin(d * 1.1 + time * 10) * 16;
                        const dy = bY + 12 + Math.cos(d * 1.1) * 8;
                        ctx.beginPath(); ctx.arc(dx, dy, 2.5, 0, Math.PI * 2); ctx.fill();
                    }
                }
                ctx.restore();
            }

            ctx.fillStyle = '#e0e7ff'; ctx.font = 'bold 11px "Outfit", sans-serif';
            ctx.fillText(pProg > 2.0 ? '💦 SPLASH DOWN!!' : '🤫 Shh... watch this!', prankX - 25, baseY - 96);
        }

        // --- ANIMATION 7: SCIENCE LAB EXPLOSIVE CONCOCTION (Active on Floor 7) ---
        // Student trying to brew a volatile chemical concoction which explodes every cycle!
        // Deals 20 damage to player & enemies within 140px of explosion!
        if (floor === 7) {
            const labX = 480;
            const cycle = 5.0;
            const labTime = time % cycle; // 0.0s to 5.0s cycle
            const isMixing = labTime < 3.2;
            const isExploding = labTime >= 3.2 && labTime < 4.4;

            // Lab Bench with glassware, Bunsen burner & conduits
            ctx.save();
            ctx.fillStyle = '#334155';
            ctx.beginPath(); ctx.roundRect(labX - 35, baseY - 46, 95, 8, 3); ctx.fill();
            ctx.fillStyle = '#1e293b'; ctx.fillRect(labX - 30, baseY - 38, 6, 26); ctx.fillRect(labX + 50, baseY - 38, 6, 26);

            // Bunsen Burner flame under flask
            ctx.fillStyle = '#0284c7';
            ctx.fillRect(labX + 2, baseY - 50, 10, 4);
            ctx.fillStyle = isExploding ? '#ef4444' : '#38bdf8';
            ctx.beginPath();
            ctx.ellipse(labX + 7, baseY - 54, 3, isExploding ? 8 : 5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Erlenmeyer Concoction Flask
            const liquidColor = isExploding ? '#ef4444' : (labTime < 1.6 ? '#8b5cf6' : '#22c55e');
            ctx.fillStyle = liquidColor;
            ctx.beginPath();
            ctx.moveTo(labX + 3, baseY - 64);
            ctx.lineTo(labX + 11, baseY - 64);
            ctx.lineTo(labX + 19, baseY - 46);
            ctx.lineTo(labX - 5, baseY - 46);
            ctx.closePath();
            ctx.fill();

            // Active chemical bubbling
            if (isMixing) {
                for (let b = 0; b < 4; b++) {
                    const bProg = (time * 2.0 + b * 0.3) % 1.0;
                    const bx = labX + 7 + Math.sin(time * 6 + b) * 6;
                    const by = (baseY - 64) - bProg * 28;
                    ctx.fillStyle = `rgba(168, 85, 247, ${1 - bProg})`;
                    ctx.beginPath(); ctx.arc(bx, by, 2 + bProg * 3, 0, Math.PI * 2); ctx.fill();
                }
            }

            // Student Brewer (Flipping from focused stir to soot-covered blown back)
            if (isMixing) {
                drawAnatomicalChar(labX + 48, baseY - 80, -1, {
                    bodyColor: '#f8fafc', // White lab coat
                    pantsColor: '#0f172a',
                    hairColor: '#1e1b4b',
                    hairStyle: 'spiky',
                    hasGlasses: true,
                    animState: 'idle'
                });
                ctx.fillStyle = '#a855f7'; ctx.font = 'bold 11px "Outfit", sans-serif';
                ctx.fillText('🧪 Mixing volatile compound...', labX - 35, baseY - 92);
            } else if (isExploding) {
                // Blown backwards into soot shock!
                const blastProg = (labTime - 3.2) / 1.2;
                drawAnatomicalChar(labX + 58 + blastProg * 20, baseY - 78, -1, {
                    bodyColor: '#1e293b', // Charred lab coat
                    pantsColor: '#0f172a',
                    skinColor: '#475569', // Soot covered face
                    hairColor: '#020617', // Scorched hair
                    hairStyle: 'spiky',
                    hasGlasses: true,
                    animState: 'laugh',
                    lean: 0.25 // Blown back angle
                });

                // Fiery Chemical Mushroom Shockwave Blast
                const blastRadius = 25 + blastProg * 65;
                const blastAlpha = Math.max(0, 1 - blastProg);
                ctx.save();
                ctx.shadowColor = '#f97316';
                ctx.shadowBlur = 24;

                const blastGrad = ctx.createRadialGradient(labX + 7, baseY - 65, 2, labX + 7, baseY - 65, blastRadius);
                blastGrad.addColorStop(0, `rgba(255, 255, 255, ${blastAlpha})`);
                blastGrad.addColorStop(0.25, `rgba(250, 204, 21, ${blastAlpha})`);
                blastGrad.addColorStop(0.6, `rgba(239, 68, 68, ${blastAlpha * 0.9})`);
                blastGrad.addColorStop(1, `rgba(30, 41, 59, 0)`);
                ctx.fillStyle = blastGrad;
                ctx.beginPath();
                ctx.arc(labX + 7, baseY - 65, blastRadius, 0, Math.PI * 2);
                ctx.fill();

                // Billowing soot clouds
                for (let s = 0; s < 8; s++) {
                    const angle = (s / 8) * Math.PI * 2;
                    const dist = blastRadius * 0.7;
                    const sx = labX + 7 + Math.cos(angle) * dist;
                    const sy = baseY - 65 + Math.sin(angle) * dist * 0.7;
                    ctx.fillStyle = `rgba(15, 23, 42, ${blastAlpha * 0.6})`;
                    ctx.beginPath(); ctx.arc(sx, sy, 10 + blastProg * 14, 0, Math.PI * 2); ctx.fill();
                }
                ctx.restore();

                ctx.fillStyle = '#ef4444'; ctx.font = '900 12px "Outfit", sans-serif';
                ctx.fillText('💥 CRITICAL CHEMICAL DETONATION (-20 HP)!', labX - 65, baseY - 105);

                // Check Explosion Proximity Damage (-20 HP to Player and Enemies in 140px range)
                const currentEpoch = Math.floor(Date.now() / (cycle * 1000));
                if (this.lastLabExplosionEpoch !== currentEpoch) {
                    this.lastLabExplosionEpoch = currentEpoch;
                    if (window.soundEngine && window.soundEngine.playHit) {
                        window.soundEngine.playHit('heavy', true);
                    }

                    if (window.gameEngine) {
                        const engine = window.gameEngine;
                        const explosionCenter = labX + 7;
                        const blastDamage = 20;

                        // Check Player damage
                        if (engine.player && Math.abs(engine.player.x - explosionCenter) <= 140) {
                            engine.player.hp = Math.max(1, engine.player.hp - blastDamage);
                            if (engine.vfx) {
                                engine.vfx.addDamageText(engine.player.x, engine.player.y, `-20 💥 LAB EXPLOSION!`, true, true);
                                engine.vfx.addSpark(engine.player.x, engine.player.y + 30, '#ef4444', 12, 220);
                            }
                            if (engine.triggerScreenShake) engine.triggerScreenShake(10, 0.25);
                        }

                        // Check Enemies damage
                        if (engine.enemies) {
                            engine.enemies.forEach(enemy => {
                                if (enemy.state !== 'ko' && Math.abs(enemy.x - explosionCenter) <= 140) {
                                    enemy.takeDamage(blastDamage, explosionCenter, 280, 0.6, engine.vfx, 'lab_explosion');
                                }
                            });
                        }
                    }
                }
            } else {
                // Post-explosion charred recovery
                drawAnatomicalChar(labX + 52, baseY - 80, -1, {
                    bodyColor: '#334155',
                    pantsColor: '#0f172a',
                    hairColor: '#020617',
                    hairStyle: 'spiky',
                    animState: 'idle'
                });
                ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 10px "Outfit", sans-serif';
                ctx.fillText('...cough, cough! Need more catalyst...', labX - 45, baseY - 92);
            }
            ctx.restore();
        }

        // --- ANIMATION 8: ROCK BAND GUITAR SHREDDER (Active on Floor 3 & 8) ---
        if (floor === 3 || floor === 8) {
            const guitarX = 1080;
            drawAnatomicalChar(guitarX, baseY - 80, 1, {
                bodyColor: '#dc2626', pantsColor: '#0f172a', hairColor: '#1e1b4b',
                hairStyle: 'bandana', animState: 'guitar'
            });

            // Music notes floating
            for (let n = 0; n < 3; n++) {
                const nProg = (time * 1.5 + n * 0.35) % 1.2;
                const nx = guitarX + 22 + Math.sin(time * 3 + n) * 12;
                const ny = (baseY - 95) - nProg * 40;
                ctx.fillStyle = `rgba(239, 68, 68, ${1 - nProg})`;
                ctx.font = 'bold 13px "Outfit", sans-serif';
                ctx.fillText(n % 2 === 0 ? '🎸 ♫' : '⚡ ♬', nx, ny);
            }
        }

        // --- ANIMATION 9: STUDY HALL CRAMMING & DESK SLEEPER (Active on Floor 5) ---
        if (floor === 5) {
            const studyX = 720;
            const sleepX = 840;

            // Study Desk
            ctx.save();
            ctx.fillStyle = '#78350f';
            ctx.beginPath(); ctx.roundRect(studyX - 25, baseY - 46, 170, 8, 3); ctx.fill();
            ctx.fillStyle = '#451a03'; ctx.fillRect(studyX - 20, baseY - 38, 6, 26); ctx.fillRect(studyX + 138, baseY - 38, 6, 26);
            ctx.restore();

            // Diligent Student Cramming
            drawAnatomicalChar(studyX, baseY - 80, 1, {
                bodyColor: '#0284c7', pantsColor: '#1e293b', hairColor: '#0f172a',
                hairStyle: 'sidepart', animState: 'read'
            });
            ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 11px "Outfit", sans-serif';
            ctx.fillText('📖 UTBK PK 2026: Algebra & Logic', studyX - 35, baseY - 92);

            // Exhausted Student Sleeping on Desk
            drawAnatomicalChar(sleepX, baseY - 74, 1, {
                bodyColor: '#6366f1', pantsColor: '#0f172a', hairColor: '#b45309',
                hairStyle: 'curly', animState: 'sleep'
            });
            ctx.fillStyle = '#c7d2fe'; ctx.font = 'bold 12px "Outfit", sans-serif';
            ctx.fillText('💤 zZZ...', sleepX + 8, baseY - 92);
        }

        // --- ANIMATION 10: SMARTPHONE TEXTING SQUAD (Active on Floor 1 & 4) ---
        if (floor === 1 || floor === 4) {
            const phoneX = 640;
            drawAnatomicalChar(phoneX, baseY - 80, 1, {
                bodyColor: '#059669', pantsColor: '#1e293b', hairColor: '#eab308',
                hairStyle: 'sidepart', animState: 'phone'
            });
            ctx.fillStyle = '#34d399'; ctx.font = 'bold 10px "Outfit", sans-serif';
            ctx.fillText('📱 "Anyone seen Beast Baldy?"', phoneX - 35, baseY - 92);
        }

        // --- ANIMATION 11: SHINAI KENDO SWORD TRAINING (Active on Floor 6) ---
        if (floor === 6) {
            const kendoX = 420;
            drawAnatomicalChar(kendoX, baseY - 80, 1, {
                bodyColor: '#f8fafc', pantsColor: '#0f172a', hairColor: '#0f172a',
                hairStyle: 'bandana', animState: 'kendo_practice'
            });
            ctx.fillStyle = '#fde047'; ctx.font = '900 11px "Outfit", sans-serif';
            ctx.fillText('🎋 MEN! DOU! KOTE!!', kendoX - 25, baseY - 92);
        }

        // --- ANIMATION 12: DELINQUENT WALL GRAFFITI TAGGER (Active on Floor 2) ---
        if (floor === 2) {
            const taggerX = 1260;
            drawAnatomicalChar(taggerX, baseY - 80, 1, {
                bodyColor: '#18181b', pantsColor: '#0f172a', hairColor: '#ef4444',
                hairStyle: 'spiky', animState: 'graffiti_tagger'
            });
            ctx.fillStyle = '#38bdf8'; ctx.font = '900 11px "Outfit", sans-serif';
            ctx.fillText('🎨 SUNGKYUN REBELS FTW!', taggerX - 45, baseY - 92);
        }
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
            } else if (prop.type === 'warning_sign') {
                ctx.fillStyle = '#facc15';
                ctx.strokeStyle = '#eab308';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(prop.x, prop.y, 130, 36, 6);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#78350f';
                ctx.font = '900 12px "Outfit", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(prop.text || '⚠️ CAUTION', prop.x + 65, prop.y + 22);
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
            } else if (prop.type === 'soda_bottle') {
                ctx.fillStyle = prop.color || '#38bdf8';
                ctx.fillRect(prop.x, prop.y, 8, 16);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(prop.x + 2, prop.y - 3, 4, 3);
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

