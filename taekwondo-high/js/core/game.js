// Main Game Loop, 10-Floor Progression, Boss Battles, Roguelike Drafting & Dual Jump Keys (Space & Tab)

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.arena = new window.ArenaManager();
        this.vfx = new window.ParticleSystem();
        this.player = new window.Player(400, 480);
        this.enemies = [];
        this.projectiles = [];
        this.pickupItems = [];
        this.kickableDesks = [];

        // Camera system
        this.camera = { x: 0, y: 0, targetX: 0, shakeTime: 0, shakeMag: 0 };

        // Game progression & Waves (10 Floors)
        this.state = 'start'; // 'start', 'playing', 'paused', 'perk_select', 'wave_clear', 'game_over', 'victory', 'math_exam'
        this.wave = 1;
        this.maxWave = 10;
        this.enemiesToSpawn = 0;
        this.spawnTimer = 0;
        this.waveCleared = false;
        this.lastTime = 0;
        this.slowMoTimer = 0;
        this.victorySunriseTimer = 0;

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

            // --- JUMP ACTION (SPACEBAR & TAB KEY) ---
            if (e.code === 'Space' || e.code === 'Tab') {
                e.preventDefault();
                if (this.state === 'playing') {
                    this.player.jump();
                }
                return;
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
                case 'KeyG':
                case 'KeyT':
                    // Throw held ammo item (Apple, Cactus, Ruler, Pencil, Book, Ninja Star)
                    this.player.throwThrowable(this.projectiles, this.vfx);
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
                case 'KeyH':
                case 'KeyY':
                    if (this.player.equippedMoves.special3) {
                        this.player.performMove(this.player.equippedMoves.special3);
                    }
                    break;
                case 'KeyI':
                case 'KeyF':
                    if (this.player.equippedMoves.ultimate) {
                        this.player.performMove(this.player.equippedMoves.ultimate);
                    }
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    e.preventDefault();
                    this.player.dash();
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
            'btn-jump': () => this.player.jump(),
            'btn-throw': () => this.player.throwThrowable(this.projectiles, this.vfx),
            'btn-primary': () => this.player.performMove(this.player.equippedMoves.primary),
            'btn-secondary': () => this.player.performMove(this.player.equippedMoves.secondary),
            'btn-dash': () => this.player.dash(),
            'btn-special': () => this.player.equippedMoves.special1 && this.player.performMove(this.player.equippedMoves.special1),
            'btn-hadouken': () => this.player.equippedMoves.special3 && this.player.performMove(this.player.equippedMoves.special3),
            'btn-ultimate': () => this.player.equippedMoves.ultimate && this.player.performMove(this.player.equippedMoves.ultimate),
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

        const startBtn = document.getElementById('btn-start-game');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.startGame();
            });
        }

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
        document.getElementById('hud-overlay').classList.remove('hidden');
        this.state = 'playing';
        this.startWave(1);
    }

    resetGame() {
        this.player = new window.Player(400, 480);
        this.vfx = new window.ParticleSystem();
        this.projectiles = [];
        this.pickupItems = [];
        this.kickableDesks = [];
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
        
        // Initialize Arena theme for this floor (Floors 1 - 10)
        this.arena.initTheme(waveNum);

        // Spawn interactive stage objects (Reading desks, pickups like apples, cactus pots, rulers, books, ninja stars)
        const spawned = this.arena.spawnInteractiveObjects(waveNum);
        this.kickableDesks = spawned.desks || [];
        this.pickupItems = spawned.items || [];
        this.projectiles = [];

        this.enemies = [];
        this.nurse = null;
        const floorCfg = window.STAGE_FLOORS_CONFIG[waveNum] || window.STAGE_FLOORS_CONFIG[1];

        // Switch to floor-specific BGM or exhilarating heavy rock boss music
        if (window.soundEngine) {
            window.soundEngine.startBGM(waveNum, !!floorCfg.isBossStage);
        }

        if (floorCfg.isNursery) {
            this.enemiesToSpawn = 0;
            this.nurse = new window.NurseNPC(800, this.arena.groundY - 80);
            this.showWaveBanner(`💖 ${floorCfg.name.toUpperCase()} 💖`);
        } else if (floorCfg.isBossStage) {
            this.enemiesToSpawn = floorCfg.mobs.reduce((acc, m) => acc + m.count, 0) + 1;
            this.spawnTimer = 0.6;
            this.showWaveBanner(`🚨 ${floorCfg.bossTitle.toUpperCase()} 🚨`);
        } else {
            this.enemiesToSpawn = 3 + (typeof waveNum === 'number' ? waveNum : 5) * 2;
            this.spawnTimer = 0.5;
            this.showWaveBanner(`FLOOR ${waveNum}/10: ${this.arena.name}`);
        }
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

        const floor = this.arena.currentFloor;
        const floorCfg = window.STAGE_FLOORS_CONFIG[floor];

        const spawnRight = Math.random() > 0.5;
        const x = spawnRight ? this.arena.width - 90 : 90;

        if (floorCfg && floorCfg.isBossStage) {
            const hasBoss = this.enemies.some(e => e.isBoss);
            if (!hasBoss) {
                this.enemies.push(new window.Enemy(this.arena.width / 2 + (spawnRight ? 200 : -200), 480, floorCfg.bossType, floor));
                if (window.soundEngine && window.soundEngine.playWhoosh) {
                    window.soundEngine.playWhoosh(0.6, 2.0);
                }
                return;
            }
        }

        let enemyType = 'bully';
        if (floor >= 7) {
            enemyType = Math.random() < 0.6 ? 'enforcer_heavy' : 'kendo_student';
        } else if (floor >= 5) {
            enemyType = Math.random() < 0.5 ? 'kendo_student' : 'delinquent';
        } else if (floor >= 3) {
            enemyType = Math.random() < 0.5 ? 'karateka' : 'delinquent';
        } else if (floor >= 2) {
            enemyType = Math.random() < 0.4 ? 'delinquent' : 'bully';
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
                const isCrit = Math.random() < this.player.critChance;
                let finalDmg = Math.round(m.damage * beltMultiplier * (isCrit ? 2.2 : 1.0));

                if (this.player.perks.flowState && this.player.comboCount > 0) {
                    finalDmg = Math.round(finalDmg * (1 + Math.floor(this.player.comboCount / 10) * 0.1));
                }

                // Apply damage
                enemy.takeDamage(finalDmg, pX, m.knockback, m.stunTime, this.vfx);
                this.player.registerHit();

                // Spark and impact visuals
                this.vfx.addSpark(enemy.x, enemy.y + 30, m.vfx?.sparkColor || '#facc15', isCrit ? 16 : 8, 300);
                this.vfx.addDamageText(enemy.x, enemy.y, `${finalDmg}${isCrit ? ' 💥 CRIT!' : ''}`, isCrit);

                if (window.soundEngine) {
                    window.soundEngine.playHit(m.damage > 60 ? 'heavy' : 'normal', isCrit);
                }

                if (this.player.perks.flameKicks) {
                    enemy.applyBurn(3);
                }

                if (this.player.perks.shockwave) {
                    this.vfx.addSpark(enemy.x, enemy.y + 40, '#38bdf8', 10, 200);
                    this.enemies.forEach(other => {
                        if (other !== enemy && other.state !== 'ko' && Math.abs(other.x - enemy.x) < 90) {
                            other.takeDamage(Math.round(finalDmg * 0.4), enemy.x, 200, 0.3, this.vfx);
                        }
                    });
                }

                this.triggerScreenShake(isCrit ? 12 : 6, isCrit ? 0.25 : 0.12);
                if (isCrit) this.triggerSlowMo(0.12);

                if (enemy.hp <= 0) {
                    const promoTarget = this.player.gainXp(enemy.xpValue);
                    if (promoTarget) {
                        this.startMathExam(promoTarget);
                    }
                    if (this.player.perks.vampirism) {
                        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 15);
                        this.player.ki = Math.min(this.player.maxKi, this.player.ki + 30);
                        this.vfx.addDamageText(this.player.x, this.player.y, '+15 HP', false, false, true);
                    }
                }
            }
        });
    }

    // --- UTBK PENGETAHUAN KUANTITATIF (PK) PROMOTION TRIAL ---
    startMathExam(beltId) {
        this.state = 'math_exam';
        this.mathExamTargetBelt = beltId;
        this.mathExamStep = 0;
        // Exact 1 UTBK PK question per promotion!
        this.currentUtbkQuestion = this.generateUtbkPkQuestion(beltId);

        this.camera.shakeTime = 0;
        this.camera.shakeMag = 0;
        this.slowMoTimer = 0;

        const modal = document.getElementById('math-exam-modal');
        if (!modal) {
            this.completePromotion(beltId);
            return;
        }

        const info = window.BELT_RANKS[beltId];
        document.getElementById('math-exam-badge').innerText = info.badgeIcon;
        const titleEl = document.getElementById('math-exam-belt-title');
        titleEl.innerText = `UJIAN ${info.name.toUpperCase()} (UTBK PK)`;
        titleEl.style.color = info.accentColor || info.color;

        const subEl = document.getElementById('math-exam-belt-sub');
        if (subEl) {
            subEl.innerText = `Selesaikan 1 soal Pengetahuan Kuantitatif UTBK untuk membuktikan kelayakan promosi sabuk ${info.name}!`;
        }

        modal.classList.remove('hidden');
        this.renderMathQuestion();
    }

    generateUtbkPkQuestion(beltId = 'YELLOW') {
        const rankIdx = Math.max(1, window.BELT_ORDER.indexOf(beltId));
        
        // Database of real reconstructed UTBK SNBT Pengetahuan Kuantitatif questions scaling in difficulty
        const utbkPkDatabase = {
            // TINGKAT 1: YELLOW BELT (Dasar: Barisan Pola Bilangan, Operasi Aljabar Linier Dasar)
            1: [
                {
                    topic: 'Pola Barisan Bilangan',
                    level: 'Tingkat Mudah • SNBT PK',
                    question: 'Diketahui pola bilangan:\n4, 7, 12, 19, 28, x\nBerapakah nilai x yang tepat?',
                    options: [
                        { key: 'A', text: '37' },
                        { key: 'B', text: '39' },
                        { key: 'C', text: '40' },
                        { key: 'D', text: '41' },
                        { key: 'E', text: '43' }
                    ],
                    correctKey: 'B',
                    explanation: 'Pola beda bertingkat: +3, +5, +7, +9, +11. Nilai x = 28 + 11 = 39.'
                },
                {
                    topic: 'Aljabar & SPLDV',
                    level: 'Tingkat Mudah • SNBT PK',
                    question: 'Jika 3x + 2y = 19 dan 2x - y = 8, berapakah nilai dari x + y?',
                    options: [
                        { key: 'A', text: '5' },
                        { key: 'B', text: '6' },
                        { key: 'C', text: '7' },
                        { key: 'D', text: '8' },
                        { key: 'E', text: '9' }
                    ],
                    correctKey: 'C',
                    explanation: 'Dari 2x - y = 8 diperoleh y = 2x - 8. Substitusi ke 3x + 2(2x - 8) = 19 => 7x = 35 => x = 5, y = 2. Maka x + y = 7.'
                },
                {
                    topic: 'Aritmetika Sosial & Rasio',
                    level: 'Tingkat Mudah • SNBT PK',
                    question: 'Rasio kelereng Toni dan Budi adalah 3 : 5. Jika selisih kelereng mereka adalah 16 butir, berapa jumlah seluruh kelereng keduanya?',
                    options: [
                        { key: 'A', text: '48 butir' },
                        { key: 'B', text: '56 butir' },
                        { key: 'C', text: '64 butir' },
                        { key: 'D', text: '72 butir' },
                        { key: 'E', text: '80 butir' }
                    ],
                    correctKey: 'C',
                    explanation: 'Selisih perbandingan = 5 - 3 = 2 bagian = 16 => 1 bagian = 8. Jumlah total = (3 + 5) × 8 = 64 butir.'
                },
                {
                    topic: 'Pola Bilangan Fibonacci Bertingkat',
                    level: 'Tingkat Mudah • SNBT PK',
                    question: 'Tentukan suku berikutnya dari deret:\n2, 3, 5, 8, 13, 21, y',
                    options: [
                        { key: 'A', text: '32' },
                        { key: 'B', text: '33' },
                        { key: 'C', text: '34' },
                        { key: 'D', text: '35' },
                        { key: 'E', text: '36' }
                    ],
                    correctKey: 'C',
                    explanation: 'Deret Fibonacci (penjumlahan 2 suku sebelumnya): 13 + 21 = 34.'
                }
            ],

            // TINGKAT 2: GREEN BELT (Menengah Bawah: Operasi Definisi Baru / Operator Khusus, Persamaan Kuadrat)
            2: [
                {
                    topic: 'Operator Baru Bilangan',
                    level: 'Tingkat Sedang • SNBT PK',
                    question: 'Operasi ⨂ pada himpunan bilangan didefinisikan dengan:\na ⨂ b = (a × b) - (a + b) + 4\nBerapakah nilai dari 5 ⨂ (3 ⨂ 2)?',
                    options: [
                        { key: 'A', text: '17' },
                        { key: 'B', text: '19' },
                        { key: 'C', text: '21' },
                        { key: 'D', text: '23' },
                        { key: 'E', text: '25' }
                    ],
                    correctKey: 'B',
                    explanation: 'Hitung dalam kurung terlebih dahulu:\n(3 ⨂ 2) = (3 × 2) - (3 + 2) + 4 = 6 - 5 + 4 = 5.\nLalu hitung:\n5 ⨂ 5 = (5 × 5) - (5 + 5) + 4 = 25 - 10 + 4 = 19 (Opsi B).'
                },
                {
                    topic: 'Persamaan Kuadrat & Akar-Akar',
                    level: 'Tingkat Sedang • SNBT PK',
                    question: 'Jika x₁ dan x₂ adalah akar-akar dari persamaan 2x² - 6x + 3 = 0, berapakah nilai dari (x₁)² + (x₂)²?',
                    options: [
                        { key: 'A', text: '4' },
                        { key: 'B', text: '6' },
                        { key: 'C', text: '7' },
                        { key: 'D', text: '9' },
                        { key: 'E', text: '12' }
                    ],
                    correctKey: 'B',
                    explanation: 'x₁ + x₂ = -(-6)/2 = 3, x₁·x₂ = 3/2. (x₁)² + (x₂)² = (x₁ + x₂)² - 2(x₁·x₂) = 3² - 2(3/2) = 9 - 3 = 6.'
                },
                {
                    topic: 'Eksponen & Sifat Pangkat',
                    level: 'Tingkat Sedang • SNBT PK',
                    question: 'Jika 3^(2x - 1) = 81^(x - 2), berapakah nilai x yang memenuhi persamaan tersebut?',
                    options: [
                        { key: 'A', text: '2.5' },
                        { key: 'B', text: '3.5' },
                        { key: 'C', text: '4.5' },
                        { key: 'D', text: '5.5' },
                        { key: 'E', text: '6.5' }
                    ],
                    correctKey: 'B',
                    explanation: '81 = 3⁴, maka 3^(2x - 1) = 3^(4(x - 2)) => 2x - 1 = 4x - 8 => 2x = 7 => x = 3.5.'
                },
                {
                    topic: 'Rata-Rata Gabungan / Statistika',
                    level: 'Tingkat Sedang • SNBT PK',
                    question: 'Rata-rata nilai ujian matematika dari 15 siswa putra adalah 74, sedangkan 25 siswa putri adalah 82. Berapakah nilai rata-rata gabungan seluruh kelas?',
                    options: [
                        { key: 'A', text: '77.5' },
                        { key: 'B', text: '78.0' },
                        { key: 'C', text: '79.0' },
                        { key: 'D', text: '79.5' },
                        { key: 'E', text: '80.0' }
                    ],
                    correctKey: 'C',
                    explanation: 'X_gab = (15×74 + 25×82) / 40 = (1110 + 2050) / 40 = 3160 / 40 = 79.0.'
                }
            ],

            // TINGKAT 3: BLUE BELT (Menengah Atas: Fungsi Komposisi & Invers, Determinan Matriks, Peluang Kombinatorika)
            3: [
                {
                    topic: 'Fungsi Komposisi & Invers',
                    level: 'Tingkat Menengah Atas • SNBT PK',
                    question: 'Diketahui f(x) = 2x - 5 dan g(x) = (3x + 1) / (x - 2) dengan x ≠ 2.\nBerapakah nilai dari (g ∘ f)(4)?',
                    options: [
                        { key: 'A', text: '6' },
                        { key: 'B', text: '8' },
                        { key: 'C', text: '10' },
                        { key: 'D', text: '12' },
                        { key: 'E', text: '14' }
                    ],
                    correctKey: 'C',
                    explanation: 'f(4) = 2(4) - 5 = 3. Maka (g ∘ f)(4) = g(3) = (3(3) + 1) / (3 - 2) = 10 / 1 = 10.'
                },
                {
                    topic: 'Matriks & Determinan',
                    level: 'Tingkat Menengah Atas • SNBT PK',
                    question: 'Diketahui matriks A = [[2, 3], [1, 4]] dan matriks B = [[1, -1], [2, 0]].\nBerapakah determinan dari matriks (A × B)?',
                    options: [
                        { key: 'A', text: '5' },
                        { key: 'B', text: '8' },
                        { key: 'C', text: '10' },
                        { key: 'D', text: '12' },
                        { key: 'E', text: '15' }
                    ],
                    correctKey: 'C',
                    explanation: 'det(A) = (2)(4) - (3)(1) = 5. det(B) = (1)(0) - (-1)(2) = 2. det(AB) = det(A) × det(B) = 5 × 2 = 10.'
                },
                {
                    topic: 'Peluang & Kombinatorika',
                    level: 'Tingkat Menengah Atas • SNBT PK',
                    question: 'Dari sebuah kantong berisi 5 kelereng merah dan 3 kelereng biru, diambil 2 kelereng sekaligus secara acak. Berapakah peluang terambilnya kelereng dengan warna berbeda?',
                    options: [
                        { key: 'A', text: '15/28' },
                        { key: 'B', text: '15/56' },
                        { key: 'C', text: '5/14' },
                        { key: 'D', text: '3/8' },
                        { key: 'E', text: '9/28' }
                    ],
                    correctKey: 'A',
                    explanation: 'Banyak cara ambil 1 merah & 1 biru = C(5,1) × C(3,1) = 5 × 3 = 15. Ruang sampel C(8,2) = 28. Peluang = 15/28.'
                },
                {
                    topic: 'Geometri Sudut & Garis Sejajar',
                    level: 'Tingkat Menengah Atas • SNBT PK',
                    question: 'Dua sudut saling berpelurus. Sudut pertama besarnya (3x + 15)° dan sudut kedua besarnya (2x + 25)°. Berapakah besar sudut pertama?',
                    options: [
                        { key: 'A', text: '81°' },
                        { key: 'B', text: '99°' },
                        { key: 'C', text: '102°' },
                        { key: 'D', text: '105°' },
                        { key: 'E', text: '115°' }
                    ],
                    correctKey: 'B',
                    explanation: '(3x + 15) + (2x + 25) = 180 => 5x + 40 = 180 => 5x = 140 => x = 28. Sudut pertama = 3(28) + 15 = 84 + 15 = 99°.'
                }
            ],

            // TINGKAT 4: RED BELT (Sukar: Pertidaksamaan Rasional/Mutlak, Limit Aljabar, Hubungan Kuantitas P dan Q)
            4: [
                {
                    topic: 'Analisis Kuantitas P dan Q',
                    level: 'Tingkat Sulit • SNBT PK',
                    question: 'Diketahui x > y > 0 dengan x² - y² = 24 dan x - y = 2.\nP = Nilai dari x × y\nQ = 35\nManakah hubungan yang benar antara kuantitas P dan Q?',
                    options: [
                        { key: 'A', text: 'Kuantitas P > Q' },
                        { key: 'B', text: 'Kuantitas P < Q' },
                        { key: 'C', text: 'Kuantitas P = Q' },
                        { key: 'D', text: 'Informasi yang diberikan tidak cukup' },
                        { key: 'E', text: '2P = Q' }
                    ],
                    correctKey: 'C',
                    explanation: 'x² - y² = (x - y)(x + y) => 24 = 2(x + y) => x + y = 12. Karena x - y = 2, maka x = 7, y = 5. Nilai P = x × y = 7 × 5 = 35. Maka P = Q.'
                },
                {
                    topic: 'Pertidaksamaan Nilai Mutlak',
                    level: 'Tingkat Sulit • SNBT PK',
                    question: 'Berapa banyak bilangan bulat x yang memenuhi pertidaksamaan:\n|2x - 5| ≤ 9 ?',
                    options: [
                        { key: 'A', text: '8' },
                        { key: 'B', text: '9' },
                        { key: 'C', text: '10' },
                        { key: 'D', text: '11' },
                        { key: 'E', text: '12' }
                    ],
                    correctKey: 'C',
                    explanation: '-9 ≤ 2x - 5 ≤ 9 => -4 ≤ 2x ≤ 14 => -2 ≤ x ≤ 7. Bilangan bulat: {-2, -1, 0, 1, 2, 3, 4, 5, 6, 7}, total = 10 bilangan.'
                },
                {
                    topic: 'Sistem Persamaan Tiga Variabel (SPLTV)',
                    level: 'Tingkat Sulit • SNBT PK',
                    question: 'Diketahui:\na + b = 7\nb + c = 11\na + c = 10\nBerapakah nilai dari a × b × c ?',
                    options: [
                        { key: 'A', text: '48' },
                        { key: 'B', text: '60' },
                        { key: 'C', text: '72' },
                        { key: 'D', text: '84' },
                        { key: 'E', text: '96' }
                    ],
                    correctKey: 'D',
                    explanation: 'Jumlahkan ketiganya: 2(a + b + c) = 28 => a + b + c = 14. Maka c = 14 - 7 = 7, a = 14 - 11 = 3, b = 14 - 10 = 4. Nilai a × b × c = 3 × 4 × 7 = 84 (Opsi D).'
                },
                {
                    topic: 'Turunan / Titik Ekstrim Optimasi',
                    level: 'Tingkat Sulit • SNBT PK',
                    question: 'Fungsi biaya total suatu produksi dinyatakan dengan C(x) = 2x² - 40x + 350 (dalam ribuan rupiah). Pada produksi berapa unit x agar biaya minimum?',
                    options: [
                        { key: 'A', text: '8 unit' },
                        { key: 'B', text: '10 unit' },
                        { key: 'C', text: '12 unit' },
                        { key: 'D', text: '15 unit' },
                        { key: 'E', text: '20 unit' }
                    ],
                    correctKey: 'B',
                    explanation: 'Titik minimum x = -b / (2a) = -(-40) / (2 × 2) = 40 / 4 = 10 unit.'
                }
            ],

            // TINGKAT 5: BLACK BELT 1ST DAN (Mastery / HOTS: Kecukupan Data (1) & (2), Logaritma Kompleks, Geometri Analitik)
            5: [
                {
                    topic: 'Kecukupan Data Pernyataan (1) & (2)',
                    level: 'Tingkat HOTS • SNBT PK Black Belt Trial',
                    question: 'Berapakah nilai dari x + 2y?\n(1) 2x + 4y = 30\n(2) x - y = 3\n\nPutuskan apakah pernyataan (1) dan (2) cukup untuk menjawab pertanyaan!',
                    options: [
                        { key: 'A', text: 'Pernyataan (1) SAJA cukup, tetapi (2) SAJA tidak cukup' },
                        { key: 'B', text: 'Pernyataan (2) SAJA cukup, tetapi (1) SAJA tidak cukup' },
                        { key: 'C', text: 'DUA pernyataan BERSAMA-SAMA cukup, tetapi SATU saja tidak cukup' },
                        { key: 'D', text: 'Pernyataan (1) SAJA cukup dan pernyataan (2) SAJA cukup' },
                        { key: 'E', text: 'Pernyataan (1) dan (2) tidak cukup untuk menjawab' }
                    ],
                    correctKey: 'A',
                    explanation: 'Dari (1): 2x + 4y = 30 jika dibagi 2 menghasilkan x + 2y = 15. Jadi (1) SAJA sudah cukup menjawab nilai x + 2y tanpa perlu tahu masing-masing x dan y.'
                },
                {
                    topic: 'Logaritma & Eksponensial HOTS',
                    level: 'Tingkat HOTS • SNBT PK Black Belt Trial',
                    question: 'Jika ²log 3 = a dan ³log 5 = b, maka nilai dari ⁶log 15 dinyatakan dalam a dan b adalah...',
                    options: [
                        { key: 'A', text: '(a + ab) / (1 + a)' },
                        { key: 'B', text: '(a + b) / (1 + a)' },
                        { key: 'C', text: '(1 + ab) / (1 + a)' },
                        { key: 'D', text: '(ab + 1) / (a + b)' },
                        { key: 'E', text: 'ab / (a + 1)' }
                    ],
                    correctKey: 'A',
                    explanation: '⁶log 15 = ²log 15 / ²log 6 = (²log 3 + ²log 5) / (²log 2 + ²log 3). Karena ²log 5 = ²log 3 × ³log 5 = ab, maka = (a + ab) / (1 + a).'
                },
                {
                    topic: 'Geometri Analitik & Lingkaran',
                    level: 'Tingkat HOTS • SNBT PK Black Belt Trial',
                    question: 'Sebuah lingkaran berpusat di titik (2, -3) dan menyinggung garis 3x - 4y + 7 = 0. Berapakah panjang jari-jari (r) lingkaran tersebut?',
                    options: [
                        { key: 'A', text: '3' },
                        { key: 'B', text: '4' },
                        { key: 'C', text: '5' },
                        { key: 'D', text: '6' },
                        { key: 'E', text: '7' }
                    ],
                    correctKey: 'C',
                    explanation: 'Jarak titik ke garis: r = |3(2) - 4(-3) + 7| / √(3² + (-4)²) = |6 + 12 + 7| / 5 = 25 / 5 = 5.'
                },
                {
                    topic: 'Peluang Bersyarat & Kombinasi Majemuk',
                    level: 'Tingkat HOTS • SNBT PK Black Belt Trial',
                    question: 'Tiga dadu bersisi enam dilempar bersamaan sekali. Berapakah peluang munculnya jumlah mata dadu sama dengan 5?',
                    options: [
                        { key: 'A', text: '1/36' },
                        { key: 'B', text: '1/24' },
                        { key: 'C', text: '5/216' },
                        { key: 'D', text: '6/216' },
                        { key: 'E', text: '1/72' }
                    ],
                    correctKey: 'D',
                    explanation: 'Pasangan jumlah 5: (1,1,3) [3 susunan], (1,2,2) [3 susunan]. Total ada 6 susunan dari 6³ = 216. Peluang = 6/216 = 1/36 (Opsi D: 6/216).'
                }
            ]
        };

        const questionList = utbkPkDatabase[rankIdx] || utbkPkDatabase[1];
        const selectedQuestion = questionList[Math.floor(Math.random() * questionList.length)];
        return selectedQuestion;
    }

    renderMathQuestion() {
        const q = this.currentUtbkQuestion;
        if (!q) return;

        const promptEl = document.getElementById('math-question-prompt');
        if (promptEl) promptEl.innerText = q.level || 'SOAL UTBK PENGETAHUAN KUANTITATIF';

        const topicEl = document.getElementById('math-topic-badge');
        if (topicEl) topicEl.innerText = q.topic || 'PENGETAHUAN KUANTITATIF';

        const formulaEl = document.getElementById('math-formula');
        if (formulaEl) formulaEl.innerText = q.question;

        // Hide solution panel when new question is rendered
        const solutionPanel = document.getElementById('math-solution-panel');
        if (solutionPanel) {
            solutionPanel.classList.add('hidden');
        }

        const grid = document.getElementById('math-options-grid');
        grid.innerHTML = q.options.map(opt => `
            <button class="math-option-btn" data-key="${opt.key}">
                <span class="math-option-key">${opt.key}</span>
                <span class="math-option-text">${opt.text}</span>
            </button>
        `).join('');

        grid.querySelectorAll('.math-option-btn').forEach(btn => {
            btn.onclick = () => {
                const selectedKey = btn.getAttribute('data-key');
                this.handleMathAnswer(selectedKey, q.correctKey, btn, q.explanation, q);
            };
        });
    }

    handleMathAnswer(selectedKey, correctKey, btnElem, explanation, questionObj) {
        const allBtns = document.querySelectorAll('.math-option-btn');
        allBtns.forEach(b => b.disabled = true);

        const isCorrect = (selectedKey === correctKey);
        const solutionPanel = document.getElementById('math-solution-panel');
        const statusEl = document.getElementById('math-solution-status');
        const bodyEl = document.getElementById('math-solution-body');
        const continueBtn = document.getElementById('btn-math-continue');

        if (isCorrect) {
            btnElem.classList.add('btn-correct');
            if (statusEl) {
                statusEl.innerText = '✓ JAWABAN ANDA BENAR!';
                statusEl.className = 'math-solution-status success';
            }
            if (window.soundEngine) window.soundEngine.playMathCorrect();
        } else {
            btnElem.classList.add('btn-wrong');
            // Highlight the correct answer button
            allBtns.forEach(b => {
                if (b.getAttribute('data-key') === correctKey) {
                    b.classList.add('btn-correct');
                }
            });
            if (statusEl) {
                statusEl.innerText = `✗ JAWABAN BELUM TEPAT (KUNCI: ${correctKey})`;
                statusEl.className = 'math-solution-status error';
            }
            if (window.soundEngine) window.soundEngine.playMathWrong();
        }

        // Render rich, detailed solution steps without any time limit
        if (bodyEl) {
            const correctOpt = questionObj.options.find(o => o.key === correctKey);
            const optText = correctOpt ? correctOpt.text : '';
            bodyEl.innerHTML = `
                <div style="margin-bottom:8px; font-weight:800; color:#facc15;">
                    📌 Kunci Jawaban: (${correctKey}) — ${optText}
                </div>
                <div style="color:#cbd5e1; line-height:1.6;">
                    <strong>💡 Langkah Pembahasan:</strong><br>
                    ${explanation || 'Tidak ada langkah tambahan.'}
                </div>
                <div style="margin-top:10px; font-size:0.82rem; color:#94a3b8; font-style:italic;">
                    Silakan baca dan telaah solusi di atas secara teliti untuk evaluasi diri. Klik tombol di bawah jika Anda sudah siap melanjutkan!
                </div>
            `;
        }

        // Reveal the solution discussion panel and smoothly scroll it into full view
        if (solutionPanel) {
            solutionPanel.classList.remove('hidden');
            setTimeout(() => {
                solutionPanel.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }, 60);
        }

        // Wire the continue button to proceed ONLY when player clicks it
        if (continueBtn) {
            continueBtn.onclick = () => {
                const modal = document.getElementById('math-exam-modal');
                if (modal) modal.classList.add('hidden');
                if (solutionPanel) solutionPanel.classList.add('hidden');
                this.completePromotion(this.mathExamTargetBelt);
            };
        }
    }

    completePromotion(beltId) {
        this.player.applyBeltStats(beltId);
        if (window.soundEngine) window.soundEngine.playBeltRankUp();
        this.presentRankUpModal(beltId);
    }

    presentRankUpModal(beltId) {
        this.state = 'rankup_view';
        this.camera.shakeTime = 0;
        this.camera.shakeMag = 0;
        this.slowMoTimer = 0;

        const info = window.BELT_RANKS[beltId];
        const modal = document.getElementById('rankup-modal');
        if (!modal) return;

        const currentRankIndex = window.BELT_ORDER.indexOf(beltId);
        const prevBeltId = currentRankIndex > 0 ? window.BELT_ORDER[currentRankIndex - 1] : null;
        const prevInfo = prevBeltId ? window.BELT_RANKS[prevBeltId] : null;

        document.getElementById('rankup-badge').innerText = info.badgeIcon;
        const rankNameEl = document.getElementById('rankup-name');
        rankNameEl.innerText = info.name.toUpperCase();
        rankNameEl.style.color = info.accentColor || info.color;
        document.getElementById('rankup-korean').innerText = info.koreanName;

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

        modal.classList.remove('hidden');

        document.getElementById('btn-rankup-continue').onclick = () => {
            modal.classList.add('hidden');
            this.state = 'playing';
        };
    }

    presentRoguelikeDraft() {
        this.state = 'perk_select';
        const modal = document.getElementById('perk-draft-modal');
        if (!modal) return;

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
                
                if (this.wave === 5) {
                    this.startWave('5.5');
                } else if (this.wave === '5.5' || this.wave === 5.5) {
                    this.startWave(6);
                } else if (this.wave >= this.maxWave) {
                    this.triggerSunriseVictory();
                } else {
                    this.startWave(Number(this.wave) + 1);
                }
            });
        });

        modal.classList.remove('hidden');
    }

    triggerSunriseVictory() {
        this.state = 'victory';
        this.victorySunriseTimer = 0;
        document.getElementById('hud-overlay').classList.add('hidden');
        document.getElementById('victory-modal').classList.remove('hidden');
        if (window.soundEngine) {
            window.soundEngine.playBeltRankUp();
        }
    }

    update(dt) {
        if (this.state === 'victory') {
            this.victorySunriseTimer += dt;
            return;
        }

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
                this.spawnTimer = Math.random() * 1.6 + 1.1;
            }
        }

        // Nursery stage completion handling
        if ((this.wave === '5.5' || this.wave === 5.5) && !this.waveCleared) {
            if (this.nurse && this.nurse.hasHealed && this.nurse.dialogueTimer > 2.5) {
                this.waveCleared = true;
                setTimeout(() => {
                    this.presentRoguelikeDraft();
                }, 1200);
            }
        }

        // Check wave / floor completion
        if (this.enemiesToSpawn <= 0 && this.enemies.length > 0 && this.enemies.every(e => e.state === 'ko') && !this.waveCleared) {
            this.waveCleared = true;

            // If defeating Floor 10 (Supreme Final Boss)
            if (this.wave >= this.maxWave) {
                setTimeout(() => {
                    this.triggerSunriseVictory();
                }, 1200);
            } else {
                setTimeout(() => {
                    this.presentRoguelikeDraft();
                }, 1000);
            }
        }

        // Player update
        this.player.update(dt, this.input, this.arena, this.vfx);

        // Nurse update
        if (this.nurse) {
            this.nurse.update(dt, this.player, this.vfx);
        }

        // Check combat collisions
        this.checkHitCollisions();

        // Enemies update
        this.enemies.forEach(e => e.update(dt, this.player, this.arena, this.vfx));

        // Interactive Stage Props: Kickable Desks update
        this.kickableDesks.forEach(desk => desk.update(dt, this.player, this.enemies, this.vfx, this.arena));

        // Floor Pickup Items update
        this.pickupItems.forEach(item => item.update(dt, this.player, this.vfx));
        this.pickupItems = this.pickupItems.filter(item => !item.collected);

        // Active Flying Projectiles update
        this.projectiles.forEach(p => p.update(dt, this.enemies, this.vfx, this.arena));
        this.projectiles = this.projectiles.filter(p => p.active);

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
        const hpPct = Math.max(0, (this.player.hp / this.player.maxHp) * 100);
        const hpFill = document.getElementById('hud-hp-fill');
        if (hpFill) hpFill.style.width = `${hpPct}%`;
        const hpText = document.getElementById('hud-hp-text');
        if (hpText) hpText.innerText = `${Math.round(this.player.hp)} / ${this.player.maxHp}`;

        const kiPct = Math.max(0, (this.player.ki / this.player.maxKi) * 100);
        const kiFill = document.getElementById('hud-ki-fill');
        if (kiFill) kiFill.style.width = `${kiPct}%`;
        const kiText = document.getElementById('hud-ki-text');
        if (kiText) kiText.innerText = `${Math.round(this.player.ki)} / ${this.player.maxKi}`;

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

        const scoreElem = document.getElementById('hud-score');
        if (scoreElem) scoreElem.innerText = `SCORE: ${this.player.totalScore}`;
        const waveElem = document.getElementById('hud-wave');
        if (waveElem) {
            const isBoss = [3, 6, 9, 10].includes(this.wave);
            waveElem.innerText = isBoss ? `⚔️ BOSS FLOOR ${this.wave}/10` : `FLOOR ${this.wave}/10`;
            waveElem.style.color = isBoss ? '#f43f5e' : 'var(--accent-yellow)';
        }

        // Ammo Slot indicator in HUD
        const ammoNameEl = document.getElementById('hud-ammo-name');
        const slotThrow = document.getElementById('slot-throw');
        if (ammoNameEl && slotThrow) {
            const count = this.player.ammoInventory.length;
            if (count > 0) {
                const topItem = this.player.ammoInventory[count - 1];
                let icon = '📦';
                if (topItem.type === 'ninja_star') icon = '⭐';
                else if (topItem.type === 'cactus') icon = '🌵';
                else if (topItem.type === 'apple') icon = '🍎';
                else if (topItem.type === 'ruler') icon = '📏';
                else if (topItem.type === 'pencil') icon = '✏️';
                else if (topItem.type === 'book') icon = '📖';
                ammoNameEl.innerText = `${icon} ${topItem.type.replace('_', ' ').toUpperCase()} (${count}/${this.player.maxAmmo})`;
                slotThrow.classList.remove('slot-locked');
            } else {
                ammoNameEl.innerText = `📦 Ammo: 0/${this.player.maxAmmo}`;
                slotThrow.classList.add('slot-locked');
            }
        }

        this.updateMoveSlotUI('slot-primary', this.player.equippedMoves.primary);
        this.updateMoveSlotUI('slot-secondary', this.player.equippedMoves.secondary);
        this.updateMoveSlotUI('slot-special1', this.player.equippedMoves.special1);
        this.updateMoveSlotUI('slot-special2', this.player.equippedMoves.special2);
        this.updateMoveSlotUI('slot-special3', this.player.equippedMoves.special3);
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

        // --- FULL SCREEN SUNRISE ROOFTOP VIEW ON VICTORY ---
        if (this.state === 'victory') {
            this.arena.renderSunriseEndScreen(this.ctx);
            // Render crowned player standing on the rooftop greeting the sunrise
            this.ctx.save();
            const playerX = this.canvas.width / 2;
            const playerY = this.arena.groundY - this.player.height;
            this.player.x = playerX;
            this.player.y = playerY;
            this.player.state = 'idle';
            this.player.belt = 'BLACK';
            this.player.render(this.ctx);
            this.ctx.restore();
            return;
        }

        let shakeOffsetX = 0;
        let shakeOffsetY = 0;
        if (this.camera.shakeTime > 0) {
            shakeOffsetX = (Math.random() - 0.5) * this.camera.shakeMag;
            shakeOffsetY = (Math.random() - 0.5) * this.camera.shakeMag;
        }

        this.ctx.save();
        this.ctx.translate(-this.camera.x + shakeOffsetX, shakeOffsetY);

        // Render 2.5D Arena Background
        this.arena.renderBackground(this.ctx, this.camera);

        // Render Kickable Desks
        this.kickableDesks.forEach(desk => desk.render(this.ctx));

        // Render Floor Pickups
        this.pickupItems.forEach(item => item.render(this.ctx));

        // Render Flying Projectiles
        this.projectiles.forEach(p => p.render(this.ctx));

        // Render Nurse in Nursery Safe Ward
        if (this.nurse) {
            this.nurse.render(this.ctx);
        }

        // Render Enemies
        this.enemies.forEach(e => e.render(this.ctx));

        // Render Player with 3D Motion Model & Dynamic Shadow
        this.player.render(this.ctx);

        // Render VFX Sparks / Trails / Healing pulses
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
