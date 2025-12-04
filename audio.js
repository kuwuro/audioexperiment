let audioContext;
let source, filter, convolver, gainNode;

async function loadBuffer(url) {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return audioContext.decodeAudioData(buf);
}

async function initAudio() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();

  const audioBuffer = await loadBuffer("capaodacanoa.mp3");
  const irBuffer = await loadBuffer("Rays.wav");

  source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.loop = true;

  filter = audioContext.createBiquadFilter();
  filter.type = "lowpass";

  convolver = audioContext.createConvolver();
  convolver.buffer = irBuffer;

  gainNode = audioContext.createGain();

  source.connect(filter);
  filter.connect(convolver);
  convolver.connect(gainNode);
  gainNode.connect(audioContext.destination);

  source.start(0);

  filter.frequency.value = 20000;
  gainNode.gain.value = 1;
}

// Wait for a user gesture before starting audio
document.getElementById("start").addEventListener("click", async () => {
  if (!audioContext) await initAudio();
  await audioContext.resume();
  document.getElementById("start").style.display = "none";
});

// Scroll → audio effects
window.addEventListener("scroll", () => {
  if (!audioContext) return;

  const maxScroll = document.body.scrollHeight - innerHeight;
  const t = window.scrollY / maxScroll;

  const minFreq = 600;
  const maxFreq = 20000;
  filter.frequency.value = maxFreq - t * (maxFreq - minFreq);

  gainNode.gain.value = 1 - t * 0.3;
});
