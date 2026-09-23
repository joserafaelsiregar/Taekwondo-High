// Entity Classes: Player (Taekwondo Martial Artist), Enemy Brawlers/Bosses, Visual Particle Effects

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.damageTexts = [];
        this.slashTrails = [];
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

    addKickTrail(x, y, radius, angleStart, angleEnd, color = 'rgba(255,255,255,0.8)') {
        this.slashTrails.push({
            x, y, radius,
            angleStart, angleEnd,
            color,
            life: 1.0,
            decay: 6.0
        });
    }

    addDamageText(x, y, text, isCrit = false, isPlayer = false) {
        this.damageTexts.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y - 20,
            text: text,
            isCrit: isCrit,
            color: isPlayer ? '#ef4444' : (isCrit ? '#facc15' : '#ffffff'),
            size: isCrit ? 26 : 18,
            vy: -120,
            life: 1.0,
            decay: 1.4
        });
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

        // Damage Texts
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
    }

    render(ctx) {
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
            ctx.font = `900 ${d.size}px "Outfit", "Segoe UI", sans-serif`;
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

// Player Class
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
            secondary: 'low_kick',
            dash: 'quick_dash',
            special1: null,
            special2: null,
            ultimate: null
        };
        this.activeMovesList = ['ap_chagi', 'low_kick', 'quick_dash'];
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

        // Combat State
        this.state = 'idle'; // 'idle', 'walk', 'attack', 'dash', 'hitstun', 'parry'
        this.stateTimer = 0;
        this.currentMove = null;
        this.movePhase = 'startup'; // 'startup', 'active', 'recovery'
        this.hitboxActive = false;
        this.hasHitThisAttack = false;
        this.cooldowns = {};
        this.iFrames = 0; // invulnerable duration
        this.isGrounded = true;
        this.vy = 0;
        this.gravity = 1400;

        // Combo Engine
        this.comboCount = 0;
        this.comboTimer = 0;
        this.comboGrade = 'D';

        // Animation / Visuals
        this.animFrame = 0;
        this.animTimer = 0;
        this.legAngle = 0;
        this.torsoAngle = 0;
        this.flashRed = 0;
    }

    applyBeltStats(beltId) {
        this.belt = beltId;
        const info = window.BELT_RANKS[beltId];
        const oldMaxHp = this.maxHp;
        this.maxHp = info.statBonus.maxHealth + (this.maxHpBonus || 0);
        this.hp = Math.min(this.maxHp, this.hp + (this.maxHp - oldMaxHp));
        this.maxKi = info.statBonus.kiMax;
        this.kiRegen = info.statBonus.kiRegen;
        this.baseSpeed = info.statBonus.speed;
        this.speed = this.baseSpeed * (1 + this.speedBonus);

        // Auto-equip unlocked moves if slot is empty
        if (info.unlockedMoves.includes('dollyo_chagi') && !this.equippedMoves.special1) {
            this.equippedMoves.special1 = 'dollyo_chagi';
        }
        if (info.unlockedMoves.includes('flying_side_kick') && !this.equippedMoves.special2) {
            this.equippedMoves.special2 = 'flying_side_kick';
        }
        if (info.unlockedMoves.includes('dragon_finisher') && !this.equippedMoves.ultimate) {
            this.equippedMoves.ultimate = 'dragon_finisher';
        }

        // Add to active list
        info.unlockedMoves.forEach(m => {
            if (!this.activeMovesList.includes(m)) this.activeMovesList.push(m);
        });
    }

    gainXp(amount) {
        this.xp += amount;
        this.totalScore += amount * 10;
        const currentRankIndex = window.BELT_ORDER.indexOf(this.belt);
        const nextBeltId = window.BELT_ORDER[currentRankIndex + 1];

        if (nextBeltId) {
            const nextInfo = window.BELT_RANKS[nextBeltId];
            if (this.xp >= nextInfo.xpRequired && !this.pendingPromotion) {
                this.pendingPromotion = nextBeltId;
                return nextBeltId; // Triggers math challenge examination
            }
        }
        return null;
    }

    performMove(moveId) {
        if (this.state === 'hitstun' || this.state === 'dash') return false;
        if (this.cooldowns[moveId] > 0) return false;

        const move = window.MOVES_DATABASE[moveId];
        if (!move) return false;

        if (this.ki < move.kiCost) {
            return false; // Not enough Ki
        }

        // Consume Ki
        this.ki -= move.kiCost;
        this.currentMove = move;
        this.state = move.type === 'defense' ? 'parry' : (move.type === 'utility' ? 'dash' : 'attack');
        this.stateTimer = 0;
        this.movePhase = 'startup';
        this.hitboxActive = false;
        this.hasHitThisAttack = false;

        const cd = (move.cooldown || 1.0) * this.cooldownMult;
        this.cooldowns[moveId] = cd;

        if (move.id === 'quick_dash') {
            this.iFrames = move.duration;
            if (window.soundEngine) window.soundEngine.playDash();
        } else if (move.id === 'parry_counter') {
            this.iFrames = move.guardDuration;
            if (window.soundEngine) window.soundEngine.playParry();
        } else {
            if (window.soundEngine) {
                if (move.id === 'dragon_finisher' || move.id === 'tornado_540') {
                    window.soundEngine.playSpecialKi();
                } else {
                    window.soundEngine.playWhoosh(1.0, move.damage > 50 ? 1.4 : 1.0);
                }
            }
        }

        // Jump physics for flying kicks
        if (move.airborne) {
            this.vy = -480;
            this.isGrounded = false;
        }

        return true;
    }

    takeDamage(amount, fromX) {
        if (this.iFrames > 0) return 0; // Invulnerable

        // Parry counter check
        if (this.state === 'parry') {
            if (window.soundEngine) window.soundEngine.playParry();
            this.state = 'attack';
            this.currentMove = {
                id: 'parry_strike',
                name: 'Parry Counter Strike',
                damage: 75,
                range: 110,
                knockback: 400,
                stunTime: 0.8,
                startupTime: 0.05,
                activeTime: 0.15,
                recoveryTime: 0.1,
                vfx: { trailColor: '#facc15', sparkColor: '#fef08a', arcAngle: 0.8 }
            };
            this.stateTimer = 0;
            this.movePhase = 'startup';
            return -1; // Deflected!
        }

        // Damage reduction
        const finalDmg = Math.max(1, Math.round(amount * (1 - this.dmgReduction)));
        this.hp -= finalDmg;
        this.flashRed = 0.2;
        this.state = 'hitstun';
        this.stateTimer = 0.3; // 0.3s stun
        this.iFrames = 0.45; // brief hit-grace

        // Reset combo
        this.comboCount = 0;

        if (window.soundEngine) window.soundEngine.playHit('heavy', true);

        // Check revive perk
        if (this.hp <= 0 && this.revives > 0) {
            this.revives--;
            this.hp = Math.round(this.maxHp * 0.5);
            this.iFrames = 3.0;
            if (window.soundEngine) window.soundEngine.playBeltRankUp();
        }

        return finalDmg;
    }

    update(dt, input, arena, vfx) {
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
                this.state = 'idle';
            }
        } else if (this.state === 'dash') {
            this.stateTimer += dt;
            const dashSpd = 800;
            this.x += this.facing * dashSpd * dt;
            // Spawn afterimage dust
            if (Math.random() < 0.4) {
                vfx.addSpark(this.x, this.y + 30, '#94a3b8', 2, 80);
            }
            if (this.stateTimer >= 0.18) {
                this.state = 'idle';
            }
        } else if (this.state === 'parry') {
            this.stateTimer += dt;
            if (this.stateTimer >= 0.3) {
                this.state = 'idle';
            }
        } else if (this.state === 'attack') {
            this.updateAttackState(dt, vfx);
        } else {
            // Normal Movement
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
                this.state = 'walk';
                this.x += moveX * (this.baseSpeed * (1 + this.speedBonus)) * dt;
                this.animTimer += dt * 12;
            } else {
                this.state = 'idle';
                this.animTimer += dt * 4;
            }
        }

        // Physics & Gravity
        if (!this.isGrounded) {
            this.vy += this.gravity * dt;
            this.y += this.vy * dt;
            if (this.y >= arena.groundY - this.height) {
                this.y = arena.groundY - this.height;
                this.vy = 0;
                this.isGrounded = true;
            }
        } else {
            this.y = arena.groundY - this.height;
        }

        // Arena boundaries
        this.x = Math.max(30, Math.min(arena.width - 30, this.x));
    }

    updateAttackState(dt, vfx) {
        const m = this.currentMove;
        if (!m) {
            this.state = 'idle';
            return;
        }

        this.stateTimer += dt;

        // Startup Phase
        if (this.movePhase === 'startup') {
            this.legAngle = -0.4 * this.facing;
            if (this.stateTimer >= m.startupTime) {
                this.movePhase = 'active';
                this.hitboxActive = true;
                // Add Kick Arc Trail
                const arcDir = this.facing === 1 ? 0 : Math.PI;
                vfx.addKickTrail(
                    this.x + this.facing * 30,
                    this.y + 35,
                    m.range * 0.75,
                    arcDir - (m.vfx?.arcAngle || 0.4),
                    arcDir + (m.vfx?.arcAngle || 0.4),
                    m.vfx?.trailColor || 'rgba(255,255,255,0.8)'
                );

                // Slight lunging step forward
                this.x += this.facing * (m.range * 0.25);
            }
        } else if (this.movePhase === 'active') {
            this.legAngle = 1.4 * this.facing;
            if (this.stateTimer >= m.startupTime + m.activeTime) {
                this.movePhase = 'recovery';
                this.hitboxActive = false;
            }
        } else if (this.movePhase === 'recovery') {
            this.legAngle = 0.5 * this.facing;
            if (this.stateTimer >= m.startupTime + m.activeTime + m.recoveryTime) {
                this.state = 'idle';
                this.currentMove = null;
                this.hitboxActive = false;
            }
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

        // Invulnerability blink
        if (this.iFrames > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
            ctx.globalAlpha = 0.45;
        }

        // Soft Radial Shadow under feet
        const shadowGrad = ctx.createRadialGradient(0, this.height, 2, 0, this.height, 32);
        shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
        shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.ellipse(0, this.height, 30, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hit flash
        if (this.flashRed > 0) {
            ctx.filter = 'brightness(2.6) saturate(2)';
        }

        const beltData = window.BELT_RANKS[this.belt];
        const doBokColor = '#f8fafc'; // Crisp White Taekwondo Uniform
        const doBokShadow = '#cbd5e1';
        const beltColor = beltData.color;

        ctx.scale(this.facing, 1);

        // Dynamic motion bob & breathing
        const walkCycle = Math.sin(this.animTimer);
        const bob = this.state === 'walk' ? Math.abs(walkCycle) * 5 : Math.sin(this.animTimer) * 2;
        const breath = Math.sin(this.animTimer * 0.8) * 1.5;

        // --- Back Leg (Layered Dobok Trousers) ---
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        if (this.state === 'attack' && this.movePhase === 'active') {
            // High Extended Kick Leg
            ctx.fillStyle = doBokColor;
            ctx.beginPath();
            ctx.roundRect(0, 36 - bob, 52, 16, [6, 10, 10, 6]);
            ctx.fill();
            ctx.stroke();

            // Foot / Instep with ankle wrap
            ctx.fillStyle = '#fde047'; // Martial sparring foot protector
            ctx.beginPath();
            ctx.roundRect(50, 34 - bob, 18, 20, [4, 8, 8, 4]);
            ctx.fill();
            ctx.stroke();
        } else {
            // Standing / Running back leg
            const legWalk = this.state === 'walk' ? -walkCycle * 16 : 0;
            ctx.fillStyle = doBokShadow;
            ctx.beginPath();
            ctx.roundRect(-12 + legWalk, 44 - bob, 16, 36, [4, 4, 8, 8]);
            ctx.fill();
            ctx.stroke();

            // Sparring foot wrap
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.roundRect(-10 + legWalk, 76 - bob, 18, 6, [2, 6, 6, 2]);
            ctx.fill();
        }

        // --- Torso / Do-bok Jacket with Shaded Folds ---
        const torsoGrad = ctx.createLinearGradient(-18, 14 - bob, 18, 50 - bob);
        torsoGrad.addColorStop(0, doBokColor);
        torsoGrad.addColorStop(1, doBokShadow);
        ctx.fillStyle = torsoGrad;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(-18, 14 - bob + breath * 0.5, 36, 36, 6);
        ctx.fill();
        ctx.stroke();

        // Authentic V-Neck Dobok Collar (Y-neckline)
        const collarColor = this.belt === 'BLACK' ? '#09090b' : '#334155';
        ctx.strokeStyle = collarColor;
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-10, 14 - bob);
        ctx.lineTo(0, 32 - bob);
        ctx.lineTo(10, 14 - bob);
        ctx.stroke();

        // --- Martial Arts Belt (Tied Knot & Flowing Ends) ---
        ctx.fillStyle = beltColor;
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-19, 38 - bob, 38, 9, 3);
        ctx.fill();
        ctx.stroke();

        // Belt Knot & Flowing Streamers
        ctx.fillStyle = beltColor;
        ctx.beginPath();
        ctx.arc(-2, 43 - bob, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        const streamerWave = Math.sin(this.animTimer * 3) * 3;
        ctx.moveTo(-4, 44 - bob);
        ctx.quadraticCurveTo(-10 + streamerWave, 56 - bob, -8 + streamerWave, 64 - bob);
        ctx.lineTo(-3 + streamerWave, 64 - bob);
        ctx.lineTo(1, 44 - bob);
        ctx.fill();
        ctx.stroke();

        // --- Front Leg ---
        if (this.state !== 'attack' || this.movePhase !== 'active') {
            const legWalkF = this.state === 'walk' ? walkCycle * 16 : 0;
            ctx.fillStyle = doBokColor;
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.roundRect(-2 + legWalkF, 44 - bob, 16, 36, [4, 4, 8, 8]);
            ctx.fill();
            ctx.stroke();

            // Sparring foot wrap
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.roundRect(0 + legWalkF, 76 - bob, 18, 6, [2, 6, 6, 2]);
            ctx.fill();
        }

        // --- Head, Face & Martial Arts Hair ---
        ctx.fillStyle = '#fed7aa'; // Anime skin tone
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 4 - bob, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Spiky Anime Hair
        ctx.fillStyle = '#1e1b4b'; // Deep navy black hair
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

        // Fiery Red Crimson Headband
        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.roundRect(-13, -2 - bob, 26, 6, 2);
        ctx.fill();

        // Trailing Headband Ribbons (Dynamic Physics)
        const ribbonFlow = Math.sin(this.animTimer * 4) * 6;
        ctx.beginPath();
        ctx.moveTo(-12, 0 - bob);
        ctx.quadraticCurveTo(-22 + ribbonFlow, 2 - bob, -28 + ribbonFlow, 8 - bob);
        ctx.lineTo(-24 + ribbonFlow, 12 - bob);
        ctx.lineTo(-12, 4 - bob);
        ctx.fill();

        // Determined Martial Focus Eyes
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(5, 3 - bob, 3, 2.5, 0.2, 0, Math.PI * 2);
        ctx.fill();
        // Eye Sparkle
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(6, 2 - bob, 1, 0, Math.PI * 2);
        ctx.fill();

        // --- Arms & Guard Stance ---
        ctx.fillStyle = doBokColor;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        if (this.state === 'parry') {
            // Cross Block (Momtong Makki)
            ctx.beginPath();
            ctx.roundRect(0, 12 - bob, 24, 11, 4);
            ctx.roundRect(-6, 22 - bob, 28, 11, 4);
            ctx.fill();
            ctx.stroke();

            // Blue Parry Shield Glow
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(12, 22 - bob, 26, -Math.PI * 0.4, Math.PI * 0.4);
            ctx.stroke();
            ctx.shadowBlur = 0;
        } else {
            // Classic Taekwondo Dynamic Stance
            ctx.beginPath();
            ctx.roundRect(6, 18 - bob, 18, 10, 4);
            ctx.fill();
            ctx.stroke();

            // Clenched Fist with Sparring Glove
            ctx.fillStyle = '#fed7aa';
            ctx.beginPath();
            ctx.arc(24, 22 - bob, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        // Martial Ki Aura for High Combos & Black Belt
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

// Enemy Brawlers & Club Rivals Class
class Enemy {
    constructor(x, y, type = 'bully', floor = 1) {
        this.x = x;
        this.y = y;
        this.type = type; // 'bully', 'delinquent', 'karateka', 'kendo_captain', 'boss_prefect'
        this.facing = -1;
        this.floor = floor;

        this.initType(type, floor);

        this.hp = this.maxHp;
        this.state = 'idle'; // 'idle', 'approach', 'windup', 'attack', 'hitstun', 'ko'
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
        const floorMult = 1 + (floor - 1) * 0.45;

        if (type === 'bully') {
            this.name = 'School Yard Bully';
            this.width = 44;
            this.height = 76;
            this.maxHp = Math.round(55 * floorMult);
            this.speed = 170;
            this.damage = Math.round(12 * floorMult);
            this.range = 55;
            this.windupTime = 0.5;
            this.activeTime = 0.15;
            this.xpValue = 25;
            this.color = '#dc2626'; // Red hoodie
            this.pantsColor = '#1e293b';
        } else if (type === 'delinquent') {
            this.name = 'Delinquent Enforcer';
            this.width = 48;
            this.height = 82;
            this.maxHp = Math.round(95 * floorMult);
            this.speed = 210;
            this.damage = Math.round(18 * floorMult);
            this.range = 65;
            this.windupTime = 0.4;
            this.activeTime = 0.18;
            this.xpValue = 45;
            this.color = '#7c3aed'; // Purple varsity jacket
            this.pantsColor = '#0f172a';
        } else if (type === 'karateka') {
            this.name = 'Rival Karate Club Senior';
            this.width = 44;
            this.height = 80;
            this.maxHp = Math.round(140 * floorMult);
            this.speed = 250;
            this.damage = Math.round(24 * floorMult);
            this.range = 80;
            this.windupTime = 0.32;
            this.activeTime = 0.16;
            this.xpValue = 70;
            this.color = '#0284c7'; // Blue Karate Gi
            this.pantsColor = '#0284c7';
        } else if (type === 'boss_prefect') {
            this.name = 'Disciplinary Head: Ryu Han-Seo';
            this.width = 54;
            this.height = 88;
            this.maxHp = Math.round(420 * floorMult);
            this.speed = 280;
            this.damage = Math.round(36 * floorMult);
            this.range = 100;
            this.windupTime = 0.28;
            this.activeTime = 0.22;
            this.xpValue = 260;
            this.isBoss = true;
            this.color = '#b91c1c'; // Gold-trimmed Disciplinary Blazer
            this.pantsColor = '#09090b';
        }
    }

    takeDamage(dmg, fromX, knockback = 200, stunTime = 0.4, vfx = null) {
        if (this.state === 'ko') return;

        this.hp -= dmg;
        this.flashRed = 0.2;
        this.facing = fromX < this.x ? -1 : 1;
        this.x += (fromX < this.x ? 1 : -1) * (knockback * 0.1);

        if (this.hp <= 0) {
            this.hp = 0;
            this.state = 'ko';
            this.stateTimer = 0.8;
            this.vy = -350;
            this.isGrounded = false;
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
                this.hp -= 15;
                vfx.addDamageText(this.x, this.y, '-15 🔥', false);
                vfx.addSpark(this.x, this.y + 20, '#f97316', 4, 120);
                if (this.hp <= 0 && this.state !== 'ko') {
                    this.state = 'ko';
                    this.stateTimer = 0.8;
                }
            }
        }

        if (this.attackCooldown > 0) this.attackCooldown -= dt;

        // Physics
        if (!this.isGrounded) {
            this.vy += this.gravity * dt;
            this.y += this.vy * dt;
            if (this.y >= arena.groundY - this.height) {
                this.y = arena.groundY - this.height;
                this.vy = 0;
                this.isGrounded = true;
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

        if (this.state === 'windup') {
            this.stateTimer += dt;
            if (this.stateTimer >= this.windupTime) {
                this.state = 'attack';
                this.stateTimer = 0;
                // Attack sound / spark
                if (window.soundEngine) window.soundEngine.playWhoosh(0.85);
            }
        } else if (this.state === 'attack') {
            this.stateTimer += dt;
            // Check hit against player
            if (this.stateTimer < this.activeTime && distToPlayer < this.range && Math.abs(player.y - this.y) < 50) {
                player.takeDamage(this.damage, this.x);
            }
            if (this.stateTimer >= this.activeTime) {
                this.state = 'idle';
                this.attackCooldown = Math.random() * 1.2 + 0.9;
            }
        } else {
            // Approach Player
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
        ctx.save();
        ctx.translate(this.x, this.y);

        // Soft Drop Shadow
        const shadowGrad = ctx.createRadialGradient(0, this.height, 2, 0, this.height, 28);
        shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
        shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.ellipse(0, this.height, 26, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        if (this.flashRed > 0) {
            ctx.filter = 'brightness(2.6) saturate(2)';
        }

        ctx.scale(this.facing, 1);

        const walkCycle = Math.sin(this.animTimer);
        const bob = this.state === 'approach' ? Math.abs(walkCycle) * 5 : Math.sin(this.animTimer * 0.5) * 2;

        // --- Legs & Pants with Shading ---
        ctx.fillStyle = this.pantsColor;
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 2.5;

        const legWalk = this.state === 'approach' ? walkCycle * 14 : 0;
        ctx.beginPath();
        ctx.roundRect(-12 - legWalk, 44 - bob, 14, 34, [3, 3, 6, 6]);
        ctx.roundRect(2 + legWalk, 44 - bob, 14, 34, [3, 3, 6, 6]);
        ctx.fill();
        ctx.stroke();

        // Shoes
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-14 - legWalk, 74 - bob, 17, 6);
        ctx.fillRect(0 + legWalk, 74 - bob, 17, 6);

        // --- Torso / Jacket / Gi ---
        const torsoGrad = ctx.createLinearGradient(-18, 14 - bob, 18, 50 - bob);
        torsoGrad.addColorStop(0, this.color);
        torsoGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = torsoGrad;
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(-18, 14 - bob, 36, 34, 6);
        ctx.fill();
        ctx.stroke();

        // Custom Uniform Embellishments
        if (this.type === 'boss_prefect') {
            // Gold Disciplinary Armband & Tie
            ctx.fillStyle = '#facc15';
            ctx.fillRect(-18, 20 - bob, 8, 10);
            ctx.strokeStyle = '#eab308';
            ctx.strokeRect(-18, 20 - bob, 8, 10);

            // Red Necktie
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(0, 16 - bob);
            ctx.lineTo(-4, 32 - bob);
            ctx.lineTo(0, 36 - bob);
            ctx.lineTo(4, 32 - bob);
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'karateka') {
            // Karate Gi V-Neck & Black Belt
            ctx.strokeStyle = '#0284c7';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-8, 14 - bob);
            ctx.lineTo(0, 28 - bob);
            ctx.lineTo(8, 14 - bob);
            ctx.stroke();

            // Black Belt at waist
            ctx.fillStyle = '#09090b';
            ctx.fillRect(-18, 36 - bob, 36, 7);
        } else if (this.type === 'delinquent') {
            // Varsity Jacket stripes
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(-18, 14 - bob, 5, 34);
            ctx.fillRect(13, 14 - bob, 5, 34);
        }

        // --- Head & Face ---
        ctx.fillStyle = '#fed7aa';
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 4 - bob, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Hair / Bandana
        if (this.type === 'boss_prefect') {
            // Slicked Back Boss Hair with Red Tint
            ctx.fillStyle = '#881337';
            ctx.beginPath();
            ctx.arc(0, 0 - bob, 12.5, Math.PI * 0.8, Math.PI * 2.2);
            ctx.fill();
        } else if (this.type === 'karateka') {
            // Karate Headband
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(-12, -1 - bob, 24, 5);
        } else {
            // Delinquent Pompadour / Punk hair
            ctx.fillStyle = '#334155';
            ctx.beginPath();
            ctx.arc(0, -1 - bob, 13, Math.PI * 0.8, Math.PI * 2.2);
            ctx.fill();
        }

        // Glaring Rival Eyes
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(3, 3 - bob, 3.5, 3);

        // --- Arms & Attack Stance ---
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 2.5;

        if (this.state === 'windup') {
            // Pulled back charging fist
            ctx.beginPath();
            ctx.roundRect(-24, 20 - bob, 16, 12, 4);
            ctx.fill();
            ctx.stroke();

            // Warning Attack Sparkle
            ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(-22, 26 - bob, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        } else if (this.state === 'attack') {
            // Extended lunging punch
            ctx.beginPath();
            ctx.roundRect(8, 18 - bob, 32, 13, 4);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#fed7aa';
            ctx.beginPath();
            ctx.arc(42, 24 - bob, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else {
            // Idle brawler stance
            ctx.beginPath();
            ctx.roundRect(4, 20 - bob, 16, 11, 4);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#fed7aa';
            ctx.beginPath();
            ctx.arc(20, 25 - bob, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        // Boss / Enemy Health Bar
        if (this.hp < this.maxHp && this.state !== 'ko') {
            const barW = this.isBoss ? 56 : 42;
            const barH = 6;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.beginPath();
            ctx.roundRect(-barW / 2 - 1, -20 - bob, barW + 2, barH + 2, 3);
            ctx.fill();

            const pct = Math.max(0, this.hp / this.maxHp);
            ctx.fillStyle = this.isBoss ? '#f59e0b' : '#ef4444';
            ctx.beginPath();
            ctx.roundRect(-barW / 2, -19 - bob, barW * pct, barH, 2);
            ctx.fill();
        }

        // Boss Crown
        if (this.isBoss) {
            ctx.font = '18px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('👑', 0, -26 - bob);
        }

        ctx.restore();
    }
}

window.ParticleSystem = ParticleSystem;
window.Player = Player;
window.Enemy = Enemy;
