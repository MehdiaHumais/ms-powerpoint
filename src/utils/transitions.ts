import type { Transition } from "@/stores/presentationStore";

export type TransitionGroup =
  | "None"
  | "Subtle"
  | "Exciting"
  | "Dynamic Content";

export type TransitionDef = {
  id: Transition;
  name: string;
  group: TransitionGroup;
  /** Office-style star rating 1-4. */
  stars: number;
};

export const TRANSITION_LIST: TransitionDef[] = [
  { id: "none", name: "None", group: "None", stars: 0 },
  { id: "fade", name: "Fade", group: "Subtle", stars: 2 },
  { id: "wipe", name: "Wipe", group: "Subtle", stars: 1 },
  { id: "split", name: "Split", group: "Subtle", stars: 1 },
  { id: "reveal", name: "Reveal", group: "Subtle", stars: 2 },
  { id: "cut", name: "Cut", group: "Subtle", stars: 1 },
  { id: "randomBars", name: "Random Bars", group: "Subtle", stars: 2 },
  { id: "shape", name: "Shape", group: "Subtle", stars: 1 },
  { id: "uncover", name: "Uncover", group: "Subtle", stars: 1 },
  { id: "cover", name: "Cover", group: "Subtle", stars: 1 },
  { id: "flash", name: "Flash", group: "Subtle", stars: 1 },
  { id: "dissolve", name: "Dissolve", group: "Exciting", stars: 2 },
  { id: "prestige", name: "Prestige", group: "Exciting", stars: 3 },
  { id: "glitter", name: "Glitter", group: "Exciting", stars: 4 },
  { id: "honeycomb", name: "Honeycomb", group: "Exciting", stars: 4 },
  { id: "vortex", name: "Vortex", group: "Exciting", stars: 4 },
  { id: "ripple", name: "Ripple", group: "Exciting", stars: 3 },
  { id: "ferris", name: "Ferris", group: "Exciting", stars: 3 },
  { id: "gallery", name: "Gallery", group: "Exciting", stars: 3 },
  { id: "conveyor", name: "Conveyor", group: "Exciting", stars: 3 },
  { id: "pan", name: "Pan", group: "Exciting", stars: 2 },
  { id: "doors", name: "Doors", group: "Exciting", stars: 3 },
  { id: "window", name: "Window", group: "Exciting", stars: 3 },
  { id: "wind", name: "Wind", group: "Exciting", stars: 2 },
  { id: "airplane", name: "Airplane", group: "Exciting", stars: 2 },
  { id: "pageCurl", name: "Page Curl", group: "Exciting", stars: 3 },
  { id: "wheelReverse", name: "Wheel Reverse", group: "Exciting", stars: 3 },
  { id: "shred", name: "Shred", group: "Exciting", stars: 2 },
  { id: "switch", name: "Switch", group: "Exciting", stars: 2 },
  { id: "flip", name: "Flip", group: "Exciting", stars: 3 },
  { id: "cube", name: "Cube", group: "Dynamic Content", stars: 4 },
  { id: "box", name: "Box", group: "Dynamic Content", stars: 3 },
  { id: "rotate", name: "Rotate", group: "Dynamic Content", stars: 3 },
  { id: "orbit", name: "Orbit", group: "Dynamic Content", stars: 4 },
  { id: "zoom", name: "Zoom", group: "Dynamic Content", stars: 2 },
  { id: "random", name: "Random", group: "Dynamic Content", stars: 4 },
];

export const TRANSITION_BY_ID: Record<string, TransitionDef> = Object.fromEntries(
  TRANSITION_LIST.map((t) => [t.id, t])
);

export function transitionName(id: string): string {
  return TRANSITION_BY_ID[id]?.name ?? "None";
}

export type SoundDef = {
  id: string;
  label: string;
  /** True when a real bundled audio asset exists; applause is synthesized/no-op. */
  bundled: boolean;
};

export const SOUND_LIST: SoundDef[] = [
  { id: "", label: "No Sound", bundled: true },
  { id: "chime", label: "Chime", bundled: true },
  { id: "whoosh", label: "Whoosh", bundled: true },
  { id: "swell", label: "Swell", bundled: true },
  { id: "applause", label: "Applause", bundled: true },
];

