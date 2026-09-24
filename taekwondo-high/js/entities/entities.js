// Entity Classes: Player (Taekwondo Martial Artist), Enemy Brawlers/Bosses, Visual Particle Effects

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.damageTexts = [];
        this.slashTrails = [];
        this.legoBricks = [];
        this.dragonSpirits = [];
        this.swirlingLeaves = [];
        this.windArcs = [];
    }

    addSpark(x, y, color = '#facc15', count = 8, speed = 250) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = (Math.random() * 0.7 + 0.3) * speed;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd - 60,
                size: Math.random() * 4 + 2,
                color,
                life: 1.0,
                decay: Math.random() * 2.5 + 2.0,
                gravity: 400
            });
        }
    }

    addDragonSpirit(x, y, facing, duration = 1.0) {
        this.dragonSpirits.push({
            startX: x,
            startY: y,
            x: x,
            y: y,
            facing: facing,
            timer: 0,
            duration: duration,
            life: 1.0,
            segments: []
        });

        // Spawn dynamic swirling wind gusts
        for (let i = 0; i < 8; i++) {
            this.windArcs.push({
                x: x + (Math.random() - 0.5) * 40,
                y: y + (Math.random() - 0.5) * 40,
                vx: facing * (Math.random() * 450 + 400),
                vy: (Math.random() - 0.5) * 120,
                radius: Math.random() * 25 + 15,
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 14,
                life: 1.0,
                decay: Math.random() * 1.5 + 1.2
            });
        }

        // Spawn ethereal golden & emerald dragon leaves
        const leafColors = ['#22c55e', '#16a34a', '#84cc16', '#facc15', '#f59e0b', '#fbbf24'];
        for (let i = 0; i < 32; i++) {
            this.swirlingLeaves.push({
                x: x + (Math.random() - 0.5) * 60,
                y: y + (Math.random() - 0.5) * 60,
                vx: facing * (Math.random() * 550 + 350) + (Math.random() - 0.5) * 120,
                vy: (Math.random() - 0.5) * 220 - 40,
                size: Math.random() * 5 + 4,
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 18,
                color: leafColors[Math.floor(Math.random() * leafColors.length)],
                life: 1.0,
                decay: Math.random() * 0.9 + 0.8,
                swirlPhase: Math.random() * Math.PI * 2
            });
        }
    }

    addHealingPulse(x, y) {
        for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = Math.random() * 80 + 40;
            this.particles.push({
                x: x + (Math.random() - 0.5) * 30,
                y: y + (Math.random() - 0.5) * 40,
                vx: Math.cos(angle) * spd,
                vy: -Math.abs(Math.sin(angle) * spd) - 60,
                size: Math.random() * 4 + 3,
                color: '#22c55e',
                life: 1.0,
                decay: 1.6,
                gravity: -80 // Float upwards
            });
        }
    }

    addKickTrail(x, y, radius, angleStart, angleEnd, color = 'rgba(255,255,255,0.85)') {
        this.slashTrails.push({
            x, y, radius,
            angleStart, angleEnd,
            color,
            life: 1.0,
            decay: 5.5
        });
    }

    addDamageText(x, y, text, isCrit = false, isPlayer = false, isHeal = false) {
        this.damageTexts.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y - 20,
            text: text,
            isCrit: isCrit,
            color: isHeal ? '#4ade80' : (isPlayer ? '#ef4444' : (isCrit ? '#facc15' : '#ffffff')),
            size: isCrit ? 26 : (isHeal ? 20 : 18),
            vy: isHeal ? -80 : -120,
            life: 1.0,
            decay: isHeal ? 1.0 : 1.4
        });
    }

    // --- LEGO BRICK COLLAPSE PHYSICS SYSTEM ---
    addLegoBricks(x, y, bodyColor = '#dc2626', pantsColor = '#1e293b', isBoss = false) {
        // Break defeated character down into 14-18 articulated Lego toy bricks
        const brickTypes = [
            // Head piece (Round brick with studs)
            { type: 'head', w: 18, h: 18, color: '#fed7aa', studs: 1, relY: -30 },
            { type: 'hair', w: 20, h: 10, color: '#1e1b4b', studs: 2, relY: -38 },
            // Torso bricks (Upper & lower chest blocks)
            { type: 'torso_top', w: 28, h: 14, color: bodyColor, studs: 3, relY: -16 },
            { type: 'torso_bot', w: 26, h: 12, color: bodyColor, studs: 3, relY: -4 },
            // Left & right arm bricks
            { type: 'arm', w: 10, h: 16, color: bodyColor, studs: 1, relX: -16, relY: -14 },
            { type: 'arm', w: 10, h: 16, color: bodyColor, studs: 1, relX: 16, relY: -14 },
            { type: 'hand', w: 8, h: 8, color: '#fed7aa', studs: 1, relX: -20, relY: 2 },
            { type: 'hand', w: 8, h: 8, color: '#fed7aa', studs: 1, relX: 20, relY: 2 },
            // Hip / Belt connector block
            { type: 'hip', w: 26, h: 8, color: '#09090b', studs: 3, relY: 8 },
            // Left & right leg bricks
            { type: 'leg', w: 11, h: 18, color: pantsColor, studs: 1, relX: -7, relY: 22 },
            { type: 'leg', w: 11, h: 18, color: pantsColor, studs: 1, relX: 7, relY: 22 },
            // Feet / Shoes bricks
            { type: 'foot', w: 14, h: 7, color: isBoss ? '#e11d48' : '#0f172a', studs: 2, relX: -7, relY: 34 },
            { type: 'foot', w: 14, h: 7, color: isBoss ? '#e11d48' : '#0f172a', studs: 2, relX: 7, relY: 34 },
            // Small decorative loose 1x1 studs
            { type: 'stud', w: 7, h: 6, color: bodyColor, studs: 1, relY: -8 },
            { type: 'stud', w: 7, h: 6, color: '#facc15', studs: 1, relY: -18 },
            { type: 'stud', w: 7, h: 6, color: pantsColor, studs: 1, relY: 14 }
        ];

        if (isBoss) {
            // Additional heavy boss blocks
            brickTypes.push({ type: 'crest', w: 12, h: 12, color: '#e11d48', studs: 2, relY: -42 });
            brickTypes.push({ type: 'shoulder', w: 14, h: 8, color: '#e11d48', studs: 2, relX: -18, relY: -22 });
            brickTypes.push({ type: 'shoulder', w: 14, h: 8, color: '#e11d48', studs: 2, relX: 18, relY: -22 });
        }

        brickTypes.forEach(b => {
            const angle = (Math.random() - 0.5) * Math.PI * 0.8;
            const power = Math.random() * 260 + 140;
            const vx = Math.sin(angle) * power + (Math.random() - 0.5) * 60;
            const vy = -Math.cos(angle) * power - (Math.random() * 180 + 120);

            this.legoBricks.push({
                x: x + (b.relX || 0),
                y: y + (b.relY || 0) + 40,
                w: b.w,
                h: b.h,
                color: b.color,
                studs: b.studs,
                type: b.type,
                vx: vx,
                vy: vy,
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 16,
                gravity: 1250,
                bounces: 0,
                maxBounces: Math.floor(Math.random() * 3) + 2,
                life: 3.5,
                isGrounded: false
            });
        });

        // Add satisfying popping sound if available
        if (window.soundEngine && window.soundEngine.playHit) {
            window.soundEngine.playHit('heavy', true);
        }
    }

    update(dt) {
        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += (p.gravity || 0) * dt;
            p.life -= p.decay * dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        // Damage & Heal Texts
        for (let i = this.damageTexts.length - 1; i >= 0; i--) {
            const d = this.damageTexts[i];
            d.y += d.vy * dt;
            d.vy *= 0.95;
            d.life -= d.decay * dt;
            if (d.life <= 0) this.damageTexts.splice(i, 1);
        }

        // Slash Trails
        for (let i = this.slashTrails.length - 1; i >= 0; i--) {
            const s = this.slashTrails[i];
            s.life -= s.decay * dt;
            if (s.life <= 0) this.slashTrails.splice(i, 1);
        }

        // Lego Bricks Physics & Bouncing
        const groundY = 560;
        for (let i = this.legoBricks.length - 1; i >= 0; i--) {
            const b = this.legoBricks[i];
            b.life -= dt;
            if (b.life <= 0) {
                this.legoBricks.splice(i, 1);
                continue;
            }

            if (!b.isGrounded) {
                b.x += b.vx * dt;
                b.y += b.vy * dt;
                b.vy += b.gravity * dt;
                b.rot += b.rotSpeed * dt;

                // Ground Collision & Bouncy Brick Physics
                if (b.y >= groundY - b.h / 2) {
                    b.y = groundY - b.h / 2;
                    b.bounces++;
                    if (b.bounces < b.maxBounces) {
                        b.vy = -b.vy * 0.48; // Bouncy elastic plastic collision
                        b.vx *= 0.65;
                        b.rotSpeed = (Math.random() - 0.5) * 8;
                    } else {
                        b.vy = 0;
                        b.vx *= 0.85;
                        b.rotSpeed *= 0.3;
                        if (Math.abs(b.vx) < 15) {
                            b.vx = 0;
                            b.rotSpeed = 0;
                            b.isGrounded = true;
                        }
                    }
                }
            } else {
                b.x += b.vx * dt;
                b.vx *= 0.92;
            }
        }

        // Dragon Spirits Update (Surging Eastern Dragon)
        for (let i = this.dragonSpirits.length - 1; i >= 0; i--) {
            const d = this.dragonSpirits[i];
            d.timer += dt;
            const progress = Math.min(1.0, d.timer / d.duration);
            d.life = 1.0 - progress;

            // Dragon head surges forward in a majestic soaring sinewave
            const surgeSpeed = 750;
            d.x = d.startX + d.facing * (progress * surgeSpeed);
            d.y = d.startY + Math.sin(progress * Math.PI * 3.5) * 35 - Math.sin(progress * Math.PI) * 20;

            // Record body segments history for undulating snake/dragon body
            d.segments.unshift({ x: d.x, y: d.y });
            if (d.segments.length > 28) {
                d.segments.pop();
            }

            // Spawn celestial spirit flame sparks along body
            if (Math.random() < 0.6) {
                this.addSpark(d.x + (Math.random() - 0.5) * 20, d.y + (Math.random() - 0.5) * 20, Math.random() < 0.5 ? '#f43f5e' : '#facc15', 2, 90);
            }

            if (progress >= 1.0) {
                this.dragonSpirits.splice(i, 1);
            }
        }

        // Swirling Wind Arcs Update
        for (let i = this.windArcs.length - 1; i >= 0; i--) {
            const w = this.windArcs[i];
            w.x += w.vx * dt;
            w.y += w.vy * dt;
            w.rot += w.rotSpeed * dt;
            w.life -= w.decay * dt;
            if (w.life <= 0) this.windArcs.splice(i, 1);
        }

        // Swirling Dragon Leaves Update
        for (let i = this.swirlingLeaves.length - 1; i >= 0; i--) {
            const l = this.swirlingLeaves[i];
            l.swirlPhase += dt * 8;
            l.x += l.vx * dt + Math.cos(l.swirlPhase) * 45 * dt;
            l.y += l.vy * dt + Math.sin(l.swirlPhase) * 65 * dt;
            l.rot += l.rotSpeed * dt;
            l.life -= l.decay * dt;
            if (l.life <= 0) this.swirlingLeaves.splice(i, 1);
        }
    }

    render(ctx) {
        // Render Majestic Dragon Spirits
        this.dragonSpirits.forEach(d => {
            if (d.segments.length < 2) return;
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1.0, d.life * 1.4));

            // 1. Dragon Glowing Ethereal Body Trail (Undulating Coils & Scales)
            const segCount = d.segments.length;
            for (let i = segCount - 1; i >= 1; i--) {
                const seg = d.segments[i];
                const prevSeg = d.segments[i - 1];
                const t = 1 - (i / segCount);
                const segRadius = 8 + t * 20;

                // Outer Dragon Fire Aura
                ctx.save();
                ctx.strokeStyle = i % 2 === 0 ? '#f43f5e' : '#fb923c';
                ctx.lineWidth = segRadius * 1.8;
                ctx.lineCap = 'round';
                ctx.shadowColor = '#e11d48';
                ctx.shadowBlur = 25;
                ctx.beginPath();
                ctx.moveTo(prevSeg.x, prevSeg.y);
                ctx.lineTo(seg.x, seg.y);
                ctx.stroke();
                ctx.restore();

                // Inner Golden Core Body
                ctx.save();
                ctx.strokeStyle = '#fef08a';
                ctx.lineWidth = segRadius * 0.9;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(prevSeg.x, prevSeg.y);
                ctx.lineTo(seg.x, seg.y);
                ctx.stroke();
                ctx.restore();

                // Dragon Dorsal Spine / Fin Spikes
                if (i % 3 === 0 && i < segCount - 2) {
                    const dx = prevSeg.x - seg.x;
                    const dy = prevSeg.y - seg.y;
                    const normLen = Math.hypot(dx, dy) || 1;
                    const perpX = -dy / normLen;
                    const perpY = dx / normLen;
                    const spikeLen = 14 + t * 16;

                    ctx.fillStyle = '#fde047';
                    ctx.beginPath();
                    ctx.moveTo(seg.x, seg.y);
                    ctx.lineTo(seg.x + perpX * spikeLen, seg.y + perpY * spikeLen);
                    ctx.lineTo(prevSeg.x, prevSeg.y);
                    ctx.closePath();
                    ctx.fill();
                }
            }

            // 2. Genuine Eastern Dragon Head (Snout, Horns, Fangs, Eyes, Whiskers)
            const head = d.segments[0];
            const neck = d.segments[Math.min(3, segCount - 1)];
            const angle = Math.atan2(head.y - neck.y, head.x - neck.x);

            ctx.save();
            ctx.translate(head.x, head.y);
            ctx.rotate(angle);

            // Dragon Head Glow
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 30;

            // Crimson Dragon Skull & Jaws
            ctx.fillStyle = '#be123c';
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 3;

            // Upper Snout & Crown
            ctx.beginPath();
            ctx.moveTo(-15, -16);
            ctx.lineTo(25, -12);
            ctx.lineTo(42, -4);
            ctx.lineTo(45, 4); // Nostril tip
            ctx.lineTo(25, 10);
            ctx.lineTo(0, 16);
            ctx.lineTo(-20, 10);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Lower Jaw (Open Roar)
            ctx.fillStyle = '#9f1239';
            ctx.beginPath();
            ctx.moveTo(5, 8);
            ctx.lineTo(32, 14);
            ctx.lineTo(28, 24);
            ctx.lineTo(0, 18);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Sharp White Dragon Fangs
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(26, -4); ctx.lineTo(30, 4); ctx.lineTo(34, -4); // Top fang 1
            ctx.moveTo(36, -3); ctx.lineTo(40, 5); ctx.lineTo(44, -3); // Top fang 2
            ctx.moveTo(18, 12); ctx.lineTo(22, 6); ctx.lineTo(26, 12); // Bottom fang
            ctx.fill();

            // Magnificent Stag Horns (Antlers)
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            // Upper Horn Branch
            ctx.beginPath();
            ctx.moveTo(-10, -14);
            ctx.quadraticCurveTo(-25, -35, -45, -42);
            ctx.moveTo(-25, -28);
            ctx.lineTo(-30, -45);
            ctx.moveTo(-35, -34);
            ctx.lineTo(-46, -26);
            ctx.stroke();

            // Blazing Celestial Dragon Eye
            ctx.fillStyle = '#38bdf8';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.ellipse(12, -7, 7, 5, -0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(13, -7, 3, 2, 0, 0, Math.PI * 2);
            ctx.fill();

            // Flowing Dragon Whiskers (Long Barbel tendrils waving in the wind)
            const whiskerWave1 = Math.sin(d.timer * 18) * 12;
            const whiskerWave2 = Math.cos(d.timer * 15) * 14;
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = '#facc15';
            ctx.shadowBlur = 12;

            // Top Whisker
            ctx.beginPath();
            ctx.moveTo(38, -3);
            ctx.bezierCurveTo(55, -20 + whiskerWave1, 75, -10 + whiskerWave2, 95, -30 + whiskerWave1);
            ctx.stroke();

            // Bottom Whisker
            ctx.beginPath();
            ctx.moveTo(35, 6);
            ctx.bezierCurveTo(55, 18 + whiskerWave2, 75, 28 + whiskerWave1, 95, 20 + whiskerWave2);
            ctx.stroke();

            ctx.restore();
            ctx.restore();
        });

        // Render Swirling Wind Arcs
        this.windArcs.forEach(w => {
            ctx.save();
            ctx.translate(w.x, w.y);
            ctx.rotate(w.rot);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
            ctx.lineWidth = 2.5;
            ctx.globalAlpha = Math.max(0, w.life);
            ctx.beginPath();
            ctx.arc(0, 0, w.radius, -Math.PI * 0.4, Math.PI * 0.4);
            ctx.stroke();
            ctx.restore();
        });

        // Render Swirling Dragon Leaves (Emerald, Jade & Golden Gilded Leaves)
        this.swirlingLeaves.forEach(l => {
            ctx.save();
            ctx.translate(l.x, l.y);
            ctx.rotate(l.rot);
            ctx.globalAlpha = Math.max(0, l.life);
            ctx.fillStyle = l.color;
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(0, 0, l.size, l.size * 0.45, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // Leaf center vein
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.moveTo(-l.size, 0);
            ctx.lineTo(l.size, 0);
            ctx.stroke();
            ctx.restore();
        });

        // Render Trails
        this.slashTrails.forEach(s => {
            ctx.save();
            ctx.strokeStyle = s.color;
            ctx.globalAlpha = Math.max(0, s.life);
            ctx.lineWidth = 14 * s.life;
            ctx.lineCap = 'round';
            ctx.shadowColor = s.color;
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, s.angleStart, s.angleEnd);
            ctx.stroke();
            ctx.restore();
        });

        // Render Lego Bricks (Collapsing toy bricks with 3D studs & drop shadows)
        this.legoBricks.forEach(b => {
            ctx.save();
            const alpha = Math.min(1.0, b.life * 1.5);
            ctx.globalAlpha = alpha;

            // Ground Contact Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.beginPath();
            ctx.ellipse(b.x, 560, b.w * 0.6, 3.5, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.translate(b.x, b.y);
            ctx.rotate(b.rot);

            // Brick Body
            ctx.fillStyle = b.color;
            ctx.strokeStyle = '#020617';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(-b.w / 2, -b.h / 2, b.w, b.h, 2);
            ctx.fill();
            ctx.stroke();

            // Lego Studs (Cylindrical bumps on top of brick)
            if (b.studs > 0) {
                const studW = b.w / (b.studs + 1);
                for (let s = 1; s <= b.studs; s++) {
                    const sx = -b.w / 2 + s * studW;
                    // Stud top highlight
                    ctx.fillStyle = b.color;
                    ctx.beginPath();
                    ctx.roundRect(sx - 3, -b.h / 2 - 3, 6, 3, [1, 1, 0, 0]);
                    ctx.fill();
                    ctx.strokeStyle = '#020617';
                    ctx.stroke();
                }
            }

            // Plastic Specular Highlight on edge
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(-b.w / 2 + 1, -b.h / 2 + 1, b.w - 2, 2);

            ctx.restore();
        });

        // Render Sparks
        this.particles.forEach(p => {
            ctx.save();
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Render Damage Numbers
        this.damageTexts.forEach(d => {
            ctx.save();
            ctx.font = `900 ${d.size}px "Outfit", sans-serif`;
            ctx.fillStyle = d.color;
            ctx.globalAlpha = Math.max(0, d.life);
            ctx.textAlign = 'center';
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 6;
            ctx.fillText(d.text, d.x, d.y);
            if (d.isCrit) {
                ctx.strokeStyle = '#e11d48';
                ctx.lineWidth = 1;
                ctx.strokeText(d.text, d.x, d.y);
            }
            ctx.restore();
        });
    }
}

// Player Class (Authentic 3D-Kinematic Motion Models & Tab Jump Physics)
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 44;
        this.height = 80;
        this.facing = 1; // 1 = right, -1 = left

        // Progression & Belt
        this.belt = 'WHITE';
        this.xp = 0;
        this.totalScore = 0;
        this.equippedMoves = {
            primary: 'ap_chagi',
            secondary: 'back_heel_kick',
            dash: 'quick_dash',
            special1: null,
            special2: null,
            special3: null,
            ultimate: null
        };
        this.activeMovesList = ['ap_chagi', 'back_heel_kick', 'quick_dash'];
        this.perks = {};

        // Base Stats
        this.maxHp = 100;
        this.hp = 100;
        this.maxKi = 100;
        this.ki = 100;
        this.kiRegen = 8;
        this.baseSpeed = 280;
        this.speed = 280;
        
        // Dynamic Perk modifiers
        this.speedBonus = 0;
        this.dashCdMult = 1.0;
        this.critChance = 0.05;
        this.dmgReduction = 0;
        this.kiRegenMult = 1.0;
        this.cooldownMult = 1.0;
        this.revives = 0;

        // Combat & Jump Physics
        this.state = 'idle'; // 'idle', 'walk', 'jump', 'attack', 'dash', 'hitstun', 'parry'
        this.stateTimer = 0;
        this.currentMove = null;
        this.movePhase = 'startup';
        this.hitboxActive = false;
        this.hasHitThisAttack = false;
        this.cooldowns = {};
        this.iFrames = 0;

        // Tab Jump & Airborne Physics
        this.isGrounded = true;
        this.vy = 0;
        this.gravity = 1450;
        this.jumpPower = -620; // High mobility jump
        this.airborneKick = false;

        // 3-Second Player Vitality Buff (+20% HP every 3 seconds)
        this.regenTimer = 0;
        this.regenInterval = 3.0;

        // Combo Engine
        this.comboCount = 0;
        this.comboTimer = 0;
        this.comboGrade = 'D';
        this.animTimer = 0;
        this.flashRed = 0;
        this.skeletalPose = {
            torsoRot: 0,
            torsoLean: 0,
            thighAngle: 0,
            kneeAngle: 0,
            hipAngle: 0
        };

        // Ammo & Throwable inventory (Apples, Cacti, Rulers, Books, Ninja Stars)
        this.ammoInventory = []; // array of { type, damage }
        this.maxAmmo = 5;
    }

    addAmmo(type, damage) {
        if (this.ammoInventory.length < this.maxAmmo) {
            this.ammoInventory.push({ type, damage });
            return true;
        }
        return false;
    }

    throwThrowable(projectiles, vfx) {
        if (this.ammoInventory.length === 0) return false;
        const item = this.ammoInventory.pop();
        const spawnX = this.x + this.facing * 35;
        const spawnY = this.y + 25;
        const vx = this.facing * 750;
        const vy = item.type === 'ninja_star' ? 0 : -180;

        projectiles.push(new window.Projectile(spawnX, spawnY, vx, vy, item.type, item.damage));
        vfx.addSpark(spawnX, spawnY, '#facc15', 6, 120);
        if (window.soundEngine) window.soundEngine.playWhoosh(1.6, 0.8);
        return true;
    }

    applyBeltStats(beltId) {
        this.belt = beltId;
        const info = window.BELT_RANKS[beltId];
        const oldMaxHp = this.maxHp;
        this.maxHp = info.statBonus.maxHealth + (this.maxHpBonus || 0);
        this.hp += (this.maxHp - oldMaxHp);
        this.maxKi = info.statBonus.kiMax;
        this.ki = this.maxKi;
        this.kiRegen = info.statBonus.kiRegen;
        this.baseSpeed = info.statBonus.speed;

        info.unlockedMoves.forEach(mId => {
            const m = window.MOVES_DATABASE[mId];
            if (m && !this.activeMovesList.includes(mId)) {
                this.activeMovesList.push(mId);
                if (m.slot === 'special1' && !this.equippedMoves.special1) {
                    this.equippedMoves.special1 = mId;
                } else if (m.slot === 'special2' && !this.equippedMoves.special2) {
                    this.equippedMoves.special2 = mId;
                } else if (m.slot === 'special3' && !this.equippedMoves.special3) {
                    this.equippedMoves.special3 = mId;
                } else if (m.slot === 'ultimate' && !this.equippedMoves.ultimate) {
                    this.equippedMoves.ultimate = mId;
                }
            }
        });
    }

    gainXp(amount) {
        this.xp += amount;
        this.totalScore += amount * 10;
        const currentRankIndex = window.BELT_ORDER.indexOf(this.belt);
        if (currentRankIndex < window.BELT_ORDER.length - 1) {
            const nextBelt = window.BELT_RANKS[window.BELT_ORDER[currentRankIndex + 1]];
            if (this.xp >= nextBelt.xpRequired) {
                return nextBelt.id;
            }
        }
        return null;
    }

    // --- TAB KEY JUMP MOBILITY ACTION ---
    jump() {
        if (!this.isGrounded && this.vy > -100) return; // single jump with air-apex grace
        if (this.state === 'hitstun' || this.state === 'parry') return;

        this.isGrounded = false;
        this.vy = this.jumpPower;
        this.state = 'jump';
        this.stateTimer = 0;

        if (window.soundEngine && window.soundEngine.playWhoosh) {
            window.soundEngine.playWhoosh(1.4, 0.6);
        }
    }

    // --- DASH / QUICK STEP EVASION ---
    dash() {
        if (this.state === 'hitstun' || this.state === 'parry' || this.state === 'dash') return false;
        const m = window.MOVES_DATABASE['quick_dash'];
        const cd = this.cooldowns['quick_dash'] || 0;
        if (cd > 0) return false;
        if (m && this.ki < m.kiCost) return false;

        if (m) this.ki -= m.kiCost;
        this.cooldowns['quick_dash'] = (m ? m.cooldown : 0.5) * this.cooldownMult;

        this.state = 'dash';
        this.stateTimer = 0;
        this.iFrames = 0.28;
        this.currentMove = null;
        this.hitboxActive = false;

        if (window.soundEngine && window.soundEngine.playWhoosh) {
            window.soundEngine.playWhoosh(1.6, 0.7);
        }
        return true;
    }

    performMove(moveId) {
        if (moveId === 'quick_dash') {
            return this.dash();
        }
        if (this.state === 'hitstun' || this.state === 'parry' || this.state === 'dash') return false;
        if (!moveId) return false;

        const m = window.MOVES_DATABASE[moveId];
        if (!m) return false;

        if (this.cooldowns[moveId] > 0) return false;
        if (this.ki < m.kiCost) return false;

        // Consume Ki
        this.ki -= m.kiCost;
        this.cooldowns[moveId] = m.cooldown * this.cooldownMult;

        // State change
        this.currentMove = m;
        this.state = 'attack';
        this.stateTimer = 0;
        this.movePhase = 'startup';
        this.hitboxActive = false;
        this.hasHitThisAttack = false;
        this.airborneKick = !this.isGrounded || m.airborne;

        // Airborne kicks give upward aerodynamic lift
        if (m.airborne || m.motionType === 'tornado_540_spin') {
            this.vy = -340;
            this.isGrounded = false;
        }

        // Sound effect
        if (window.soundEngine) {
            window.soundEngine.playWhoosh(m.damage > 60 ? 0.9 : 1.2, m.damage > 60 ? 1.4 : 1.0);
        }

        return true;
    }

    takeDamage(amount, fromX) {
        if (this.iFrames > 0) return 0;
        if (this.state === 'dash') return 0;

        // Check Parry Guard
        if (this.state === 'parry' && this.stateTimer < 0.35) {
            if (window.soundEngine) window.soundEngine.playParrySuccess();
            this.iFrames = 0.5;
            this.currentMove = {
                id: 'parry_strike',
                name: 'Counter Strike',
                damage: 85,
                range: 120,
                hitRadius: 60,
                knockback: 400,
                stunTime: 0.8,
                startupTime: 0.05,
                activeTime: 0.15,
                recoveryTime: 0.1,
                vfx: { trailColor: '#facc15', sparkColor: '#fef08a', arcAngle: 0.8 }
            };
            this.state = 'attack';
            this.stateTimer = 0;
            this.movePhase = 'startup';
            return -1;
        }

        const finalDmg = Math.max(1, Math.round(amount * (1 - this.dmgReduction)));
        this.hp -= finalDmg;
        this.flashRed = 0.2;
        this.state = 'hitstun';
        this.stateTimer = 0.3;
        this.iFrames = 0.45;
        this.comboCount = 0;

        if (window.soundEngine) window.soundEngine.playHit('heavy', true);

        // Revive perk check
        if (this.hp <= 0 && this.revives > 0) {
            this.revives--;
            this.hp = Math.round(this.maxHp * 0.6);
            this.iFrames = 3.5;
            if (window.soundEngine) window.soundEngine.playBeltRankUp();
        }

        return finalDmg;
    }

    update(dt, input, arena, vfx) {
        // --- 1. PASSIVE PLAYER VITALITY BUFF (+20% HP EVERY 3 SECONDS) ---
        this.regenTimer += dt;
        if (this.regenTimer >= this.regenInterval) {
            this.regenTimer = 0;
            if (this.hp > 0 && this.hp < this.maxHp) {
                const healAmt = Math.round(this.maxHp * 0.20);
                this.hp = Math.min(this.maxHp, this.hp + healAmt);
                vfx.addDamageText(this.x, this.y, `+${healAmt} HP 💖`, false, false, true);
                vfx.addHealingPulse(this.x, this.y + 20);
            }
        }

        // Ki Regeneration
        if (this.ki < this.maxKi) {
            this.ki = Math.min(this.maxKi, this.ki + this.kiRegen * this.kiRegenMult * dt);
        }

        // Flash & iFrames
        if (this.flashRed > 0) this.flashRed -= dt;
        if (this.iFrames > 0) this.iFrames -= dt;

        // Cooldowns
        for (let k in this.cooldowns) {
            if (this.cooldowns[k] > 0) {
                this.cooldowns[k] -= dt;
                if (this.cooldowns[k] < 0) this.cooldowns[k] = 0;
            }
        }

        // Combo Decay
        if (this.comboCount > 0) {
            this.comboTimer -= dt * (this.perks.flowState ? 0.5 : 1.0);
            if (this.comboTimer <= 0) {
                this.comboCount = 0;
            }
        }
        this.updateComboGrade();

        // State Machine
        if (this.state === 'hitstun') {
            this.stateTimer -= dt;
            if (this.stateTimer <= 0) {
                this.state = this.isGrounded ? 'idle' : 'jump';
            }
        } else if (this.state === 'dash') {
            this.stateTimer += dt;
            const dashSpd = 860;
            this.x += this.facing * dashSpd * dt;
            if (Math.random() < 0.4) {
                vfx.addSpark(this.x, this.y + 30, '#94a3b8', 2, 80);
            }
            if (this.stateTimer >= 0.18) {
                this.state = this.isGrounded ? 'idle' : 'jump';
            }
        } else if (this.state === 'parry') {
            this.stateTimer += dt;
            if (this.stateTimer >= 0.35) {
                this.state = this.isGrounded ? 'idle' : 'jump';
            }
        } else if (this.state === 'attack') {
            this.updateAttackState(dt, vfx);
        } else {
            // Normal Movement & Aerial Directional Control
            let moveX = 0;
            if (input.left) {
                moveX = -1;
                this.facing = -1;
            }
            if (input.right) {
                moveX = 1;
                this.facing = 1;
            }

            if (moveX !== 0) {
                this.x += moveX * (this.baseSpeed * (1 + this.speedBonus)) * dt;
                if (this.isGrounded) {
                    this.state = 'walk';
                    this.animTimer += dt * 12;
                }
            } else if (this.isGrounded) {
                this.state = 'idle';
                this.animTimer += dt * 4;
            }
        }

        // --- TAB JUMP PHYSICS & 2.5D GRAVITY ---
        if (!this.isGrounded) {
            this.vy += this.gravity * dt;
            this.y += this.vy * dt;
            if (this.y >= arena.groundY - this.height) {
                this.y = arena.groundY - this.height;
                this.vy = 0;
                this.isGrounded = true;
                if (this.state === 'jump') this.state = 'idle';
                // Landing dust spark
                vfx.addSpark(this.x, arena.groundY - 5, '#94a3b8', 5, 120);
            }
        } else {
            this.y = arena.groundY - this.height;
        }

        // Arena boundaries
        this.x = Math.max(30, Math.min(arena.width - 30, this.x));

        // Update 3D Kinematic Motion Coordinates
        this.update3DKinematics(dt);
    }

    updateAttackState(dt, vfx) {
        const m = this.currentMove;
        if (!m) {
            this.state = this.isGrounded ? 'idle' : 'jump';
            return;
        }

        this.stateTimer += dt;

        // Startup Phase
        if (this.movePhase === 'startup') {
            if (this.stateTimer >= m.startupTime) {
                this.movePhase = 'active';
                this.hitboxActive = true;
                const arcDir = this.facing === 1 ? 0 : Math.PI;
                vfx.addKickTrail(
                    this.x + this.facing * 35,
                    this.y + 35,
                    m.range * 0.75,
                    arcDir - (m.vfx?.arcAngle || 0.4),
                    arcDir + (m.vfx?.arcAngle || 0.4),
                    m.vfx?.trailColor || 'rgba(255,255,255,0.85)'
                );
                
                // Spawn Majestic Eastern Dragon Spirit for Dragon Finisher!
                if (m.id === 'dragon_finisher' || m.motionType === 'dragon_rush') {
                    vfx.addDragonSpirit(this.x + this.facing * 20, this.y + 25, this.facing, 0.95);
                    if (window.soundEngine && window.soundEngine.playWhoosh) {
                        window.soundEngine.playWhoosh(0.5, 2.0);
                    }
                }

                // Spawn Piercing Sapphire-Coral Hadouken Blast!
                if (m.id === 'hadouken_blast' || m.motionType === 'hadouken_thrust') {
                    const spawnX = this.x + this.facing * 40;
                    const spawnY = this.y + 22;
                    const projDamage = Math.round(m.damage * (window.BELT_RANKS[this.belt]?.statBonus.damageMult || 1.0));
                    if (window.gameEngine && window.gameEngine.projectiles) {
                        window.gameEngine.projectiles.push(
                            new window.Projectile(spawnX, spawnY, this.facing * 820, 0, 'hadouken', projDamage)
                        );
                    }
                    vfx.addSpark(spawnX, spawnY, '#38bdf8', 16, 260);
                    vfx.addSpark(spawnX, spawnY, '#f472b6', 12, 220);
                    if (window.soundEngine && window.soundEngine.playWhoosh) {
                        window.soundEngine.playWhoosh(0.7, 1.8);
                    }
                }

                // Slight lunge step
                this.x += this.facing * (m.range * 0.22);
            }
        } else if (this.movePhase === 'active') {
            if (this.stateTimer >= m.startupTime + m.activeTime) {
                this.movePhase = 'recovery';
                this.hitboxActive = false;
            }
        } else if (this.movePhase === 'recovery') {
            if (this.stateTimer >= m.startupTime + m.activeTime + m.recoveryTime) {
                this.state = this.isGrounded ? 'idle' : 'jump';
                this.currentMove = null;
                this.hitboxActive = false;
            }
        }
    }

    // --- AUTHENTIC TAEKWONDO 3D SKELETAL KINEMATICS & HARD-EDGED KICKS ---
    update3DKinematics(dt) {
        const pose = this.skeletalPose;
        const m = this.currentMove;

        if (this.state === 'attack' && m) {
            const totalTime = m.startupTime + m.activeTime + m.recoveryTime;
            const t = Math.min(1.0, Math.max(0, this.stateTimer / (totalTime || 0.3)));
            const phase = this.movePhase; // 'startup', 'active', 'recovery'
            const mType = m.motionType || '';

            // 1. Ap Chagi (Front Snap Kick)
            if (mType === 'front_snap') {
                if (phase === 'startup') {
                    // Fast snappy high knee chamber
                    pose.torsoLean = 0.08;
                    pose.torsoRot = 0.05;
                    pose.chamberHeight = 0.9;
                    pose.thighAngle = -1.6; 
                    pose.kneeAngle = 2.45;   
                    pose.ankleAngle = -0.55; 
                    pose.supportKneeAngle = 0.18;
                } else if (phase === 'active') {
                    // Explosive rigid straight front snap extension with ball of foot
                    pose.torsoLean = -0.3;
                    pose.torsoRot = 0.1;
                    pose.thighAngle = -0.28;
                    pose.kneeAngle = 0.0;  // Fully locked straight edge
                    pose.ankleAngle = -0.45;
                    pose.supportKneeAngle = 0.12;
                } else {
                    // Crisp snap back
                    pose.torsoLean = 0.0;
                    pose.thighAngle = -0.85;
                    pose.kneeAngle = 1.7;
                    pose.ankleAngle = 0;
                    pose.supportKneeAngle = 0.1;
                }
            }
            // 2. Back Heel Thrust Kick (Dwi Chuk Chagi - Balanced Powerful Starter)
            else if (mType === 'back_heel' || mType === 'low_kick' || mType === 'low_sweep') {
                if (phase === 'startup') {
                    // Back pivot chamber: knee lifted towards chest, heel aimed back
                    pose.torsoLean = -0.2;
                    pose.torsoRot = -0.6;
                    pose.thighAngle = -1.35;
                    pose.kneeAngle = 2.3;
                    pose.ankleAngle = -0.95; // Bladed heel ready to strike
                    pose.supportKneeAngle = 0.22;
                } else if (phase === 'active') {
                    // Rock-hard linear backward heel thrust with devastating stopping power
                    pose.torsoLean = -0.65;
                    pose.torsoRot = -0.85;
                    pose.thighAngle = -0.2;
                    pose.kneeAngle = 0.0;  // Locked rigid straight leg
                    pose.ankleAngle = -1.15; // Solid flexed back heel
                    pose.supportKneeAngle = 0.18;
                } else {
                    // Crisp recovery
                    pose.torsoLean = -0.15;
                    pose.torsoRot = -0.3;
                    pose.thighAngle = -0.7;
                    pose.kneeAngle = 1.4;
                    pose.ankleAngle = -0.3;
                }
            }
            // 3. Dollyo Chagi (Roundhouse Kick)
            else if (mType === 'roundhouse') {
                if (phase === 'startup') {
                    // Horizontal hip tilt and tight heel fold
                    pose.torsoLean = -0.35;
                    pose.torsoRot = 0.8;
                    pose.thighAngle = -1.3;
                    pose.kneeAngle = 2.55; 
                    pose.ankleAngle = 0.75; 
                    pose.supportKneeAngle = 0.25;
                } else if (phase === 'active') {
                    // Razor-sharp horizontal whip extension
                    pose.torsoLean = -0.6;
                    pose.torsoRot = 1.0;
                    pose.thighAngle = -0.45;
                    pose.kneeAngle = 0.0; // Straight line whip
                    pose.ankleAngle = 0.85; // Pointed instep
                    pose.supportKneeAngle = 0.2;
                } else {
                    pose.torsoLean = -0.2;
                    pose.torsoRot = 0.5;
                    pose.thighAngle = -0.8;
                    pose.kneeAngle = 1.5;
                    pose.ankleAngle = 0.4;
                }
            }
            // 4. Yeop Chagi & Twio Yeop Chagi (Side Kick / Flying Thrust)
            else if (mType === 'side_thrust' || mType === 'flying_thrust') {
                if (phase === 'startup') {
                    pose.torsoLean = -0.45;
                    pose.torsoRot = 0.95;
                    pose.thighAngle = -1.65;
                    pose.kneeAngle = 2.65;
                    pose.ankleAngle = -0.95; 
                    pose.supportKneeAngle = 0.3;
                } else if (phase === 'active') {
                    // Uncompromising linear heel thrust, locked torso counter-balance
                    pose.torsoLean = -0.8; 
                    pose.torsoRot = 1.0;
                    pose.thighAngle = -0.12; 
                    pose.kneeAngle = 0.0;
                    pose.ankleAngle = -1.1; // Razor sharp knife-edge heel
                    pose.supportKneeAngle = 0.15;
                } else {
                    pose.torsoLean = -0.35;
                    pose.torsoRot = 0.7;
                    pose.thighAngle = -0.9;
                    pose.kneeAngle = 1.8;
                    pose.ankleAngle = -0.5;
                }
            }
            // 5. Naeryeo Chagi (Axe Kick / Downward Hammer)
            else if (mType === 'axe_hammer') {
                if (phase === 'startup') {
                    pose.torsoLean = -0.4;
                    pose.torsoRot = 0.15;
                    pose.thighAngle = -2.15; // Vertical crest
                    pose.kneeAngle = 0.0;
                    pose.ankleAngle = -0.85;
                    pose.supportKneeAngle = 0.22;
                } else if (phase === 'active') {
                    // Heavy downward hammer smash
                    pose.torsoLean = 0.48; 
                    pose.torsoRot = 0.1;
                    pose.thighAngle = 0.52;
                    pose.kneeAngle = 0.0;
                    pose.ankleAngle = -1.15; // Crushing heel strike
                    pose.supportKneeAngle = 0.38;
                } else {
                    pose.torsoLean = 0.15;
                    pose.thighAngle = 0.8;
                    pose.kneeAngle = 0.6;
                    pose.ankleAngle = 0;
                }
            }
            // 6. Dwi Chagi (Spinning Back Kick)
            else if (mType === 'spinning_back') {
                if (phase === 'startup') {
                    pose.torsoLean = -0.25;
                    pose.torsoRot = -1.25;
                    pose.thighAngle = -1.3;
                    pose.kneeAngle = 2.45;
                    pose.ankleAngle = -0.95;
                } else if (phase === 'active') {
                    // Piston-linear back kick
                    pose.torsoLean = -0.7;
                    pose.torsoRot = -1.45;
                    pose.thighAngle = -0.18;
                    pose.kneeAngle = 0.0;
                    pose.ankleAngle = -1.15; 
                } else {
                    pose.torsoLean = -0.1;
                    pose.torsoRot = -0.4;
                    pose.thighAngle = -0.6;
                    pose.kneeAngle = 1.4;
                }
            }
            // 7. Spinning Hook Kick (Dwi Huryeo Chagi)
            else if (mType === 'spinning_hook') {
                const spinProg = t * Math.PI * 2;
                pose.torsoRot = Math.sin(spinProg) * 1.5;
                pose.torsoLean = -0.55;
                if (phase === 'active') {
                    pose.thighAngle = -0.3;
                    pose.kneeAngle = 0.15 + (1 - t) * 1.1; 
                    pose.ankleAngle = -0.95;
                } else {
                    pose.thighAngle = -1.1;
                    pose.kneeAngle = 1.8;
                }
            }
            // 8. Hadouken Energy Thrust (Pa-dong Gwon: Deep Horse-Stance & Forward Dual Palm Thrust)
            else if (mType === 'hadouken_thrust') {
                if (phase === 'startup') {
                    // Deep rooted gathering stance: chest back, elbows tucked at hips
                    pose.torsoLean = 0.25;
                    pose.torsoRot = -0.15;
                    pose.thighAngle = -0.7;
                    pose.kneeAngle = 1.35;
                    pose.ankleAngle = -0.4;
                    pose.supportKneeAngle = 0.35;
                } else if (phase === 'active') {
                    // Explosive forward thrust locked chest surge
                    pose.torsoLean = -0.45;
                    pose.torsoRot = 0.25;
                    pose.thighAngle = -0.85;
                    pose.kneeAngle = 1.1;
                    pose.ankleAngle = -0.2;
                    pose.supportKneeAngle = 0.4;
                } else {
                    // Controlled martial recovery
                    pose.torsoLean = -0.1;
                    pose.torsoRot = 0.05;
                    pose.thighAngle = -0.45;
                    pose.kneeAngle = 0.6;
                    pose.ankleAngle = 0;
                    pose.supportKneeAngle = 0.2;
                }
            }
            // 9. 540 Tornado & Ultimate Dragon Overdrive
            else if (mType === 'tornado_540_spin' || mType === 'dragon_rush') {
                pose.torsoRot = t * Math.PI * 6;
                pose.torsoLean = Math.sin(t * Math.PI * 4) * 0.45;
                pose.thighAngle = -0.3 + Math.sin(t * Math.PI * 6) * 0.55;
                pose.kneeAngle = 0.0;
                pose.ankleAngle = 0.6;
            }
            // Generic
            else {
                pose.thighAngle = -0.3;
                pose.kneeAngle = 0.0;
                pose.torsoLean = -0.2;
                pose.torsoRot = 0.2;
                pose.ankleAngle = 0;
            }
        } else {
            // Idle / Walk / Jump Neutral Kinematics
            pose.torsoRot = 0;
            pose.torsoLean = 0;
            pose.thighAngle = 0;
            pose.kneeAngle = 0;
            pose.ankleAngle = 0;
            pose.supportKneeAngle = 0;
        }
    }

    registerHit() {
        this.comboCount++;
        this.comboTimer = 3.5;
        this.hasHitThisAttack = true;
    }

    updateComboGrade() {
        if (this.comboCount >= 35) this.comboGrade = 'SSS';
        else if (this.comboCount >= 25) this.comboGrade = 'SS';
        else if (this.comboCount >= 18) this.comboGrade = 'S';
        else if (this.comboCount >= 12) this.comboGrade = 'A';
        else if (this.comboCount >= 7) this.comboGrade = 'B';
        else if (this.comboCount >= 3) this.comboGrade = 'C';
        else this.comboGrade = 'D';
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        if (this.iFrames > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
            ctx.globalAlpha = 0.45;
        }

        // --- 2.5D DYNAMIC CONTACT SHADOW ---
        const groundBaseline = 560;
        const jumpHeightOffset = Math.max(0, groundBaseline - (this.y + this.height));
        const shadowScale = Math.max(0.3, 1.0 - (jumpHeightOffset / 350));
        const shadowAlpha = Math.max(0.15, 0.55 - (jumpHeightOffset / 400));

        ctx.save();
        ctx.translate(0, this.height + jumpHeightOffset);
        const shadowGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 32 * shadowScale);
        shadowGrad.addColorStop(0, `rgba(0, 0, 0, ${shadowAlpha})`);
        shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 32 * shadowScale, 10 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        const beltData = window.BELT_RANKS[this.belt];
        const doBokColor = this.flashRed > 0 ? '#fecdd3' : '#f8fafc';
        const doBokShadow = this.flashRed > 0 ? '#fda4af' : '#cbd5e1';
        const beltColor = beltData.color;

        ctx.scale(this.facing, 1);

        const walkCycle = Math.sin(this.animTimer);
        const bob = this.state === 'walk' ? Math.abs(walkCycle) * 5 : (this.state === 'jump' ? -4 : Math.sin(this.animTimer) * 2);
        const breath = Math.sin(this.animTimer * 0.8) * 1.5;
        const pose = this.skeletalPose;

        // Dobok V-Neck Collar styling
        const collarColor = this.belt === 'BLACK' ? '#09090b' : '#334155';

        // --- AUTHENTIC ANATOMICAL SKELETAL 3D RENDERING (WITH BONE BUMPS, PATELLA & CONDYLE ARTICULATION) ---
        if (this.state === 'attack' && this.currentMove) {
            const hipOriginX = -4;
            const hipOriginY = 40 - bob;

            // 1. SUPPORT / BASE LEG (Anatomical Thigh, Knee Condyle Flare, Calf Bulge, and Ankle Joint)
            ctx.save();
            ctx.translate(-10, hipOriginY);
            const supLean = pose.torsoLean * 0.3;
            ctx.rotate(supLean);
            
            const supKnee = (pose.supportKneeAngle || 0.15) * 12;

            // Render Support Leg with realistic anatomical contours
            ctx.fillStyle = doBokShadow;
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 2.5;
            ctx.lineJoin = 'round';
            ctx.beginPath();
            // Hip root
            ctx.moveTo(-7, 0);
            ctx.lineTo(8, 0);
            // Thigh flare towards knee
            ctx.lineTo(9 + supKnee * 0.5, 16);
            // Lateral Femoral Condyle (Knee Bone Bump)
            ctx.lineTo(10 + supKnee * 0.6, 20);
            ctx.lineTo(8 + supKnee * 0.7, 24);
            // Calf Gastrocnemius contour down to lateral malleolus (Ankle bone bump)
            ctx.lineTo(7 + supKnee, 34);
            ctx.lineTo(8 + supKnee, 37); // Lateral Malleolus bone bump
            ctx.lineTo(6 + supKnee, 40);
            // Ankle base
            ctx.lineTo(-6 + supKnee, 40);
            ctx.lineTo(-7 + supKnee, 37); // Medial Malleolus bump
            ctx.lineTo(-6 + supKnee, 34);
            // Inner leg contour back up through knee fold
            ctx.lineTo(-7 + supKnee * 0.5, 20);
            ctx.lineTo(-6, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Anatomical Knee Crease Shadow on Support Leg
            ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(2 + supKnee * 0.6, 20);
            ctx.lineTo(7 + supKnee * 0.6, 21);
            ctx.stroke();

            // Base Pivot Foot & Sparring Protector
            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = '#020617';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.roundRect(-12 + supKnee, 38, 21, 8, [3, 6, 6, 3]);
            ctx.fill();
            ctx.stroke();
            ctx.restore();

            // 2. TORSO & DOBOK JACKET (With Dynamic Deltoids, Clavicle, V-Neck & Belt)
            ctx.save();
            ctx.translate(hipOriginX, hipOriginY - 6);
            ctx.rotate(pose.torsoLean);

            const torsoGrad = ctx.createLinearGradient(-18, -32, 18, 6);
            torsoGrad.addColorStop(0, doBokColor);
            torsoGrad.addColorStop(1, doBokShadow);
            ctx.fillStyle = torsoGrad;
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 2.5;
            ctx.lineJoin = 'round';
            ctx.beginPath();
            // Shoulder deltoid contours
            ctx.moveTo(-18, -30);
            ctx.quadraticCurveTo(0, -32, 18, -30); // Broad athletic shoulders
            ctx.lineTo(17, -12);
            ctx.lineTo(15, 6); // Tapered waist
            ctx.lineTo(-15, 6);
            ctx.lineTo(-17, -12);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Dobok V-Neck Collar
            ctx.strokeStyle = collarColor;
            ctx.lineWidth = 3.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(-10, -30);
            ctx.lineTo(0, -12);
            ctx.lineTo(10, -30);
            ctx.stroke();

            // Belt & Tied Knot
            ctx.fillStyle = beltColor;
            ctx.strokeStyle = '#09090b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(-19, -4, 38, 9, 3);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(-2, 1, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // HEAD & BANDANA
            ctx.save();
            ctx.translate(0, -40);
            ctx.fillStyle = '#fed7aa';
            ctx.strokeStyle = '#ea580c';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, 13, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Spiky Martial Arts Hair
            ctx.fillStyle = '#1e1b4b';
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

            // Crimson Headband & Streamer Flow
            ctx.fillStyle = '#e11d48';
            ctx.beginPath();
            ctx.roundRect(-13, -6, 26, 6, 2);
            ctx.fill();
            const ribbonFlow = Math.sin(this.animTimer * 6) * 7;
            ctx.beginPath();
            ctx.moveTo(-12, -4);
            ctx.quadraticCurveTo(-22 + ribbonFlow, -2, -28 + ribbonFlow, 4);
            ctx.lineTo(-24 + ribbonFlow, 8);
            ctx.lineTo(-12, 0);
            ctx.fill();

            // Focused Eye
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.ellipse(5, -1, 3, 2.5, 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // GUARD ARMS WITH ARTICULATED ELBOW BONE BUMPS (Olecranon Hexagon & Wrist Joint)
            ctx.fillStyle = doBokColor;
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 2.5;
            ctx.lineJoin = 'round';

            // Lead Guard Arm (Deltoid -> Bicep -> Olecranon Elbow Bump -> Forearm)
            ctx.beginPath();
            ctx.moveTo(4, -26);
            ctx.lineTo(14, -26);
            ctx.lineTo(19, -23); // Elbow Olecranon Bone Bump
            ctx.lineTo(22, -18); // Forearm
            ctx.lineTo(16, -14);
            ctx.lineTo(8, -18);
            ctx.lineTo(4, -20);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Sparring Glove / Fist
            ctx.fillStyle = '#fed7aa';
            ctx.beginPath();
            ctx.arc(22, -18, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Rear Guard Arm (With Shadow & Elbow Point)
            ctx.fillStyle = doBokShadow;
            ctx.beginPath();
            ctx.moveTo(-14, -22);
            ctx.lineTo(-22, -18); // Olecranon point
            ctx.lineTo(-24, -13);
            ctx.lineTo(-16, -12);
            ctx.lineTo(-10, -18);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#fed7aa';
            ctx.beginPath();
            ctx.arc(-22, -13, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.restore(); // End Torso

            // 3. AUTHENTIC ANATOMICAL KICKING LEG (With Hexagonal Patella, Femoral Condyle & Malleolus Bumps)
            ctx.save();
            ctx.translate(hipOriginX + 6, hipOriginY);
            ctx.rotate(pose.thighAngle);

            const thighLen = 25;
            const shinLen = 27;
            const kAngle = pose.kneeAngle || 0;

            // Compute precise joint pivot coordinates
            const kneeX = thighLen;
            const kneeY = 0;
            const ankleX = kneeX + Math.cos(kAngle) * shinLen;
            const ankleY = kneeY + Math.sin(kAngle) * shinLen;

            // Compute perpendicular vectors for natural muscle & bone thickness
            const thighNormX = 0;
            const thighNormY = 1;
            const shinDirX = Math.cos(kAngle);
            const shinDirY = Math.sin(kAngle);
            const shinNormX = -shinDirY;
            const shinNormY = shinDirX;

            // Draw Full Anatomical Dobok Pants Silhouette
            ctx.fillStyle = doBokColor;
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 2.5;
            ctx.lineJoin = 'round';
            ctx.beginPath();
            
            // 1. Hip joint origin
            ctx.moveTo(0, -9);
            // 2. Quadricep curve to upper knee
            ctx.quadraticCurveTo(kneeX * 0.5, -11, kneeX - 3, -9);
            
            // 3. Patella (Knee Cap) Hexagonal / Bone Bump Ridge
            ctx.lineTo(kneeX + shinNormX * 2, -10 + shinNormY * 2);
            ctx.lineTo(kneeX + shinDirX * 3 + shinNormX * 7, -8 + shinDirY * 3 + shinNormY * 7); // Anterior Patella Peak
            ctx.lineTo(kneeX + shinDirX * 6 + shinNormX * 6, -6 + shinDirY * 6 + shinNormY * 6); // Tibial Tuberosity bump
            
            // 4. Anterior Tibial Crest (Shin bone line) to Lateral Malleolus (Ankle Bone)
            ctx.lineTo(ankleX + shinNormX * 6, ankleY + shinNormY * 6);
            ctx.lineTo(ankleX + shinNormX * 7.5 + shinDirX * 1, ankleY + shinNormY * 7.5 + shinDirY * 1); // Ankle Bone Bump
            ctx.lineTo(ankleX + shinDirX * 3, ankleY + shinDirY * 3); // Ankle opening cap
            
            // 5. Medial Malleolus & Achilles / Heel transition
            ctx.lineTo(ankleX - shinNormX * 6.5, ankleY - shinNormY * 6.5);
            // 6. Gastrocnemius (Calf Muscle Belly) bulge
            ctx.quadraticCurveTo(
                kneeX + shinDirX * (shinLen * 0.45) - shinNormX * 9,
                kneeY + shinDirY * (shinLen * 0.45) - shinNormY * 9,
                kneeX - shinNormX * 6,
                kneeY - shinNormY * 6
            );
            // 7. Popliteal Fossa (Posterior Knee Flexure Crease)
            ctx.lineTo(kneeX - 2, 7);
            // 8. Hamstring curve back to gluteal fold & hip
            ctx.quadraticCurveTo(kneeX * 0.4, 10, 0, 9);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Anatomical Joint Shadow Accents (Subtle Patella & Knee Cavity Shading)
            ctx.save();
            ctx.strokeStyle = 'rgba(15, 23, 42, 0.35)';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            // Patellar tendon & condyle contour crease
            ctx.moveTo(kneeX - 1, -4);
            ctx.lineTo(kneeX + 4, -5);
            ctx.lineTo(kneeX + 6, -2);
            ctx.stroke();

            // Posterior Knee Crease
            ctx.beginPath();
            ctx.moveTo(kneeX - 2, 4);
            ctx.lineTo(kneeX + 2, 5);
            ctx.stroke();
            ctx.restore();

            // Taekwondo Sparring Foot Guard (Ball / Instep / Blade of Foot at Ankle)
            ctx.save();
            ctx.translate(ankleX, ankleY);
            ctx.rotate(kAngle + (pose.ankleAngle || 0));
            ctx.fillStyle = '#fde047'; // Sparring Foot Guard
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.roundRect(0, -6, 19, 13, [4, 8, 8, 4]);
            ctx.fill();
            ctx.stroke();

            // Ball of Foot / Toes Pad
            ctx.fillStyle = '#fed7aa';
            ctx.beginPath();
            ctx.arc(18, 0, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            ctx.restore(); // End Kicking Leg
        } else {
            // === NEUTRAL / WALK / JUMP / PARRY STATE RIG (ANATOMICAL CONTOURS & BONE BUMPS) ===
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 2.5;
            ctx.lineJoin = 'round';

            // Back Leg (With Knee Condyle and Ankle Malleolus Bumps)
            const legWalk = this.state === 'walk' ? -walkCycle * 16 : (this.state === 'jump' ? -10 : 0);
            ctx.fillStyle = doBokShadow;
            ctx.beginPath();
            ctx.moveTo(-12 + legWalk, 44 - bob);
            ctx.lineTo(3 + legWalk, 44 - bob);
            // Thigh to knee condyle bump
            ctx.lineTo(4 + legWalk, 60 - bob);
            ctx.lineTo(5 + legWalk, 63 - bob); // Patella / Knee bump
            ctx.lineTo(3 + legWalk, 67 - bob);
            // Calf down to ankle bump
            ctx.lineTo(4 + legWalk, 75 - bob);
            ctx.lineTo(2 + legWalk, 78 - bob);
            ctx.lineTo(-11 + legWalk, 78 - bob);
            ctx.lineTo(-13 + legWalk, 74 - bob);
            ctx.lineTo(-11 + legWalk, 63 - bob);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Back Shoe / Foot Protector
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.roundRect(-10 + legWalk, 76 - bob, 18, 6, [2, 6, 6, 2]);
            ctx.fill();

            // Torso (Anatomical Broad Deltoid Shoulders and Tapered Waist)
            const torsoGrad = ctx.createLinearGradient(-18, 14 - bob, 18, 50 - bob);
            torsoGrad.addColorStop(0, doBokColor);
            torsoGrad.addColorStop(1, doBokShadow);
            ctx.fillStyle = torsoGrad;
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(-18, 14 - bob);
            ctx.quadraticCurveTo(0, 12 - bob, 18, 14 - bob); // Shoulder clavicle arch
            ctx.lineTo(16, 48 - bob + breath * 0.5);
            ctx.lineTo(-16, 48 - bob + breath * 0.5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Dobok V-Neck Collar
            ctx.strokeStyle = collarColor;
            ctx.lineWidth = 3.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(-10, 14 - bob);
            ctx.lineTo(0, 32 - bob);
            ctx.lineTo(10, 14 - bob);
            ctx.stroke();

            // Belt & Knot
            ctx.fillStyle = beltColor;
            ctx.strokeStyle = '#09090b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(-19, 38 - bob, 38, 9, 3);
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(-2, 43 - bob, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Front Leg (Anatomical Patella, Gastrocnemius Calf and Malleolus Ankle)
            const legWalkF = this.state === 'walk' ? walkCycle * 16 : (this.state === 'jump' ? 8 : 0);
            ctx.fillStyle = doBokColor;
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(-2 + legWalkF, 44 - bob);
            ctx.lineTo(13 + legWalkF, 44 - bob);
            // Lateral Quad down to Patella knee cap
            ctx.lineTo(14 + legWalkF, 59 - bob);
            ctx.lineTo(16 + legWalkF, 63 - bob); // Patella ridge
            ctx.lineTo(14 + legWalkF, 67 - bob);
            // Calf to Lateral Malleolus ankle bump
            ctx.lineTo(15 + legWalkF, 75 - bob);
            ctx.lineTo(13 + legWalkF, 78 - bob);
            ctx.lineTo(-1 + legWalkF, 78 - bob);
            ctx.lineTo(-3 + legWalkF, 74 - bob);
            ctx.lineTo(-1 + legWalkF, 63 - bob); // Medial knee crease
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Knee Patella crease highlight
            ctx.strokeStyle = 'rgba(15, 23, 42, 0.35)';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(5 + legWalkF, 63 - bob);
            ctx.lineTo(12 + legWalkF, 63 - bob);
            ctx.stroke();

            // Front Shoe
            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = '#09090b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(0 + legWalkF, 76 - bob, 19, 7, [2, 6, 6, 2]);
            ctx.fill();
            ctx.stroke();

            // Head & Crimson Headband
            ctx.fillStyle = '#fed7aa';
            ctx.strokeStyle = '#ea580c';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 4 - bob, 13, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Spiky Martial Arts Hair
            ctx.fillStyle = '#1e1b4b';
            ctx.beginPath();
            ctx.moveTo(-13, 2 - bob);
            ctx.lineTo(-16, -8 - bob);
            ctx.lineTo(-8, -6 - bob);
            ctx.lineTo(-4, -14 - bob);
            ctx.lineTo(4, -8 - bob);
            ctx.lineTo(10, -12 - bob);
            ctx.lineTo(14, 0 - bob);
            ctx.closePath();
            ctx.fill();

            // Headband
            ctx.fillStyle = '#e11d48';
            ctx.beginPath();
            ctx.roundRect(-13, -2 - bob, 26, 6, 2);
            ctx.fill();

            const ribbonFlow = Math.sin(this.animTimer * 4) * 6;
            ctx.beginPath();
            ctx.moveTo(-12, 0 - bob);
            ctx.quadraticCurveTo(-22 + ribbonFlow, 2 - bob, -28 + ribbonFlow, 8 - bob);
            ctx.lineTo(-24 + ribbonFlow, 12 - bob);
            ctx.lineTo(-12, 4 - bob);
            ctx.fill();

            // Eye
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.ellipse(5, 3 - bob, 3, 2.5, 0.2, 0, Math.PI * 2);
            ctx.fill();

            // Guard Arms (With Hexagonal Olecranon Elbow & Forearm Contours)
            ctx.fillStyle = doBokColor;
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 2.5;
            if (this.state === 'parry') {
                ctx.beginPath();
                ctx.roundRect(0, 12 - bob, 24, 11, 4);
                ctx.roundRect(-6, 22 - bob, 28, 11, 4);
                ctx.fill();
                ctx.stroke();

                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 3;
                ctx.shadowColor = '#38bdf8';
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.arc(12, 22 - bob, 26, -Math.PI * 0.4, Math.PI * 0.4);
                ctx.stroke();
                ctx.shadowBlur = 0;
            } else {
                // Guard Arm with Elbow Olecranon Point
                ctx.beginPath();
                ctx.moveTo(6, 17 - bob);
                ctx.lineTo(18, 17 - bob);
                ctx.lineTo(24, 21 - bob); // Elbow bone bump
                ctx.lineTo(19, 27 - bob);
                ctx.lineTo(6, 25 - bob);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#fed7aa';
                ctx.beginPath();
                ctx.arc(24, 22 - bob, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
        }

        // Ki Aura for Black Belt or High Combo
        if (this.belt === 'BLACK' || this.comboCount >= 12) {
            ctx.strokeStyle = beltData.accentColor || '#facc15';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = beltData.accentColor || '#facc15';
            ctx.shadowBlur = 18;
            ctx.globalAlpha = 0.5 + Math.sin(this.animTimer * 5) * 0.35;
            ctx.beginPath();
            ctx.ellipse(0, 36 - bob, 38 + Math.sin(this.animTimer * 6) * 4, 52, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        ctx.restore();
    }
}

function arenaGroundBaseline(entity) {
    return 560;
}

// Enemy Brawlers, Elite Rivals & Floor 3, 6, 9, 10 Bosses Class
class Enemy {
    constructor(x, y, type = 'bully', floor = 1) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.facing = -1;
        this.floor = floor;

        this.initType(type, floor);

        this.hp = this.maxHp;
        this.state = 'idle';
        this.stateTimer = 0;
        this.attackCooldown = Math.random() * 1.5 + 0.8;
        this.isGrounded = true;
        this.vy = 0;
        this.gravity = 1400;
        this.flashRed = 0;
        this.burnTicks = 0;
        this.burnTimer = 0;
        this.animTimer = Math.random() * 10;
    }

    initType(type, floor) {
        const floorMult = 1 + (floor - 1) * 0.35;

        // Basic Mobs
        if (type === 'bully') {
            this.name = 'School Yard Bully';
            this.width = 44;
            this.height = 76;
            this.maxHp = Math.round(50 * floorMult);
            this.speed = 170;
            this.damage = Math.round(10 * floorMult);
            this.range = 55;
            this.windupTime = 0.5;
            this.activeTime = 0.15;
            this.xpValue = 25;
            this.color = '#dc2626';
            this.pantsColor = '#1e293b';
        } else if (type === 'delinquent') {
            this.name = 'Delinquent Enforcer';
            this.width = 48;
            this.height = 82;
            this.maxHp = Math.round(85 * floorMult);
            this.speed = 200;
            this.damage = Math.round(15 * floorMult);
            this.range = 65;
            this.windupTime = 0.42;
            this.activeTime = 0.18;
            this.xpValue = 45;
            this.color = '#7c3aed';
            this.pantsColor = '#0f172a';
        } else if (type === 'karateka') {
            this.name = 'Karate Club Member';
            this.width = 44;
            this.height = 80;
            this.maxHp = Math.round(120 * floorMult);
            this.speed = 240;
            this.damage = Math.round(20 * floorMult);
            this.range = 75;
            this.windupTime = 0.34;
            this.activeTime = 0.16;
            this.xpValue = 65;
            this.color = '#0284c7';
            this.pantsColor = '#0284c7';
        } else if (type === 'kendo_student') {
            this.name = 'Kendo Club Senior';
            this.width = 46;
            this.height = 82;
            this.maxHp = Math.round(150 * floorMult);
            this.speed = 260;
            this.damage = Math.round(24 * floorMult);
            this.range = 95;
            this.windupTime = 0.30;
            this.activeTime = 0.15;
            this.xpValue = 85;
            this.color = '#1e1b4b';
            this.pantsColor = '#0f172a';
        } else if (type === 'enforcer_heavy') {
            this.name = 'Iron Fist Brawler';
            this.width = 54;
            this.height = 86;
            this.maxHp = Math.round(220 * floorMult);
            this.speed = 210;
            this.damage = Math.round(30 * floorMult);
            this.range = 80;
            this.windupTime = 0.38;
            this.activeTime = 0.20;
            this.xpValue = 120;
            this.color = '#450a0a';
            this.pantsColor = '#18181b';
        }
        
        // --- BUFFED BOSSES & BODYGUARDS (EXACT SCALED SIZES: Boss 1.5x, Elites & Bodyguards 1.2x) ---
        else if (type === 'boss_karate_captain') {
            // Floor 3: Elite Boss Karate Captain (1.2x Player Size)
            this.name = '🥋 Bae Min-Jun (Karate Club Captain)';
            this.scale = 1.2;
            this.width = Math.round(44 * 1.2); // 53
            this.height = Math.round(80 * 1.2); // 96
            this.maxHp = 750;
            this.speed = 280;
            this.damage = 42;
            this.range = 110;
            this.windupTime = 0.26;
            this.activeTime = 0.22;
            this.xpValue = 350;
            this.isBoss = true;
            this.bossTier = 'elite';
            this.color = '#b91c1c';
            this.pantsColor = '#09090b';
        } else if (type === 'boss_kendo_master') {
            // Floor 6: Elite Boss Kendo Master (1.2x Player Size)
            this.name = '⚔️ Kang Tae-Sik (Sword Disciplinarian)';
            this.scale = 1.2;
            this.width = Math.round(44 * 1.2); // 53
            this.height = Math.round(80 * 1.2); // 96
            this.maxHp = 1250;
            this.speed = 320;
            this.damage = 58;
            this.range = 130;
            this.windupTime = 0.22;
            this.activeTime = 0.18;
            this.xpValue = 600;
            this.isBoss = true;
            this.bossTier = 'elite';
            this.color = '#1d4ed8';
            this.pantsColor = '#0f172a';
        } else if (type === 'boss_bodyguard_viper' || type === 'boss_bodyguard_golem') {
            // Floor 9: Bodyguard Boss (1.2x Player Size)
            this.name = type === 'boss_bodyguard_viper' ? '🐍 Viper Baek (Head Bodyguard)' : '🗿 Iron Golem (Heavy Bodyguard)';
            this.scale = 1.2;
            this.width = Math.round(44 * 1.2); // 53
            this.height = Math.round(80 * 1.2); // 96
            this.maxHp = 1850;
            this.speed = type === 'boss_bodyguard_viper' ? 340 : 240;
            this.damage = 72;
            this.range = 115;
            this.windupTime = 0.20;
            this.activeTime = 0.20;
            this.xpValue = 950;
            this.isBoss = true;
            this.bossTier = 'bodyguard';
            this.color = '#701a75';
            this.pantsColor = '#18181b';
        } else if (type === 'boss_the_head') {
            // Floor 10: SUPREME FINAL BOSS - LORD SHIN (1.5x Player Size)
            this.name = '👑 PRINCIPAL SHIN: THE SUPREME HEAD';
            this.scale = 1.5;
            this.width = Math.round(44 * 1.5); // 66
            this.height = Math.round(80 * 1.5); // 120
            this.maxHp = 3200;
            this.speed = 370;
            this.damage = 85;
            this.range = 160;
            this.windupTime = 0.16;
            this.activeTime = 0.24;
            this.xpValue = 2500;
            this.isBoss = true;
            this.bossTier = 'the_head';
            this.color = '#000000'; // Black suit
            this.pantsColor = '#000000';
            this.darkAura = true;
            this.smashCooldown = 4.0;
        }
    }

    takeDamage(dmg, fromX, knockback = 200, stunTime = 0.4, vfx = null) {
        if (this.state === 'ko') return;
        if (this.state === 'smash_grab' || this.state === 'smash_leap') return; // Unstoppable during grab/slam

        this.hp -= dmg;
        this.flashRed = 0.2;
        this.facing = fromX < this.x ? -1 : 1;
        this.x += (fromX < this.x ? 1 : -1) * (knockback * 0.08);

        if (this.hp <= 0) {
            this.hp = 0;
            this.state = 'ko';
            this.stateTimer = 0.8;
            this.vy = -350;
            this.isGrounded = false;
            
            // --- COLLAPSE INTO BRICKY LEGO PHYSICS PIECES ---
            if (vfx && vfx.addLegoBricks) {
                vfx.addLegoBricks(this.x, this.y, this.color, this.pantsColor, this.isBoss);
            }
        } else {
            this.state = 'hitstun';
            this.stateTimer = stunTime;
        }
    }

    applyBurn(ticks = 3) {
        this.burnTicks = Math.max(this.burnTicks, ticks);
    }

    update(dt, player, arena, vfx) {
        this.animTimer += dt * 8;
        if (this.flashRed > 0) this.flashRed -= dt;

        // Burn Status
        if (this.burnTicks > 0) {
            this.burnTimer += dt;
            if (this.burnTimer >= 1.0) {
                this.burnTimer = 0;
                this.burnTicks--;
                this.hp -= 20;
                vfx.addDamageText(this.x, this.y, '-20 🔥', false);
                vfx.addSpark(this.x, this.y + 20, '#f97316', 4, 120);
                if (this.hp <= 0 && this.state !== 'ko') {
                    this.state = 'ko';
                    this.stateTimer = 0.8;
                    if (vfx && vfx.addLegoBricks) {
                        vfx.addLegoBricks(this.x, this.y, this.color, this.pantsColor, this.isBoss);
                    }
                }
            }
        }

        if (this.attackCooldown > 0) this.attackCooldown -= dt;
        if (this.smashCooldown > 0) this.smashCooldown -= dt;

        // Physics
        if (!this.isGrounded) {
            this.vy += this.gravity * dt;
            this.y += this.vy * dt;
            if (this.y >= arena.groundY - this.height) {
                this.y = arena.groundY - this.height;
                this.vy = 0;
                this.isGrounded = true;

                // Ground impact slam on Floor 10 Boss
                if (this.state === 'smash_leap') {
                    this.state = 'idle';
                    this.attackCooldown = 1.0;
                    this.smashCooldown = 5.5;
                    player.takeDamage(95, this.x);
                    player.vy = 300;
                    
                    // Powerful Seismic Screen Shake & Epic Impact VFX
                    if (window.gameEngine) {
                        window.gameEngine.triggerScreenShake(24, 0.45);
                        window.gameEngine.triggerSlowMo(0.18);
                    }
                    
                    // Ground shockwave crater & blood crimson energy burst
                    vfx.addSpark(this.x, this.y + 50, '#e11d48', 40, 550);
                    vfx.addSpark(this.x, this.y + 50, '#facc15', 25, 400);
                    vfx.addDamageText(player.x, player.y, '95 💥 SEISMIC CATACLYSM!', true, true);
                    
                    if (window.soundEngine && window.soundEngine.playHit) {
                        window.soundEngine.playHit('heavy', true);
                    }
                }
            }
        } else {
            this.y = arena.groundY - this.height;
        }

        // State Machine
        if (this.state === 'ko') {
            this.stateTimer -= dt;
            return;
        }

        if (this.state === 'hitstun') {
            this.stateTimer -= dt;
            if (this.stateTimer <= 0) {
                this.state = 'idle';
            }
            return;
        }

        const distToPlayer = Math.abs(player.x - this.x);
        this.facing = player.x > this.x ? 1 : -1;

        // --- UNIQUE SPECIAL SKILL: PRINCIPAL SHIN CATCH, JUMP & GROUND SMASH ---
        if (this.type === 'boss_the_head') {
            if (this.state === 'smash_grab') {
                this.stateTimer += dt;
                // Lock player to boss hands
                player.x = this.x + this.facing * 30;
                player.y = this.y - 15;
                player.iFrames = 0.5;

                // Screen tremor during lock-on grab
                if (window.gameEngine && Math.random() < 0.4) {
                    window.gameEngine.triggerScreenShake(6, 0.1);
                }
                vfx.addSpark(this.x + this.facing * 20, this.y + 10, '#f43f5e', 2, 80);

                if (this.stateTimer >= 0.45) {
                    // Leap skyward carrying the player with a massive sonic shockwave!
                    this.state = 'smash_leap';
                    this.isGrounded = false;
                    this.vy = -850;
                    
                    if (window.gameEngine) {
                        window.gameEngine.triggerScreenShake(14, 0.25);
                    }
                    vfx.addSpark(this.x, arena.groundY - 10, '#e11d48', 20, 380);
                    if (window.soundEngine && window.soundEngine.playWhoosh) {
                        window.soundEngine.playWhoosh(0.6, 1.8);
                    }
                    vfx.addDamageText(this.x, this.y - 40, '💥 SEISMIC TOSS!', true);
                }
                return;
            } else if (this.state === 'smash_leap') {
                // Carry player in air
                player.x = this.x + this.facing * 30;
                player.y = this.y - 15;
                if (Math.random() < 0.5) {
                    vfx.addSpark(this.x, this.y + 20, '#e11d48', 3, 140);
                }
                return;
            } else if (this.smashCooldown <= 0 && distToPlayer < 110 && this.isGrounded) {
                // Trigger Catch & Smash
                this.state = 'smash_grab';
                this.stateTimer = 0;
                if (window.gameEngine) {
                    window.gameEngine.triggerScreenShake(10, 0.2);
                }
                vfx.addSpark(this.x, this.y + 20, '#e11d48', 16, 260);
                vfx.addDamageText(this.x, this.y - 30, '⚠️ CAUGHT!', true);
                return;
            }
        }

        if (this.state === 'windup') {
            this.stateTimer += dt;
            if (this.stateTimer >= this.windupTime) {
                this.state = 'attack';
                this.stateTimer = 0;
                if (window.soundEngine) window.soundEngine.playWhoosh(0.85);
            }
        } else if (this.state === 'attack') {
            this.stateTimer += dt;
            if (this.stateTimer < this.activeTime && distToPlayer < this.range && Math.abs(player.y - this.y) < 60) {
                player.takeDamage(this.damage, this.x);
            }
            if (this.stateTimer >= this.activeTime) {
                this.state = 'idle';
                this.attackCooldown = Math.random() * 0.8 + 0.6;
            }
        } else {
            if (distToPlayer > this.range - 10) {
                this.state = 'approach';
                this.x += this.facing * this.speed * dt;
            } else {
                this.state = 'idle';
                if (this.attackCooldown <= 0 && distToPlayer <= this.range + 10) {
                    this.state = 'windup';
                    this.stateTimer = 0;
                }
            }
        }

        this.x = Math.max(20, Math.min(arena.width - 20, this.x));
    }

    render(ctx) {
        if (this.state === 'ko') return; // Enemy body has collapsed into articulated Lego bricks!

        ctx.save();
        ctx.translate(this.x, this.y);

        // Soft Drop Shadow
        const renderScale = this.scale || 1.0;
        const shadowGrad = ctx.createRadialGradient(0, this.height, 2, 0, this.height, 28 * renderScale);
        shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
        shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.ellipse(0, this.height, 26 * renderScale, 8 * renderScale, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.scale(this.facing * renderScale, renderScale);

        const walkCycle = Math.sin(this.animTimer);
        const bob = this.state === 'approach' ? Math.abs(walkCycle) * 5 : Math.sin(this.animTimer * 0.5) * 2;

        // --- DARK AURA FOR FLOOR 10 FINAL BOSS (LORD SHIN) ---
        if (this.darkAura) {
            ctx.strokeStyle = '#e11d48';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#e11d48';
            ctx.shadowBlur = 24;
            ctx.globalAlpha = 0.75 + Math.sin(this.animTimer * 6) * 0.25;
            ctx.beginPath();
            ctx.ellipse(0, 40 - bob, 44 + Math.sin(this.animTimer * 7) * 4, 58, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1.0;
        }

        // --- Legs & Pants (Anatomical Thigh, Patella Ridge, Calf, and Malleolus Ankle) ---
        ctx.fillStyle = this.pantsColor;
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';

        const legWalk = this.state === 'approach' ? walkCycle * 14 : 0;
        
        // Left Leg (Back) with Anatomical Contours
        ctx.beginPath();
        ctx.moveTo(-12 - legWalk, 44 - bob);
        ctx.lineTo(-1 - legWalk, 44 - bob);
        ctx.lineTo(0 - legWalk, 59 - bob);
        ctx.lineTo(1 - legWalk, 63 - bob); // Patella bump
        ctx.lineTo(-1 - legWalk, 67 - bob);
        ctx.lineTo(0 - legWalk, 75 - bob);
        ctx.lineTo(-2 - legWalk, 78 - bob); // Lateral Malleolus
        ctx.lineTo(-13 - legWalk, 78 - bob);
        ctx.lineTo(-15 - legWalk, 74 - bob);
        ctx.lineTo(-13 - legWalk, 62 - bob); // Inner knee
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Right Leg (Front) with Anatomical Contours
        ctx.beginPath();
        ctx.moveTo(2 + legWalk, 44 - bob);
        ctx.lineTo(13 + legWalk, 44 - bob);
        ctx.lineTo(14 + legWalk, 59 - bob);
        ctx.lineTo(16 + legWalk, 63 - bob); // Patella bone bump
        ctx.lineTo(14 + legWalk, 67 - bob);
        ctx.lineTo(15 + legWalk, 75 - bob);
        ctx.lineTo(13 + legWalk, 78 - bob); // Malleolus bump
        ctx.lineTo(2 + legWalk, 78 - bob);
        ctx.lineTo(0 + legWalk, 74 - bob);
        ctx.lineTo(2 + legWalk, 62 - bob);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Knee Cap Shadow Crease Accents
        ctx.strokeStyle = 'rgba(2, 6, 23, 0.4)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(5 + legWalk, 63 - bob);
        ctx.lineTo(11 + legWalk, 63 - bob);
        ctx.stroke();

        // Shoes
        ctx.fillStyle = this.type === 'boss_the_head' ? '#09090b' : '#0f172a';
        ctx.fillRect(-15 - legWalk, 74 - bob, 17, 7);
        ctx.fillRect(0 + legWalk, 74 - bob, 17, 7);

        // --- Torso / Outfit (Broad Shoulders & Tapered Athletic Waist) ---
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(-18, 14 - bob);
        ctx.quadraticCurveTo(0, 12 - bob, 18, 14 - bob);
        ctx.lineTo(16, 48 - bob);
        ctx.lineTo(-16, 48 - bob);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Boss Uniform & Principal Suit Styling
        if (this.type === 'boss_the_head') {
            // Tailored Black Suit Jacket with Lapels
            ctx.fillStyle = '#09090b';
            ctx.fillRect(-17, 15 - bob, 34, 32);

            // Crisp White Collared Shirt V-shape
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.moveTo(-8, 14 - bob);
            ctx.lineTo(0, 32 - bob);
            ctx.lineTo(8, 14 - bob);
            ctx.closePath();
            ctx.fill();

            // Crimson Silk Necktie
            ctx.fillStyle = '#e11d48';
            ctx.beginPath();
            ctx.moveTo(-3, 16 - bob);
            ctx.lineTo(3, 16 - bob);
            ctx.lineTo(4, 34 - bob);
            ctx.lineTo(0, 39 - bob);
            ctx.lineTo(-4, 34 - bob);
            ctx.closePath();
            ctx.fill();

            // Suit Lapels
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-16, 14 - bob); ctx.lineTo(-7, 30 - bob);
            ctx.moveTo(16, 14 - bob); ctx.lineTo(7, 30 - bob);
            ctx.stroke();

            // Gold Principal Pocket Watch Chain
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(8, 36 - bob, 6, 0, Math.PI);
            ctx.stroke();
        }

        // --- Head & Face ---
        ctx.fillStyle = this.type === 'boss_the_head' ? '#e2e8f0' : '#fed7aa'; // Authoritative complexion
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 4 - bob, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Hair / Slicked Principal Hairstyle
        if (this.type === 'boss_the_head') {
            // Slicked Back Black Hair with Silver Streaks
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(0, 0 - bob, 14, Math.PI * 0.85, Math.PI * 2.15);
            ctx.fill();
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-6, -8 - bob); ctx.lineTo(4, -12 - bob);
            ctx.stroke();

            // THICK DARK BEARD & MUSTACHE (Principal & Head Authority)
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.moveTo(-12, 6 - bob);
            ctx.lineTo(-10, 16 - bob);
            ctx.lineTo(-3, 20 - bob);
            ctx.lineTo(0, 21 - bob);
            ctx.lineTo(3, 20 - bob);
            ctx.lineTo(10, 16 - bob);
            ctx.lineTo(12, 6 - bob);
            ctx.lineTo(7, 9 - bob);
            ctx.lineTo(0, 10 - bob);
            ctx.lineTo(-7, 9 - bob);
            ctx.closePath();
            ctx.fill();

            // Full Mustache
            ctx.fillStyle = '#020617';
            ctx.beginPath();
            ctx.roundRect(-8, 8 - bob, 16, 4, 2);
            ctx.fill();
        } else {
            ctx.fillStyle = '#334155';
            ctx.beginPath();
            ctx.arc(0, -1 - bob, 13, Math.PI * 0.8, Math.PI * 2.2);
            ctx.fill();
        }

        // Eyes (Glowing Crimson for Bosses)
        ctx.fillStyle = this.isBoss ? '#ef4444' : '#dc2626';
        if (this.type === 'boss_the_head') {
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 8;
        }
        ctx.fillRect(3, 3 - bob, 4, 3);
        ctx.shadowBlur = 0;

        // --- Arms & Attack Stance ---
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.type === 'boss_the_head' ? '#e11d48' : '#020617';
        ctx.lineWidth = 2.5;

        if (this.state === 'smash_grab' || this.state === 'smash_leap') {
            // Forward outstretched grabbing arms
            ctx.beginPath();
            ctx.roundRect(8, 10 - bob, 32, 12, 4);
            ctx.roundRect(8, 22 - bob, 32, 12, 4);
            ctx.fill();
            ctx.stroke();
        } else if (this.state === 'windup') {
            ctx.beginPath();
            ctx.roundRect(-24, 20 - bob, 16, 12, 4);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(-22, 26 - bob, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        } else if (this.state === 'attack') {
            ctx.beginPath();
            ctx.roundRect(8, 18 - bob, 36, 14, 4);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = this.type === 'boss_the_head' ? '#e11d48' : '#fed7aa';
            ctx.beginPath();
            ctx.arc(46, 25 - bob, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.roundRect(4, 20 - bob, 16, 11, 4);
            ctx.fill();
            ctx.stroke();
        }

        // Boss Health Bar & Crown Title
        if (this.hp < this.maxHp && this.state !== 'ko') {
            const barW = this.isBoss ? 68 : 42;
            const barH = this.isBoss ? 8 : 6;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.beginPath();
            ctx.roundRect(-barW / 2 - 1, -22 - bob, barW + 2, barH + 2, 3);
            ctx.fill();

            const pct = Math.max(0, this.hp / this.maxHp);
            ctx.fillStyle = this.type === 'boss_the_head' ? '#e11d48' : (this.isBoss ? '#f59e0b' : '#ef4444');
            ctx.beginPath();
            ctx.roundRect(-barW / 2, -21 - bob, barW * pct, barH, 2);
            ctx.fill();
        }

        if (this.isBoss) {
            ctx.font = 'bold 12px "Outfit", sans-serif';
            ctx.fillStyle = this.type === 'boss_the_head' ? '#f43f5e' : '#facc15';
            ctx.textAlign = 'center';
            ctx.fillText(this.type === 'boss_the_head' ? '👑 PRINCIPAL SHIN' : '👑 ELITE', 0, -28 - bob);
        }

        ctx.restore();
    }
}

// Female School Nurse NPC in Pristine White Attire for Nursery Rest Haven
class NurseNPC {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 80;
        this.animTimer = 0;
        this.hasHealed = false;
        this.dialogue = "Please rest here. Vital signs stabilized and energy replenished.";
        this.dialogueTimer = 0;
    }

    update(dt, player, vfx) {
        this.animTimer += dt * 3;
        this.dialogueTimer += dt;

        // Auto healing on proximity
        const dist = Math.hypot(player.x - this.x, player.y - this.y);
        if (dist < 180 && !this.hasHealed) {
            this.hasHealed = true;
            const healHp = player.maxHp - player.hp;
            player.hp = player.maxHp;
            player.ki = player.maxKi;

            vfx.addHealingPulse(player.x, player.y + 20);
            vfx.addHealingPulse(this.x, this.y + 20);
            vfx.addDamageText(player.x, player.y - 20, `FULL TREATMENT APPLIED: +${healHp} HP`, false, false, true);

            if (window.soundEngine && window.soundEngine.playBeltRankUp) {
                window.soundEngine.playBeltRankUp();
            }
        }
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        const bob = Math.sin(this.animTimer) * 2.5;

        // Ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, this.height - 2, 28, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // White Nurse Dress & Apron
        const dressGrad = ctx.createLinearGradient(-16, 20 - bob, 16, 75 - bob);
        dressGrad.addColorStop(0, '#ffffff');
        dressGrad.addColorStop(1, '#f1f5f9');
        ctx.fillStyle = dressGrad;
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-16, 22 - bob, 32, 54, [6, 6, 12, 12]);
        ctx.fill();
        ctx.stroke();

        // Red Medical Cross on Apron
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-3, 38 - bob, 6, 18);
        ctx.fillRect(-9, 44 - bob, 18, 6);

        // Nurse Collar & Stethoscope
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 26 - bob, 10, 0, Math.PI);
        ctx.stroke();

        // Head & Gentle Facial Features
        ctx.fillStyle = '#fde68a'; // skin tone
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 10 - bob, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Long Dark Hair
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.arc(0, 8 - bob, 14, Math.PI * 0.8, Math.PI * 2.2);
        ctx.fill();
        // Hair sides
        ctx.fillRect(-14, 8 - bob, 6, 24);
        ctx.fillRect(8, 8 - bob, 6, 24);

        // White Nurse Cap with Red Cross
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-12, -4 - bob, 24, 10, [4, 4, 1, 1]);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-1.5, -2 - bob, 3, 7);
        ctx.fillRect(-3.5, 0 - bob, 7, 3);

        // Gentle eyes & smile
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(-4, 10 - bob, 2, 0, Math.PI * 2);
        ctx.arc(4, 10 - bob, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 14 - bob, 4, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Floating Healing Aura & Dialogue Box
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-140, -42 - bob, 280, 28, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 12px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.dialogue, 0, -24 - bob);

        ctx.restore();
    }
}

window.ParticleSystem = ParticleSystem;
window.Player = Player;
window.Enemy = Enemy;
window.NurseNPC = NurseNPC;

