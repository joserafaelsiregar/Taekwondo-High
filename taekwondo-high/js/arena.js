// High School Arenas Renderer (Dynamic Backdrops, Prop Collisions, Atmosphere)

class ArenaManager {
    constructor() {
        this.currentFloor = 1;
        this.width = 1600;
        this.height = 700;
        this.groundY = 560; // baseline floor line
        this.props = [];
        this.theme = 'hallway'; // 'hallway', 'cafeteria', 'gym', 'rooftop'
        this.timeOfDay = 'afternoon'; // 'morning', 'afternoon', 'sunset', 'night'
        this.lightFlicker = 0;
        this.ambientParticles = [];
        this.initTheme(1);
    }

    initTheme(floor) {
        this.currentFloor = floor;
        this.ambientParticles = [];
        
        if (floor === 1) {
            this.theme = 'hallway';
            this.name = 'Floor 1: Main Lockers & Corridors';
            this.bgColor = '#1e293b';
            this.floorColor = '#334155';
            this.wallColor = '#0f172a';
            this.accentColor = '#38bdf8';
            this.timeOfDay = 'afternoon';
            this.generateHallwayProps();
        } else if (floor === 2) {
            this.theme = 'cafeteria';
            this.name = 'Floor 2: High School Cafeteria';
            this.bgColor = '#292524';
            this.floorColor = '#44403c';
            this.wallColor = '#1c1917';
            this.accentColor = '#f59e0b';
            this.timeOfDay = 'afternoon';
            this.generateCafeteriaProps();
        } else if (floor === 3) {
            this.theme = 'gym';
            this.name = 'Floor 3: High School Dojang & Gymnasium';
            this.bgColor = '#18181b';
            this.floorColor = '#713f12'; // polished wooden court
            this.wallColor = '#27272a';
            this.accentColor = '#ef4444';
            this.timeOfDay = 'sunset';
            this.generateGymProps();
        } else {
            this.theme = 'rooftop';
            this.name = 'Rooftop: Sunset Martial Arts Arena (Final)';
            this.bgColor = '#450a0a';
            this.floorColor = '#1c1917';
            this.wallColor = '#7f1d1d';
            this.accentColor = '#fbbf24';
            this.timeOfDay = 'sunset';
            this.generateRooftopProps();
        }

        // Spawn ambient dust / cherry blossoms / sparks
        for (let i = 0; i < 40; i++) {
            this.ambientParticles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 20 + (this.theme === 'rooftop' ? 30 : 5),
                vy: (Math.random() - 0.5) * 15 - (this.theme === 'rooftop' ? 10 : 0),
                size: Math.random() * 3 + 1,
                alpha: Math.random() * 0.6 + 0.2,
                color: this.theme === 'rooftop' ? '#fca5a5' : '#cbd5e1'
            });
        }
    }

    generateHallwayProps() {
        this.props = [];
        // Lockers along the wall
        for (let x = 60; x < this.width - 60; x += 180) {
            if (x > 650 && x < 950) continue; // Trophy case in middle
            this.props.push({
                type: 'lockers',
                x: x,
                y: this.groundY - 140,
                width: 140,
                height: 140,
                color: '#3b82f6',
                accent: '#1d4ed8'
            });
        }
        // Vending machine
        this.props.push({
            type: 'vending',
            x: 750,
            y: this.groundY - 160,
            width: 100,
            height: 160,
            lightGlow: '#06b6d4'
        });
        // Banners
        this.props.push({
            type: 'banner',
            x: 400,
            y: 120,
            text: '🥋 TAEKWONDO CLUB CHAMPIONSHIPS'
        });
        this.props.push({
            type: 'banner',
            x: 1100,
            y: 120,
            text: '⭐ VICTORY THROUGH DISCIPLINE'
        });
    }

    generateCafeteriaProps() {
        this.props = [];
        // Cafeteria tables
        for (let x = 120; x < this.width - 120; x += 320) {
            this.props.push({
                type: 'cafeteria_table',
                x: x,
                y: this.groundY - 60,
                width: 180,
                height: 60
            });
        }
        // Food bar & Snack Dispensers
        this.props.push({
            type: 'snack_bar',
            x: 700,
            y: this.groundY - 150,
            width: 220,
            height: 150
        });
    }

    generateGymProps() {
        this.props = [];
        // Tatami mats on floor
        this.props.push({
            type: 'tatami_ring',
            x: 300,
            y: this.groundY - 10,
            width: 1000,
            height: 20
        });
        // Punching bags
        this.props.push({ type: 'punching_bag', x: 220, y: this.groundY - 180, swing: 0, swingSpeed: 0 });
        this.props.push({ type: 'punching_bag', x: 1380, y: this.groundY - 180, swing: 0, swingSpeed: 0 });
        // Korean Taekwondo flags
        this.props.push({
            type: 'flag_taeguk',
            x: 800,
            y: 140,
            width: 180,
            height: 110
        });
    }

    generateRooftopProps() {
        this.props = [];
        // Rooftop fence
        this.props.push({
            type: 'chain_fence',
            x: 0,
            y: this.groundY - 200,
            width: this.width,
            height: 200
        });
        // AC Units / Water Tank
        this.props.push({ type: 'water_tank', x: 180, y: this.groundY - 210, width: 140, height: 210 });
        this.props.push({ type: 'vent_unit', x: 1320, y: this.groundY - 90, width: 120, height: 90 });
    }

    update(dt) {
        // Update ambient particles
        this.ambientParticles.forEach(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            if (p.x > this.width) p.x = 0;
            if (p.x < 0) p.x = this.width;
            if (p.y > this.groundY) p.y = 50;
            if (p.y < 0) p.y = this.groundY;
        });

        // Flickering lights
        this.lightFlicker = Math.sin(Date.now() * 0.005) * 0.05 + 0.95;

        // Swing punching bags
        this.props.forEach(prop => {
            if (prop.type === 'punching_bag') {
                prop.swing += prop.swingSpeed * dt;
                prop.swingSpeed *= 0.97; // damping
                if (Math.abs(prop.swing) > 0.01) {
                    prop.swing -= Math.sin(prop.swing) * dt * 4;
                }
            }
        });
    }

    renderBackground(ctx, camera) {
        // Sky / Wall background
        ctx.save();
        
        if (this.theme === 'rooftop') {
            // Sunset gradient with vibrant anime aesthetic
            const skyGrad = ctx.createLinearGradient(0, 0, 0, this.groundY);
            skyGrad.addColorStop(0, '#0f172a');
            skyGrad.addColorStop(0.25, '#312e81');
            skyGrad.addColorStop(0.55, '#831843');
            skyGrad.addColorStop(0.8, '#ea580c');
            skyGrad.addColorStop(1.0, '#fde047');
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, this.width, this.height);

            // Layered clouds
            ctx.fillStyle = 'rgba(251, 146, 60, 0.15)';
            for (let c = 0; c < 6; c++) {
                ctx.beginPath();
                ctx.ellipse(200 + c * 240, 140 + (c % 3) * 40, 160, 32, 0, 0, Math.PI * 2);
                ctx.fill();
            }

            // Distant Mountains Silhouette
            ctx.fillStyle = '#1e1b4b';
            ctx.beginPath();
            ctx.moveTo(0, this.groundY - 140);
            for (let mx = 0; mx <= this.width; mx += 150) {
                const my = this.groundY - 180 - Math.sin(mx * 0.008) * 60 - ((mx * 31) % 40);
                ctx.lineTo(mx, my);
            }
            ctx.lineTo(this.width, this.groundY);
            ctx.lineTo(0, this.groundY);
            ctx.closePath();
            ctx.fill();

            // Radiant Sun disk with layered glow
            const sunGlow = ctx.createRadialGradient(800, 240, 20, 800, 240, 180);
            sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
            sunGlow.addColorStop(0.4, 'rgba(249, 115, 22, 0.45)');
            sunGlow.addColorStop(1, 'rgba(234, 88, 12, 0)');
            ctx.fillStyle = sunGlow;
            ctx.fillRect(500, 40, 600, 400);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.beginPath();
            ctx.arc(800, 240, 55, 0, Math.PI * 2);
            ctx.fill();

            // City silhouette in background with architectural variance
            ctx.fillStyle = '#0f172a';
            for (let i = 0; i < 32; i++) {
                const bWidth = 60 + (i % 6) * 18;
                const bHeight = 130 + ((i * 47) % 210);
                const bX = i * 55 - 30;
                ctx.fillRect(bX, this.groundY - bHeight - 20, bWidth, bHeight + 20);
                
                // Antenna / Spire on skyscrapers
                if (i % 3 === 0) {
                    ctx.strokeStyle = '#334155';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(bX + bWidth / 2, this.groundY - bHeight - 20);
                    ctx.lineTo(bX + bWidth / 2, this.groundY - bHeight - 50);
                    ctx.stroke();
                    // Blinking red beacon
                    if (Math.floor(Date.now() / 600) % 2 === 0) {
                        ctx.fillStyle = '#ef4444';
                        ctx.beginPath();
                        ctx.arc(bX + bWidth / 2, this.groundY - bHeight - 52, 2.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

                // Glowing Windows in city
                ctx.fillStyle = 'rgba(254, 215, 170, 0.55)';
                for (let w = 0; w < 4; w++) {
                    for (let h = 0; h < 8; h++) {
                        if ((i * 3 + w + h * 2) % 4 === 0) {
                            ctx.fillRect(bX + 8 + w * 12, this.groundY - bHeight - 10 + h * 18, 5, 9);
                        }
                    }
                }
                ctx.fillStyle = '#0f172a';
            }
        } else {
            // Indoor school wall with rich gradient
            const wallGrad = ctx.createLinearGradient(0, 0, 0, this.groundY);
            wallGrad.addColorStop(0, this.wallColor);
            wallGrad.addColorStop(0.7, '#0f172a');
            wallGrad.addColorStop(1, '#020617');
            ctx.fillStyle = wallGrad;
            ctx.fillRect(0, 0, this.width, this.height);

            // Wall paneling / wainscoting line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, this.groundY - 170);
            ctx.lineTo(this.width, this.groundY - 170);
            ctx.stroke();

            // Hallway Windows / High lights with volumetric dust beams
            for (let x = 120; x < this.width; x += 280) {
                // Window frame
                ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
                ctx.fillRect(x, 50, 160, 150);
                
                // Sky outside window
                const winSky = ctx.createLinearGradient(x, 50, x, 200);
                winSky.addColorStop(0, '#0369a1');
                winSky.addColorStop(1, '#38bdf8');
                ctx.fillStyle = winSky;
                ctx.fillRect(x + 6, 56, 148, 138);

                // Window Muntin Bars
                ctx.strokeStyle = '#1e293b';
                ctx.lineWidth = 4;
                ctx.strokeRect(x, 50, 160, 150);
                ctx.beginPath();
                ctx.moveTo(x + 80, 50); ctx.lineTo(x + 80, 200);
                ctx.moveTo(x, 125); ctx.lineTo(x + 160, 125);
                ctx.stroke();

                // Volumetric light shaft casting down onto the floor
                const beamGrad = ctx.createLinearGradient(x, 200, x + 60, this.groundY);
                beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
                beamGrad.addColorStop(1, 'rgba(56, 189, 248, 0.01)');
                ctx.fillStyle = beamGrad;
                ctx.beginPath();
                ctx.moveTo(x + 10, 200);
                ctx.lineTo(x + 150, 200);
                ctx.lineTo(x + 260, this.groundY);
                ctx.lineTo(x - 60, this.groundY);
                ctx.closePath();
                ctx.fill();
            }

            // Fluorescent Ceiling Lights with Neon Bloom
            for (let x = 140; x < this.width; x += 320) {
                ctx.fillStyle = `rgba(224, 242, 254, ${0.95 * this.lightFlicker})`;
                ctx.shadowColor = '#38bdf8';
                ctx.shadowBlur = 24;
                ctx.fillRect(x, 12, 140, 9);
                ctx.shadowBlur = 0;
            }
        }

        // Render Background Props
        this.renderProps(ctx);

        // Ground Floor with Polished Gloss/Wood Finish
        const floorGrad = ctx.createLinearGradient(0, this.groundY, 0, this.height);
        floorGrad.addColorStop(0, this.floorColor);
        floorGrad.addColorStop(0.3, '#0f172a');
        floorGrad.addColorStop(1, '#020617');
        ctx.fillStyle = floorGrad;
        ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);

        // Floor Tiles Grid Lines / Gym Wood Planks
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let py = this.groundY + 25; py < this.height; py += 30) {
            ctx.beginPath();
            ctx.moveTo(0, py);
            ctx.lineTo(this.width, py);
            ctx.stroke();
        }

        // Floor baseline polished neon trim
        ctx.strokeStyle = this.accentColor;
        ctx.lineWidth = 3;
        ctx.shadowColor = this.accentColor;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(0, this.groundY);
        ctx.lineTo(this.width, this.groundY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Tatami markings / Court lines for Gymnasium
        if (this.theme === 'gym') {
            ctx.strokeStyle = 'rgba(234, 179, 8, 0.55)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(800, this.groundY + 45, 420, 55, 0, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(225, 29, 72, 0.45)';
            ctx.beginPath();
            ctx.ellipse(800, this.groundY + 45, 220, 30, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Ambient particles (Glow flakes / Cherry petals / Dust)
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
            if (prop.type === 'lockers') {
                // Metal lockers
                ctx.fillStyle = '#1e3a8a';
                ctx.fillRect(prop.x, prop.y, prop.width, prop.height);
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 2;
                ctx.strokeRect(prop.x, prop.y, prop.width, prop.height);
                // Individual locker doors
                for (let col = 0; col < 3; col++) {
                    const doorX = prop.x + col * (prop.width / 3);
                    ctx.strokeRect(doorX, prop.y, prop.width / 3, prop.height);
                    // Vents
                    ctx.fillStyle = '#0f172a';
                    for (let v = 0; v < 3; v++) {
                        ctx.fillRect(doorX + 8, prop.y + 15 + v * 8, 30, 3);
                    }
                    // Handle & Lock
                    ctx.fillStyle = '#f8fafc';
                    ctx.fillRect(doorX + 36, prop.y + 70, 4, 14);
                }
            } else if (prop.type === 'vending') {
                // Neon Vending Machine
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(prop.x, prop.y, prop.width, prop.height);
                ctx.strokeStyle = '#06b6d4';
                ctx.lineWidth = 2;
                ctx.strokeRect(prop.x, prop.y, prop.width, prop.height);
                // Glowing glass display
                ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
                ctx.fillRect(prop.x + 8, prop.y + 12, prop.width - 16, 90);
                // Drinks inside
                const cans = ['#ef4444', '#10b981', '#f59e0b', '#3b82f6'];
                for (let r = 0; r < 3; r++) {
                    for (let c = 0; c < 4; c++) {
                        ctx.fillStyle = cans[(r + c) % cans.length];
                        ctx.fillRect(prop.x + 16 + c * 18, prop.y + 20 + r * 26, 12, 18);
                    }
                }
                // Machine Logo
                ctx.fillStyle = '#38bdf8';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('⚡ ENERGY', prop.x + prop.width / 2, prop.y + 125);
            } else if (prop.type === 'banner') {
                // High school banner
                ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
                ctx.fillRect(prop.x - 140, prop.y, 280, 40);
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 2;
                ctx.strokeRect(prop.x - 140, prop.y, 280, 40);
                ctx.fillStyle = '#fbbf24';
                ctx.font = 'bold 12px "Segoe UI", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(prop.text, prop.x, prop.y + 25);
            } else if (prop.type === 'punching_bag') {
                // Hanging Heavy Bag
                ctx.save();
                ctx.translate(prop.x, prop.y - 120);
                ctx.rotate(prop.swing);
                // Chain
                ctx.strokeStyle = '#94a3b8';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, 100);
                ctx.stroke();
                // Bag
                const bagGrad = ctx.createLinearGradient(-25, 100, 25, 100);
                bagGrad.addColorStop(0, '#7f1d1d');
                bagGrad.addColorStop(0.5, '#dc2626');
                bagGrad.addColorStop(1, '#450a0a');
                ctx.fillStyle = bagGrad;
                ctx.beginPath();
                ctx.roundRect(-25, 100, 50, 160, [10, 10, 20, 20]);
                ctx.fill();
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.stroke();
                // Label
                ctx.fillStyle = '#f8fafc';
                ctx.font = 'bold 11px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('TKD', 0, 180);
                ctx.restore();
            } else if (prop.type === 'flag_taeguk') {
                // Korean Flag / Taegeuk
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(prop.x - prop.width / 2, prop.y, prop.width, prop.height);
                ctx.strokeStyle = '#cbd5e1';
                ctx.lineWidth = 2;
                ctx.strokeRect(prop.x - prop.width / 2, prop.y, prop.width, prop.height);
                // Taegeuk circle
                const cX = prop.x;
                const cY = prop.y + prop.height / 2;
                const r = 30;
                // Red top half
                ctx.fillStyle = '#dc2626';
                ctx.beginPath();
                ctx.arc(cX, cY, r, 0, Math.PI, true);
                ctx.fill();
                // Blue bottom half
                ctx.fillStyle = '#2563eb';
                ctx.beginPath();
                ctx.arc(cX, cY, r, 0, Math.PI, false);
                ctx.fill();
            } else if (prop.type === 'chain_fence') {
                // Rooftop metal wire fence
                ctx.strokeStyle = 'rgba(203, 213, 225, 0.35)';
                ctx.lineWidth = 1;
                for (let fx = 0; fx < prop.width; fx += 20) {
                    ctx.beginPath();
                    ctx.moveTo(fx, prop.y);
                    ctx.lineTo(fx + 20, prop.y + prop.height);
                    ctx.moveTo(fx + 20, prop.y);
                    ctx.lineTo(fx, prop.y + prop.height);
                    ctx.stroke();
                }
                // Posts
                ctx.strokeStyle = '#475569';
                ctx.lineWidth = 4;
                for (let px = 0; px < prop.width; px += 160) {
                    ctx.beginPath();
                    ctx.moveTo(px, prop.y);
                    ctx.lineTo(px, prop.y + prop.height);
                    ctx.stroke();
                }
            }
        });
    }
}

window.ArenaManager = ArenaManager;
