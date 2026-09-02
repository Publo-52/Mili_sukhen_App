// Generate beautiful, high-quality romantic piano & strings audio tracks in WAV format
const fs = require('fs');
const path = require('path');

function createWavBuffer(sampleRate, durationSeconds, generateSample) {
  const numChannels = 2;
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const totalSamples = Math.floor(sampleRate * durationSeconds);
  const dataSize = totalSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk size
  buffer.writeUInt16LE(1, 20);  // audio format (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // bits per sample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const [left, right] = generateSample(t, i, totalSamples);

    // Clamp -1 to 1
    const clampedL = Math.max(-1, Math.min(1, left));
    const clampedR = Math.max(-1, Math.min(1, right));

    const sample16L = Math.floor(clampedL * 32767);
    const sample16R = Math.floor(clampedR * 32767);

    buffer.writeInt16LE(sample16L, offset);
    buffer.writeInt16LE(sample16R, offset + 2);
    offset += 4;
  }

  return buffer;
}

const sampleRate = 44100;
const outputDir = path.join(__dirname, '..', 'public', 'audio');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Romantic Special Melody (Suksharmi Melody)
// Romantic piano notes: C4, E4, G4, B4, C5, D5, E5 with lush warm chord pad and soft reverb
console.log('Generating Suksharmi Special Melody...');
const suksharmiDuration = 45; // 45 seconds loop
const melodyNotes = [
  { time: 0.0, freq: 261.63, dur: 4.0 }, // C4
  { time: 0.8, freq: 329.63, dur: 3.5 }, // E4
  { time: 1.6, freq: 392.00, dur: 3.0 }, // G4
  { time: 2.4, freq: 493.88, dur: 2.5 }, // B4
  { time: 3.2, freq: 523.25, dur: 4.0 }, // C5
  { time: 4.5, freq: 587.33, dur: 3.0 }, // D5
  { time: 5.5, freq: 659.25, dur: 4.0 }, // E5
  { time: 7.0, freq: 523.25, dur: 3.0 }, // C5
  { time: 8.5, freq: 440.00, dur: 4.0 }, // A4
  { time: 10.0, freq: 392.00, dur: 4.0 }, // G4
  { time: 12.0, freq: 349.23, dur: 4.0 }, // F4
  { time: 14.0, freq: 392.00, dur: 4.0 }, // G4
  { time: 16.0, freq: 440.00, dur: 4.0 }, // A4
  { time: 18.0, freq: 493.88, dur: 4.0 }, // B4
  { time: 20.0, freq: 523.25, dur: 5.0 }, // C5
  { time: 23.0, freq: 659.25, dur: 4.0 }, // E5
  { time: 26.0, freq: 587.33, dur: 4.0 }, // D5
  { time: 29.0, freq: 523.25, dur: 5.0 }, // C5
  { time: 32.0, freq: 440.00, dur: 4.0 }, // A4
  { time: 35.0, freq: 392.00, dur: 4.0 }, // G4
  { time: 38.0, freq: 329.63, dur: 5.0 }, // E4
  { time: 41.0, freq: 261.63, dur: 4.0 }, // C4
];

