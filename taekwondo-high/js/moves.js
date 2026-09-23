// Taekwondo Belt Definitions and Move Techniques Database

const BELT_RANKS = {
    WHITE: {
        id: 'WHITE',
        name: 'White Belt',
        koreanName: 'Baek-tti (백띠)',
        color: '#f8fafc',
        textColor: '#0f172a',
        accentColor: '#cbd5e1',
        xpRequired: 100,
        unlockedMoves: ['ap_chagi', 'low_kick', 'quick_dash'],
        statBonus: { damageMult: 1.0, maxHealth: 100, kiMax: 100, kiRegen: 8, speed: 280 },
        badgeIcon: '🥋'
    },
    YELLOW: {
        id: 'YELLOW',
        name: 'Yellow Belt',
        koreanName: 'Norang-tti (노랑띠)',
        color: '#facc15',
        textColor: '#78350f',
        accentColor: '#eab308',
        xpRequired: 260,
        unlockedMoves: ['ap_chagi', 'low_kick', 'quick_dash', 'dollyo_chagi', 'parry_counter'],
        statBonus: { damageMult: 1.25, maxHealth: 130, kiMax: 120, kiRegen: 10, speed: 300 },
        badgeIcon: '⚡'
    },
    GREEN: {
        id: 'GREEN',
        name: 'Green Belt',
        koreanName: 'Chorok-tti (초록띠)',
        color: '#22c55e',
        textColor: '#064e3b',
        accentColor: '#16a34a',
        xpRequired: 500,
        unlockedMoves: ['ap_chagi', 'low_kick', 'quick_dash', 'dollyo_chagi', 'parry_counter', 'yeop_chagi', 'flying_side_kick'],
        statBonus: { damageMult: 1.55, maxHealth: 165, kiMax: 140, kiRegen: 12, speed: 325 },
        badgeIcon: '🍃'
    },
    BLUE: {
        id: 'BLUE',
        name: 'Blue Belt',
        koreanName: 'Parang-tti (파랑띠)',
        color: '#38bdf8',
        textColor: '#082f49',
        accentColor: '#0284c7',
        xpRequired: 850,
        unlockedMoves: ['ap_chagi', 'low_kick', 'quick_dash', 'dollyo_chagi', 'parry_counter', 'yeop_chagi', 'flying_side_kick', 'naeryeo_chagi', 'ki_burst'],
        statBonus: { damageMult: 1.9, maxHealth: 200, kiMax: 165, kiRegen: 15, speed: 350 },
        badgeIcon: '🌊'
    },
    RED: {
        id: 'RED',
        name: 'Red Belt',
        koreanName: 'Ppalgang-tti (빨강띠)',
        color: '#ef4444',
        textColor: '#450a0a',
        accentColor: '#dc2626',
        xpRequired: 1300,
        unlockedMoves: ['ap_chagi', 'low_kick', 'quick_dash', 'dollyo_chagi', 'parry_counter', 'yeop_chagi', 'flying_side_kick', 'naeryeo_chagi', 'ki_burst', 'dwi_chagi', 'spinning_hook_kick'],
        statBonus: { damageMult: 2.35, maxHealth: 240, kiMax: 190, kiRegen: 18, speed: 375 },
        badgeIcon: '🔥'
    },
    BLACK: {
        id: 'BLACK',
        name: 'Black Belt (1st Dan)',
        koreanName: 'Geomeun-tti (검은띠)',
        color: '#09090b',
        textColor: '#f8fafc',
        accentColor: '#e11d48',
        xpRequired: 2000,
        unlockedMoves: ['ap_chagi', 'low_kick', 'quick_dash', 'dollyo_chagi', 'parry_counter', 'yeop_chagi', 'flying_side_kick', 'naeryeo_chagi', 'ki_burst', 'dwi_chagi', 'spinning_hook_kick', 'tornado_540', 'dragon_finisher'],
        statBonus: { damageMult: 3.0, maxHealth: 300, kiMax: 220, kiRegen: 22, speed: 400 },
        badgeIcon: '👑'
    }
};

const BELT_ORDER = ['WHITE', 'YELLOW', 'GREEN', 'BLUE', 'RED', 'BLACK'];

