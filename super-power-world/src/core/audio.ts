// =========================================================
// 音频系统 (Web Audio API 程序化生成音效，无外部素材)
// =========================================================

type SfxKind = 'click' | 'merge' | 'gacha' | 'battle_hit' | 'battle_skill' | 'victory' | 'defeat' | 'levelup' | 'purchase' | 'coin';

class AudioSystem {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmTimer: number | null = null;
  public bgmEnabled = true;
  public sfxEnabled = true;
  public bgmVolume = 0.3;
  public sfxVolume = 0.6;

  private ensureCtx() {
    if (this.ctx) return;
    const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    this.ctx = ctx;
    const mg = ctx.createGain();
    mg.gain.value = 1;
    mg.connect(ctx.destination);
    this.masterGain = mg;
  }

  resume() {
    this.ensureCtx();
    this.ctx?.resume();
  }

  playSfx(kind: SfxKind) {
    if (!this.sfxEnabled) return;
    this.ensureCtx();
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const dur = this.durationOf(kind);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);
    gain.gain.value = this.sfxVolume;
    this.applyEnvelope(kind, gain, now, dur);
    this.applyWave(kind, osc);
    osc.start(now);
    osc.stop(now + dur);
  }

  private applyEnvelope(kind: SfxKind, gain: GainNode, now: number, dur: number) {
    const g = gain.gain;
    g.setValueAtTime(0, now);
    switch (kind) {
      case 'click':
        g.linearRampToValueAtTime(1, now + 0.005);
        g.exponentialRampToValueAtTime(0.001, now + 0.1);
        break;
      case 'merge':
        g.linearRampToValueAtTime(0.8, now + 0.02);
        g.exponentialRampToValueAtTime(0.001, now + dur);
        break;
      case 'gacha':
        g.linearRampToValueAtTime(0.7, now + 0.05);
        g.linearRampToValueAtTime(1, now + 0.2);
        g.exponentialRampToValueAtTime(0.001, now + dur);
        break;
      case 'battle_hit':
        g.linearRampToValueAtTime(1, now + 0.005);
        g.exponentialRampToValueAtTime(0.001, now + 0.15);
        break;
      case 'battle_skill':
        g.linearRampToValueAtTime(0.5, now + 0.05);
        g.linearRampToValueAtTime(1, now + 0.3);
        g.exponentialRampToValueAtTime(0.001, now + dur);
        break;
      case 'victory':
        g.linearRampToValueAtTime(0.6, now + 0.05);
        g.linearRampToValueAtTime(1, now + 0.4);
        g.linearRampToValueAtTime(0.8, now + 0.6);
        g.exponentialRampToValueAtTime(0.001, now + dur);
        break;
      case 'defeat':
        g.linearRampToValueAtTime(0.7, now + 0.05);
        g.exponentialRampToValueAtTime(0.001, now + dur);
        break;
      case 'levelup':
        g.linearRampToValueAtTime(0.4, now + 0.02);
        g.linearRampToValueAtTime(1, now + 0.1);
        g.linearRampToValueAtTime(0.6, now + 0.3);
        g.exponentialRampToValueAtTime(0.001, now + dur);
        break;
      case 'purchase':
        g.linearRampToValueAtTime(0.5, now + 0.02);
        g.linearRampToValueAtTime(0.9, now + 0.08);
        g.exponentialRampToValueAtTime(0.001, now + dur);
        break;
      case 'coin':
        g.linearRampToValueAtTime(0.6, now + 0.01);
        g.exponentialRampToValueAtTime(0.001, now + 0.2);
        break;
    }
  }

  private applyWave(kind: SfxKind, osc: OscillatorNode) {
    switch (kind) {
      case 'click':
        osc.type = 'square'; osc.frequency.setValueAtTime(900, osc.context.currentTime); break;
      case 'merge':
        osc.type = 'sine'; osc.frequency.setValueAtTime(440, osc.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, osc.context.currentTime + 0.2); break;
      case 'gacha':
        osc.type = 'triangle'; osc.frequency.setValueAtTime(220, osc.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, osc.context.currentTime + 0.5); break;
      case 'battle_hit':
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(220, osc.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(60, osc.context.currentTime + 0.15); break;
      case 'battle_skill':
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(120, osc.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(680, osc.context.currentTime + 0.4); break;
      case 'victory':
        osc.type = 'sine'; osc.frequency.setValueAtTime(523, osc.context.currentTime);
        osc.frequency.setValueAtTime(659, osc.context.currentTime + 0.15);
        osc.frequency.setValueAtTime(784, osc.context.currentTime + 0.3); break;
      case 'defeat':
        osc.type = 'sine'; osc.frequency.setValueAtTime(330, osc.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, osc.context.currentTime + 0.6); break;
      case 'levelup':
        osc.type = 'sine'; osc.frequency.setValueAtTime(440, osc.context.currentTime);
        osc.frequency.setValueAtTime(660, osc.context.currentTime + 0.1);
        osc.frequency.setValueAtTime(880, osc.context.currentTime + 0.2); break;
      case 'purchase':
        osc.type = 'triangle'; osc.frequency.setValueAtTime(660, osc.context.currentTime);
        osc.frequency.setValueAtTime(880, osc.context.currentTime + 0.08); break;
      case 'coin':
        osc.type = 'square'; osc.frequency.setValueAtTime(1200, osc.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, osc.context.currentTime + 0.15); break;
    }
  }

  private durationOf(kind: SfxKind): number {
    return ({
      click: 0.1, merge: 0.25, gacha: 0.7, battle_hit: 0.15, battle_skill: 0.5,
      victory: 0.7, defeat: 0.6, levelup: 0.4, purchase: 0.2, coin: 0.2,
    } as Record<SfxKind, number>)[kind];
  }

  startBgm() {
    if (!this.bgmEnabled) return;
    this.ensureCtx();
    if (!this.ctx || !this.masterGain) return;
    this.stopBgm();
    const ctx = this.ctx;
    const playNote = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(this.bgmVolume, start + 0.05);
      gain.gain.linearRampToValueAtTime(0, start + dur);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(start);
      osc.stop(start + dur + 0.05);
    };
    const melody = [261.6, 293.7, 329.6, 349.2, 392.0, 440.0, 493.9, 523.2];
    const bpm = 80;
    const beat = 60 / bpm;
    let t = ctx.currentTime;
    for (let bar = 0; bar < 8; bar++) {
      for (let i = 0; i < 4; i++) {
        const f = melody[Math.floor(Math.random() * melody.length)];
        playNote(f, t + i * beat, beat * 0.8);
      }
      t += beat * 4;
    }
    this.bgmTimer = window.setTimeout(() => this.startBgm(), (beat * 32) * 1000);
  }

  stopBgm() {
    if (this.bgmTimer) clearTimeout(this.bgmTimer);
    this.bgmTimer = null;
  }

  setBgm(enabled: boolean) {
    this.bgmEnabled = enabled;
    if (!enabled) this.stopBgm();
    else this.startBgm();
  }

  setSfx(enabled: boolean) {
    this.sfxEnabled = enabled;
  }
}

export const audio = new AudioSystem();