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

        // Input State Tracking
        this.input = {
            left: false,
            right: false,
            up: false,
            down: false,
            vectorX: 0,
            vectorY: 0
        };

        // --- GRAPHICS, SCREEN SHAKE & KEYBINDING PREFERENCES ---
        this.graphicsQuality = 'hd';
        this.colorSaturation = 'normal';
        this.screenShakeMultiplier = 1.0;
        this.bloomGlow = true;
        this.showDamageNumbers = true;
        this.athleteSkin = 'classic_white';

        // Custom Keybindings Database (supports primary, secondary, special1-3, ultimate, throw, jump, dash, parry)
        this.customKeybinds = {
            primary: ['KeyJ', 'KeyZ'],
            secondary: ['KeyK', 'KeyX'],
            special1: ['KeyL', 'KeyE', 'KeyC'],
            special2: ['KeyU', 'KeyR', 'KeyV'],
            special3: ['KeyH', 'KeyY'],
            ultimate: ['KeyI', 'KeyF'],
            throw: ['KeyG', 'KeyT'],
            jump: ['Space', 'Tab'],
            dash: ['ShiftLeft', 'ShiftRight'],
            parry: ['KeyQ']
        };

        this.rebindingAction = null; // Holds the action currently being rebound
        this.loadSavedPreferences();
        this.initCanvasSize();
        this.initInputListeners();
        this.initUI();
    }

    loadSavedPreferences() {
        try {
            const savedBinds = localStorage.getItem('tkd_keybinds');
            if (savedBinds) {
                this.customKeybinds = Object.assign(this.customKeybinds, JSON.parse(savedBinds));
            }
            const savedGfx = localStorage.getItem('tkd_gfx_quality');
            if (savedGfx) this.graphicsQuality = savedGfx;
            const savedSat = localStorage.getItem('tkd_color_sat');
            if (savedSat) this.colorSaturation = savedSat;
            const savedShake = localStorage.getItem('tkd_screen_shake');
            if (savedShake !== null) this.screenShakeMultiplier = parseFloat(savedShake);
            const savedBloom = localStorage.getItem('tkd_bloom');
            if (savedBloom) this.bloomGlow = savedBloom === 'true';
            const savedDmg = localStorage.getItem('tkd_dmg_nums');
            if (savedDmg) this.showDamageNumbers = savedDmg === 'true';
            const savedSkin = localStorage.getItem('tkd_athlete_skin');
            if (savedSkin) this.athleteSkin = savedSkin;
        } catch (e) {
            console.warn('LocalStorage preferences load failed:', e);
        }
    }

    savePreferences() {
        try {
            localStorage.setItem('tkd_keybinds', JSON.stringify(this.customKeybinds));
            localStorage.setItem('tkd_gfx_quality', this.graphicsQuality);
            localStorage.setItem('tkd_color_sat', this.colorSaturation);
            localStorage.setItem('tkd_screen_shake', this.screenShakeMultiplier.toString());
            localStorage.setItem('tkd_bloom', this.bloomGlow.toString());
            localStorage.setItem('tkd_dmg_nums', this.showDamageNumbers.toString());
            localStorage.setItem('tkd_athlete_skin', this.athleteSkin);
        } catch (e) {}
    }

    applyGraphicsSettings() {
        if (!this.canvas) return;
        this.canvas.classList.remove('gfx-hd', 'gfx-retro', 'sat-ultra', 'sat-saturated', 'sat-noir');
        if (this.graphicsQuality === 'hd') {
            this.canvas.classList.add('gfx-hd');
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';
        } else if (this.graphicsQuality === 'retro') {
            this.canvas.classList.add('gfx-retro');
            this.ctx.imageSmoothingEnabled = false;
        } else {
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'medium';
        }

        if (this.colorSaturation === 'ultra') {
            this.canvas.classList.add('sat-ultra');
        } else if (this.colorSaturation === 'saturated') {
            this.canvas.classList.add('sat-saturated');
        } else if (this.colorSaturation === 'noir') {
            this.canvas.classList.add('sat-noir');
        }

        this.updateActionSlotKeyLabels();
    }

    formatKeyCodeForDisplay(code) {
        if (!code) return '';
        if (code.startsWith('Key')) return code.replace('Key', '');
        if (code.startsWith('Digit')) return code.replace('Digit', '');
        if (code === 'Space') return 'SPACE';
        if (code === 'Tab') return 'TAB';
        if (code === 'ShiftLeft' || code === 'ShiftRight') return 'SHIFT';
        if (code === 'ControlLeft' || code === 'ControlRight') return 'CTRL';
        if (code === 'AltLeft' || code === 'AltRight') return 'ALT';
        if (code.startsWith('Arrow')) return code.replace('Arrow', '↑').replace('Up', '↑').replace('Down', '↓').replace('Left', '←').replace('Right', '→');
        return code.toUpperCase();
    }

    updateActionSlotKeyLabels() {
        const getLabel = (action) => {
            const binds = this.customKeybinds[action] || [];
            return binds.map(c => this.formatKeyCodeForDisplay(c)).join(' / ') || 'NONE';
        };

        const map = {
            'slot-primary': getLabel('primary'),
            'slot-secondary': getLabel('secondary'),
            'slot-special1': getLabel('special1'),
            'slot-special2': getLabel('special2'),
            'slot-special3': getLabel('special3'),
            'slot-ultimate': getLabel('ultimate'),
            'slot-throw': getLabel('throw'),
            'slot-jump': getLabel('jump'),
            'slot-dash': getLabel('dash'),
            'slot-guard': getLabel('parry')
        };

        for (let id in map) {
            const el = document.getElementById(id);
            if (el) {
                const keyEl = el.querySelector('.slot-key');
                if (keyEl) keyEl.innerText = map[id];
            }
        }

        // Update Keybinds Modal buttons
        for (let action in this.customKeybinds) {
            const btn = document.getElementById(`kbind-${action}`);
            if (btn) {
                btn.innerText = (this.customKeybinds[action] || []).map(c => this.formatKeyCodeForDisplay(c)).join(' / ') || 'UNBOUND';
            }
        }
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

        // --- MOBILE GESTURE & PINCH-TO-ZOOM / SLIDE PREVENTERS ---
        document.addEventListener('gesturestart', (e) => { e.preventDefault(); }, { passive: false });
        document.addEventListener('gesturechange', (e) => { e.preventDefault(); }, { passive: false });
        document.addEventListener('gestureend', (e) => { e.preventDefault(); }, { passive: false });
        document.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches.length > 1) {
                e.preventDefault(); // Prevent double finger pinch/slide zoom
            }
        }, { passive: false });
        
        let lastTap = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTap <= 300) {
                e.preventDefault(); // Prevent double-tap zoom
            }
            lastTap = now;
        }, { passive: false });
    }

    initInputListeners() {
        window.addEventListener('keydown', (e) => {
            // --- KEY REBINDING INTERCEPTOR ---
            if (this.rebindingAction) {
                e.preventDefault();
                e.stopPropagation();
                const act = this.rebindingAction;
                this.customKeybinds[act] = [e.code];
                this.rebindingAction = null;
                document.querySelectorAll('.keybind-btn').forEach(b => b.classList.remove('rebinding'));
                const hint = document.getElementById('keybind-listening-hint');
                if (hint) hint.innerText = `✅ Assigned ${this.formatKeyCodeForDisplay(e.code)} to ${act.toUpperCase()}!`;
                this.savePreferences();
                this.updateActionSlotKeyLabels();
                return;
            }

            if (window.soundEngine && !window.soundEngine.bgmPlaying) {
                window.soundEngine.init();
                window.soundEngine.startBGM();
            }

            // Pause toggle
            if (e.code === 'KeyP' || e.code === 'Escape') {
                this.togglePause();
                return;
            }

            // Jump check (Space, Tab or custom jump keys)
            const jumpKeys = this.customKeybinds.jump || ['Space', 'Tab'];
            if (jumpKeys.includes(e.code)) {
                e.preventDefault();
                if (this.state === 'playing') {
                    this.player.jump();
                }
                return;
            }

            if (this.state !== 'playing') {
                return;
            }

            // Directional movement
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
                this.input.left = true;
                return;
            }
            if (e.code === 'KeyD' || e.code === 'ArrowRight') {
                this.input.right = true;
                return;
            }

            // Dash
            const dashKeys = this.customKeybinds.dash || ['ShiftLeft', 'ShiftRight'];
            if (dashKeys.includes(e.code)) {
                e.preventDefault();
                this.player.dash();
                return;
            }

            // Parry
            const parryKeys = this.customKeybinds.parry || ['KeyQ'];
            if (parryKeys.includes(e.code)) {
                this.player.performMove('parry_counter');
                return;
            }

            // Throw ammo
            const throwKeys = this.customKeybinds.throw || ['KeyG', 'KeyT'];
            if (throwKeys.includes(e.code)) {
                this.player.throwThrowable(this.projectiles, this.vfx);
                return;
            }

            // Primary Attack
            const primaryKeys = this.customKeybinds.primary || ['KeyJ', 'KeyZ'];
            if (primaryKeys.includes(e.code)) {
                this.player.performMove(this.player.equippedMoves.primary);
                return;
            }

            // Secondary Attack
            const secKeys = this.customKeybinds.secondary || ['KeyK', 'KeyX'];
            if (secKeys.includes(e.code)) {
                this.player.performMove(this.player.equippedMoves.secondary);
                return;
            }

            // Special 1
            const spec1Keys = this.customKeybinds.special1 || ['KeyL', 'KeyE', 'KeyC'];
            if (spec1Keys.includes(e.code)) {
                if (this.player.equippedMoves.special1) {
                    this.player.performMove(this.player.equippedMoves.special1);
                }
                return;
            }

            // Special 2
            const spec2Keys = this.customKeybinds.special2 || ['KeyU', 'KeyR', 'KeyV'];
            if (spec2Keys.includes(e.code)) {
                if (this.player.equippedMoves.special2) {
                    this.player.performMove(this.player.equippedMoves.special2);
                }
                return;
            }

            // Special 3 (Hadouken)
            const spec3Keys = this.customKeybinds.special3 || ['KeyH', 'KeyY'];
            if (spec3Keys.includes(e.code)) {
                if (this.player.equippedMoves.special3) {
                    this.player.performMove(this.player.equippedMoves.special3);
                }
                return;
            }

            // Ultimate (Dragon)
            const ultKeys = this.customKeybinds.ultimate || ['KeyI', 'KeyF'];
            if (ultKeys.includes(e.code)) {
                if (this.player.equippedMoves.ultimate) {
                    this.player.performMove(this.player.equippedMoves.ultimate);
                }
                return;
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

        // Mobile Legends Virtual Touch Buttons Setup (Clean letter labels: A, B, C, X, Y, Z, Jump, Dash, Throw, Guard)
        const btnMap = {
            'btn-primary': () => this.player.equippedMoves.primary && this.player.performMove(this.player.equippedMoves.primary), // Button A (Front Snap Kick)
            'btn-secondary': () => this.player.equippedMoves.secondary && this.player.performMove(this.player.equippedMoves.secondary), // Button B (Back Heel Kick)
            'btn-special1': () => this.player.equippedMoves.special1 && this.player.performMove(this.player.equippedMoves.special1), // Button C (Special 1)
            'btn-special2': () => this.player.equippedMoves.special2 && this.player.performMove(this.player.equippedMoves.special2), // Button X (Special 2)
            'btn-hadouken': () => this.player.equippedMoves.special3 && this.player.performMove(this.player.equippedMoves.special3), // Button Y (Special 3)
            'btn-ultimate': () => this.player.equippedMoves.ultimate && this.player.performMove(this.player.equippedMoves.ultimate), // Button Z (Ultimate)
            'btn-jump': () => this.player.jump(),
            'btn-dash': () => this.player.dash(),
            'btn-throw': () => this.player.throwThrowable(this.projectiles, this.vfx),
            'btn-guard': () => (this.player.activeMovesList && this.player.activeMovesList.includes('parry_counter')) ? this.player.performMove('parry_counter') : false
        };

        for (let id in btnMap) {
            const btn = document.getElementById(id);
            if (btn) {
                const triggerAction = (e) => {
                    if (e.cancelable) e.preventDefault();
                    if (btn.disabled || btn.classList.contains('ml-btn-locked')) return;
                    if (window.soundEngine && !window.soundEngine.bgmPlaying) {
                        window.soundEngine.init();
                        window.soundEngine.startBGM();
                    }
                    btnMap[id]();
                };
                btn.addEventListener('touchstart', triggerAction, { passive: false });
                btn.addEventListener('mousedown', triggerAction);
            }
        }

        // --- 2D ANALOG JOYSTICK CONTROLLER (Mobile Legends Style) ---
        this.initJoystickController();
    }

    initJoystickController() {
        const zone = document.getElementById('joystick-zone');
        const stick = document.getElementById('joystick-stick');
        const base = document.getElementById('joystick-base');
        if (!zone || !stick || !base) return;

        let activeTouchId = null;
        let originX = 0;
        let originY = 0;
        const maxRadius = 45; // Max knob displacement radius in px

        this.input.vectorX = 0;
        this.input.vectorY = 0;

        const updateJoystick = (clientX, clientY) => {
            const dx = clientX - originX;
            const dy = clientY - originY;
            const dist = Math.hypot(dx, dy);
            const clampedDist = Math.min(dist, maxRadius);
            const angle = Math.atan2(dy, dx);

            const stickX = Math.cos(angle) * clampedDist;
            const stickY = Math.sin(angle) * clampedDist;

            stick.style.transform = `translate3d(${stickX}px, ${stickY}px, 0)`;

            // Normalized 2D vector values between -1 and 1
            const normX = clampedDist > 6 ? (dx / maxRadius) : 0;
            const normY = clampedDist > 6 ? (dy / maxRadius) : 0;

            this.input.vectorX = Math.max(-1, Math.min(1, normX));
            this.input.vectorY = Math.max(-1, Math.min(1, normY));

            // Upward swipe jump trigger if pulled sharply up
            if (this.input.vectorY < -0.85 && this.player && this.player.isGrounded) {
                this.player.jump();
            }
        };

        const resetJoystick = () => {
            activeTouchId = null;
            this.input.vectorX = 0;
            this.input.vectorY = 0;
            stick.style.transform = 'translate3d(0, 0, 0)';
            base.classList.remove('active');
            // Smoothly recenter back to default middle of joystick-zone
            base.style.left = '50%';
            base.style.top = '50%';
            base.style.transform = 'translate(-50%, -50%)';
        };

        const repositionBase = (clientX, clientY) => {
            const zoneRect = zone.getBoundingClientRect();
            // Clamp base position inside zone boundaries with margin
            const halfBase = 70;
            const clampedX = Math.max(halfBase, Math.min(zoneRect.width - halfBase, clientX - zoneRect.left));
            const clampedY = Math.max(halfBase, Math.min(zoneRect.height - halfBase, clientY - zoneRect.top));

            originX = zoneRect.left + clampedX;
            originY = zoneRect.top + clampedY;

            base.style.left = `${clampedX}px`;
            base.style.top = `${clampedY}px`;
            base.style.transform = 'translate(-50%, -50%)';
            base.classList.add('active');
        };

        zone.addEventListener('touchstart', (e) => {
            if (e.cancelable) e.preventDefault();
            if (activeTouchId !== null) return;
            const touch = e.changedTouches[0];
            activeTouchId = touch.identifier;
            repositionBase(touch.clientX, touch.clientY);
            updateJoystick(touch.clientX, touch.clientY);
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (activeTouchId === null) return;
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === activeTouchId) {
                    if (e.cancelable) e.preventDefault();
                    updateJoystick(touch.clientX, touch.clientY);
                    break;
                }
            }
        }, { passive: false });

        const onTouchEnd = (e) => {
            if (activeTouchId === null) return;
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === activeTouchId) {
                    resetJoystick();
                    break;
                }
            }
        };

        window.addEventListener('touchend', onTouchEnd);
        window.addEventListener('touchcancel', onTouchEnd);

        // Pointer/Mouse support for testing joystick
        let isMouseDown = false;
        zone.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            repositionBase(e.clientX, e.clientY);
            updateJoystick(e.clientX, e.clientY);
        });

        window.addEventListener('mousemove', (e) => {
            if (isMouseDown) {
                updateJoystick(e.clientX, e.clientY);
            }
        });

        window.addEventListener('mouseup', () => {
            if (isMouseDown) {
                isMouseDown = false;
                resetJoystick();
            }
        });
    }

    initUI() {
        // Run Difficulty Card Selectors (Supporting Click & Touch with instant selection feedback)
        window.selectDifficulty = (diff) => {
            if (!diff) return;
            this.difficulty = diff;
            const diffCards = document.querySelectorAll('.diff-card');
            diffCards.forEach(c => {
                const cDiff = c.getAttribute('data-difficulty');
                if (cDiff === diff) {
                    c.classList.add('selected');
                } else {
                    c.classList.remove('selected');
                }
            });

            // Sync with settings modal diff buttons
            const setDiffBtns = document.querySelectorAll('.settings-diff-btn');
            setDiffBtns.forEach(btn => {
                if (btn.getAttribute('data-diff') === diff) {
                    btn.classList.add('selected');
                } else {
                    btn.classList.remove('selected');
                }
            });

            this.updateDifficultyHUD();
            if (window.soundEngine && window.soundEngine.playWhoosh) {
                window.soundEngine.playWhoosh(1.4, 0.4);
            }
        };
        window.setRunDifficulty = window.selectDifficulty;

        // Skin Unlock Progression Tracking & Verification System
        this.skinRequirements = {
            classic_white: { name: 'Pure White Dobok', req: 'Default Unlocked', check: () => true },
            shadow_black: { 
                name: 'Shadow Shinobi', 
                req: 'Reach Green Belt or 2,500 High Score', 
                check: () => {
                    const highScore = parseInt(localStorage.getItem('tkd_high_score') || '0', 10);
                    const highestBelt = localStorage.getItem('tkd_highest_belt') || 'WHITE';
                    const beltIdx = window.BELT_ORDER ? window.BELT_ORDER.indexOf(highestBelt) : 0;
                    return highScore >= 2500 || beltIdx >= 2 || localStorage.getItem('tkd_skin_unlocked_shadow_black') === 'true';
                }
            },
            olympic_korea: { 
                name: 'National Champion', 
                req: 'Reach Black Belt or 5,000 High Score', 
                check: () => {
                    const highScore = parseInt(localStorage.getItem('tkd_high_score') || '0', 10);
                    const highestBelt = localStorage.getItem('tkd_highest_belt') || 'WHITE';
                    const beltIdx = window.BELT_ORDER ? window.BELT_ORDER.indexOf(highestBelt) : 0;
                    return highScore >= 5000 || beltIdx >= 5 || localStorage.getItem('tkd_skin_unlocked_olympic_korea') === 'true';
                }
            },
            golden_tiger: { 
                name: 'Golden Tiger', 
                req: 'Reach Floor 9 or 7,500 High Score', 
                check: () => {
                    const highScore = parseInt(localStorage.getItem('tkd_high_score') || '0', 10);
                    const maxFloor = parseInt(localStorage.getItem('tkd_max_floor') || '1', 10);
                    return highScore >= 7500 || maxFloor >= 9 || localStorage.getItem('tkd_skin_unlocked_golden_tiger') === 'true';
                }
            },
            cyber_neon: { 
                name: 'Cyber Striker', 
                req: 'Clear Focus Mode or Complete Game on Focus', 
                check: () => {
                    return localStorage.getItem('tkd_focus_completed') === 'true' || localStorage.getItem('tkd_skin_unlocked_cyber_neon') === 'true';
                }
            },
            flaming_shin: { 
                name: 'Flaming Shin', 
                req: 'Defeat Head Shin & Complete Game (Floor 10 Victory)', 
                check: () => {
                    return localStorage.getItem('tkd_game_completed') === 'true' || localStorage.getItem('tkd_skin_unlocked_flaming_shin') === 'true';
                }
            }
        };

        window.isSkinUnlocked = (skinId) => {
            if (!this.skinRequirements[skinId]) return true;
            return this.skinRequirements[skinId].check();
        };

        this.updateSkinCardsUnlockVisuals = () => {
            document.querySelectorAll('.skin-card').forEach(card => {
                const skin = card.getAttribute('data-skin');
                const isUnlocked = window.isSkinUnlocked(skin);
                const badgeEl = card.querySelector('.skin-status-badge');
                if (isUnlocked) {
                    card.classList.remove('locked');
                    if (badgeEl) {
                        badgeEl.className = 'skin-status-badge unlocked';
                        badgeEl.innerText = '✅ UNLOCKED';
                    }
                } else {
                    card.classList.add('locked');
                    if (badgeEl && this.skinRequirements[skin]) {
                        badgeEl.className = 'skin-status-badge locked';
                        badgeEl.innerText = `🔒 ${this.skinRequirements[skin].req}`;
                    }
                }
            });

            // Update settings modal options
            const skinSelect = document.getElementById('setting-athlete-skin');
            if (skinSelect) {
                Array.from(skinSelect.options).forEach(opt => {
                    const skin = opt.value;
                    const isUnlocked = window.isSkinUnlocked(skin);
                    if (!isUnlocked) {
                        opt.text = `🔒 ${opt.text.replace('🔒 ', '')} (Locked)`;
                        opt.disabled = true;
                    } else {
                        opt.text = opt.text.replace('🔒 ', '').replace(' (Locked)', '');
                        opt.disabled = false;
                    }
                });
            }
        };

        // Taekwondo Athlete Skin Selection Handlers
        window.selectAthleteSkin = (skin) => {
            if (!skin) return;
            const isUnlocked = window.isSkinUnlocked(skin);
            if (!isUnlocked) {
                const req = this.skinRequirements[skin] ? this.skinRequirements[skin].req : 'Achievement Required';
                this.showWaveBanner(`🔒 SKIN TERKUNCI: ${req}`);
                if (window.soundEngine && window.soundEngine.playWhoosh) {
                    window.soundEngine.playWhoosh(0.8, 0.2);
                }
                return;
            }

            this.athleteSkin = skin;
            if (this.player) this.player.skin = skin;
            document.querySelectorAll('.skin-card').forEach(c => {
                if (c.getAttribute('data-skin') === skin) {
                    c.classList.add('selected');
                } else {
                    c.classList.remove('selected');
                }
            });
            const skinSelect = document.getElementById('setting-athlete-skin');
            if (skinSelect) skinSelect.value = skin;
            this.savePreferences();
            if (window.soundEngine && window.soundEngine.playWhoosh) {
                window.soundEngine.playWhoosh(1.6, 0.3);
            }
        };

        this.updateSkinCardsUnlockVisuals();

        const skinCards = document.querySelectorAll('.skin-card');
        skinCards.forEach(card => {
            const handleSkinSelect = (e) => {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                const skin = card.getAttribute('data-skin');
                window.selectAthleteSkin(skin);
            };
            card.onclick = handleSkinSelect;
            card.ontouchstart = handleSkinSelect;
            card.onpointerdown = handleSkinSelect;
        });

        // Initialize default selected skin visual (fallback to classic_white if saved skin is locked)
        const initialSkin = window.isSkinUnlocked(this.athleteSkin) ? this.athleteSkin : 'classic_white';
        window.selectAthleteSkin(initialSkin);

        const diffCards = document.querySelectorAll('.diff-card');
        diffCards.forEach(card => {
            const handleSelect = (e) => {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                const diff = card.getAttribute('data-difficulty');
                window.selectDifficulty(diff);
            };
            card.onclick = handleSelect;
            card.ontouchstart = handleSelect;
            card.onpointerdown = handleSelect;
        });

        // Settings Modal Difficulty Buttons
        const setDiffBtns = document.querySelectorAll('.settings-diff-btn');
        setDiffBtns.forEach(btn => {
            btn.onclick = () => {
                const diff = btn.getAttribute('data-diff');
                window.selectDifficulty(diff);
            };
        });

        // Initialize default selected card visual
        window.selectDifficulty(this.difficulty || 'beginner');

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

        // --- MENU / SETTINGS MODAL TRIGGERS ---
        const openSettings = () => {
            this.state = 'paused';
            document.getElementById('pause-modal')?.classList.add('hidden');
            const settingsModal = document.getElementById('settings-modal');
            if (settingsModal) {
                settingsModal.classList.remove('hidden');
                settingsModal.style.display = 'flex';
                // Highlight currently active difficulty
                setDiffBtns.forEach(btn => {
                    if (btn.getAttribute('data-diff') === this.difficulty) {
                        btn.classList.add('selected');
                    } else {
                        btn.classList.remove('selected');
                    }
                });
                // Sync graphics & visual controls state
                const skinSelect = document.getElementById('setting-athlete-skin');
                if (skinSelect) skinSelect.value = this.athleteSkin;
                const gfxSelect = document.getElementById('setting-graphics-quality');
                if (gfxSelect) gfxSelect.value = this.graphicsQuality;
                const satSelect = document.getElementById('setting-color-saturation');
                if (satSelect) satSelect.value = this.colorSaturation;
                const shakeSelect = document.getElementById('setting-screen-shake');
                if (shakeSelect) shakeSelect.value = this.screenShakeMultiplier.toString();
                const bloomSelect = document.getElementById('setting-bloom-glow');
                if (bloomSelect) bloomSelect.value = this.bloomGlow ? 'on' : 'off';
                const dmgSelect = document.getElementById('setting-dmg-numbers');
                if (dmgSelect) dmgSelect.value = this.showDamageNumbers ? 'on' : 'off';
                this.updateActionSlotKeyLabels();
            }
        };
        window.openGameSettings = openSettings;

        const settingsToggleBtn = document.getElementById('btn-settings-toggle');
        if (settingsToggleBtn) {
            settingsToggleBtn.addEventListener('click', openSettings);
        }

        const startScreenSettingsBtn = document.getElementById('btn-start-screen-settings');
        if (startScreenSettingsBtn) {
            startScreenSettingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openSettings();
            });
        }

        const pauseSettingsBtn = document.getElementById('btn-pause-settings');
        if (pauseSettingsBtn) {
            pauseSettingsBtn.addEventListener('click', openSettings);
        }

        const pauseDiffBtn = document.getElementById('btn-pause-difficulty');
        if (pauseDiffBtn) {
            pauseDiffBtn.addEventListener('click', () => {
                openSettings();
            });
        }

        const returnToTitle = () => {
            document.getElementById('pause-modal')?.classList.add('hidden');
            document.getElementById('settings-modal')?.classList.add('hidden');
            document.getElementById('hud-overlay')?.classList.add('hidden');
            const startScreen = document.getElementById('start-screen');
            if (startScreen) {
                startScreen.classList.remove('hidden');
            }
            this.state = 'start';
            if (window.soundEngine) window.soundEngine.stopBGM();
        };

        const pauseTitleBtn = document.getElementById('btn-pause-title');
        if (pauseTitleBtn) {
            pauseTitleBtn.addEventListener('click', returnToTitle);
        }

        const settingsTitleBtn = document.getElementById('btn-settings-back-title');
        if (settingsTitleBtn) {
            settingsTitleBtn.addEventListener('click', returnToTitle);
        }

        const settingsSaveBtn = document.getElementById('btn-settings-save');
        if (settingsSaveBtn) {
            settingsSaveBtn.addEventListener('click', () => {
                document.getElementById('settings-modal')?.classList.add('hidden');
                this.applyGraphicsSettings();
                this.savePreferences();
                if (this.state === 'start') {
                    const startScreen = document.getElementById('start-screen');
                    if (startScreen) {
                        startScreen.classList.remove('hidden');
                    }
                } else {
                    this.state = 'playing';
                }
            });
        }

        // --- GRAPHICS & VISUAL CONTROLS LISTENERS ---
        const skinSelect = document.getElementById('setting-athlete-skin');
        if (skinSelect) {
            skinSelect.addEventListener('change', (e) => {
                window.selectAthleteSkin(e.target.value);
            });
        }

        const gfxSelect = document.getElementById('setting-graphics-quality');
        if (gfxSelect) {
            gfxSelect.addEventListener('change', (e) => {
                this.graphicsQuality = e.target.value;
                this.applyGraphicsSettings();
                this.savePreferences();
            });
        }

        const satSelect = document.getElementById('setting-color-saturation');
        if (satSelect) {
            satSelect.addEventListener('change', (e) => {
                this.colorSaturation = e.target.value;
                this.applyGraphicsSettings();
                this.savePreferences();
            });
        }

        const shakeSelect = document.getElementById('setting-screen-shake');
        if (shakeSelect) {
            shakeSelect.addEventListener('change', (e) => {
                this.screenShakeMultiplier = parseFloat(e.target.value);
                this.savePreferences();
            });
        }

        const bloomSelect = document.getElementById('setting-bloom-glow');
        if (bloomSelect) {
            bloomSelect.addEventListener('change', (e) => {
                this.bloomGlow = e.target.value === 'on';
                this.savePreferences();
            });
        }

        const dmgSelect = document.getElementById('setting-dmg-numbers');
        if (dmgSelect) {
            dmgSelect.addEventListener('change', (e) => {
                this.showDamageNumbers = e.target.value === 'on';
                this.savePreferences();
            });
        }

        // --- KEYBINDING REBINDING LISTENERS ---
        document.querySelectorAll('.keybind-btn').forEach(btn => {
            const handleRebindStart = (e) => {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                const action = btn.getAttribute('data-action');
                if (!action) return;
                // Cancel any previous rebinding
                document.querySelectorAll('.keybind-btn').forEach(b => b.classList.remove('rebinding'));
                btn.classList.add('rebinding');
                this.rebindingAction = action;
                const hint = document.getElementById('keybind-listening-hint');
                if (hint) hint.innerText = `👉 Press ANY keyboard key now to bind to ${action.toUpperCase()}...`;
            };
            btn.onclick = handleRebindStart;
            btn.ontouchstart = handleRebindStart;
        });

        const resetKeybindsBtn = document.getElementById('btn-reset-keybinds');
        if (resetKeybindsBtn) {
            resetKeybindsBtn.addEventListener('click', () => {
                this.customKeybinds = {
                    primary: ['KeyJ', 'KeyZ'],
                    secondary: ['KeyK', 'KeyX'],
                    special1: ['KeyL', 'KeyE', 'KeyC'],
                    special2: ['KeyU', 'KeyR', 'KeyV'],
                    special3: ['KeyH', 'KeyY'],
                    ultimate: ['KeyI', 'KeyF'],
                    throw: ['KeyG', 'KeyT'],
                    jump: ['Space', 'Tab'],
                    dash: ['ShiftLeft', 'ShiftRight'],
                    parry: ['KeyQ']
                };
                this.savePreferences();
                this.updateActionSlotKeyLabels();
                const hint = document.getElementById('keybind-listening-hint');
                if (hint) hint.innerText = '✅ Keybindings restored to defaults!';
            });
        }

        // --- FULLSCREEN API CONTROLLER ---
        const toggleFullscreen = () => {
            if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                const elem = document.documentElement;
                if (elem.requestFullscreen) {
                    elem.requestFullscreen().catch(err => console.warn('Fullscreen request rejected:', err));
                } else if (elem.webkitRequestFullscreen) {
                    elem.webkitRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen().catch(err => console.warn('Exit fullscreen rejected:', err));
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            }
        };

        const toggleFsBtn = document.getElementById('btn-toggle-fullscreen');
        if (toggleFsBtn) {
            toggleFsBtn.addEventListener('click', () => {
                toggleFullscreen();
                setTimeout(() => {
                    const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
                    toggleFsBtn.innerText = isFs ? '⛶ Exit Fullscreen' : '⛶ Enter Fullscreen';
                }, 150);
            });
        }

        // Fullscreen Permission Prompt Modal Handlers
        const allowFsBtn = document.getElementById('btn-allow-fullscreen');
        if (allowFsBtn) {
            allowFsBtn.addEventListener('click', () => {
                document.getElementById('fullscreen-prompt-modal')?.classList.add('hidden');
                toggleFullscreen();
                this.startGame();
            });
        }

        const skipFsBtn = document.getElementById('btn-skip-fullscreen');
        if (skipFsBtn) {
            skipFsBtn.addEventListener('click', () => {
                document.getElementById('fullscreen-prompt-modal')?.classList.add('hidden');
                this.startGame();
            });
        }

        // --- BUTTON UI & PREFERENCES CUSTOMIZER CONTROLS ---
        const touchVisSelect = document.getElementById('setting-touch-visibility');
        const touchControlsEl = document.getElementById('mobile-touch-controls');
        if (touchVisSelect && touchControlsEl) {
            touchVisSelect.addEventListener('change', (e) => {
                const val = e.target.value;
                if (val === 'always') {
                    touchControlsEl.style.display = 'flex';
                } else if (val === 'hidden') {
                    touchControlsEl.style.display = 'none';
                } else {
                    touchControlsEl.style.display = '';
                }
            });
        }

        const touchScaleSlider = document.getElementById('setting-touch-scale');
        const touchScaleVal = document.getElementById('touch-scale-val');
        if (touchScaleSlider && touchScaleVal) {
            touchScaleSlider.addEventListener('input', (e) => {
                const val = e.target.value;
                touchScaleVal.innerText = `${val}%`;
                const scale = val / 100;
                const joyZone = document.getElementById('joystick-zone');
                if (joyZone) joyZone.style.transform = `scale(${scale})`;
                const skillCluster = document.getElementById('skill-action-cluster');
                if (skillCluster) skillCluster.style.transform = `scale(${scale})`;
            });
        }

        const touchOpacitySlider = document.getElementById('setting-touch-opacity');
        const touchOpacityVal = document.getElementById('touch-opacity-val');
        if (touchOpacitySlider && touchOpacityVal) {
            touchOpacitySlider.addEventListener('input', (e) => {
                const val = e.target.value;
                touchOpacityVal.innerText = `${val}%`;
                const alpha = val / 100;
                if (touchControlsEl) touchControlsEl.style.opacity = alpha;
                const hudOverlay = document.getElementById('hud-overlay');
                if (hudOverlay) hudOverlay.style.opacity = alpha;
            });
        }

        const slotSizeSelect = document.getElementById('setting-slot-size');
        const hudBottom = document.querySelector('.hud-bottom');
        if (slotSizeSelect && hudBottom) {
            slotSizeSelect.addEventListener('change', (e) => {
                const val = e.target.value;
                hudBottom.classList.remove('slots-compact', 'slots-large');
                if (val === 'compact') hudBottom.classList.add('slots-compact');
                else if (val === 'large') hudBottom.classList.add('slots-large');
            });
        }

        const startBtn = document.getElementById('btn-start-game');
        if (startBtn) {
            const handleStart = (e) => {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                // If on mobile/touch device and not yet in fullscreen, ask permission modal first
                const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth <= 960;
                const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
                
                if (isTouchDevice && !isFullscreen) {
                    document.getElementById('start-screen')?.classList.add('hidden');
                    document.getElementById('fullscreen-prompt-modal')?.classList.remove('hidden');
                } else {
                    this.startGame();
                }
            };
            startBtn.onclick = handleStart;
            startBtn.ontouchstart = handleStart;
        }

        const retryBtn = document.getElementById('btn-retry');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.resetGame();
            });
        }
    }

    updateDifficultyHUD() {
        const diffBadge = document.getElementById('hud-difficulty-badge');
        if (!diffBadge) return;

        diffBadge.classList.remove('diff-badge-musclehead', 'diff-badge-beginner', 'diff-badge-focus', 'diff-badge-intermediate', 'diff-badge-expert');
        if (this.difficulty === 'musclehead') {
            diffBadge.innerText = '💪 MUSCLEHEAD';
            diffBadge.classList.add('diff-badge-musclehead');
        } else if (this.difficulty === 'beginner') {
            diffBadge.innerText = '🌱 BEGINNER';
            diffBadge.classList.add('diff-badge-beginner');
        } else if (this.difficulty === 'focus') {
            diffBadge.innerText = '🧠 FOCUS MODE (UTBK 2026)';
            diffBadge.classList.add('diff-badge-focus');
        } else if (this.difficulty === 'intermediate') {
            diffBadge.innerText = '🥋 INTERMEDIATE';
            diffBadge.classList.add('diff-badge-intermediate');
        } else if (this.difficulty === 'expert') {
            diffBadge.innerText = '🔥 EXPERT';
            diffBadge.classList.add('diff-badge-expert');
        }
    }

    startGame() {
        try {
            if (window.soundEngine) {
                window.soundEngine.init();
                window.soundEngine.startBGM(1, false);
            }
        } catch (err) {
            console.warn('Audio initialization deferred:', err);
        }
        this.updateDifficultyHUD();
        this.applyGraphicsSettings();

        // Dismiss all possible modal backdrops cleanly
        const modalIds = [
            'start-screen', 
            'fullscreen-prompt-modal', 
            'game-over-modal', 
            'victory-modal', 
            'pause-modal', 
            'settings-modal', 
            'math-exam-modal', 
            'perk-draft-modal', 
            'rankup-modal'
        ];
        modalIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.add('hidden');
                el.style.display = '';
            }
        });

        const hudOverlay = document.getElementById('hud-overlay');
        if (hudOverlay) {
            hudOverlay.classList.remove('hidden');
            hudOverlay.style.display = 'flex';
        }

        if (this.canvas) {
            this.canvas.style.display = 'block';
            if (this.canvas.width !== 1280 || this.canvas.height !== 720) {
                this.canvas.width = 1280;
                this.canvas.height = 720;
            }
        }

        this.state = 'playing';
        if (this.player) {
            if (this.athleteSkin) this.player.skin = this.athleteSkin;
            this.player.x = 400;
            this.player.y = this.arena ? (this.arena.groundY - this.player.height) : 480;
            this.player.hp = this.player.maxHp;
            this.player.ki = this.player.maxKi;
            this.player.state = 'idle';
        }
        if (this.camera) {
            this.camera.x = 0;
            this.camera.y = 0;
            this.camera.targetX = 0;
            this.camera.shakeTime = 0;
            this.camera.shakeMag = 0;
        }

        this.startWave(1);
    }

    resetGame() {
        this.player = new window.Player(400, 480);
        if (this.athleteSkin) this.player.skin = this.athleteSkin;
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
            this.showWaveBanner(`➕ ${floorCfg.name.toUpperCase()} ➕`);
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
                let critMult = 2.2;
                if (this.player.perks && this.player.perks.brawlerFury) critMult += 0.40;

                let finalDmg = Math.round(m.damage * beltMultiplier * (isCrit ? critMult : 1.0));

                // 1. Bone-Cracking Shattering Impact
                if (this.player.perks && this.player.perks.shatteringImpact && (m.id === 'ap_chagi' || m.id === 'back_heel_kick' || m.id === 'parry_strike')) {
                    finalDmg = Math.round(finalDmg * 1.25);
                }

                // 2. Cloud Stride aerial damage boost
                if (this.player.perks && this.player.perks.cloudStride && !this.player.isGrounded) {
                    finalDmg = Math.round(finalDmg * 1.30);
                }

                // 3. Executioner Precision (Target below 50% HP)
                if (this.player.perks && this.player.perks.executioner && enemy.hp < enemy.maxHp * 0.50) {
                    finalDmg = Math.round(finalDmg * 1.50);
                }

                // 4. Infinite Combo Flow
                if (this.player.perks && this.player.perks.flowState && this.player.comboCount > 0) {
                    finalDmg = Math.round(finalDmg * (1 + Math.floor(this.player.comboCount / 10) * 0.12));
                }

                // Apply damage
                let knockbackDist = m.knockback;
                if (this.player.perks && this.player.perks.shatteringImpact) knockbackDist *= 1.4;
                enemy.takeDamage(finalDmg, pX, knockbackDist, m.stunTime, this.vfx, m.id);
                this.player.registerHit();

                // Spark and impact visuals
                this.vfx.addSpark(enemy.x, enemy.y + 30, m.vfx?.sparkColor || '#facc15', isCrit ? 16 : 8, 300);
                this.vfx.addDamageText(enemy.x, enemy.y, `${finalDmg}${isCrit ? ' 💥 CRIT!' : ''}`, isCrit);

                if (window.soundEngine) {
                    window.soundEngine.playHit(m.damage > 60 ? 'heavy' : 'normal', isCrit);
                }

                if (this.player.perks && this.player.perks.flameKicks) {
                    enemy.applyBurn(3.5);
                }

                if (this.player.perks && this.player.perks.dragon_flame && (m.id === 'dragon_finisher' || m.motionType === 'dragon_rush')) {
                    this.vfx.addSpark(enemy.x, enemy.y + 20, '#f97316', 18, 320);
                    this.enemies.forEach(other => {
                        if (other !== enemy && other.state !== 'ko' && Math.abs(other.x - enemy.x) < 140) {
                            other.takeDamage(80, enemy.x, 300, 0.4, this.vfx, 'dragon_finisher');
                        }
                    });
                }

                if (this.player.perks && this.player.perks.shockwave) {
                    this.vfx.addSpark(enemy.x, enemy.y + 40, '#38bdf8', 10, 200);
                    this.enemies.forEach(other => {
                        if (other !== enemy && other.state !== 'ko' && Math.abs(other.x - enemy.x) < 100) {
                            other.takeDamage(Math.round(finalDmg * 0.45), enemy.x, 220, 0.3, this.vfx, m.id);
                        }
                    });
                }

                this.triggerScreenShake(isCrit ? 12 : 6, isCrit ? 0.25 : 0.12);
                if (isCrit) this.triggerSlowMo(0.12);

                if (enemy.hp <= 0) {
                    const promoTarget = this.player.gainXp(enemy.xpValue);
                    if (promoTarget) {
                        if (this.difficulty === 'musclehead') {
                            this.completePromotion(promoTarget);
                        } else {
                            this.startMathExam(promoTarget, 'promotion');
                        }
                    }
                    if (this.player.perks && this.player.perks.vampirism) {
                        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 18);
                        this.player.ki = Math.min(this.player.maxKi, this.player.ki + 30);
                        this.vfx.addDamageText(this.player.x, this.player.y, '+18 HP', false, false, true);
                    }
                }
            }
        });
    }

    // --- UTBK PENGETAHUAN KUANTITATIF (PK) EXAMINATION SUITE ---
    startMathExam(contextId = 'YELLOW', triggerType = 'promotion', onCompleteCallback = null) {
        if (this.difficulty === 'musclehead') {
            // Pure brawler musclehead mode: immediately pass without any test
            if (onCompleteCallback) onCompleteCallback(true);
            else if (triggerType === 'promotion') this.completePromotion(contextId);
            return;
        }

        this.state = 'math_exam';
        this.mathExamTargetBelt = (triggerType === 'promotion') ? contextId : null;
        this.mathExamTriggerType = triggerType; // 'promotion', 'skill_selection', 'floor_advance'
        this.mathExamOnComplete = onCompleteCallback;
        this.currentUtbkQuestion = this.generateUtbkPkQuestion(contextId);

        this.camera.shakeTime = 0;
        this.camera.shakeMag = 0;
        this.slowMoTimer = 0;

        const modal = document.getElementById('math-exam-modal');
        if (!modal) {
            if (onCompleteCallback) onCompleteCallback(true);
            else if (triggerType === 'promotion') this.completePromotion(contextId);
            return;
        }

        const badgeEl = document.getElementById('math-exam-badge');
        const titleEl = document.getElementById('math-exam-belt-title');
        const subEl = document.getElementById('math-exam-belt-sub');

        if (triggerType === 'promotion') {
            const info = window.BELT_RANKS[contextId] || window.BELT_RANKS['YELLOW'];
            badgeEl.innerText = info.badgeIcon;
            titleEl.innerText = `UJIAN ${info.name.toUpperCase()} (UTBK PK 2026)`;
            titleEl.style.color = info.accentColor || info.color;
            if (subEl) subEl.innerText = `Selesaikan 1 soal Pengetahuan Kuantitatif UTBK 2026 untuk membuktikan kelayakan promosi sabuk ${info.name}!`;
        } else if (triggerType === 'skill_selection') {
            badgeEl.innerText = '📜';
            titleEl.innerText = 'TRIAL • SKILL SCROLL UTBK PK';
            titleEl.style.color = '#facc15';
            if (subEl) subEl.innerText = 'Jawab dengan benar untuk membuka gulungan teknik perk martial arts baru!';
        } else if (triggerType === 'floor_advance') {
            badgeEl.innerText = '🏫';
            titleEl.innerText = `TRIAL • FLOOR ${this.wave} ADVANCEMENT`;
            titleEl.style.color = '#38bdf8';
            if (subEl) subEl.innerText = `Selesaikan soal Pengetahuan Kuantitatif UTBK 2026 untuk membuka pintu akses menuju lantai berikutnya!`;
        }

        modal.classList.remove('hidden');
        this.renderMathQuestion();
    }

    generateUtbkPkQuestion(contextId = 'YELLOW') {
        const fullDb = (window.UTBK_2026_PK_DATABASE && window.UTBK_2026_PK_DATABASE.length > 0)
            ? window.UTBK_2026_PK_DATABASE
            : null;

        if (fullDb) {
            // Select questions spanning the 200 question bank
            // Track used questions so player experiences diverse topics
            if (!this.usedQuestionIds) this.usedQuestionIds = new Set();
            if (this.usedQuestionIds.size >= fullDb.length) this.usedQuestionIds.clear();

            const available = fullDb.filter(q => !this.usedQuestionIds.has(q.id));
            const pool = available.length > 0 ? available : fullDb;
            const chosen = pool[Math.floor(Math.random() * pool.length)];
            this.usedQuestionIds.add(chosen.id);
            return chosen;
        }

        // Fallback question
        return {
            id: 1,
            topic: 'Pola Barisan Bilangan',
            level: 'Tingkat Mudah • UTBK 2026',
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
        };
    }

    renderMathQuestion() {
        const q = this.currentUtbkQuestion;
        if (!q) return;

        const promptEl = document.getElementById('math-question-prompt');
        if (promptEl) promptEl.innerText = q.level || 'SOAL UTBK PENGETAHUAN KUANTITATIF 2026';

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
        const isBeginner = (this.difficulty === 'beginner');
        // If beginner mode, treat result as passing regardless of correctness (lenient)
        const isPassed = isCorrect || isBeginner;

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
                if (isBeginner) {
                    statusEl.innerText = `✗ JAWABAN BELUM TEPAT (KUNCI: ${correctKey}) • MODE BEGINNER (DIIZINKAN LANJUT)`;
                    statusEl.className = 'math-solution-status error';
                } else {
                    statusEl.innerText = `✗ JAWABAN SALAH (KUNCI: ${correctKey}) • GAGAL MEMENUHI SYARAT`;
                    statusEl.className = 'math-solution-status error';
                }
            }
            if (window.soundEngine) window.soundEngine.playMathWrong();
        }

        // Render rich, detailed solution steps without any time limit
        if (bodyEl) {
            const correctOpt = questionObj.options.find(o => o.key === correctKey);
            const optText = correctOpt ? correctOpt.text : '';

            let penaltyNotice = '';
            if (!isCorrect && !isBeginner) {
                if (this.mathExamTriggerType === 'promotion') {
                    penaltyNotice = `
                        <div style="margin-top:10px; padding:8px 12px; background:rgba(239, 68, 68, 0.2); border:1px solid #ef4444; border-radius:8px; color:#fca5a5; font-size:0.85rem;">
                            ⚠️ <b>Ujian Promosi Sabuk Gagal:</b> Anda belum dapat naik tingkat sabuk dan tidak mendapatkan bonus stat sabuk baru. Kumpulkan XP kembali di dojo!
                        </div>
                    `;
                } else if (this.mathExamTriggerType === 'skill_selection') {
                    penaltyNotice = `
                        <div style="margin-top:10px; padding:8px 12px; background:rgba(239, 68, 68, 0.2); border:1px solid #ef4444; border-radius:8px; color:#fca5a5; font-size:0.85rem;">
                            ⚠️ <b>Scroll Teknik Ditolak:</b> Anda tidak mendapatkan penambahan skill/perk baru pada giliran ini.
                        </div>
                    `;
                } else if (this.mathExamTriggerType === 'floor_advance') {
                    penaltyNotice = `
                        <div style="margin-top:10px; padding:8px 12px; background:rgba(239, 68, 68, 0.2); border:1px solid #ef4444; border-radius:8px; color:#fca5a5; font-size:0.85rem;">
                            ⚠️ <b>Akses Lantai Berikutnya Terkunci:</b> Anda harus mengulang dan bertarung kembali di Lantai ${this.wave} sampai berhasil menyelesaikan soal!
                        </div>
                    `;
                }
            }

            bodyEl.innerHTML = `
                <div style="margin-bottom:8px; font-weight:800; color:#facc15;">
                    📌 Kunci Jawaban: (${correctKey}) — ${optText}
                </div>
                <div style="color:#cbd5e1; line-height:1.6;">
                    <strong>💡 Langkah Pembahasan:</strong><br>
                    ${explanation || 'Tidak ada langkah tambahan.'}
                </div>
                ${penaltyNotice}
                <div style="margin-top:10px; font-size:0.82rem; color:#94a3b8; font-style:italic;">
                    Silakan baca dan telaah solusi di atas secara teliti untuk evaluasi diri. Klik tombol di bawah jika Anda sudah siap melanjutkan!
                </div>
            `;
        }

        // Configure button label based on outcome
        if (continueBtn) {
            if (isPassed) {
                continueBtn.innerHTML = `LANJUTKAN <span class="cta-arrow">➔</span>`;
            } else {
                if (this.mathExamTriggerType === 'floor_advance') {
                    continueBtn.innerHTML = `ULANGI LANTAI INI (${this.wave}) <span class="cta-arrow">➔</span>`;
                } else {
                    continueBtn.innerHTML = `KEMBALI BERTARUNG (TANPA BONUS) <span class="cta-arrow">➔</span>`;
                }
            }
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
                
                if (this.mathExamOnComplete) {
                    const cb = this.mathExamOnComplete;
                    this.mathExamOnComplete = null;
                    cb(isPassed);
                } else if (this.mathExamTriggerType === 'promotion' && this.mathExamTargetBelt) {
                    if (isPassed) {
                        this.completePromotion(this.mathExamTargetBelt);
                    } else {
                        // Failed promotion in non-beginner mode: Reset XP to 75% so player has to earn threshold again
                        const prevRankIdx = window.BELT_ORDER.indexOf(this.player.belt);
                        const curBeltData = window.BELT_RANKS[this.player.belt];
                        const targetBeltData = window.BELT_RANKS[this.mathExamTargetBelt];
                        if (targetBeltData) {
                            this.player.xp = Math.floor(targetBeltData.xpRequired * 0.75);
                        }
                        this.vfx.addDamageText(this.player.x, this.player.y, '❌ PROMOTI DITOLAK', true);
                        this.state = 'playing';
                    }
                } else {
                    this.state = 'playing';
                }
            };
        }
    }

    completePromotion(beltId) {
        this.player.applyBeltStats(beltId);
        try {
            const currentHighest = localStorage.getItem('tkd_highest_belt') || 'WHITE';
            const curIdx = window.BELT_ORDER ? window.BELT_ORDER.indexOf(currentHighest) : 0;
            const newIdx = window.BELT_ORDER ? window.BELT_ORDER.indexOf(beltId) : 0;
            if (newIdx > curIdx) {
                localStorage.setItem('tkd_highest_belt', beltId);
            }
            if (beltId === 'GREEN' || beltId === 'BLUE' || beltId === 'RED' || beltId === 'BLACK') {
                localStorage.setItem('tkd_skin_unlocked_shadow_black', 'true');
            }
            if (beltId === 'BLACK') {
                localStorage.setItem('tkd_skin_unlocked_olympic_korea', 'true');
            }
            if (this.updateSkinCardsUnlockVisuals) this.updateSkinCardsUnlockVisuals();
        } catch (e) {}
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
        const checkFloorAdvancement = () => {
            const advanceToNextFloor = () => {
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
            };

            // In Focus, Intermediate, and Expert modes: floor advance requires passing the UTBK PK question
            if (this.difficulty !== 'beginner' && this.difficulty !== 'musclehead') {
                this.startMathExam(`FLOOR_${this.wave}`, 'floor_advance', (passed) => {
                    if (passed) {
                        advanceToNextFloor();
                    } else {
                        // Failed: Replay the current floor!
                        this.state = 'playing';
                        this.showWaveBanner(`❌ SOAL SALAH • MENGULANG FLOOR ${this.wave}/10`);
                        this.startWave(this.wave);
                    }
                });
            } else {
                advanceToNextFloor();
            }
        };

        const showDraftModal = () => {
            this.state = 'perk_select';
            const modal = document.getElementById('perk-draft-modal');
            if (!modal) return;

            // Filter out perks already acquired by the player
            const learnedIds = this.player.learnedPerks || [];
            const availablePerks = window.ROGUELIKE_PERKS.filter(p => !learnedIds.includes(p.id));

            // If player somehow acquired all scrolls, fallback to all scrolls
            const pool = availablePerks.length >= 3 ? availablePerks : window.ROGUELIKE_PERKS;
            const shuffled = [...pool].sort(() => 0.5 - Math.random());
            const choices = shuffled.slice(0, 3);

            const container = document.getElementById('perk-cards-container');
            container.innerHTML = choices.map(p => `
                <div class="perk-card rarity-${p.rarity}" data-id="${p.id}">
                    <div class="perk-card-icon">${p.icon}</div>
                    <div class="perk-card-title">${p.name}</div>
                    <div class="perk-card-rarity">${p.category ? p.category.toUpperCase() + ' • ' : ''}${p.rarity.toUpperCase()} TECHNIQUE</div>
                    <div class="perk-card-desc">${p.description}</div>
                    <button class="perk-choose-btn">LEARN SCROLL</button>
                </div>
            `).join('');

            container.querySelectorAll('.perk-card').forEach(card => {
                card.addEventListener('click', () => {
                    const perkId = card.getAttribute('data-id');
                    const perk = window.ROGUELIKE_PERKS.find(p => p.id === perkId);
                    if (perk) {
                        if (!this.player.learnedPerks) this.player.learnedPerks = [];
                        this.player.learnedPerks.push(perk.id);
                        perk.apply(this.player);
                        if (window.soundEngine) window.soundEngine.playPerkSelect();
                    }
                    modal.classList.add('hidden');
                    checkFloorAdvancement();
                });
            });

            modal.classList.remove('hidden');
        };

        // In Focus, Intermediate, and Expert mode: Skill scroll technique draft is gated behind a question
        if (this.difficulty !== 'beginner' && this.difficulty !== 'musclehead') {
            this.startMathExam('SKILL_SELECT', 'skill_selection', (passed) => {
                if (passed) {
                    showDraftModal();
                } else {
                    // Failed: Skip skill addition completely and move straight to floor advancement evaluation
                    this.showWaveBanner(`❌ SKILL SCROLL DITOLAK (SOAL SALAH)`);
                    checkFloorAdvancement();
                }
            });
        } else {
            // Musclehead & Beginner mode: direct, seamless skill scroll access with zero math tests
            showDraftModal();
        }
    }

    triggerSunriseVictory() {
        this.state = 'victory';
        this.victorySunriseTimer = 0;
        
        // Save commendable points: Game completed & floor 10 cleared
        try {
            localStorage.setItem('tkd_game_completed', 'true');
            localStorage.setItem('tkd_skin_unlocked_flaming_shin', 'true');
            if (this.difficulty === 'focus') {
                localStorage.setItem('tkd_focus_completed', 'true');
                localStorage.setItem('tkd_skin_unlocked_cyber_neon', 'true');
            }
            if (this.player && this.player.totalScore) {
                const prevHigh = parseInt(localStorage.getItem('tkd_high_score') || '0', 10);
                if (this.player.totalScore > prevHigh) {
                    localStorage.setItem('tkd_high_score', this.player.totalScore.toString());
                }
            }
            localStorage.setItem('tkd_max_floor', '10');
            localStorage.setItem('tkd_highest_belt', 'BLACK');
            if (this.updateSkinCardsUnlockVisuals) this.updateSkinCardsUnlockVisuals();
        } catch (e) {}

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
        this.player.update(dt, this.input || { left: false, right: false }, this.arena, this.vfx);

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
            try {
                const prevHigh = parseInt(localStorage.getItem('tkd_high_score') || '0', 10);
                if (this.player.totalScore > prevHigh) {
                    localStorage.setItem('tkd_high_score', this.player.totalScore.toString());
                }
                const prevFloor = parseInt(localStorage.getItem('tkd_max_floor') || '1', 10);
                const currentFloorNum = typeof this.wave === 'number' ? this.wave : 5;
                if (currentFloorNum > prevFloor) {
                    localStorage.setItem('tkd_max_floor', currentFloorNum.toString());
                }
                if (this.updateSkinCardsUnlockVisuals) this.updateSkinCardsUnlockVisuals();
            } catch (e) {}
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

        // School Dropout Debuff Banner UI
        const dropoutBanner = document.getElementById('hud-dropout-banner');
        if (dropoutBanner) {
            if (this.player.schoolDropoutTimer > 0) {
                dropoutBanner.classList.remove('hidden');
                dropoutBanner.innerText = `⚠️ SCHOOL DROPOUT: ${this.player.schoolDropoutTimer.toFixed(1)}s (MOVES LOCKED)`;
            } else {
                dropoutBanner.classList.add('hidden');
            }
        }

        this.updateMoveSlotUI('slot-primary', this.player.equippedMoves.primary);
        this.updateMoveSlotUI('slot-secondary', this.player.equippedMoves.secondary);
        this.updateMoveSlotUI('slot-special1', this.player.equippedMoves.special1);
        this.updateMoveSlotUI('slot-special2', this.player.equippedMoves.special2);
        this.updateMoveSlotUI('slot-special3', this.player.equippedMoves.special3);
        this.updateMoveSlotUI('slot-ultimate', this.player.equippedMoves.ultimate);

        // Update Mobile Legends Virtual Touch Buttons (Disable & color light gray if skill not unlocked, and update clockwise spinning pie chart cooldowns)
        this.updateTouchButtonUI('btn-primary', this.player.equippedMoves.primary);
        this.updateTouchButtonUI('btn-secondary', this.player.equippedMoves.secondary);
        this.updateTouchButtonUI('btn-special1', this.player.equippedMoves.special1);
        this.updateTouchButtonUI('btn-special2', this.player.equippedMoves.special2);
        this.updateTouchButtonUI('btn-hadouken', this.player.equippedMoves.special3);
        this.updateTouchButtonUI('btn-ultimate', this.player.equippedMoves.ultimate);

        // Update Utility Virtual Touch Buttons (Dash, Guard, Throw)
        this.updateUtilityTouchButtonUI('btn-dash', 'quick_dash', this.player.cooldowns['quick_dash'] || 0, 0.55);
        
        const hasGuard = this.player.activeMovesList && this.player.activeMovesList.includes('parry_counter');
        const guardCd = this.player.cooldowns['parry_counter'] || 0;
        this.updateUtilityTouchButtonUI('btn-guard', 'parry_counter', guardCd, 2.0, !hasGuard);

        const throwBtn = document.getElementById('btn-throw');
        if (throwBtn) {
            const hasAmmo = this.player.ammoInventory && this.player.ammoInventory.length > 0;
            if (!hasAmmo || this.player.schoolDropoutTimer > 0) {
                throwBtn.classList.add('ml-btn-locked');
                throwBtn.disabled = true;
            } else {
                throwBtn.classList.remove('ml-btn-locked');
                throwBtn.disabled = false;
            }
        }
    }

    updateUtilityTouchButtonUI(elemId, actionId, cdRemaining, defaultCd, forceLocked = false) {
        const btn = document.getElementById(elemId);
        if (!btn) return;

        if (forceLocked || this.player.schoolDropoutTimer > 0) {
            btn.classList.add('ml-btn-locked');
            btn.disabled = true;
            btn.setAttribute('aria-disabled', 'true');
            const cdOverlay = btn.querySelector('.ml-btn-cooldown');
            if (cdOverlay) cdOverlay.classList.remove('active');
            return;
        }

        btn.classList.remove('ml-btn-locked');
        btn.disabled = false;
        btn.removeAttribute('aria-disabled');

        const move = window.MOVES_DATABASE ? window.MOVES_DATABASE[actionId] : null;
        if (move && this.player.ki < move.kiCost) {
            btn.classList.add('no-ki');
        } else {
            btn.classList.remove('no-ki');
        }

        const cdOverlay = btn.querySelector('.ml-btn-cooldown');
        if (cdOverlay) {
            const totalCd = (move ? move.cooldown : defaultCd) || defaultCd || 1.0;
            if (cdRemaining > 0) {
                const angle = Math.min(360, Math.max(0, (cdRemaining / totalCd) * 360));
                cdOverlay.style.setProperty('--cd-angle', `${angle.toFixed(1)}deg`);
                cdOverlay.classList.add('active');
            } else {
                cdOverlay.classList.remove('active');
                cdOverlay.style.setProperty('--cd-angle', '0deg');
            }
        }
    }

    updateTouchButtonUI(elemId, moveId) {
        const btn = document.getElementById(elemId);
        if (!btn) return;

        // If no move unlocked OR player is suffering from School Dropout (moves disabled except jump & dash)
        if (!moveId || this.player.schoolDropoutTimer > 0) {
            btn.classList.add('ml-btn-locked');
            btn.disabled = true;
            btn.setAttribute('aria-disabled', 'true');
            const cdOverlay = btn.querySelector('.ml-btn-cooldown');
            if (cdOverlay) cdOverlay.classList.remove('active');
            return;
        }

        btn.classList.remove('ml-btn-locked');
        btn.disabled = false;
        btn.removeAttribute('aria-disabled');

        const move = window.MOVES_DATABASE[moveId];
        if (move && this.player.ki < move.kiCost) {
            btn.classList.add('no-ki');
        } else {
            btn.classList.remove('no-ki');
        }

        // Clockwise spinning pie chart cooldown indicator for mobile buttons
        const cdOverlay = btn.querySelector('.ml-btn-cooldown');
        if (cdOverlay) {
            // Front Snap Kick & Back Heel Thrust do not have cooldowns
            const isZeroCdMove = moveId === 'ap_chagi' || moveId === 'back_heel_kick' || moveId === 'low_kick';
            const cd = isZeroCdMove ? 0 : (this.player.cooldowns[moveId] || 0);
            const totalCd = (move ? move.cooldown : 1.0) || 1.0;

            if (cd > 0 && !isZeroCdMove) {
                const angle = Math.min(360, Math.max(0, (cd / totalCd) * 360));
                cdOverlay.style.setProperty('--cd-angle', `${angle.toFixed(1)}deg`);
                cdOverlay.classList.add('active');
            } else {
                cdOverlay.classList.remove('active');
                cdOverlay.style.setProperty('--cd-angle', '0deg');
            }
        }
    }

    updateMoveSlotUI(elemId, moveId) {
        const elem = document.getElementById(elemId);
        if (!elem) return;

        if (!moveId || this.player.schoolDropoutTimer > 0) {
            elem.classList.add('slot-locked');
            elem.querySelector('.slot-name').innerText = this.player.schoolDropoutTimer > 0 ? 'DROPOUT' : 'Locked';
            elem.querySelector('.slot-cd').style.height = '0%';
            return;
        }

        elem.classList.remove('slot-locked');
        const move = window.MOVES_DATABASE[moveId];
        elem.querySelector('.slot-name').innerText = move.name;
        
        // Front Snap Kick & Back Heel Thrust have zero cooldowns
        const isZeroCdMove = moveId === 'ap_chagi' || moveId === 'back_heel_kick' || moveId === 'low_kick';
        const cd = isZeroCdMove ? 0 : (this.player.cooldowns[moveId] || 0);
        const totalCd = (move && move.cooldown) ? move.cooldown : 1.0;
        const cdPct = isZeroCdMove ? 0 : (cd / totalCd) * 100;
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
            try {
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
            } catch (err) {
                console.error('Victory render error:', err);
            }
            return;
        }

        let shakeOffsetX = 0;
        let shakeOffsetY = 0;
        const shakeMult = typeof this.screenShakeMultiplier === 'number' ? this.screenShakeMultiplier : 1.0;
        if (this.camera && this.camera.shakeTime > 0 && shakeMult > 0) {
            shakeOffsetX = (Math.random() - 0.5) * this.camera.shakeMag * shakeMult;
            shakeOffsetY = (Math.random() - 0.5) * this.camera.shakeMag * shakeMult;
        }

        const camX = (this.camera && typeof this.camera.x === 'number') ? this.camera.x : 0;

        this.ctx.save();
        this.ctx.translate(-camX + shakeOffsetX, shakeOffsetY);

        // Render 2.5D Arena Background
        try {
            this.arena.renderBackground(this.ctx, this.camera);
        } catch (err) {
            console.error('Arena render error:', err);
        }

        // Render Kickable Desks
        if (this.kickableDesks) {
            this.kickableDesks.forEach(desk => {
                try { desk.render(this.ctx); } catch (e) {}
            });
        }

        // Render Floor Pickups
        if (this.pickupItems) {
            this.pickupItems.forEach(item => {
                try { item.render(this.ctx); } catch (e) {}
            });
        }

        // Render Flying Projectiles
        if (this.projectiles) {
            this.projectiles.forEach(p => {
                try { p.render(this.ctx); } catch (e) {}
            });
        }

        // Render Nurse in Nursery Safe Ward
        if (this.nurse) {
            try { this.nurse.render(this.ctx); } catch (e) {}
        }

        // Render Enemies
        if (this.enemies) {
            this.enemies.forEach(e => {
                try { e.render(this.ctx); } catch (err) { console.error('Enemy render error:', err); }
            });
        }

        // Render Player with 3D Motion Model & Dynamic Shadow
        if (this.player) {
            try {
                this.player.render(this.ctx);
            } catch (err) {
                console.error('Player render error:', err);
            }
        }

        // Render VFX Sparks / Trails / Healing pulses with Bloom and Damage number toggles
        if (this.vfx) {
            try { this.vfx.render(this.ctx, { bloom: this.bloomGlow, showDamage: this.showDamageNumbers }); } catch (e) {}
        }

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

function initGameEngine() {
    if (!window.gameEngine) {
        window.gameEngine = new GameEngine();
        requestAnimationFrame((t) => window.gameEngine.loop(t));
    }
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initGameEngine);
} else {
    initGameEngine();
}
