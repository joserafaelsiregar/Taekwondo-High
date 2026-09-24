// Procedural Web Audio Synthesizer for Martial Arts Sound Effects & Music
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.masterVolume = 0.85;
        this.sfxVolume = 0.55;    // Sound effects balanced lower
        this.bgmVolume = 0.90;    // Music slightly louder than SFX as requested
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
        const bufferSize = this.ctx.sampleRate * 0.22;
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
        filter.frequency.exponentialRampToValueAtTime(1400 * pitch * power, now + 0.1);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.22);
        filter.Q.setValueAtTime(3.0, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.45 * this.masterVolume * this.sfxVolume * power, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

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
        gain.gain.setValueAtTime(0.28 * this.masterVolume * this.sfxVolume, now);
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
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + (isCrit ? 0.22 : 0.13));

        const baseVol = (isCrit ? 0.75 : 0.5) * this.masterVolume * this.sfxVolume;
        oscGain.gain.setValueAtTime(baseVol, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + (isCrit ? 0.24 : 0.14));

        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.26);

        // Crack / transient noise
        const bufferSize = this.ctx.sampleRate * 0.07;
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
        noiseGain.gain.setValueAtTime(baseVol * 0.75, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

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
            bell.frequency.exponentialRampToValueAtTime(440, now + 0.25);
            bellGain.gain.setValueAtTime(0.3 * this.masterVolume * this.sfxVolume, now);
            bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

            bell.connect(bellGain);
            bellGain.connect(this.ctx.destination);
            bell.start(now);
            bell.stop(now + 0.28);
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
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.1);

        gain.gain.setValueAtTime(0.22 * this.masterVolume * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.11);
    }

    // Parry / Block sound
    playParry() {
        if (this.muted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.18);

        gain.gain.setValueAtTime(0.55 * this.masterVolume * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
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
            gain.gain.setValueAtTime(0.3 * this.masterVolume, startTime);
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

        gain.gain.setValueAtTime(0.35 * this.masterVolume, now);
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
        gain.gain.linearRampToValueAtTime(0.4 * this.masterVolume, now + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
    }

    // Background synth music loop (10 Unique Floor Soundtracks & Distinct Musical Vibes)
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

    // Helper synthesis methods for rich music generation
    _playDrum(type, now, volumeMultiplier = 1.0) {
        if (!this.ctx || this.muted) return;
        const vol = this.bgmVolume * this.masterVolume * volumeMultiplier;

        if (type === 'kick') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(155, now);
            osc.frequency.exponentialRampToValueAtTime(36, now + 0.12);
            gain.gain.setValueAtTime(0.7 * vol, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.15);
        } else if (type === 'heavy_kick') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.exponentialRampToValueAtTime(32, now + 0.1);
            gain.gain.setValueAtTime(0.85 * vol, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.13);
        } else if (type === 'snare') {
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1300, now);
            filter.Q.setValueAtTime(1.5, now);

            const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const d = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.55 * vol, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start(now);
        } else if (type === 'hihat') {
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(7500, now);

            const bufferSize = Math.floor(this.ctx.sampleRate * 0.04);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const d = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) d[i] = Math.random() * 2 - 1;

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.22 * vol, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start(now);
        } else if (type === 'openhat') {
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(6000, now);

            const bufferSize = Math.floor(this.ctx.sampleRate * 0.15);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const d = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.5));

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.3 * vol, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start(now);
        }
    }

    _playTone(freq, duration, now, type = 'sawtooth', filterFreq = 1200, volume = 0.35, q = 2.0) {
        if (!this.ctx || this.muted || !freq) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(filterFreq, now);
        filter.Q.setValueAtTime(q, now);

        const targetVol = volume * this.bgmVolume * this.masterVolume;
        gain.gain.setValueAtTime(targetVol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + duration + 0.02);
    }

    scheduleBGMStep() {
        if (!this.bgmPlaying || !this.ctx) return;
        
        const floor = this.currentFloor || 1;
        const now = this.ctx.currentTime;
        const step = this.currentStep % 16;
        const bar = Math.floor(this.currentStep / 16);

        // Define distinct BPM and musical identities for all 10 Floors!
        const floorConfigs = {
            1: { bpm: 126, name: "Synthwave Rookie Rush" },
            2: { bpm: 130, name: "Cafeteria Slap Funk" },
            3: { bpm: 148, name: "Dojang Master Heavy Rock" },
            4: { bpm: 132, name: "Student Council Neo-Tokyo Electro" },
            5: { bpm: 118, name: "Library Mystic Arpeggio" },
            6: { bpm: 154, name: "Kendo Hall Samurai Metal" },
            7: { bpm: 138, name: "Science Lab Acid Industrial" },
            8: { bpm: 134, name: "Infirmary Dark Tension Groove" },
            9: { bpm: 160, name: "Staircase Speed Metal Climax" },
            10: { bpm: 168, name: "Lord Shin Rooftop Thunder Metal" }
        };

        const config = floorConfigs[floor] || floorConfigs[1];
        const bpm = config.bpm;
        const stepDuration = 60 / bpm / 2; // 16th note timing

        if (!this.muted) {
            // =========================================================================
            // 🎵 10 DISTINCT FLOOR SOUNDTRACK GENERATOR ENGINES
            // =========================================================================
            switch (floor) {
                case 1: {
                    // FLOOR 1: "Synthwave Rookie Rush" - Catchy 80s arcade synth & four-on-floor
                    if (step % 4 === 0) this._playDrum('kick', now, 0.9);
                    if (step === 4 || step === 12) this._playDrum('snare', now, 0.8);
                    if (step % 2 === 1) this._playDrum('hihat', now, 0.7);

                    // Bassline: A Minor bouncing 80s bass
                    const bassSeq = [110.0, 110.0, 130.81, 146.83, 110.0, 164.81, 146.83, 130.81];
                    const bFreq = bassSeq[Math.floor(step / 2) % bassSeq.length];
                    if (step % 2 === 0) {
                        this._playTone(bFreq * 0.5, stepDuration * 1.5, now, 'sawtooth', 800 + Math.sin(this.currentStep * 0.2) * 300, 0.4);
                    }

                    // Catchy Lead Synth Melody
                    const leadMelody = [440.0, 523.25, 659.25, 587.33, 523.25, 440.0, 392.00, 523.25];
                    if (step % 2 === 0 && bar % 2 === 1) {
                        const lFreq = leadMelody[(Math.floor(this.currentStep / 2)) % leadMelody.length];
                        this._playTone(lFreq, stepDuration * 1.4, now, 'square', 2400, 0.35, 3.0);
                    }
                    break;
                }

                case 2: {
                    // FLOOR 2: "Cafeteria Slap Funk" - Groovy syncopated disco-funk with bouncy chords
                    if (step === 0 || step === 6 || step === 10) this._playDrum('kick', now, 0.95);
                    if (step === 4 || step === 12) this._playDrum('snare', now, 0.9);
                    if (step % 2 === 1 || step === 14) this._playDrum(step === 14 ? 'openhat' : 'hihat', now, 0.75);

                    // Slap Bass F# Minor
                    const funkBass = [92.5, 0, 92.5, 110.0, 0, 123.47, 92.5, 138.59];
                    const bassNote = funkBass[Math.floor(step / 2) % funkBass.length];
                    if (bassNote > 0 && step % 2 === 0) {
                        this._playTone(bassNote, stepDuration * 1.2, now, 'triangle', 1500, 0.5, 4.0);
                    }

                    // Funky organ stabs on upbeats
                    if (step === 2 || step === 6 || step === 10 || step === 14) {
                        this._playTone(370.0, stepDuration * 0.9, now, 'square', 1800, 0.25);
                        this._playTone(440.0, stepDuration * 0.9, now, 'square', 1800, 0.25);
                    }
                    break;
                }

                case 3: {
                    // FLOOR 3: "Dojang Master Heavy Rock" (BOSS 1) - Driving power chords & crash
                    if (step % 2 === 0 || step === 7 || step === 15) this._playDrum('heavy_kick', now, 1.1);
                    if (step === 4 || step === 12) this._playDrum('snare', now, 1.0);
                    if (step % 2 === 1 || step === 0) this._playDrum('hihat', now, 0.8);

                    // Power Chords (E minor heavy chug)
                    const rockRiff = [82.41, 82.41, 98.0, 82.41, 110.0, 98.0, 82.41, 123.47];
                    const rFreq = rockRiff[Math.floor(step / 2) % rockRiff.length];
                    this._playTone(rFreq, stepDuration * 1.4, now, 'sawtooth', 2200, 0.42, 3.5);
                    this._playTone(rFreq * 1.4983, stepDuration * 1.4, now, 'sawtooth', 2200, 0.35, 3.5); // 5th harmony

                    // Melodic Guitar Lick
                    if (bar % 2 === 1 && step % 2 === 0) {
                        const solo = [329.63, 392.00, 493.88, 440.0, 392.00, 329.63, 293.66, 329.63];
                        const sFreq = solo[(Math.floor(this.currentStep / 2)) % solo.length];
                        this._playTone(sFreq, stepDuration * 1.8, now, 'sawtooth', 3000, 0.38, 4.0);
                    }
                    break;
                }

                case 4: {
                    // FLOOR 4: "Student Council Neo-Tokyo Electro" - Cyber synth battle with pulse arps
                    if (step % 4 === 0 || step === 14) this._playDrum('kick', now, 0.9);
                    if (step === 4 || step === 12) this._playDrum('snare', now, 0.85);
                    this._playDrum('hihat', now, 0.6);

                    // 16th-note Rapid Cyber Arpeggio (D minor electro)
                    const arpNotes = [293.66, 349.23, 440.0, 587.33, 523.25, 440.0, 349.23, 293.66];
                    const arpFreq = arpNotes[step % arpNotes.length];
                    this._playTone(arpFreq, stepDuration * 0.9, now, 'square', 2500 + Math.sin(step * 0.7) * 900, 0.28, 2.5);

                    // Heavy Low Cyber Bass
                    if (step % 4 === 0) {
                        const bassRoots = [73.42, 73.42, 65.41, 87.31];
                        const bRoot = bassRoots[Math.floor(this.currentStep / 8) % bassRoots.length];
                        this._playTone(bRoot, stepDuration * 3.5, now, 'sawtooth', 900, 0.45, 3.0);
                    }
                    break;
                }

                case 5: {
                    // FLOOR 5: "Library Mystic Arpeggio" - Ambient, mysterious bells & floating pads
                    if (step === 0 || step === 8) this._playDrum('kick', now, 0.7);
                    if (step === 8) this._playDrum('snare', now, 0.6);
                    if (step % 4 === 2) this._playDrum('hihat', now, 0.45);

                    // Celestial Harmonic Minor Bell Arpeggio
                    const mysticNotes = [329.63, 392.00, 493.88, 587.33, 659.25, 783.99, 659.25, 493.88];
                    const mFreq = mysticNotes[step % mysticNotes.length];
                    this._playTone(mFreq, stepDuration * 2.5, now, 'sine', 3500, 0.35, 1.2);

                    // Deep Sub Bass Resonance
                    if (step === 0 || step === 8) {
                        this._playTone(82.41, stepDuration * 6.0, now, 'triangle', 400, 0.48, 1.0);
                    }
                    break;
                }

                case 6: {
                    // FLOOR 6: "Kendo Hall Samurai Metal" (BOSS 2) - Fast thrash metal & double-kick
                    const isDouble = (step % 2 === 0 || step === 3 || step === 7 || step === 11 || step === 15);
                    if (isDouble) this._playDrum('heavy_kick', now, 1.15);
                    if (step === 4 || step === 12) this._playDrum('snare', now, 1.05);
                    this._playDrum('hihat', now, 0.85);

                    // Fast Samurai Metal Riff (B minor speed gallop)
                    const samuraiRiff = [61.74, 61.74, 73.42, 61.74, 82.41, 73.42, 92.5, 61.74];
                    const sFreq = samuraiRiff[Math.floor(step / 2) % samuraiRiff.length];
                    this._playTone(sFreq, stepDuration * 1.3, now, 'sawtooth', 2600, 0.45, 4.0);
                    this._playTone(sFreq * 1.4983, stepDuration * 1.3, now, 'sawtooth', 2600, 0.38, 4.0);

                    // Screaming Lead Guitar Solo
                    if (step % 2 === 0) {
                        const soloNotes = [493.88, 587.33, 739.99, 659.25, 587.33, 493.88, 440.0, 587.33];
                        const solFreq = soloNotes[(Math.floor(this.currentStep / 2)) % soloNotes.length];
                        this._playTone(solFreq, stepDuration * 1.7, now, 'square', 3200, 0.36, 4.5);
                    }
                    break;
                }

                case 7: {
                    // FLOOR 7: "Science Lab Acid Industrial" - 303 Acid bassline squelch & electronic drive
                    if (step % 4 === 0 || step === 10) this._playDrum('kick', now, 0.95);
                    if (step === 4 || step === 12) this._playDrum('snare', now, 0.9);
                    if (step % 2 === 1) this._playDrum('hihat', now, 0.7);

                    // TB-303 Style Squelchy Acid Bass
                    const acidNotes = [65.41, 130.81, 73.42, 146.83, 65.41, 164.81, 146.83, 196.00];
                    const aFreq = acidNotes[step % acidNotes.length];
                    const resCutoff = 800 + Math.abs(Math.sin(this.currentStep * 0.45)) * 2800;
                    this._playTone(aFreq, stepDuration * 1.1, now, 'sawtooth', resCutoff, 0.45, 6.0);

                    // Industrial Cyber Blips
                    if (step % 4 === 2) {
                        this._playTone(523.25, stepDuration * 0.5, now, 'square', 4000, 0.22, 5.0);
                    }
                    break;
                }

                case 8: {
                    // FLOOR 8: "Infirmary Dark Tension Groove" - Deep pulsing darkwave synth & haunting melodies
                    if (step === 0 || step === 6 || step === 8 || step === 14) this._playDrum('kick', now, 0.9);
                    if (step === 4 || step === 12) this._playDrum('snare', now, 0.85);
                    if (step % 2 === 1) this._playDrum('hihat', now, 0.65);

                    // C# Minor Darkwave Pulse
                    const darkBass = [69.30, 69.30, 82.41, 69.30, 92.50, 82.41, 69.30, 103.83];
                    const dFreq = darkBass[Math.floor(step / 2) % darkBass.length];
                    this._playTone(dFreq, stepDuration * 1.4, now, 'triangle', 750, 0.5, 2.5);

                    // Haunting High Synth Line
                    if (step % 4 === 0) {
                        const melody = [554.37, 659.25, 739.99, 659.25];
                        const mFreq = melody[Math.floor(this.currentStep / 4) % melody.length];
                        this._playTone(mFreq, stepDuration * 3.5, now, 'sine', 1600, 0.35, 2.0);
                    }
                    break;
                }

                case 9: {
                    // FLOOR 9: "Staircase Speed Metal Climax" (BOSS 3) - Blistering speed, double pedal & frantic riffs
                    const isThrashKick = (step % 2 === 0 || step === 7 || step === 11 || step === 15);
                    if (isThrashKick) this._playDrum('heavy_kick', now, 1.2);
                    if (step === 4 || step === 12) this._playDrum('snare', now, 1.1);
                    this._playDrum('hihat', now, 0.9);

                    // A Minor High-Speed Metal Gallop
                    const speedRiff = [55.0, 55.0, 65.41, 55.0, 73.42, 65.41, 82.41, 98.0];
                    const spFreq = speedRiff[Math.floor(step / 2) % speedRiff.length];
                    this._playTone(spFreq, stepDuration * 1.2, now, 'sawtooth', 3000, 0.48, 4.0);
                    this._playTone(spFreq * 1.4983, stepDuration * 1.2, now, 'sawtooth', 3000, 0.4, 4.0);

                    // Frantic Shredding Arp
                    if (step % 2 === 0) {
                        const shred = [440.0, 523.25, 659.25, 880.0, 783.99, 659.25, 523.25, 440.0];
                        const shFreq = shred[(Math.floor(this.currentStep / 2)) % shred.length];
                        this._playTone(shFreq, stepDuration * 1.6, now, 'square', 3500, 0.38, 5.0);
                    }
                    break;
                }

                case 10: {
                    // FLOOR 10: "Lord Shin Rooftop Thunder Metal" (FINAL BOSS) - Extreme adrenaline rock symphony
                    // Continuous thundering double bass
                    this._playDrum('heavy_kick', now, 1.25);
                    if (step === 4 || step === 12) this._playDrum('snare', now, 1.2);
                    this._playDrum(step % 2 === 0 ? 'openhat' : 'hihat', now, 0.95);

                    // D-Minor Epic Final Boss Power Chords
                    const finalRiff = [73.42, 73.42, 87.31, 73.42, 98.00, 92.50, 73.42, 110.00];
                    const fFreq = finalRiff[Math.floor(step / 2) % finalRiff.length];
                    this._playTone(fFreq, stepDuration * 1.4, now, 'sawtooth', 3400, 0.52, 4.5);
                    this._playTone(fFreq * 1.4983, stepDuration * 1.4, now, 'sawtooth', 3400, 0.45, 4.5);

                    // Screaming Virtuoso Guitar Shredding
                    const finalLead = [587.33, 698.46, 880.00, 1046.50, 1174.66, 1046.50, 880.00, 698.46];
                    const leadF = finalLead[this.currentStep % finalLead.length];
                    this._playTone(leadF, stepDuration * 1.5, now, 'square', 4200, 0.42, 5.5);
                    break;
                }
            }
        }

        this.currentStep++;
        this.bgmTimer = setTimeout(() => this.scheduleBGMStep(), stepDuration * 1000);
    }
}

window.soundEngine = new SoundEngine();