// Authentic Taekwondo Techniques
const MOVES_DATABASE = {
    // Basic White Belt Kicks
    ap_chagi: {
        id: 'ap_chagi',
        name: 'Front Snap Kick',
        korean: 'Ap Chagi (앞차기)',
        belt: 'WHITE',
        type: 'attack',
        slot: 'primary',
        key: 'J / Left Click',
        damage: 22,
        kiCost: 0,
        cooldown: 0.28,
        range: 85,
        hitRadius: 40,
        knockback: 180,
        stunTime: 0.25,
        startupTime: 0.08,
        activeTime: 0.12,
        recoveryTime: 0.08,
        airLaunch: false,
        vfx: { trailColor: 'rgba(255,255,255,0.7)', sparkColor: '#ffffff', arcAngle: 0.3 },
        description: 'Fast direct linear kick with ball of foot. Pushes foes back.'
    },
    low_kick: {
        id: 'low_kick',
        name: 'Low Sweeper Kick',
        korean: 'Arae Chagi (아래차기)',
        belt: 'WHITE',
        type: 'attack',
        slot: 'secondary',
        key: 'K / Right Click',
        damage: 18,
        kiCost: 5,
        cooldown: 0.4,
        range: 75,
        hitRadius: 45,
        knockback: 90,
        stunTime: 0.45,
        startupTime: 0.1,
        activeTime: 0.15,
        recoveryTime: 0.1,
        airLaunch: false,
        tripsEnemy: true,
        vfx: { trailColor: 'rgba(203,213,225,0.8)', sparkColor: '#94a3b8', arcAngle: -0.5 },
        description: 'Low shin strike that destabilizes enemy posture and trips them.'
    },
    quick_dash: {
        id: 'quick_dash',
        name: 'Step Slide Dash',
        korean: 'Bbal-gichagi Step (스텝)',
        belt: 'WHITE',
        type: 'utility',
        slot: 'dash',
        key: 'Space / Shift',
        damage: 0,
        kiCost: 15,
        cooldown: 0.6,
        dashSpeed: 820,
        duration: 0.18,
        iFrames: true,
        vfx: { trailColor: 'rgba(148,163,184,0.4)' },
        description: 'Instant evasive reposition with invulnerability frames.'
    },

    // Yellow Belt
    dollyo_chagi: {
        id: 'dollyo_chagi',
        name: 'Roundhouse Kick',
        korean: 'Dollyo Chagi (돌려차기)',
        belt: 'YELLOW',
        type: 'attack',
        slot: 'special1',
        key: 'L / E',
        damage: 42,
        kiCost: 18,
        cooldown: 1.0,
        range: 105,
        hitRadius: 55,
        knockback: 320,
        stunTime: 0.35,
        startupTime: 0.12,
        activeTime: 0.14,
        recoveryTime: 0.12,
        airLaunch: true,
        vfx: { trailColor: 'rgba(250,204,21,0.85)', sparkColor: '#facc15', arcAngle: 0.9 },
        description: 'High momentum whipping kick with the instep. Powerful knockback.'
    },
    parry_counter: {
        id: 'parry_counter',
        name: 'Grommet Counter Parry',
        korean: 'Momtong Makki (몸통막기)',
        belt: 'YELLOW',
        type: 'defense',
        slot: 'defend',
        key: 'Q / Guard',
        damage: 60,
        kiCost: 10,
        cooldown: 2.2,
        guardDuration: 0.3,
        vfx: { trailColor: 'rgba(234,179,8,0.9)', sparkColor: '#fef08a' },
        description: 'Block incoming attacks within 0.3s to deflect and execute an instant counter-strike!'
    },

    // Green Belt
    yeop_chagi: {
        id: 'yeop_chagi',
        name: 'Thrusting Side Kick',
        korean: 'Yeop Chagi (옆차기)',
        belt: 'GREEN',
        type: 'attack',
        slot: 'special1',
        key: 'L / E',
        damage: 55,
        kiCost: 24,
        cooldown: 1.4,
        range: 120,
        hitRadius: 50,
        knockback: 450,
        stunTime: 0.5,
        startupTime: 0.14,
        activeTime: 0.12,
        recoveryTime: 0.14,
        wallBounce: true,
        vfx: { trailColor: 'rgba(34,197,94,0.85)', sparkColor: '#4ade80', arcAngle: 0.1 },
        description: 'Penetrating heel drive that slams targets into walls for extra crash damage.'
    },
    flying_side_kick: {
        id: 'flying_side_kick',
        name: 'Twio Yeop Chagi',
        korean: 'Flying Side Kick (뛰어 옆차기)',
        belt: 'GREEN',
        type: 'attack',
        slot: 'special2',
        key: 'U / R',
        damage: 70,
        kiCost: 32,
        cooldown: 2.5,
        range: 220,
        hitRadius: 65,
        knockback: 480,
        stunTime: 0.6,
        startupTime: 0.18,
        activeTime: 0.22,
        recoveryTime: 0.15,
        airborne: true,
        vfx: { trailColor: 'rgba(74,222,128,0.9)', sparkColor: '#86efac', arcAngle: 0.2 },
        description: 'Leap across the screen with devastating aerial thrust piercing all enemies in path.'
    },

    // Blue Belt
    naeryeo_chagi: {
        id: 'naeryeo_chagi',
        name: 'Axe Kick (Downward Hammer)',
        korean: 'Naeryeo Chagi (내려차기)',
        belt: 'BLUE',
        type: 'attack',
        slot: 'special1',
        key: 'L / E',
        damage: 85,
        kiCost: 35,
        cooldown: 2.0,
        range: 95,
        hitRadius: 60,
        knockback: 100,
        groundSlam: true,
        stunTime: 1.2,
        startupTime: 0.22,
        activeTime: 0.12,
        recoveryTime: 0.18,
        vfx: { trailColor: 'rgba(56,189,248,0.9)', sparkColor: '#38bdf8', arcAngle: -1.2 },
        description: 'Raise leg high and slam heel down with crushing force, heavily stunning targets.'
    },
    ki_burst: {
        id: 'ki_burst',
        name: 'Kihap Shockwave',
        korean: 'Kihap Wave (기합 파동)',
        belt: 'BLUE',
        type: 'utility',
        slot: 'special2',
        key: 'U / R',
        damage: 40,
        kiCost: 40,
        cooldown: 3.5,
        range: 150,
        hitRadius: 150,
        isAoE: true,
        knockback: 380,
        vfx: { trailColor: 'rgba(14,165,233,0.9)', sparkColor: '#bae6fd' },
        description: 'Unleash a resonant spirit shout that repels all nearby surrounders and clears space.'
    },

    // Red Belt
    dwi_chagi: {
        id: 'dwi_chagi',
        name: 'Spinning Back Kick',
        korean: 'Dwi Chagi (뒤차기)',
        belt: 'RED',
        type: 'attack',
        slot: 'special1',
        key: 'L / E',
        damage: 110,
        kiCost: 45,
        cooldown: 2.4,
        range: 130,
        hitRadius: 55,
        knockback: 550,
        stunTime: 0.7,
        startupTime: 0.16,
        activeTime: 0.15,
        recoveryTime: 0.15,
        vfx: { trailColor: 'rgba(239,68,68,0.95)', sparkColor: '#f87171', arcAngle: 1.2 },
        description: 'Blinding blindside spin with devastating heel impact that pulverizes heavy targets.'
    },
    spinning_hook_kick: {
        id: 'spinning_hook_kick',
        name: 'Spinning Hook Kick',
        korean: 'Dwi Huryeo Chagi (뒤후려차기)',
        belt: 'RED',
        type: 'attack',
        slot: 'special2',
        key: 'U / R',
        damage: 130,
        kiCost: 50,
        cooldown: 3.0,
        range: 140,
        hitRadius: 75,
        knockback: 400,
        stunTime: 0.9,
        startupTime: 0.2,
        activeTime: 0.18,
        recoveryTime: 0.18,
        vfx: { trailColor: 'rgba(220,38,38,0.95)', sparkColor: '#fca5a5', arcAngle: 1.8 },
        description: '360° sweeping heel hook that catches whole crowds and deals massive critical damage.'
    },

    // Black Belt
    tornado_540: {
        id: 'tornado_540',
        name: '540° Tornado Kick',
        korean: 'Twio Mondollyo 540 (540도 토네이도)',
        belt: 'BLACK',
        type: 'attack',
        slot: 'special1',
        key: 'L / E',
        damage: 190,
        kiCost: 65,
        cooldown: 4.5,
        range: 180,
        hitRadius: 100,
        knockback: 650,
        stunTime: 1.4,
        startupTime: 0.25,
        activeTime: 0.35,
        recoveryTime: 0.2,
        multiHit: 3,
        vfx: { trailColor: 'rgba(225,29,72,0.95)', sparkColor: '#fda4af', arcAngle: 3.4 },
        description: 'Legendary acrobatic spin striking three times in mid-air with supreme Dragon Ki.'
    },
    dragon_finisher: {
        id: 'dragon_finisher',
        name: 'Dragon Spirit Overdrive',
        korean: 'Yong-ui Gyeok (용의 격)',
        belt: 'BLACK',
        type: 'ultimate',
        slot: 'ultimate',
        key: 'I / F',
        damage: 280,
        kiCost: 100,
        cooldown: 8.0,
        range: 260,
        hitRadius: 140,
        knockback: 800,
        stunTime: 2.0,
        startupTime: 0.3,
        activeTime: 0.45,
        recoveryTime: 0.3,
        screenFreeze: true,
        vfx: { trailColor: 'rgba(244,63,94,1.0)', sparkColor: '#fff1f2', arcAngle: 4.5 },
        description: 'Summon ancestral martial spirit to perform an unstoppable blitzkrieg across the arena.'
    }
};

