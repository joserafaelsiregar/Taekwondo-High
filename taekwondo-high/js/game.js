// Main Game Loop, Wave Management, Roguelike Deck Drafting, Camera & Input Handler

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.arena = new window.ArenaManager();
        this.vfx = new window.ParticleSystem();
        this.player = new window.Player(400, 480);
        this.enemies = [];

        // Camera system
        this.camera = { x: 0, y: 0, targetX: 0, shakeTime: 0, shakeMag: 0 };

        // Game progression & Waves
        this.state = 'start'; // 'start', 'playing', 'paused', 'perk_select', 'wave_clear', 'game_over', 'victory'
        this.wave = 1;
        this.enemiesToSpawn = 0;
        this.spawnTimer = 0;
        this.waveCleared = false;
        this.lastTime = 0;
        this.slowMoTimer = 0;

        // Input
        this.input = { left: false, right: false, up: false, down: false };

        this.initCanvasSize();
        this.initInputListeners();
        this.initUI();
    }

    initCanvasSize() {
        const resize = () => {
            const container = document.getElementById('game-container');
            if (!container) return;
            const aspect = 16 / 9;
            let w = window.innerWidth;
            let h = window.innerHeight;
            if (w / h > aspect) {
                w = h * aspect;
            } else {
                h = w / aspect;
            }
            this.canvas.width = 1280;
            this.canvas.height = 720;
        };
        window.addEventListener('resize', resize);
        resize();
    }

    initInputListeners() {
        window.addEventListener('keydown', (e) => {
            if (window.soundEngine && !window.soundEngine.bgmPlaying) {
                window.soundEngine.init();
                window.soundEngine.startBGM();
            }

            if (this.state !== 'playing') {
                if (e.code === 'KeyP' || e.code === 'Escape') this.togglePause();
                return;
            }

            switch (e.code) {
                case 'KeyA':
                case 'ArrowLeft':
                    this.input.left = true;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.input.right = true;
                    break;
                case 'KeyJ':
                case 'KeyZ':
                    this.player.performMove(this.player.equippedMoves.primary);
                    break;
                case 'KeyK':
                case 'KeyX':
                    this.player.performMove(this.player.equippedMoves.secondary);
                    break;
                case 'KeyL':
                case 'KeyE':
                case 'KeyC':
                    if (this.player.equippedMoves.special1) {
                        this.player.performMove(this.player.equippedMoves.special1);
                    }
                    break;
                case 'KeyU':
                case 'KeyR':
                case 'KeyV':
                    if (this.player.equippedMoves.special2) {
                        this.player.performMove(this.player.equippedMoves.special2);
                    }
                    break;
                case 'KeyI':
                case 'KeyF':
                    if (this.player.equippedMoves.ultimate) {
                        this.player.performMove(this.player.equippedMoves.ultimate);
                    }
                    break;
                case 'Space':
                case 'ShiftLeft':
                    e.preventDefault();
                    this.player.performMove('quick_dash');
                    break;
                case 'KeyQ':
                    this.player.performMove('parry_counter');
                    break;
                case 'KeyP':
                case 'Escape':
                    this.togglePause();
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'KeyA':
                case 'ArrowLeft':
                    this.input.left = false;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.input.right = false;
                    break;
            }
        });

        // Mouse controls
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.state !== 'playing') return;
            if (window.soundEngine && !window.soundEngine.bgmPlaying) {
                window.soundEngine.init();
                window.soundEngine.startBGM();
            }
            if (e.button === 0) {
                this.player.performMove(this.player.equippedMoves.primary);
            } else if (e.button === 2) {
                this.player.performMove(this.player.equippedMoves.secondary);
            }
        });
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // Virtual Touch Buttons Setup
        const btnMap = {
            'btn-left': () => { this.input.left = true; },
            'btn-right': () => { this.input.right = true; },
            'btn-primary': () => this.player.performMove(this.player.equippedMoves.primary),
            'btn-secondary': () => this.player.performMove(this.player.equippedMoves.secondary),
            'btn-dash': () => this.player.performMove('quick_dash'),
            'btn-special': () => this.player.equippedMoves.special1 && this.player.performMove(this.player.equippedMoves.special1),
            'btn-guard': () => this.player.performMove('parry_counter')
        };

        for (let id in btnMap) {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('touchstart', (e) => { e.preventDefault(); btnMap[id](); });
                btn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    if (id === 'btn-left') this.input.left = false;
                    if (id === 'btn-right') this.input.right = false;
                });
            }
        }
    }

    initUI() {
        // Sound toggle button
        const soundBtn = document.getElementById('sound-toggle');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                if (window.soundEngine) {
                    window.soundEngine.init();
                    const isMuted = window.soundEngine.toggleMute();
                    soundBtn.innerText = isMuted ? '🔇 Audio OFF' : '🔊 Audio ON';
                    if (!isMuted) window.soundEngine.startBGM();
                }
            });
        }

        // Start game button
        const startBtn = document.getElementById('btn-start-game');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.startGame();
            });
        }

        // Retry button
        const retryBtn = document.getElementById('btn-retry');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.resetGame();
            });
        }
    }

    startGame() {
        if (window.soundEngine) {
            window.soundEngine.init();
            window.soundEngine.startBGM();
        }
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-over-modal').classList.add('hidden');
        document.getElementById('victory-modal').classList.add('hidden');
        this.state = 'playing';
        this.startWave(1);
    }

    resetGame() {
        this.player = new window.Player(400, 480);
        this.vfx = new window.ParticleSystem();
        this.arena.initTheme(1);
        this.wave = 1;
        this.enemies = [];
        this.startGame();
    }

    togglePause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            document.getElementById('pause-modal').classList.remove('hidden');
        } else if (this.state === 'paused') {
            this.state = 'playing';
            document.getElementById('pause-modal').classList.add('hidden');
        }
    }

    startWave(waveNum) {
        this.wave = waveNum;
        this.waveCleared = false;
        
        // Floor transition (4 floors total)
        const floor = Math.min(4, Math.ceil(waveNum / 2));
        if (this.arena.currentFloor !== floor) {
            this.arena.initTheme(floor);
        }

        // Calculate wave enemy compositions
        this.enemies = [];
        this.enemiesToSpawn = 3 + waveNum * 2;
        this.spawnTimer = 0.5;

        // Show wave announcement banner
        this.showWaveBanner(`ROUND ${waveNum}: ${this.arena.name}`);
    }

    showWaveBanner(text) {
        const banner = document.getElementById('announcement-banner');
        if (banner) {
            banner.innerText = text;
            banner.classList.remove('hidden');
            banner.classList.add('banner-animate');
            setTimeout(() => {
                banner.classList.remove('banner-animate');
                banner.classList.add('hidden');
            }, 2500);
        }
    }

    spawnEnemy() {
        if (this.enemiesToSpawn <= 0) return;
        this.enemiesToSpawn--;

        // Spawn left or right
        const spawnRight = Math.random() > 0.5;
        const x = spawnRight ? this.arena.width - 80 : 80;

        let enemyType = 'bully';
        const floor = this.arena.currentFloor;

        if (this.wave === 8 && this.enemiesToSpawn === 0) {
            // Boss encounter on rooftop
            enemyType = 'boss_prefect';
        } else if (floor >= 3 && Math.random() < 0.4) {
            enemyType = 'karateka';
        } else if (floor >= 2 && Math.random() < 0.5) {
            enemyType = 'delinquent';
        }

        this.enemies.push(new window.Enemy(x, 480, enemyType, floor));
    }

    triggerScreenShake(mag = 8, time = 0.2) {
        this.camera.shakeMag = mag;
        this.camera.shakeTime = time;
    }

    triggerSlowMo(time = 0.15) {
        this.slowMoTimer = time;
    }

    checkHitCollisions() {
        if (!this.player.hitboxActive || this.player.hasHitThisAttack) return;
        const m = this.player.currentMove;
        if (!m) return;

        const pX = this.player.x;
        const pY = this.player.y;
        const facing = this.player.facing;
        const beltMultiplier = window.BELT_RANKS[this.player.belt].statBonus.damageMult;

        this.enemies.forEach(enemy => {
            if (enemy.state === 'ko') return;

            const inDirection = (facing === 1 && enemy.x >= pX - 10) || (facing === -1 && enemy.x <= pX + 10);
            const dist = Math.abs(enemy.x - pX);
            const vertDist = Math.abs(enemy.y - pY);

            if ((m.isAoE || inDirection) && dist <= m.range && vertDist <= m.hitRadius + 30) {
                // Critical strike check
                const isCrit = Math.random() < this.player.critChance;
                let finalDmg = Math.round(m.damage * beltMultiplier * (isCrit ? 2.2 : 1.0));

                // Flow state perk bonus
                if (this.player.perks.flowState && this.player.comboCount > 0) {
                    finalDmg = Math.round(finalDmg * (1 + Math.floor(this.player.comboCount / 10) * 0.1));
                }

                // Apply damage & physics
                enemy.takeDamage(finalDmg, pX, m.knockback, m.stunTime, this.vfx);
                this.player.registerHit();

                // Spark and impact visuals
                this.vfx.addSpark(enemy.x, enemy.y + 30, m.vfx?.sparkColor || '#facc15', isCrit ? 16 : 8, 300);
                this.vfx.addDamageText(enemy.x, enemy.y, `${finalDmg}${isCrit ? ' 💥 CRIT!' : ''}`, isCrit);

                // Sound
                if (window.soundEngine) {
                    window.soundEngine.playHit(m.damage > 60 ? 'heavy' : 'normal', isCrit);
                }

                // Burn perk
                if (this.player.perks.flameKicks) {
                    enemy.applyBurn(3);
                }

                // Shockwave perk splash
                if (this.player.perks.shockwave) {
                    this.vfx.addSpark(enemy.x, enemy.y + 40, '#38bdf8', 10, 200);
                    this.enemies.forEach(other => {
                        if (other !== enemy && other.state !== 'ko' && Math.abs(other.x - enemy.x) < 90) {
                            other.takeDamage(Math.round(finalDmg * 0.4), enemy.x, 200, 0.3, this.vfx);
                        }
                    });
                }

                // Camera Shake & Hitstop
                this.triggerScreenShake(isCrit ? 12 : 6, isCrit ? 0.25 : 0.12);
                if (isCrit) this.triggerSlowMo(0.12);

                // Check K.O.
                if (enemy.hp <= 0) {
                    const promotedBelt = this.player.gainXp(enemy.xpValue);
                    if (promotedBelt) {
                        this.showBeltRankUpModal(promotedBelt);
                    }
                    if (this.player.perks.vampirism) {
                        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 12);
                        this.player.ki = Math.min(this.player.maxKi, this.player.ki + 25);
                        this.vfx.addDamageText(this.player.x, this.player.y, '+12 HP', false, false);
                    }
                }
            }
        });
    }

    showBeltRankUpModal(beltId) {
        const info = window.BELT_RANKS[beltId];
        const modal = document.getElementById('rankup-modal');
        if (!modal) return;

        const currentRankIndex = window.BELT_ORDER.indexOf(beltId);
        const prevBeltId = currentRankIndex > 0 ? window.BELT_ORDER[currentRankIndex - 1] : null;
        const prevInfo = prevBeltId ? window.BELT_RANKS[prevBeltId] : null;

        // Header info
        document.getElementById('rankup-badge').innerText = info.badgeIcon;
        const rankNameEl = document.getElementById('rankup-name');
        rankNameEl.innerText = info.name.toUpperCase();
        rankNameEl.style.color = info.accentColor || info.color;
        document.getElementById('rankup-korean').innerText = info.koreanName;

        // Render Martial Stat Boosts
        const statsGrid = document.getElementById('rankup-stats-grid');
        if (statsGrid) {
            const dmgMult = Math.round(info.statBonus.damageMult * 100);
            const dmgDiff = prevInfo ? Math.round((info.statBonus.damageMult - prevInfo.statBonus.damageMult) * 100) : 0;
            const hpDiff = prevInfo ? info.statBonus.maxHealth - prevInfo.statBonus.maxHealth : 0;
            const kiDiff = prevInfo ? info.statBonus.kiMax - prevInfo.statBonus.kiMax : 0;
            const spdDiff = prevInfo ? info.statBonus.speed - prevInfo.statBonus.speed : 0;

            statsGrid.innerHTML = `
                <div class="rankup-stat-card">
                    <span class="rankup-stat-icon">⚔️</span>
                    <span class="rankup-stat-val">${dmgMult}% DMG</span>
                    <span class="rankup-stat-sub">+${dmgDiff}% Output</span>
                </div>
                <div class="rankup-stat-card">
                    <span class="rankup-stat-icon">❤️</span>
                    <span class="rankup-stat-val">${info.statBonus.maxHealth} HP</span>
                    <span class="rankup-stat-sub">+${hpDiff} Max HP</span>
                </div>
                <div class="rankup-stat-card">
                    <span class="rankup-stat-icon">⚡</span>
                    <span class="rankup-stat-val">${info.statBonus.kiMax} KI</span>
                    <span class="rankup-stat-sub">+${kiDiff} Max Ki</span>
                </div>
                <div class="rankup-stat-card">
                    <span class="rankup-stat-icon">💨</span>
                    <span class="rankup-stat-val">${info.statBonus.speed} SPD</span>
                    <span class="rankup-stat-sub">+${spdDiff} Agility</span>
                </div>
            `;
        }

        // Determine which moves are BRAND NEW to this belt tier
        const prevMoves = prevInfo ? prevInfo.unlockedMoves : [];
        const newMoves = info.unlockedMoves.filter(mId => !prevMoves.includes(mId));
        const newMovesListDiv = document.getElementById('rankup-unlocked-moves');
        const newLabel = document.getElementById('rankup-new-label');

        if (newMoves.length > 0) {
            if (newLabel) newLabel.style.display = 'block';
            newMovesListDiv.innerHTML = newMoves.map(mId => {
                const m = window.MOVES_DATABASE[mId];
                if (!m) return '';
                const typeIcon = m.type === 'ultimate' ? '👑' : (m.type === 'defense' ? '🛡️' : (m.type === 'utility' ? '💨' : '⚡'));
                return `
                    <div class="rankup-move-card">
                        <div class="rankup-move-header">
                            <div class="rankup-move-title-wrap">
                                <span class="rankup-move-icon">${typeIcon}</span>
                                <div>
                                    <div class="rankup-move-name">${m.name}</div>
                                    <div class="rankup-move-korean">${m.korean}</div>
                                </div>
                            </div>
                            <span class="rankup-move-key">${m.key || 'HOTKEY'}</span>
                        </div>
                        <div class="rankup-move-desc">${m.description || ''}</div>
                        <div class="rankup-move-meta">
                            <span><b style="color:#f87171;">⚔️ DMG:</b> ${m.damage || 0}</span>
                            <span><b style="color:#38bdf8;">⚡ KI:</b> ${m.kiCost || 0}</span>
                            <span><b style="color:#facc15;">⏱️ CD:</b> ${m.cooldown}s</span>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            if (newLabel) newLabel.style.display = 'none';
            newMovesListDiv.innerHTML = `<div style="color:#94a3b8; font-size:0.85rem; padding:8px;">All base techniques fully mastered.</div>`;
        }

        // Mastered move pills summary
        const masteredDiv = document.getElementById('rankup-mastered-summary');
        if (masteredDiv && prevMoves.length > 0) {
            masteredDiv.classList.remove('hidden');
            masteredDiv.innerHTML = `
                <div class="rankup-mastered-title">🥋 PREVIOUS ARSENAL READY:</div>
                <div class="rankup-mastered-pills">
                    ${prevMoves.map(mId => {
                        const m = window.MOVES_DATABASE[mId];
                        return m ? `<span class="rankup-mastered-pill">✓ ${m.name}</span>` : '';
                    }).join('')}
                </div>
            `;
        } else if (masteredDiv) {
            masteredDiv.classList.add('hidden');
        }

        modal.classList.remove('hidden');

        document.getElementById('btn-rankup-continue').onclick = () => {
            modal.classList.add('hidden');
        };
    }

    presentRoguelikeDraft() {
        this.state = 'perk_select';
        const modal = document.getElementById('perk-draft-modal');
        if (!modal) return;

        // Pick 3 random distinct perks
        const shuffled = [...window.ROGUELIKE_PERKS].sort(() => 0.5 - Math.random());
        const choices = shuffled.slice(0, 3);

        const container = document.getElementById('perk-cards-container');
        container.innerHTML = choices.map(p => `
            <div class="perk-card rarity-${p.rarity}" data-id="${p.id}">
                <div class="perk-card-icon">${p.icon}</div>
                <div class="perk-card-title">${p.name}</div>
                <div class="perk-card-rarity">${p.rarity.toUpperCase()} TECHNIQUE</div>
                <div class="perk-card-desc">${p.description}</div>
                <button class="perk-choose-btn">LEARN SCROLL</button>
            </div>
        `).join('');

        container.querySelectorAll('.perk-card').forEach(card => {
            card.addEventListener('click', () => {
                const perkId = card.getAttribute('data-id');
                const perk = window.ROGUELIKE_PERKS.find(p => p.id === perkId);
                if (perk) {
                    perk.apply(this.player);
                    if (window.soundEngine) window.soundEngine.playPerkSelect();
                }
                modal.classList.add('hidden');
                this.state = 'playing';
                // Proceed to next wave
                if (this.wave >= 8) {
                    this.state = 'victory';
                    document.getElementById('victory-modal').classList.remove('hidden');
                } else {
                    this.startWave(this.wave + 1);
                }
            });
        });

        modal.classList.remove('hidden');
    }

    update(dt) {
        if (this.state !== 'playing') return;

        // Slow motion scale
        if (this.slowMoTimer > 0) {
            this.slowMoTimer -= dt;
            dt *= 0.35;
        }

        // Camera shake update
        if (this.camera.shakeTime > 0) {
            this.camera.shakeTime -= dt;
        }

        // Wave spawner
        if (this.enemiesToSpawn > 0) {
            this.spawnTimer -= dt;
            if (this.spawnTimer <= 0) {
                this.spawnEnemy();
                this.spawnTimer = Math.random() * 1.8 + 1.2;
            }
        }

        // Check wave completion
        if (this.enemiesToSpawn <= 0 && this.enemies.every(e => e.state === 'ko') && !this.waveCleared) {
            this.waveCleared = true;
            setTimeout(() => {
                this.presentRoguelikeDraft();
            }, 1000);
        }

        // Player update
        this.player.update(dt, this.input, this.arena, this.vfx);

        // Check combat collisions
        this.checkHitCollisions();

        // Enemies update
        this.enemies.forEach(e => e.update(dt, this.player, this.arena, this.vfx));

        // Arena & VFX update
        this.arena.update(dt);
        this.vfx.update(dt);

        // Check player death
        if (this.player.hp <= 0 && this.player.revives <= 0) {
            this.state = 'game_over';
            document.getElementById('game-over-modal').classList.remove('hidden');
            document.getElementById('game-over-score').innerText = `Final Score: ${this.player.totalScore} | Belt: ${window.BELT_RANKS[this.player.belt].name}`;
        }

        // Smooth camera follow
        this.camera.targetX = this.player.x - this.canvas.width / 2;
        this.camera.targetX = Math.max(0, Math.min(this.arena.width - this.canvas.width, this.camera.targetX));
        this.camera.x += (this.camera.targetX - this.camera.x) * (dt * 6);

        this.updateHUD();
    }

    updateHUD() {
        // Health Bar
        const hpPct = Math.max(0, (this.player.hp / this.player.maxHp) * 100);
        const hpFill = document.getElementById('hud-hp-fill');
        if (hpFill) hpFill.style.width = `${hpPct}%`;
        const hpText = document.getElementById('hud-hp-text');
        if (hpText) hpText.innerText = `${Math.round(this.player.hp)} / ${this.player.maxHp}`;

        // Ki Bar
        const kiPct = Math.max(0, (this.player.ki / this.player.maxKi) * 100);
        const kiFill = document.getElementById('hud-ki-fill');
        if (kiFill) kiFill.style.width = `${kiPct}%`;
        const kiText = document.getElementById('hud-ki-text');
        if (kiText) kiText.innerText = `${Math.round(this.player.ki)} / ${this.player.maxKi}`;

        // Belt Badge & XP
        const beltData = window.BELT_RANKS[this.player.belt];
        const beltBadge = document.getElementById('hud-belt-badge');
        if (beltBadge) {
            beltBadge.innerText = `${beltData.badgeIcon} ${beltData.name}`;
            beltBadge.style.background = beltData.color;
            beltBadge.style.color = beltData.textColor;
        }

        const nextRankIdx = window.BELT_ORDER.indexOf(this.player.belt) + 1;
        const nextBelt = window.BELT_RANKS[window.BELT_ORDER[nextRankIdx]];
        const xpFill = document.getElementById('hud-xp-fill');
        if (xpFill) {
            const xpReq = nextBelt ? nextBelt.xpRequired : beltData.xpRequired;
            const xpPct = Math.min(100, (this.player.xp / xpReq) * 100);
            xpFill.style.width = `${xpPct}%`;
        }

        // Combo Counter
        const comboContainer = document.getElementById('hud-combo-container');
        if (comboContainer) {
            if (this.player.comboCount > 1) {
                comboContainer.classList.remove('hidden');
                document.getElementById('hud-combo-count').innerText = this.player.comboCount;
                const gradeElem = document.getElementById('hud-combo-grade');
                gradeElem.innerText = this.player.comboGrade;
                gradeElem.className = `combo-grade grade-${this.player.comboGrade}`;
            } else {
                comboContainer.classList.add('hidden');
            }
        }

        // Score & Wave
        const scoreElem = document.getElementById('hud-score');
        if (scoreElem) scoreElem.innerText = `SCORE: ${this.player.totalScore}`;
        const waveElem = document.getElementById('hud-wave');
        if (waveElem) waveElem.innerText = `STAGE ${this.wave}/8`;

        // Action Move Slots Cooldown & UI
        this.updateMoveSlotUI('slot-primary', this.player.equippedMoves.primary);
        this.updateMoveSlotUI('slot-secondary', this.player.equippedMoves.secondary);
        this.updateMoveSlotUI('slot-special1', this.player.equippedMoves.special1);
        this.updateMoveSlotUI('slot-special2', this.player.equippedMoves.special2);
        this.updateMoveSlotUI('slot-ultimate', this.player.equippedMoves.ultimate);
    }

    updateMoveSlotUI(elemId, moveId) {
        const elem = document.getElementById(elemId);
        if (!elem) return;

        if (!moveId) {
            elem.classList.add('slot-locked');
            elem.querySelector('.slot-name').innerText = 'Locked';
            elem.querySelector('.slot-cd').style.height = '0%';
            return;
        }

        elem.classList.remove('slot-locked');
        const move = window.MOVES_DATABASE[moveId];
        elem.querySelector('.slot-name').innerText = move.name;
        
        const cd = this.player.cooldowns[moveId] || 0;
        const totalCd = move.cooldown || 1.0;
        const cdPct = (cd / totalCd) * 100;
        elem.querySelector('.slot-cd').style.height = `${cdPct}%`;

        if (this.player.ki < move.kiCost) {
            elem.classList.add('no-ki');
        } else {
            elem.classList.remove('no-ki');
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Screen Shake calculation
        let shakeOffsetX = 0;
        let shakeOffsetY = 0;
        if (this.camera.shakeTime > 0) {
            shakeOffsetX = (Math.random() - 0.5) * this.camera.shakeMag;
            shakeOffsetY = (Math.random() - 0.5) * this.camera.shakeMag;
        }

        this.ctx.save();
        this.ctx.translate(-this.camera.x + shakeOffsetX, shakeOffsetY);

        // Render Arena Background
        this.arena.renderBackground(this.ctx, this.camera);

        // Render Enemies
        this.enemies.forEach(e => e.render(this.ctx));

        // Render Player
        this.player.render(this.ctx);

        // Render VFX Sparks / Slashes / Floating text
        this.vfx.render(this.ctx);

        this.ctx.restore();
    }

    loop(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const dt = Math.min(0.05, (timestamp - this.lastTime) / 1000);
        this.lastTime = timestamp;

        this.update(dt);
        this.render();

        requestAnimationFrame((t) => this.loop(t));
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.gameEngine = new GameEngine();
    requestAnimationFrame((t) => window.gameEngine.loop(t));
});