const suksharmiBuf = createWavBuffer(sampleRate, suksharmiDuration, (t) => {
  let left = 0;
  let right = 0;

  // Background warm pad chords
  const chordT = (t % 16) / 4;
  const chordIdx = Math.floor(t / 8) % 4;
  const padChords = [
    [261.63, 329.63, 392.0, 523.25], // C
    [220.00, 261.63, 329.63, 440.00], // Am
    [174.61, 220.00, 261.63, 349.23], // F
    [196.00, 246.94, 293.66, 392.00], // G
  ];
  const activePad = padChords[chordIdx];
  for (let i = 0; i < activePad.length; i++) {
    const f = activePad[i];
    const padGain = 0.04 * (1 + 0.15 * Math.sin(2 * Math.PI * 0.25 * t + i));
    const padOsc = Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2 * t);
    left += padGain * padOsc * (0.8 - i * 0.1);
    right += padGain * padOsc * (0.5 + i * 0.1);
  }

  // Piano melody notes
  for (const n of melodyNotes) {
    if (t >= n.time && t < n.time + n.dur) {
      const dt = t - n.time;
      const env = Math.exp(-2.2 * dt) * (1 - Math.exp(-40 * dt));
      // Rich piano harmonic series
      const f = n.freq;
      const piano =
        Math.sin(2 * Math.PI * f * dt) +
        0.55 * Math.sin(2 * Math.PI * f * 2 * dt) * Math.exp(-3.0 * dt) +
        0.28 * Math.sin(2 * Math.PI * f * 3 * dt) * Math.exp(-4.5 * dt) +
        0.12 * Math.sin(2 * Math.PI * f * 4 * dt) * Math.exp(-6.0 * dt) +
        0.05 * Math.sin(2 * Math.PI * f * 5 * dt) * Math.exp(-7.5 * dt);

      const pan = 0.5 + 0.25 * Math.sin(f);
      left += 0.22 * env * piano * (1 - pan);
      right += 0.22 * env * piano * pan;
    }
  }

  return [left, right];
});
fs.writeFileSync(path.join(outputDir, 'suksharmi-melody.wav'), suksharmiBuf);

// 2. Clair de Lune - Claude Debussy (Soft Romantic Piano)
console.log('Generating Clair de Lune...');
const debussyNotes = [
  { time: 0.0, freq: 415.30, dur: 4.0 }, // G#4
  { time: 1.0, freq: 466.16, dur: 3.5 }, // A#4
  { time: 2.2, freq: 554.37, dur: 4.5 }, // C#5
  { time: 4.5, freq: 523.25, dur: 3.0 }, // C5
  { time: 6.0, freq: 466.16, dur: 4.0 }, // A#4
  { time: 8.0, freq: 415.30, dur: 4.5 }, // G#4
  { time: 10.5, freq: 369.99, dur: 4.0 }, // F#4
  { time: 13.0, freq: 329.63, dur: 4.5 }, // E4
  { time: 16.0, freq: 415.30, dur: 4.0 }, // G#4
  { time: 18.5, freq: 466.16, dur: 4.0 }, // A#4
  { time: 21.0, freq: 554.37, dur: 5.0 }, // C#5
  { time: 24.5, freq: 622.25, dur: 4.0 }, // D#5
  { time: 27.0, freq: 554.37, dur: 5.0 }, // C#5
  { time: 30.5, freq: 466.16, dur: 4.5 }, // A#4
  { time: 33.5, freq: 415.30, dur: 6.0 }, // G#4
];
const debussyBuf = createWavBuffer(sampleRate, 38, (t) => {
  let left = 0, right = 0;
  // Deep warm bass notes
  const bassFreq = t < 16 ? 138.59 : 110.0; // C#3 / A2
  const bassEnv = 0.06 * (1 + 0.1 * Math.sin(2 * Math.PI * 0.2 * t));
  const bass = (Math.sin(2 * Math.PI * bassFreq * t) + 0.4 * Math.sin(2 * Math.PI * bassFreq * 2 * t)) * bassEnv;
  left += bass;
  right += bass;

  for (const n of debussyNotes) {
    if (t >= n.time && t < n.time + n.dur) {
      const dt = t - n.time;
      const env = Math.exp(-1.8 * dt) * (1 - Math.exp(-35 * dt));
      const f = n.freq;
      const sound =
        Math.sin(2 * Math.PI * f * dt) +
        0.45 * Math.sin(2 * Math.PI * f * 2 * dt) * Math.exp(-2.5 * dt) +
        0.2 * Math.sin(2 * Math.PI * f * 3 * dt) * Math.exp(-4.0 * dt);
      left += 0.24 * env * sound * 0.6;
      right += 0.24 * env * sound * 0.4;
    }
  }
  return [left, right];
});
fs.writeFileSync(path.join(outputDir, 'clair-de-lune.wav'), debussyBuf);

