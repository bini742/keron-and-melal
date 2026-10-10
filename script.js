(() => {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const candleColors = ["#9d1015", "#9d1015", "#9d1015"];
  const candlesGroup = document.getElementById("candles");
  const microphone = document.getElementById("microphone");
  const buttonLabel = document.getElementById("button-label");
  const hint = document.getElementById("hint");
  const message = document.getElementById("message");
  const manualWish = document.getElementById("wish-button");
  const candleNodes = [];
  let finished = false;
  let animationStarted = false;
  let analyser, samples, audioContext, stream;
  let baseline = 0, calibrationTotal = 0, calibrationFrames = 0, sustainedBlow = 0, lastTime = 0;

  new URLSearchParams(window.location.search).get("name")?.trim().slice(0, 24) && (() => {
    document.getElementById("name").textContent = new URLSearchParams(window.location.search).get("name").trim().slice(0, 24);
  })();

  [56, 100, 144].forEach((x, index) => {
    const candle = document.createElementNS(NS, "g");
    candle.innerHTML = `<rect x="${x - 4}" y="65" width="8" height="38" rx="3" fill="${candleColors[index]}"/>
      <path class="flame on" d="M${x} 34 C${x + 10} 46 ${x + 7} 61 ${x} 61 C${x - 7} 61 ${x - 10} 46 ${x} 34Z" fill="#ffbb2f"/>
      <path class="smoke" d="M${x} 59q6 -10 0 -20q-6 -9 0 -18" fill="none" stroke="#fff8ee" stroke-width="2.5" stroke-linecap="round"/>`;
    candlesGroup.append(candle);
    candleNodes.push({ flame: candle.querySelector(".flame"), smoke: candle.querySelector(".smoke") });
  });

  const setLean = value => candleNodes.forEach(({ flame }) => flame.style.setProperty("--lean", value));

  function finishCelebration() {
    if (finished) return;
    finished = true;
    microphone.disabled = true;
    buttonLabel.textContent = "Wish granted!";
    manualWish.hidden = true;
    hint.textContent = "✨ Your wish is on its way.";
    stream?.getTracks().forEach(track => track.stop());
    audioContext?.close().catch(() => {});
    candleNodes.forEach(({ flame, smoke }, index) => setTimeout(() => {
      flame.classList.replace("on", "off");
      smoke.classList.remove("go");
      void smoke.getBoundingClientRect();
      smoke.classList.add("go");
    }, index * 120));
    setLean(0);
    setTimeout(() => { message.textContent = "Your wish is on its way. Happy birthday!"; launchConfetti(); }, 700);
    setTimeout(() => { window.location.href = `cards.html${window.location.search}`; }, 2200);
  }

  function listen(time) {
    if (!animationStarted || finished) return;
    requestAnimationFrame(listen);
    analyser.getByteTimeDomainData(samples);
    let total = 0;
    for (const sample of samples) { const value = (sample - 128) / 128; total += value * value; }
    const rms = Math.sqrt(total / samples.length);
    if (calibrationFrames < 40) {
      calibrationTotal += rms; calibrationFrames += 1; lastTime = time;
      if (calibrationFrames === 40) { baseline = calibrationTotal / calibrationFrames; hint.textContent = "Ready! A gentle blow toward your device will do it."; }
      return;
    }
    const level = Math.max(0, rms - baseline);
    setLean(Math.min(14, level * 180));
    const delta = Math.min(100, time - lastTime); lastTime = time;
    sustainedBlow = level > 0.025 ? sustainedBlow + delta : Math.max(0, sustainedBlow - delta * 2);
    if (sustainedBlow > 180) finishCelebration();
  }

  microphone.addEventListener("click", async () => {
    if (!navigator.mediaDevices?.getUserMedia) { hint.textContent = "Microphone access needs a modern browser and a secure page. Open this page through HTTPS or a local development server, then try again."; return; }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioContext();
      if (audioContext.state === "suspended") await audioContext.resume();
      analyser = audioContext.createAnalyser(); analyser.fftSize = 1024;
      samples = new Uint8Array(analyser.fftSize);
      audioContext.createMediaStreamSource(stream).connect(analyser);
      microphone.disabled = true; buttonLabel.textContent = "Microphone is on";
      hint.textContent = "Listening to the room for a moment…";
      calibrationTotal = 0; calibrationFrames = 0; lastTime = performance.now(); animationStarted = true;
      requestAnimationFrame(listen);
    } catch (_) { hint.textContent = "Microphone access was blocked. Allow it in browser settings, or use the celebration button below."; }
  });
  manualWish.addEventListener("click", finishCelebration);

  const canvas = document.getElementById("confetti");
  const context = canvas.getContext("2d");
  const particles = [];
  let running = false;
  function resizeCanvas() { const density = devicePixelRatio || 1; canvas.width = innerWidth * density; canvas.height = innerHeight * density; context.setTransform(density, 0, 0, density, 0, 0); }
  resizeCanvas(); addEventListener("resize", resizeCanvas);
  function launchConfetti() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const colors = ["#ca2e69", "#ffbd35", "#78ddc5", "#8caaff", "#fff8ee"];
    for (let i = 0; i < 150; i += 1) particles.push({ x: innerWidth / 2 + (Math.random() - .5) * 130, y: innerHeight * .5, vx: (Math.random() - .5) * 14, vy: -Math.random() * 14 - 4, width: 6 + Math.random() * 6, height: 4 + Math.random() * 5, rotation: Math.random() * 6, rotationSpeed: (Math.random() - .5) * .4, color: colors[i % colors.length] });
    if (!running) { running = true; requestAnimationFrame(drawConfetti); }
  }
  function drawConfetti() {
    context.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i]; p.vy += .28; p.vx *= .992; p.x += p.vx; p.y += p.vy; p.rotation += p.rotationSpeed;
      if (p.y > innerHeight + 30) { particles.splice(i, 1); continue; }
      context.save(); context.translate(p.x, p.y); context.rotate(p.rotation); context.fillStyle = p.color; context.fillRect(-p.width / 2, -p.height / 2, p.width, p.height); context.restore();
    }
    if (particles.length) requestAnimationFrame(drawConfetti); else { running = false; context.clearRect(0, 0, innerWidth, innerHeight); }
  }
})();
