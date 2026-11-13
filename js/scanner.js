// Hardware Barcode Scanner Listener & Audio Feedback
let buffer = '';
let lastKeyTime = 0;
const SCAN_TIMEOUT = 50; // Milliseconds threshold for keyboard wedge scanner
const MIN_BARCODE_LENGTH = 3;

// Web Audio API Synthesizer for instant tactile audio feedback
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSound(type = 'scan') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'scan') {
      // Crisp laser scanner beep
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'success') {
      // Pleasant rising transaction chime
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'error') {
      // Low alert buzz
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch (e) {
    // Audio context may require initial user click in some strict browsers
  }
}

export function initBarcodeScanner() {
  window.addEventListener('keydown', (e) => {
    // If target is an editable input or textarea and NOT explicitly marked as a barcode scanner receiver,
    // let user type normally UNLESS it's typed unnaturally fast (hardware scanner speed)
    const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable;
    const now = Date.now();
    const timeDiff = now - lastKeyTime;
    lastKeyTime = now;

    // Handle Enter key
    if (e.key === 'Enter') {
      if (buffer.length >= MIN_BARCODE_LENGTH) {
        const scannedCode = buffer.trim();
        buffer = '';
        dispatchBarcode(scannedCode);
      } else {
        buffer = '';
      }
      return;
    }

    // Ignore modifier keys
    if (e.key.length > 1) {
      return;
    }

    // Check keystroke timing
    if (timeDiff > 120 && buffer.length > 0) {
      // Reset buffer if delay too long (manual human typing)
      buffer = '';
    }

    buffer += e.key;

    // Auto-clear buffer if user paused
    setTimeout(() => {
      if (Date.now() - lastKeyTime >= 150) {
        buffer = '';
      }
    }, 160);
  });
}

function dispatchBarcode(code) {
  playSound('scan');
  console.log("Barcode hardware scan detected:", code);
  window.dispatchEvent(new CustomEvent('barcode-scanned', { detail: { barcode: code } }));
}
