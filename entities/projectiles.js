// Interactive World Objects: Heavy Desks (Kickable), Throwables (Apples, Cactus Pots, Rulers, Books, Ninja Stars)

class Projectile {
    constructor(x, y, vx, vy, type = 'apple', damage = 35) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.type = type;
        this.damage = damage;
        this.gravity = (type === 'ninja_star' || type === 'hadouken') ? 0 : 800;
        this.rot = 0;
        this.rotSpeed = vx > 0 ? 12 : -12;
        this.life = type === 'hadouken' ? 3.0 : 4.0;
        this.active = true;
        this.radius = type === 'reading_desk' ? 40 : (type === 'hadouken' ? 32 : 12);
        this.hitEnemies = [];
    }

    update(dt, enemies, vfx, arena) {
        if (!this.active) return;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy += this.gravity * dt;
        this.rot += this.rotSpeed * dt;
        this.life -= dt;

        // Hadouken trailing sparkles
        if (this.type === 'hadouken' && Math.random() < 0.6) {
            vfx.addSpark(this.x + (Math.random() - 0.5) * 20, this.y + (Math.random() - 0.5) * 20, Math.random() < 0.5 ? '#38bdf8' : '#f472b6', 2, 90);
        }

        // Ground hit
        if (this.y >= arena.groundY - 10 && this.type !== 'hadouken') {
            this.y = arena.groundY - 10;
            this.vy = -this.vy * 0.4;
            this.vx *= 0.7;
            if (Math.abs(this.vy) < 50) {
                this.active = false;
                vfx.addSpark(this.x, this.y, '#cbd5e1', 4, 80);
            }
        }

        if (this.life <= 0) this.active = false;

        // Enemy collision
        enemies.forEach(enemy => {
            if (!this.active || enemy.state === 'ko') return;
            if (this.type === 'hadouken' && this.hitEnemies.includes(enemy)) return; // Multi-target pierce

            const dist = Math.hypot(enemy.x - this.x, enemy.y + 40 - this.y);
            if (dist < this.radius + 35) {
                if (this.type !== 'hadouken') {
                    this.active = false;
                } else {
                    this.hitEnemies.push(enemy);
                }

                const isCrit = this.type === 'ninja_star' || this.type === 'reading_desk' || this.type === 'hadouken';
                const finalDmg = isCrit ? this.damage * 1.5 : this.damage;
                enemy.takeDamage(finalDmg, this.x - this.vx, this.type === 'hadouken' ? 550 : 350, 0.6, vfx);

                let sparkColor = '#facc15';
                if (this.type === 'apple') sparkColor = '#ef4444';
                else if (this.type === 'cactus') sparkColor = '#22c55e';
                else if (this.type === 'ninja_star') sparkColor = '#38bdf8';
                else if (this.type === 'hadouken') sparkColor = '#38bdf8';

                vfx.addSpark(this.x, this.y, sparkColor, isCrit ? 18 : 8, 320);
                vfx.addDamageText(enemy.x, enemy.y, `${Math.round(finalDmg)}${this.type === 'hadouken' ? ' 🌊 HADOUKEN!' : ' 💥'}`, isCrit);

                if (window.soundEngine) {
                    window.soundEngine.playHit(isCrit ? 'heavy' : 'normal', isCrit);
                }
            }
        });
    }

    render(ctx) {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);

        if (this.type === 'reading_desk') {
            // Kickable heavy study desk
            ctx.fillStyle = '#78350f';
            ctx.strokeStyle = '#451a03';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(-45, -25, 90, 50, 6);
            ctx.fill();
            ctx.stroke();

            // Metal desk legs
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 4;
            ctx.strokeRect(-40, -20, 80, 40);
        } else if (this.type === 'apple') {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();
            // Leaf
            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            ctx.ellipse(3, -9, 4, 2, 0.4, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'cactus') {
            // Terracotta pot with cactus
            ctx.fillStyle = '#ea580c';
            ctx.fillRect(-8, 0, 16, 12);
            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            ctx.roundRect(-6, -12, 12, 14, 4);
            ctx.fill();
        } else if (this.type === 'ruler') {
            ctx.fillStyle = '#facc15';
            ctx.strokeStyle = '#ca8a04';
            ctx.lineWidth = 1;
            ctx.fillRect(-18, -4, 36, 8);
            ctx.strokeRect(-18, -4, 36, 8);
        } else if (this.type === 'pencil') {
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(-14, -3, 28, 6);
            ctx.fillStyle = '#f43f5e'; // eraser
            ctx.fillRect(-18, -3, 4, 6);
        } else if (this.type === 'book') {
            ctx.fillStyle = '#3b82f6';
            ctx.beginPath();
            ctx.roundRect(-14, -10, 28, 20, 3);
            ctx.fill();
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(-12, -8, 24, 16);
        } else if (this.type === 'hadouken') {
            // Hadouken: Powerful martial ki sphere composed of sapphire blue and coral blue palette
            const pulse = Math.sin(Date.now() / 60) * 3;
            const coreRadius = 22 + pulse;

            // Outer Radiant Coral-Blue & Cyan Energy Halo
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 28;
            
            const outerGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, coreRadius * 1.6);
            outerGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
            outerGrad.addColorStop(0.35, 'rgba(56, 189, 248, 0.95)'); // Cyan / Sapphire
            outerGrad.addColorStop(0.7, 'rgba(244, 114, 182, 0.85)'); // Coral Pinkish-Blue Flare
            outerGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');
            ctx.fillStyle = outerGrad;
            ctx.beginPath();
            ctx.arc(0, 0, coreRadius * 1.6, 0, Math.PI * 2);
            ctx.fill();

            // Swirling Plasma Energy Rings (Rotating Ki Arcs)
            ctx.strokeStyle = '#67e8f9';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(0, 0, coreRadius * 1.2, coreRadius * 0.6, Math.PI / 4 + this.rot, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = '#f472b6'; // Coral accent ring
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.ellipse(0, 0, coreRadius * 1.1, coreRadius * 0.5, -Math.PI / 3 - this.rot * 1.5, 0, Math.PI * 2);
            ctx.stroke();

            // Pure White Intense Core
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 16;
            ctx.beginPath();
            ctx.arc(0, 0, coreRadius * 0.45, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        ctx.restore();
    }
}

// Pickup Ammo Item spawned on the floor
class PickupItem {
    constructor(x, y, type = 'apple') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 30;
        this.height = 30;
        this.bob = Math.random() * Math.PI * 2;
        this.collected = false;

        this.initItemData(type);
    }

    initItemData(type) {
        if (type === 'ninja_star') {
            this.name = 'Legendary Shuriken ⭐';
            this.damage = 95;
            this.icon = '⭐';
            this.color = '#38bdf8';
        } else if (type === 'cactus') {
            this.name = 'Prickly Cactus Pot 🌵';
            this.damage = 45;
            this.icon = '🌵';
            this.color = '#22c55e';
        } else if (type === 'apple') {
            this.name = 'Fresh Red Apple 🍎';
            this.damage = 35;
            this.icon = '🍎';
            this.color = '#ef4444';
        } else if (type === 'ruler') {
            this.name = 'Steel Ruler 📏';
            this.damage = 40;
            this.icon = '📏';
            this.color = '#facc15';
        } else if (type === 'pencil') {
            this.name = 'Sharpened Pencil ✏️';
            this.damage = 30;
            this.icon = '✏️';
            this.color = '#f59e0b';
        } else {
            this.name = 'Heavy Textbook 📖';
            this.damage = 50;
            this.icon = '📖';
            this.color = '#3b82f6';
        }
    }

    update(dt, player, vfx) {
        if (this.collected) return;
        this.bob += dt * 4;

        // Check player collision for pickup
        const dist = Math.hypot(player.x - this.x, player.y + 40 - this.y);
        if (dist < 45) {
            this.collected = true;
            player.addAmmo(this.type, this.damage);
            vfx.addDamageText(this.x, this.y - 20, `+1 ${this.name}!`, false, false, true);
            vfx.addSpark(this.x, this.y, this.color, 8, 140);
            if (window.soundEngine) window.soundEngine.playWhoosh(1.8, 0.4);
        }
    }

    render(ctx) {
        if (this.collected) return;
        ctx.save();
        const floatY = this.y + Math.sin(this.bob) * 5;
        ctx.translate(this.x, floatY);

        // Gentle item halo glow
        const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 22);
        glow.addColorStop(0, this.type === 'ninja_star' ? 'rgba(56, 189, 248, 0.6)' : 'rgba(250, 204, 21, 0.45)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fill();

        // Icon Render
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, 0, 0);

        // Ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 18 - Math.sin(this.bob) * 5, 14, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// Interactive World Objects: Kickable Thematic Props & Throwables
// Each floor features 2 unique, authentic interactable objects!

class KickableProp {
    constructor(x, y, type = 'trash_can') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.vx = 0;
        this.vy = 0;
        this.rot = 0;
        this.rotSpeed = 0;
        this.isLaunched = false;
        this.isBall = (type === 'basketball' || type === 'rugby_ball');
        this.bounceCount = 0;
        this.hitsRemaining = 3; // Breaks after 3 hits
        this.broken = false;

        this.initPropStats(type);
    }

    initPropStats(type) {
        switch (type) {
            // Floor 1 (Entrance Hall)
            case 'trash_can':
                this.width = 46; this.height = 70; this.damage = 65; this.weight = 1.0; break;
            case 'locker_bench':
                this.width = 110; this.height = 45; this.damage = 80; this.weight = 1.5; break;

            // Floor 2 (Cafeteria)
            case 'dining_table':
                this.width = 120; this.height = 65; this.damage = 85; this.weight = 1.6; break;
            case 'food_tray_stack':
                this.width = 44; this.height = 36; this.damage = 50; this.weight = 0.7; break;

            // Floor 3 (Gym/Dojo)
            case 'basketball':
                this.width = 34; this.height = 34; this.damage = 60; this.weight = 0.5; break;
            case 'rugby_ball':
                this.width = 38; this.height = 26; this.damage = 65; this.weight = 0.6; break;

            // Floor 4 (Student Council)
            case 'council_desk':
                this.width = 115; this.height = 70; this.damage = 90; this.weight = 1.7; break;
            case 'swivel_chair':
                this.width = 50; this.height = 75; this.damage = 60; this.weight = 0.9; break;

            // Floor 5 (Library)
            case 'reading_desk':
                this.width = 110; this.height = 70; this.damage = 80; this.weight = 1.5; break;
            case 'bookshelf_cart':
                this.width = 75; this.height = 95; this.damage = 95; this.weight = 1.8; break;

            // Floor 6 (Kendo Hall)
            case 'weapon_rack':
                this.width = 90; this.height = 80; this.damage = 85; this.weight = 1.4; break;
            case 'armor_dummy':
                this.width = 48; this.height = 90; this.damage = 75; this.weight = 1.2; break;

            // Floor 7 (Science Lab)
            case 'lab_bench':
                this.width = 115; this.height = 75; this.damage = 90; this.weight = 1.6; break;
            case 'chemical_cart':
                this.width = 65; this.height = 70; this.damage = 85; this.weight = 1.1; break;

            // Floor 8 (Infirmary)
            case 'infirmary_stretcher':
                this.width = 125; this.height = 60; this.damage = 95; this.weight = 1.5; break;
            case 'rolling_iv_stand':
                this.width = 36; this.height = 105; this.damage = 55; this.weight = 0.6; break;

            // Floor 9 (Rooftop Stairs)
            case 'security_gate':
                this.width = 95; this.height = 85; this.damage = 100; this.weight = 1.9; break;
            case 'concrete_crate':
                this.width = 60; this.height = 55; this.damage = 85; this.weight = 1.7; break;

            // Floor 10 (Midnight Rooftop)
            case 'air_duct_fan':
                this.width = 85; this.height = 75; this.damage = 110; this.weight = 2.0; break;
            case 'steel_radio_crate':
                this.width = 65; this.height = 60; this.damage = 95; this.weight = 1.8; break;

            default:
                this.width = 90; this.height = 60; this.damage = 70; this.weight = 1.0;
        }
    }

    kick(fromX, vfx, enemies) {
        if (this.broken) return;
        this.isLaunched = true;
        this.bounceCount = 0;
        const dir = fromX < this.x ? 1 : -1;
        const speedBase = 740 / Math.max(0.7, this.weight);
        this.vx = dir * speedBase;

        if (this.isBall) {
            this.vy = -390;
            this.rotSpeed = dir * 18;
        } else {
            this.vy = -120;
            this.rotSpeed = dir * (8.5 / Math.max(0.8, this.weight)); // Real rolling rotation
        }

        vfx.addSpark(this.x, this.y + 10, '#f59e0b', 14, 260);
        if (window.soundEngine) window.soundEngine.playHit('heavy', true);
    }

    shatter(vfx) {
        this.broken = true;
        this.isLaunched = false;
        // Explode into debris / lego bricks
        if (vfx) {
            if (vfx.addLegoBricks) {
                vfx.addLegoBricks(this.x, this.y, '#d97706', '#78350f', false);
            }
            vfx.addSpark(this.x, this.y, '#f59e0b', 24, 380);
            vfx.addDamageText(this.x, this.y - 20, '💥 OBJECT DESTROYED!', true);
        }
        if (window.soundEngine && window.soundEngine.playHit) {
            window.soundEngine.playHit('heavy', true);
        }
    }

    update(dt, player, enemies, vfx, arena) {
        if (this.broken) return;

        if (this.isLaunched) {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.rot += this.rotSpeed * dt;

            // Ground collision & rolling physics
            const groundContact = arena.groundY - this.height / 2;
            if (this.y >= groundContact) {
                this.y = groundContact;
                if (this.isBall && Math.abs(this.vy) > 90) {
                    this.vy = -this.vy * 0.65;
                    this.vx *= 0.88;
                    vfx.addSpark(this.x, this.y + this.height / 2, '#fbbf24', 4, 100);
                } else {
                    this.vy = 0;
                    this.vx *= 0.94; // ground friction
                    this.rotSpeed = (this.vx / (this.width * 0.45)); // Roll speed directly proportional to velocity
                }
            } else {
                this.vy += 980 * dt; // gravity
            }

            // Wall bounce
            if (this.x <= 40) {
                this.x = 40;
                this.vx = -this.vx * 0.7;
                this.rotSpeed = -this.rotSpeed;
                vfx.addSpark(this.x, this.y, '#94a3b8', 6, 150);
            } else if (this.x >= arena.width - 40) {
                this.x = arena.width - 40;
                this.vx = -this.vx * 0.7;
                this.rotSpeed = -this.rotSpeed;
                vfx.addSpark(this.x, this.y, '#94a3b8', 6, 150);
            }

            // Collide with enemies while rolling / flying
            enemies.forEach(enemy => {
                if (enemy.state === 'ko' || this.broken) return;
                const hitDistX = Math.abs(enemy.x - this.x);
                const hitDistY = Math.abs(enemy.y - this.y);
                if (hitDistX < this.width / 2 + 35 && hitDistY < this.height / 2 + 45) {
                    const finalDmg = Math.round(this.damage * (this.isBall ? 1.0 : 1.3));
                    enemy.takeDamage(finalDmg, this.x - this.vx, 550, 0.75, vfx);
                    vfx.addSpark(enemy.x, enemy.y + 30, '#f59e0b', 16, 320);
                    
                    this.hitsRemaining--;

                    if (this.hitsRemaining <= 0) {
                        vfx.addDamageText(enemy.x, enemy.y, `${finalDmg} 💥 SHATTERED!`, true);
                        this.shatter(vfx);
                        return;
                    } else {
                        vfx.addDamageText(enemy.x, enemy.y, `${finalDmg} 💥 [${this.hitsRemaining}/3 HITS]`, true);
                        if (this.isBall) {
                            this.vx = -this.vx * 0.55;
                            this.vy = -260;
                        } else {
                            // Rebound & continue rolling
                            this.vx = -this.vx * 0.45;
                            this.rotSpeed = (this.vx / (this.width * 0.45));
                        }
                    }

                    if (window.soundEngine) window.soundEngine.playHit('heavy', true);
                }
            });

            if (Math.abs(this.vx) < 20 && Math.abs(this.vy) < 20) {
                this.isLaunched = false;
                this.rotSpeed = 0;
            }
        } else {
            // Resting on ground
            this.y = arena.groundY - this.height / 2;

            // Check if player kicked near this prop
            if (player.state === 'attack' && player.hitboxActive) {
                const distNearX = Math.abs(player.x - this.x);
                const distNearY = Math.abs(player.y - this.y);
                if (distNearX < this.width / 2 + 55 && distNearY < this.height / 2 + 50) {
                    this.kick(player.x, vfx, enemies);
                }
            }
        }

        this.x = Math.max(35, Math.min(arena.width - 35, this.x));
    }

    render(ctx) {
        if (this.broken) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);

        // Ground shadow
        ctx.save();
        ctx.rotate(-this.rot);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, this.height / 2 + 2, this.width / 2, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Distinct procedural render per prop type
        switch (this.type) {
            case 'trash_can':
                // Metal trash can with ridges
                ctx.fillStyle = '#64748b';
                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, [4, 4, 8, 8]);
                ctx.fill();
                ctx.stroke();
                // Ridges
                ctx.strokeStyle = '#94a3b8';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-this.width / 2 + 4, -10); ctx.lineTo(this.width / 2 - 4, -10);
                ctx.moveTo(-this.width / 2 + 4, 10); ctx.lineTo(this.width / 2 - 4, 10);
                ctx.stroke();
                // Lid
                ctx.fillStyle = '#475569';
                ctx.beginPath();
                ctx.roundRect(-this.width / 2 - 3, -this.height / 2 - 5, this.width + 6, 8, 3);
                ctx.fill();
                break;

            case 'locker_bench':
                // Wood slat bench with iron frame
                ctx.fillStyle = '#b45309';
                ctx.strokeStyle = '#78350f';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(-this.width / 2, -this.height / 2, this.width, 14, 3);
                ctx.fill();
                ctx.stroke();
                // Legs
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(-this.width / 2 + 8, -this.height / 2 + 14, 8, this.height - 14);
                ctx.fillRect(this.width / 2 - 16, -this.height / 2 + 14, 8, this.height - 14);
                break;

            case 'dining_table':
                // Cafeteria Formica dining table
                ctx.fillStyle = '#f8fafc';
                ctx.strokeStyle = '#94a3b8';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(-this.width / 2, -this.height / 2, this.width, 16, 4);
                ctx.fill();
                ctx.stroke();
                // Chrome legs
                ctx.fillStyle = '#cbd5e1';
                ctx.fillRect(-this.width / 2 + 12, -this.height / 2 + 16, 8, this.height - 16);
                ctx.fillRect(this.width / 2 - 20, -this.height / 2 + 16, 8, this.height - 16);
                // Orange tray on table
                ctx.fillStyle = '#ea580c';
                ctx.fillRect(-18, -this.height / 2 - 6, 36, 6);
                break;

            case 'food_tray_stack':
                // Stack of metal lunch trays
                ctx.fillStyle = '#94a3b8';
                ctx.strokeStyle = '#475569';
                ctx.lineWidth = 1.5;
                for (let i = 0; i < 4; i++) {
                    ctx.beginPath();
                    ctx.roundRect(-this.width / 2, -this.height / 2 + i * 8, this.width, 7, 2);
                    ctx.fill();
                    ctx.stroke();
                }
                break;

            case 'basketball':
                // Orange basketball with black seams
                ctx.fillStyle = '#ea580c';
                ctx.strokeStyle = '#7c2d12';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                // Seams
                ctx.strokeStyle = '#431407';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-this.width / 2, 0); ctx.lineTo(this.width / 2, 0);
                ctx.moveTo(0, -this.width / 2); ctx.lineTo(0, this.width / 2);
                ctx.stroke();
                break;

            case 'rugby_ball':
                // Brown leather rugby ball with white stripe
                ctx.fillStyle = '#92400e';
                ctx.strokeStyle = '#451a03';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                // White laces
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-10, 0); ctx.lineTo(10, 0);
                ctx.moveTo(-6, -4); ctx.lineTo(-6, 4);
                ctx.moveTo(0, -4); ctx.lineTo(0, 4);
                ctx.moveTo(6, -4); ctx.lineTo(6, 4);
                ctx.stroke();
                break;

            case 'council_desk':
                // Executive mahogany desk
                ctx.fillStyle = '#451a03';
                ctx.strokeStyle = '#1c1917';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.roundRect(-this.width / 2, -this.height / 2, this.width, 22, 4);
                ctx.fill();
                ctx.stroke();
                // Drawers & gold trim
                ctx.fillStyle = '#292524';
                ctx.fillRect(-this.width / 2 + 6, -this.height / 2 + 22, this.width - 12, this.height - 22);
                ctx.fillStyle = '#facc15';
                ctx.fillRect(-20, -this.height / 2 + 30, 40, 3);
                break;

            case 'swivel_chair':
                // Black leather office chair with chrome base
                ctx.fillStyle = '#1e293b';
                ctx.beginPath();
                ctx.roundRect(-this.width / 2 + 5, -this.height / 2, this.width - 10, 36, 6);
                ctx.roundRect(-this.width / 2, -this.height / 2 + 36, this.width, 12, 4);
                ctx.fill();
                // Pole & castor wheels
                ctx.fillStyle = '#94a3b8';
                ctx.fillRect(-3, -this.height / 2 + 48, 6, this.height - 48);
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(-this.width / 2 + 4, this.height / 2 - 6, this.width - 8, 6);
                break;

            case 'reading_desk':
                // Library study desk with lamp
                ctx.fillStyle = '#78350f';
                ctx.strokeStyle = '#451a03';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.roundRect(-this.width / 2, -this.height / 2, this.width, 20, 4);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#334155';
                ctx.fillRect(-this.width / 2 + 10, -this.height / 2 + 20, 8, this.height - 20);
                ctx.fillRect(this.width / 2 - 18, -this.height / 2 + 20, 8, this.height - 20);
                // Lamp
                ctx.fillStyle = '#fde047';
                ctx.beginPath();
                ctx.arc(-18, -this.height / 2 - 6, 6, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'bookshelf_cart':
                // Wheeled mobile bookcase
                ctx.fillStyle = '#92400e';
                ctx.beginPath();
                ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height - 12, 4);
                ctx.fill();
                // Books on shelf
                const bColors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#ec4899'];
                for (let i = 0; i < 5; i++) {
                    ctx.fillStyle = bColors[i % bColors.length];
                    ctx.fillRect(-this.width / 2 + 6 + i * 12, -this.height / 2 + 10, 9, 32);
                    ctx.fillRect(-this.width / 2 + 6 + i * 12, -this.height / 2 + 48, 9, 30);
                }
                // Wheels
                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.arc(-this.width / 2 + 12, this.height / 2 - 6, 6, 0, Math.PI * 2);
                ctx.arc(this.width / 2 - 12, this.height / 2 - 6, 6, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'weapon_rack':
                // Wooden weapon rack with shinai/bokken
                ctx.fillStyle = '#78350f';
                ctx.beginPath();
                ctx.roundRect(-this.width / 2, -this.height / 2 + 20, this.width, 10, 2);
                ctx.roundRect(-this.width / 2, -this.height / 2 + 50, this.width, 10, 2);
                ctx.fill();
                // Vertical pillars
                ctx.fillRect(-this.width / 2 + 6, -this.height / 2, 10, this.height);
                ctx.fillRect(this.width / 2 - 16, -this.height / 2, 10, this.height);
                // Bamboo wooden swords on rack
                ctx.fillStyle = '#fef08a';
                ctx.fillRect(-this.width / 2 - 6, -this.height / 2 + 14, this.width + 12, 5);
                ctx.fillRect(-this.width / 2 - 6, -this.height / 2 + 44, this.width + 12, 5);
                break;

            case 'armor_dummy':
                // Kendo Bogu Sparring Dummy
                ctx.fillStyle = '#1e1b4b';
                ctx.beginPath();
                ctx.roundRect(-this.width / 2 + 4, -this.height / 2, this.width - 8, 30, 8); // Men mask
                ctx.roundRect(-this.width / 2, -this.height / 2 + 32, this.width, 42, 4); // Do chest
                ctx.fill();
                // Silver grill
                ctx.strokeStyle = '#e2e8f0';
                ctx.lineWidth = 1.5;
                for (let y = -this.height / 2 + 6; y < -this.height / 2 + 26; y += 4) {
                    ctx.beginPath();
                    ctx.moveTo(-this.width / 2 + 8, y); ctx.lineTo(this.width / 2 - 8, y);
                    ctx.stroke();
                }
                // Base stand
                ctx.fillStyle = '#78350f';
                ctx.fillRect(-6, this.height / 2 - 16, 12, 16);
                break;

            case 'lab_bench':
                // Science Chemical Bench with sink & beakers
                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.roundRect(-this.width / 2, -this.height / 2, this.width, 18, 3);
                ctx.fill();
                ctx.fillStyle = '#334155';
                ctx.fillRect(-this.width / 2 + 8, -this.height / 2 + 18, this.width - 16, this.height - 18);
                // Glowing Flasks
                ctx.fillStyle = '#2dd4bf';
                ctx.beginPath();
                ctx.arc(-22, -this.height / 2 - 8, 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ec4899';
                ctx.beginPath();
                ctx.arc(18, -this.height / 2 - 8, 7, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'chemical_cart':
                // Stainless lab rolling cart with toxic solutions
                ctx.fillStyle = '#cbd5e1';
                ctx.strokeStyle = '#64748b';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(-this.width / 2, -this.height / 2, this.width, 10, 2);
                ctx.roundRect(-this.width / 2, 4, this.width, 10, 2);
                ctx.fill();
                ctx.stroke();
                // Frame
                ctx.fillRect(-this.width / 2 + 2, -this.height / 2, 4, this.height);
                ctx.fillRect(this.width / 2 - 6, -this.height / 2, 4, this.height);
                // Beakers
                ctx.fillStyle = '#a855f7';
                ctx.fillRect(-15, -this.height / 2 - 12, 12, 12);
                ctx.fillStyle = '#38bdf8';
                ctx.fillRect(4, -this.height / 2 - 12, 12, 12);
                break;

            case 'infirmary_stretcher':
                // Wheeled hospital stretcher bed
                ctx.fillStyle = '#f8fafc';
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(-this.width / 2, -this.height / 2, this.width, 18, 4); // mattress
                ctx.fill();
                ctx.stroke();
                // Pillow
                ctx.fillStyle = '#e0f2fe';
                ctx.fillRect(-this.width / 2 + 6, -this.height / 2 + 3, 24, 12);
                // Metal frame & wheels
                ctx.fillStyle = '#94a3b8';
                ctx.fillRect(-this.width / 2 + 10, -this.height / 2 + 18, 8, this.height - 18);
                ctx.fillRect(this.width / 2 - 18, -this.height / 2 + 18, 8, this.height - 18);
                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.arc(-this.width / 2 + 14, this.height / 2 - 4, 5, 0, Math.PI * 2);
                ctx.arc(this.width / 2 - 14, this.height / 2 - 4, 5, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'rolling_iv_stand':
                // Stainless IV drip pole with saline bag
                ctx.fillStyle = '#cbd5e1';
                ctx.fillRect(-2, -this.height / 2 + 15, 4, this.height - 15);
                // Base
                ctx.fillStyle = '#64748b';
                ctx.fillRect(-this.width / 2, this.height / 2 - 6, this.width, 6);
                // Saline drip pouch
                ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
                ctx.beginPath();
                ctx.roundRect(-10, -this.height / 2, 20, 26, 4);
                ctx.fill();
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-4, -this.height / 2 + 13); ctx.lineTo(4, -this.height / 2 + 13);
                ctx.moveTo(0, -this.height / 2 + 9); ctx.lineTo(0, -this.height / 2 + 17);
                ctx.stroke();
                break;

            case 'security_gate':
                // Heavy steel chain-link barrier gate
                ctx.fillStyle = '#334155';
                ctx.strokeStyle = '#e11d48';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, 4);
                ctx.fill();
                ctx.stroke();
                // Warning stripes
                ctx.fillStyle = '#facc15';
                for (let x = -this.width / 2 + 8; x < this.width / 2 - 8; x += 18) {
                    ctx.fillRect(x, -this.height / 2 + 10, 8, this.height - 20);
                }
                break;

            case 'concrete_crate':
                // Heavy concrete construction block
                ctx.fillStyle = '#64748b';
                ctx.strokeStyle = '#1e293b';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, 4);
                ctx.fill();
                ctx.stroke();
                // Cross indent
                ctx.strokeStyle = '#475569';
                ctx.beginPath();
                ctx.moveTo(-this.width / 2, -this.height / 2); ctx.lineTo(this.width / 2, this.height / 2);
                ctx.moveTo(-this.width / 2, this.height / 2); ctx.lineTo(this.width / 2, -this.height / 2);
                ctx.stroke();
                break;

            case 'air_duct_fan':
                // Industrial HVAC ventilation unit
                ctx.fillStyle = '#1e293b';
                ctx.strokeStyle = '#0f172a';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, 6);
                ctx.fill();
                ctx.stroke();
                // Fan grill
                ctx.fillStyle = '#334155';
                ctx.beginPath();
                ctx.arc(0, 0, this.width / 2 - 12, 0, Math.PI * 2);
                ctx.fill();
                // Fan blades
                ctx.fillStyle = '#94a3b8';
                for (let i = 0; i < 4; i++) {
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 6, this.width / 2 - 16, (i * Math.PI) / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;

            case 'steel_radio_crate':
                // High voltage radio equipment case
                ctx.fillStyle = '#0284c7';
                ctx.strokeStyle = '#0369a1';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, 5);
                ctx.fill();
                ctx.stroke();
                // High Voltage symbol ⚡
                ctx.font = '22px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('⚡', 0, 0);
                break;

            default:
                // Fallback box
                ctx.fillStyle = '#78350f';
                ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }

        ctx.restore();
    }
}

window.Projectile = Projectile;
window.PickupItem = PickupItem;
window.KickableDesk = KickableProp;
window.KickableProp = KickableProp;

