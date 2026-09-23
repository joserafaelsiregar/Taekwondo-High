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

    // Background synth music loop (Adrenaline beat for school martial arts battle)
    startBGM() {
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
        
        const bpm = 128;
        const stepDuration = 60 / bpm / 2; // 16th notes
        const now = this.ctx.currentTime;

        if (!this.muted) {
            const step = this.currentStep % 16;
            
            // Bass Kick on 0, 4, 8, 12
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

            // Snare / Clap on 4, 12
            if (step === 4 || step === 12) {
                const snareFilter = this.ctx.createBiquadFilter();
                snareFilter.type = 'highpass';
                snareFilter.frequency.setValueAtTime(1000, now);
                
                const bufferSize = this.ctx.sampleRate * 0.1;
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

            // High hat on every odd step
            if (step % 2 === 1) {
                const hatFilter = this.ctx.createBiquadFilter();
                hatFilter.type = 'bandpass';
                hatFilter.frequency.setValueAtTime(8000, now);

                const bufferSize = this.ctx.sampleRate * 0.03;
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

            // Synth Bassline / Arp
            const bassNotes = [55, 55, 65.4, 73.4, 55, 82.4, 73.4, 65.4]; // A minor pentatonic vibes
            const currentFreq = bassNotes[Math.floor(this.currentStep / 2) % bassNotes.length];
            if (step % 2 === 0) {
                const synth = this.ctx.createOscillator();
                const synthGain = this.ctx.createGain();
                synth.type = 'sawtooth';
                synth.frequency.setValueAtTime(currentFreq, now);

                synthGain.gain.setValueAtTime(0.12 * this.bgmVolume * this.masterVolume, now);
                synthGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.5);

                const synthFilter = this.ctx.createBiquadFilter();
                synthFilter.type = 'lowpass';
                synthFilter.frequency.setValueAtTime(600 + Math.sin(this.currentStep * 0.4) * 350, now);

                synth.connect(synthFilter);
                synthFilter.connect(synthGain);
                synthGain.connect(this.ctx.destination);
                synth.start(now);
                synth.stop(now + stepDuration * 1.6);
            }
        }

        this.currentStep++;
        this.bgmTimer = setTimeout(() => this.scheduleBGMStep(), stepDuration * 1000);
    }
}

window.soundEngine = new SoundEngine();