// Roguelike Technique Scrolls & Stat Badges
const ROGUELIKE_PERKS = [
    {
        id: 'flame_kicks',
        name: 'Tiger Flame Infusion',
        icon: '🔥',
        rarity: 'rare',
        description: 'All kicks apply Burn dealing 15 damage/sec for 3s to enemies.',
        apply: (player) => { player.perks.flameKicks = (player.perks.flameKicks || 0) + 1; }
    },
    {
        id: 'lightning_speed',
        name: 'Brisk Wind Footwork',
        icon: '⚡',
        rarity: 'common',
        description: '+18% Movement speed and Dash cooldown reduced by 25%.',
        apply: (player) => { player.speedBonus = (player.speedBonus || 0) + 0.18; player.dashCdMult = (player.dashCdMult || 1.0) * 0.75; }
    },
    {
        id: 'critical_strike',
        name: 'Precise Target Pressure',
        icon: '🎯',
        rarity: 'rare',
        description: '+20% Critical Hit Chance (Crits deal 220% damage with screen impact).',
        apply: (player) => { player.critChance = (player.critChance || 0.05) + 0.20; }
    },
    {
        id: 'ki_vampirism',
        name: 'Spirit Leech Stance',
        icon: '🩸',
        rarity: 'epic',
        description: 'Defeating an enemy restores 12 HP and 25 Ki immediately.',
        apply: (player) => { player.perks.vampirism = (player.perks.vampirism || 0) + 1; }
    },
    {
        id: 'iron_shins',
        name: 'Conditioned Iron Shin',
        icon: '🛡️',
        rarity: 'common',
        description: '+30 Max HP and take 15% less damage from all enemy hits.',
        apply: (player) => { player.maxHpBonus = (player.maxHpBonus || 0) + 30; player.hp = Math.min(player.maxHp, player.hp + 30); player.dmgReduction = (player.dmgReduction || 0) + 0.15; }
    },
    {
        id: 'flow_state',
        name: 'Infinite Combo Flow',
        icon: '🌊',
        rarity: 'epic',
        description: 'Combo meter decays 50% slower. Every 10 combo hits boosts attack damage by +10%.',
        apply: (player) => { player.perks.flowState = (player.perks.flowState || 0) + 1; }
    },
    {
        id: 'shockwave_impact',
        name: 'Crushing Shockwave',
        icon: '💥',
        rarity: 'legendary',
        description: 'Kicks release kinetic shockwaves damaging nearby enemies for 40% splash damage.',
        apply: (player) => { player.perks.shockwave = (player.perks.shockwave || 0) + 1; }
    },
    {
        id: 'overcharge_ki',
        name: 'Dan-Jeon Breathing',
        icon: '🧘',
        rarity: 'rare',
        description: 'Ki regeneration speed increased by +50%. Special kick cooldowns reduced by 20%.',
        apply: (player) => { player.kiRegenMult = (player.kiRegenMult || 1.0) * 1.5; player.cooldownMult = (player.cooldownMult || 1.0) * 0.8; }
    },
    {
        id: 'instant_recovery',
        name: 'Indomitable Spirit',
        icon: '✨',
        rarity: 'legendary',
        description: 'Once per run: Revive at 50% HP with 3 seconds of invulnerability when defeated.',
        apply: (player) => { player.revives = (player.revives || 0) + 1; }
    }
];

window.BELT_RANKS = BELT_RANKS;
window.BELT_ORDER = BELT_ORDER;
window.MOVES_DATABASE = MOVES_DATABASE;
window.ROGUELIKE_PERKS = ROGUELIKE_PERKS;