// 3. Gymnopédie No. 1 - Erik Satie
console.log('Generating Gymnopedie No. 1...');
const satieNotes = [
  { time: 0.0, freq: 293.66, dur: 3.5 }, // D4
  { time: 2.0, freq: 329.63, dur: 3.5 }, // E4
  { time: 4.0, freq: 369.99, dur: 4.5 }, // F#4
  { time: 7.0, freq: 440.00, dur: 5.0 }, // A4
  { time: 10.5, freq: 369.99, dur: 4.0 }, // F#4
  { time: 13.0, freq: 329.63, dur: 4.0 }, // E4
  { time: 16.0, freq: 293.66, dur: 5.0 }, // D4
  { time: 20.0, freq: 246.94, dur: 4.5 }, // B3
  { time: 23.5, freq: 293.66, dur: 4.5 }, // D4
  { time: 27.0, freq: 369.99, dur: 6.0 }, // F#4
];
const satieBuf = createWavBuffer(sampleRate, 32, (t) => {
  let left = 0, right = 0;
  // Satie alternating Gmaj7 & Dmaj7 waltz bass
  const beat = (t % 3.0);
  const chord = Math.floor(t / 6.0) % 2 === 0 ? 196.0 : 146.83; // G3 vs D3
  const bassPulse = Math.exp(-3.0 * beat) * 0.08 * (Math.sin(2 * Math.PI * chord * beat) + 0.3 * Math.sin(2 * Math.PI * chord * 2 * beat));
  left += bassPulse * 0.6;
  right += bassPulse * 0.4;

  for (const n of satieNotes) {
    if (t >= n.time && t < n.time + n.dur) {
      const dt = t - n.time;
      const env = Math.exp(-1.5 * dt) * (1 - Math.exp(-30 * dt));
      const f = n.freq;
      const s = Math.sin(2 * Math.PI * f * dt) + 0.35 * Math.sin(2 * Math.PI * f * 2 * dt);
      left += 0.22 * env * s * 0.5;
      right += 0.22 * env * s * 0.5;
    }
  }
  return [left, right];
});
fs.writeFileSync(path.join(outputDir, 'gymnopedie-no1.wav'), satieBuf);

// 4. Canon in D - Johann Pachelbel
console.log('Generating Canon in D...');
const canonNotes = [
  { time: 0.0, freq: 587.33, dur: 2.5 }, // D5
  { time: 1.5, freq: 554.37, dur: 2.5 }, // C#5
  { time: 3.0, freq: 493.88, dur: 2.5 }, // B4
  { time: 4.5, freq: 440.00, dur: 2.5 }, // A4
  { time: 6.0, freq: 392.00, dur: 2.5 }, // G4
  { time: 7.5, freq: 369.99, dur: 2.5 }, // F#4
  { time: 9.0, freq: 392.00, dur: 2.5 }, // G4
  { time: 10.5, freq: 440.00, dur: 2.5 }, // A4
  { time: 12.0, freq: 587.33, dur: 2.0 }, // D5
  { time: 13.5, freq: 659.25, dur: 2.0 }, // E5
  { time: 15.0, freq: 739.99, dur: 3.0 }, // F#5
  { time: 17.5, freq: 587.33, dur: 2.5 }, // D5
  { time: 19.5, freq: 659.25, dur: 2.5 }, // E5
  { time: 21.5, freq: 739.99, dur: 3.0 }, // F#5
  { time: 24.0, freq: 587.33, dur: 4.0 }, // D5
];
const canonBuf = createWavBuffer(sampleRate, 28, (t) => {
  let left = 0, right = 0;
  // Ground bass D - A - Bm - F#m - G - D - G - A
  const bassT = (t % 16) / 2;
  const bIdx = Math.floor(bassT);
  const bassSeq = [146.83, 110.0, 123.47, 92.5, 98.0, 146.83, 98.0, 110.0];
  const bFreq = bassSeq[bIdx] || 146.83;
  const bEnv = 0.06 * (1 + 0.1 * Math.sin(2 * Math.PI * 0.5 * t));
  const bSound = Math.sin(2 * Math.PI * bFreq * t) + 0.35 * Math.sin(2 * Math.PI * bFreq * 2 * t);
  left += bEnv * bSound;
  right += bEnv * bSound;

  for (const n of canonNotes) {
    if (t >= n.time && t < n.time + n.dur) {
      const dt = t - n.time;
      const env = Math.exp(-2.0 * dt) * (1 - Math.exp(-40 * dt));
      const f = n.freq;
      const s = Math.sin(2 * Math.PI * f * dt) + 0.4 * Math.sin(2 * Math.PI * f * 2 * dt);
      left += 0.22 * env * s * 0.45;
      right += 0.22 * env * s * 0.55;
    }
  }
  return [left, right];
});
fs.writeFileSync(path.join(outputDir, 'canon-in-d.wav'), canonBuf);

