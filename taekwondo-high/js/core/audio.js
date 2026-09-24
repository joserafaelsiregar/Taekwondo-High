// Procedural Web Audio Synthesizer for Martial Arts Sound Effects & Music
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.masterVolume = 0.7;
        this.sfxVolume = 0.8;
        this.bgmVolume = 0.45;
        this.bgmPlaying = false;
        this.bgmTimer = null;
        this.currentStep = 0;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    // High speed whoosh / swish for kicks
    playWhoosh(pitch = 1.0, power = 1.0) {
        if (this.muted || !this.ctx) return;
        const now = this.ctx.currentTime;
        
        // White noise node
        const bufferSize = this.ctx.sampleRate * 0.25;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(300 * pitch, now);
        filter.frequency.exponentialRampToValueAtTime(1400 * pitch * power, now + 0.12);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.25);
        filter.Q.setValueAtTime(3.0, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.6 * this.masterVolume * this.sfxVolume * power, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
    }

    // Math Exam Sounds
    playMathCorrect() {
        if (this.muted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.25 * this.masterVolume * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
    }

    playMathWrong() {
        if (this.muted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.25);
        gain.gain.setValueAtTime(0.3 * this.masterVolume * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
    }

    // Heavy martial arts impact hit
    playHit(type = 'normal', isCrit = false) {
        if (this.muted || !this.ctx) return;
        const now = this.ctx.currentTime;

        // Sub-bass thud
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        
        let startFreq = type === 'heavy' ? 140 : 180;
        let endFreq = type === 'heavy' ? 35 : 45;
        if (isCrit) startFreq = 220;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + (isCrit ? 0.25 : 0.15));

        const baseVol = (isCrit ? 0.9 : 0.6) * this.masterVolume * this.sfxVolume;
        oscGain.gain.setValueAtTime(baseVol, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + (isCrit ? 0.28 : 0.16));

        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);

        // Crack / transient noise
        const bufferSize = this.ctx.sampleRate * 0.08;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(isCrit ? 900 : 600, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(baseVol * 0.8, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(now);

        // Clang / shockwave for crit
        if (isCrit) {
            const bell = this.ctx.createOscillator();
            const bellGain = this.ctx.createGain();
            bell.type = 'sine';
            bell.frequency.setValueAtTime(880, now);
            bell.frequency.exponentialRampToValueAtTime(440, now + 0.3);
            bellGain.gain.setValueAtTime(0.35 * this.masterVolume, now);
            bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

            bell.connect(bellGain);
            bellGain.connect(this.ctx.destination);
            bell.start(now);
            bell.stop(now + 0.32);
        }
    }

    // Quick Dash sound
    playDash() {
        if (this.muted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.12);

        gain.gain.setValueAtTime(0.25 * this.masterVolume * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.13);
    }

    // Parry / Block sound
    playParry() {
        if (this.muted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.2);

        gain.gain.setValueAtTime(0.7 * this.masterVolume * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
    }

    // Belt Promotion Fanfare
    playBeltRankUp() {
        if (this.muted || !this.ctx) return;
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C major arpeggio
        const now = this.ctx.currentTime;

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + idx * 0.07;
            
            osc.type = idx === notes.length - 1 ? 'triangle' : 'square';
            osc.frequency.setValueAtTime(freq, startTime);

            const duration = idx === notes.length - 1 ? 0.6 : 0.15;
            gain.gain.setValueAtTime(0.25 * this.masterVolume, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + duration + 0.05);
        });
    }

    // Upgrade chosen sound
    playPerkSelect() {
        if (this.muted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);

        gain.gain.setValueAtTime(0.4 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
    }

    // Special Ki / 540 Kick build-up sound
    playSpecialKi() {
        if (this.muted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.linearRampToValueAtTime(660, now + 0.4);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.45 * this.masterVolume, now + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
    }

    // Background synth music loop (Unique floor soundtracks & exhilarating heavy rock boss music)
    setFloor(floor, isBoss = false) {
        this.currentFloor = floor;
        this.isBossTheme = isBoss || [3, 6, 9, 10].includes(floor);
        this.currentStep = 0;
    }

    startBGM(floor = 1, isBoss = false) {
        if (floor) this.setFloor(floor, isBoss);
        if (this.bgmPlaying || !this.ctx) return;
        this.bgmPlaying = true;
        this.scheduleBGMStep();
    }

    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    scheduleBGMStep() {
        if (!this.bgmPlaying || !this.ctx) return;
        
        const floor = this.currentFloor || 1;
        const isBoss = this.isBossTheme || [3, 6, 9, 10].includes(floor);

        // Different BPM & speed per floor type: Fast electrifying 148-164 BPM for rock bosses
        let bpm = 128;
        if (isBoss) {
            bpm = floor === 10 ? 164 : (floor === 9 ? 154 : 146); // Fast adrenaline heavy metal rock
        } else if (floor === 5) {
            bpm = 114; // Atmospheric mystical library
        } else if (floor === 7 || floor === 8) {
            bpm = 136; // Dark tension electro lab
        } else if (floor === 2) {
            bpm = 132; // Energetic cafeteria clash
        }

        const stepDuration = 60 / bpm / 2; // 16th notes
        const now = this.ctx.currentTime;

        if (!this.muted) {
            const step = this.currentStep % 16;
            const bar = Math.floor(this.currentStep / 16);

            if (isBoss) {
                // =========================================================================
                // 🎸 EXHILARATING HEAVY ROCK METAL BOSS THEME (Double Bass, Power Chords, Lead Shred)
                // =========================================================================

                // 1. Heavy Double Bass Drum (Punchy driving double-kick pattern)
                const isDoubleKick = (floor === 10) 
                    ? (step % 2 === 0 || step === 3 || step === 7 || step === 11 || step === 15)
                    : (step % 2 === 0 || step === 7 || step === 15);

                if (isDoubleKick) {
                    const kick = this.ctx.createOscillator();
                    const kickGain = this.ctx.createGain();
                    kick.type = 'triangle';
                    kick.frequency.setValueAtTime(170, now);
                    kick.frequency.exponentialRampToValueAtTime(32, now + 0.09);
                    kickGain.gain.setValueAtTime(0.48 * this.bgmVolume * this.masterVolume, now);
                    kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
                    kick.connect(kickGain);
                    kickGain.connect(this.ctx.destination);
                    kick.start(now);
                    kick.stop(now + 0.12);
                }

                // 2. Heavy Metal Snare Crack on Beats 4 & 12 (with explosive mid-range noise)
                if (step === 4 || step === 12) {
                    const snareFilter = this.ctx.createBiquadFilter();
                    snareFilter.type = 'bandpass';
                    snareFilter.frequency.setValueAtTime(1400, now);
                    snareFilter.Q.setValueAtTime(1.8, now);
                    
                    const bufferSize = Math.floor(this.ctx.sampleRate * 0.14);
                    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                    const d = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));

                    const snare = this.ctx.createBufferSource();
                    snare.buffer = buffer;
                    const snareGain = this.ctx.createGain();
                    snareGain.gain.setValueAtTime(0.38 * this.bgmVolume * this.masterVolume, now);
                    snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

                    snare.connect(snareFilter);
                    snareFilter.connect(snareGain);
                    snareGain.connect(this.ctx.destination);
                    snare.start(now);
                }

                // 3. Heavy Metal Crash / Ride Cymbal (Fast driving rock cymbals)
                if (step % 2 === 1 || step === 0) {
                    const cymbalFilter = this.ctx.createBiquadFilter();
                    cymbalFilter.type = 'highpass';
                    cymbalFilter.frequency.setValueAtTime(7500, now);

                    const bufferSize = Math.floor(this.ctx.sampleRate * 0.05);
                    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                    const d = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) d[i] = Math.random() * 2 - 1;

                    const cymbal = this.ctx.createBufferSource();
                    cymbal.buffer = buffer;
                    const cymbalGain = this.ctx.createGain();
                    cymbalGain.gain.setValueAtTime((step === 0 ? 0.22 : 0.1) * this.bgmVolume * this.masterVolume, now);
                    cymbalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

                    cymbal.connect(cymbalFilter);
                    cymbalFilter.connect(cymbalGain);
                    cymbalGain.connect(this.ctx.destination);
                    cymbal.start(now);
                }

                // 4. Overdriven Power Chord Rhythm Guitar (Distorted Sawtooth Chugging: D/E/C/B metal riffs)
                let bossRiffFreq = 73.42; // D2
                if (floor === 10) {
                    // Midnight Final Boss: Dark D-minor thrash riff
                    const riff = [73.42, 73.42, 87.31, 73.42, 98.0, 92.5, 73.42, 110.0];
                    bossRiffFreq = riff[Math.floor(step / 2) % riff.length];
                } else if (floor === 6) {
                    // Kendo Boss: E-minor battle metal
                    const riff = [82.41, 82.41, 98.0, 82.41, 110.0, 103.83, 82.41, 123.47];
                    bossRiffFreq = riff[Math.floor(step / 2) % riff.length];
                } else {
                    // Floor 3 / 9: Driving A-minor / E-minor rock riffs
                    const riff = [55.0, 55.0, 65.41, 55.0, 73.42, 65.41, 55.0, 82.41];
                    bossRiffFreq = riff[Math.floor(step / 2) % riff.length];
                }

                const guitar1 = this.ctx.createOscillator();
                const guitar2 = this.ctx.createOscillator(); // 5th power chord harmony
                const guitarGain = this.ctx.createGain();
                const guitarDistort = this.ctx.createBiquadFilter();

                guitar1.type = 'sawtooth';
                guitar2.type = 'sawtooth';
                guitar1.frequency.setValueAtTime(bossRiffFreq, now);
                guitar2.frequency.setValueAtTime(bossRiffFreq * 1.4983, now); // Perfect 5th interval

                guitarDistort.type = 'lowpass';
                guitarDistort.frequency.setValueAtTime(1600 + (step % 4 === 0 ? 900 : 200), now);
                guitarDistort.Q.setValueAtTime(4.0, now);

                guitarGain.gain.setValueAtTime(0.24 * this.bgmVolume * this.masterVolume, now);
                guitarGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.3);

                guitar1.connect(guitarDistort);
                guitar2.connect(guitarDistort);
                guitarDistort.connect(guitarGain);
                guitarGain.connect(this.ctx.destination);

                guitar1.start(now);
                guitar2.start(now);
                guitar1.stop(now + stepDuration * 1.4);
                guitar2.stop(now + stepDuration * 1.4);

                // 5. High-Octane Lead Guitar Shredding / Melodic Hook
                if (step % 2 === 0 && (bar % 2 === 1 || floor === 10)) {
                    const leadNotes = floor === 10 
                        ? [293.66, 349.23, 440.0, 523.25, 587.33, 698.46, 587.33, 440.0] // Dm metal shred
                        : [220.0, 261.63, 329.63, 392.0, 440.0, 523.25, 440.0, 329.63]; // Am rock lead
                    const leadFreq = leadNotes[Math.floor(this.currentStep / 2) % leadNotes.length];

                    const leadOsc = this.ctx.createOscillator();
                    const leadGain = this.ctx.createGain();
                    const leadFilter = this.ctx.createBiquadFilter();

                    leadOsc.type = 'square';
                    leadOsc.frequency.setValueAtTime(leadFreq, now);
                    leadOsc.frequency.linearRampToValueAtTime(leadFreq * 1.01, now + stepDuration); // natural rock vibrato

                    leadFilter.type = 'bandpass';
                    leadFilter.frequency.setValueAtTime(2200, now);
                    leadFilter.Q.setValueAtTime(3.5, now);

                    leadGain.gain.setValueAtTime(0.18 * this.bgmVolume * this.masterVolume, now);
                    leadGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.8);

                    leadOsc.connect(leadFilter);
                    leadFilter.connect(leadGain);
                    leadGain.connect(this.ctx.destination);

                    leadOsc.start(now);
                    leadOsc.stop(now + stepDuration * 1.9);
                }

            } else {
                // =========================================================================
                // 🏫 UNIQUE THEMATIC STAGE SOUNDTRACKS (Floors 1, 2, 4, 5, 7, 8)
                // =========================================================================

                // Standard Four-on-the-Floor Bass Kick
                if (step % 4 === 0) {
                    const kick = this.ctx.createOscillator();
                    const kickGain = this.ctx.createGain();
                    kick.type = 'sine';
                    kick.frequency.setValueAtTime(130, now);
                    kick.frequency.exponentialRampToValueAtTime(38, now + 0.12);
                    kickGain.gain.setValueAtTime(0.35 * this.bgmVolume * this.masterVolume, now);
                    kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
                    kick.connect(kickGain);
                    kickGain.connect(this.ctx.destination);
                    kick.start(now);
                    kick.stop(now + 0.15);
                }

                // Snare / Clap on beats 4, 12
                if (step === 4 || step === 12) {
                    const snareFilter = this.ctx.createBiquadFilter();
                    snareFilter.type = 'highpass';
                    snareFilter.frequency.setValueAtTime(1000, now);
                    
                    const bufferSize = Math.floor(this.ctx.sampleRate * 0.1);
                    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                    const d = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);

                    const snare = this.ctx.createBufferSource();
                    snare.buffer = buffer;
                    const snareGain = this.ctx.createGain();
                    snareGain.gain.setValueAtTime(0.2 * this.bgmVolume * this.masterVolume, now);
                    snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

                    snare.connect(snareFilter);
                    snareFilter.connect(snareGain);
                    snareGain.connect(this.ctx.destination);
                    snare.start(now);
                }

                // Hi-Hats on odd steps
                if (step % 2 === 1) {
                    const hatFilter = this.ctx.createBiquadFilter();
                    hatFilter.type = 'bandpass';
                    hatFilter.frequency.setValueAtTime(8000, now);

                    const bufferSize = Math.floor(this.ctx.sampleRate * 0.03);
                    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                    const d = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) d[i] = Math.random() * 2 - 1;

                    const hat = this.ctx.createBufferSource();
                    hat.buffer = buffer;
                    const hatGain = this.ctx.createGain();
                    hatGain.gain.setValueAtTime(0.08 * this.bgmVolume * this.masterVolume, now);
                    hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

                    hat.connect(hatFilter);
                    hatFilter.connect(hatGain);
                    hatGain.connect(this.ctx.destination);
                    hat.start(now);
                }

                // Floor-Distinct Basslines & Melody Scales
                let bassNotes, waveType = 'sawtooth', cutoff = 700;
                if (floor === 1) {
                    // Floor 1 (Lockers): Energetic High School Synthwave (A minor pentatonic)
                    bassNotes = [55.0, 55.0, 65.41, 73.42, 55.0, 82.41, 73.42, 65.41];
                    waveType = 'sawtooth';
                    cutoff = 650 + Math.sin(this.currentStep * 0.4) * 350;
                } else if (floor === 2) {
                    // Floor 2 (Cafeteria): Funky Groovy Bass Slap (F# minor bounce)
                    bassNotes = [46.25, 46.25, 55.0, 46.25, 61.74, 55.0, 46.25, 69.30];
                    waveType = 'triangle';
                    cutoff = 900;
                } else if (floor === 4) {
                    // Floor 4 (Student Council): Elegant Neo-Classical Martial Synth (D minor dramatic)
                    bassNotes = [73.42, 73.42, 87.31, 73.42, 98.0, 87.31, 73.42, 110.0];
                    waveType = 'sawtooth';
                    cutoff = 800;
                } else if (floor === 5) {
                    // Floor 5 (Library): Mysterious Ambient Arpeggios (E minor harmonic)
                    bassNotes = [82.41, 98.0, 123.47, 146.83, 164.81, 146.83, 123.47, 98.0];
                    waveType = 'sine';
                    cutoff = 1200;
                } else if (floor === 7) {
                    // Floor 7 (Science Lab): Acid Cyberpunk Pulse (B minor industrial)
                    bassNotes = [61.74, 61.74, 73.42, 61.74, 82.41, 73.42, 92.5, 61.74];
                    waveType = 'sawtooth';
                    cutoff = 1400 + Math.sin(this.currentStep * 0.8) * 800;
                } else {
                    // Floor 8 (Dark Corridor / Infirmary): Eerie Darkwave Pulse (C# minor tension)
                    bassNotes = [69.30, 69.30, 82.41, 69.30, 92.5, 82.41, 69.30, 103.83];
                    waveType = 'triangle';
                    cutoff = 500 + Math.sin(this.currentStep * 0.3) * 200;
                }

                const currentFreq = bassNotes[Math.floor(this.currentStep / 2) % bassNotes.length];
                if (step % 2 === 0) {
                    const synth = this.ctx.createOscillator();
                    const synthGain = this.ctx.createGain();
                    synth.type = waveType;
                    synth.frequency.setValueAtTime(currentFreq, now);

                    synthGain.gain.setValueAtTime(0.14 * this.bgmVolume * this.masterVolume, now);
                    synthGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.5);

                    const synthFilter = this.ctx.createBiquadFilter();
                    synthFilter.type = 'lowpass';
                    synthFilter.frequency.setValueAtTime(cutoff, now);

                    synth.connect(synthFilter);
                    synthFilter.connect(synthGain);
                    synthGain.connect(this.ctx.destination);
                    synth.start(now);
                    synth.stop(now + stepDuration * 1.6);
                }
            }
        }

        this.currentStep++;
        this.bgmTimer = setTimeout(() => this.scheduleBGMStep(), stepDuration * 1000);
    }
}

window.soundEngine = new SoundEngine();