type ToneSpec = {
  partials?: { freq: number; dur: number; gain: number; type: OscillatorType; delay?: number }[];
  noise?: {
    dur: number;
    gain: number;
    from: number;
    to: number;
    type?: BiquadFilterType;
    q?: number;
    /** Amplitude-modulation rate (Hz) to build clap-like bursts, e.g. applause. */
    flutter?: number;
  };
};

const SOUND_SPECS: Record<string, ToneSpec> = {
  chime: {
    partials: [
      { freq: 880, dur: 0.7, gain: 0.16, type: "sine" },
      { freq: 1320, dur: 0.55, gain: 0.08, type: "sine", delay: 0.04 },
      { freq: 1760, dur: 0.4, gain: 0.05, type: "sine", delay: 0.08 },
    ],
  },
  whoosh: {
    noise: { dur: 0.55, gain: 0.16, from: 300, to: 3200 },
  },
  swell: {
    partials: [
      { freq: 196, dur: 1.0, gain: 0.1, type: "triangle" },
      { freq: 294, dur: 0.9, gain: 0.07, type: "sine", delay: 0.12 },
      { freq: 392, dur: 0.8, gain: 0.06, type: "sine", delay: 0.26 },
    ],
  },
  applause: {
    noise: { dur: 1.6, gain: 0.22, from: 2400, to: 900, type: "bandpass", q: 0.7, flutter: 11 },
  },
};

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor: typeof AudioContext | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    const ctx = new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Plays one of the bundled transition sounds by id so picking a sound previews it. */
export function playSoundCue(id: string): boolean {
  if (!id) return false;
  const spec = SOUND_SPECS[id];
  if (!spec) return false;
  const ctx = getAudioContext();
  if (!ctx) return false;
  try {
    let longest = 0.25;
    for (const p of spec.partials ?? []) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = p.type;
      const t0 = ctx.currentTime + (p.delay ?? 0);
      osc.frequency.setValueAtTime(p.freq, t0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(p.gain, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + p.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + p.dur + 0.02);
      longest = Math.max(longest, (p.delay ?? 0) + p.dur);
    }
    if (spec.noise) {
      const n = spec.noise;
      const frames = Math.ceil(ctx.sampleRate * n.dur);
      const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const filt = ctx.createBiquadFilter();
      filt.type = n.type ?? "bandpass";
      filt.Q.value = n.q ?? 1.1;
      filt.frequency.setValueAtTime(n.from, ctx.currentTime);
      filt.frequency.exponentialRampToValueAtTime(n.to, ctx.currentTime + n.dur);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(n.gain, ctx.currentTime + n.dur * 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + n.dur);
      src.connect(filt);
      filt.connect(gain);
      gain.connect(ctx.destination);
      src.start();
      if (n.flutter) {
        // Amplitude modulation turns steady noise into a clap-like texture.
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = "sine";
        lfo.frequency.setValueAtTime(n.flutter, ctx.currentTime);
        lfoGain.gain.setValueAtTime(n.gain * 0.55, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        lfo.start();
        lfo.stop(ctx.currentTime + n.dur);
      }
      longest = Math.max(longest, n.dur);
    }
    window.setTimeout(() => void ctx.close(), (longest + 0.25) * 1000);
    return true;
  } catch {
    return false;
  }
}

/** Sound that plays during a transition, honoring the slide's chosen sound. */
export function playTransitionSound(id: string, soundId?: string): void {
  const def = TRANSITION_BY_ID[id];
  if (!def) return;
  if (soundId) {
    if (playSoundCue(soundId)) return;
  }
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = def.group === "Dynamic Content" ? "sawtooth" : def.group === "Exciting" ? "triangle" : "sine";
    const base = def.group === "Dynamic Content" ? 520 : def.group === "Exciting" ? 400 : 300;
    osc.frequency.setValueAtTime(base, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(base * 2.4, ctx.currentTime + 0.22);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.14, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.42);
    window.setTimeout(() => void ctx.close(), 700);
  } catch {
    /* audio unavailable */
  }
}