// 5. Für Elise - Ludwig van Beethoven
console.log('Generating Für Elise...');
const furEliseNotes = [
  { time: 0.0, freq: 659.25, dur: 0.8 }, // E5
  { time: 0.4, freq: 622.25, dur: 0.8 }, // D#5
  { time: 0.8, freq: 659.25, dur: 0.8 }, // E5
  { time: 1.2, freq: 622.25, dur: 0.8 }, // D#5
  { time: 1.6, freq: 659.25, dur: 0.8 }, // E5
  { time: 2.0, freq: 493.88, dur: 0.8 }, // B4
  { time: 2.4, freq: 587.33, dur: 0.8 }, // D5
  { time: 2.8, freq: 523.25, dur: 0.8 }, // C5
  { time: 3.2, freq: 440.00, dur: 2.2 }, // A4
  { time: 5.0, freq: 261.63, dur: 0.8 }, // C4
  { time: 5.4, freq: 329.63, dur: 0.8 }, // E4
  { time: 5.8, freq: 440.00, dur: 0.8 }, // A4
  { time: 6.2, freq: 493.88, dur: 2.2 }, // B4
  { time: 8.0, freq: 329.63, dur: 0.8 }, // E4
  { time: 8.4, freq: 415.30, dur: 0.8 }, // G#4
  { time: 8.8, freq: 493.88, dur: 0.8 }, // B4
  { time: 9.2, freq: 523.25, dur: 2.2 }, // C5
  { time: 11.0, freq: 329.63, dur: 0.8 }, // E4
  { time: 11.4, freq: 659.25, dur: 0.8 }, // E5
  { time: 11.8, freq: 622.25, dur: 0.8 }, // D#5
  { time: 12.2, freq: 659.25, dur: 0.8 }, // E5
  { time: 12.6, freq: 622.25, dur: 0.8 }, // D#5
  { time: 13.0, freq: 659.25, dur: 0.8 }, // E5
  { time: 13.4, freq: 493.88, dur: 0.8 }, // B4
  { time: 13.8, freq: 587.33, dur: 0.8 }, // D5
  { time: 14.2, freq: 523.25, dur: 0.8 }, // C5
  { time: 14.6, freq: 440.00, dur: 3.0 }, // A4
];
const furEliseBuf = createWavBuffer(sampleRate, 18, (t) => {
  let left = 0, right = 0;
  for (const n of furEliseNotes) {
    if (t >= n.time && t < n.time + n.dur) {
      const dt = t - n.time;
      const env = Math.exp(-2.5 * dt) * (1 - Math.exp(-40 * dt));
      const f = n.freq;
      const s = Math.sin(2 * Math.PI * f * dt) + 0.45 * Math.sin(2 * Math.PI * f * 2 * dt);
      left += 0.24 * env * s * 0.55;
      right += 0.24 * env * s * 0.45;
    }
  }
  return [left, right];
});
fs.writeFileSync(path.join(outputDir, 'fur-elise.wav'), furEliseBuf);

console.log('All 5 romantic WAV audio tracks successfully generated in public/audio/!');
