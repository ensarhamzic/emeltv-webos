const video = document.getElementById("video");
const playPauseBtn = document.getElementById("playPauseBtn");
const startOverlay = document.getElementById("startOverlay");
const startBtn = document.getElementById("startBtn");
const controls = document.querySelector(".controls");
const videoSrc = "https://emelplayout.ddnsguru.com/live/tv_emel_test101.m3u8";

const pauseText = "|| Pause";
const playText = "▶ Play";

let hls;

startBtn.addEventListener("click", () => {
  if (Hls.isSupported()) {
    hls = new Hls();
    hls.loadSource(videoSrc);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.muted = false;
      video
        .play()
        .then(setupControls)
        .catch((err) => {
          console.error("Autoplay error:", err);
        });
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = videoSrc;
    video.addEventListener("loadedmetadata", () => {
      video.muted = false;
      video
        .play()
        .then(setupControls)
        .catch((err) => {
          console.error("Autoplay error:", err);
        });
    });
  }

  startOverlay.style.display = "none";
});

function setupControls() {
  video.pause();
  video.play();
  controls.classList.remove("show");
  playPauseBtn.textContent = pauseText;
}

// WebOS Media Key Handler
document.addEventListener("keydown", function (event) {
  console.log("Key pressed:", event.keyCode, event.key);

  switch (event.keyCode) {
    case 415: // Play button
    case 19: // Pause button
    case 32: // Space bar (backup)
      event.preventDefault();
      togglePlayPause();
      break;

    case 461: // Back button
      event.preventDefault();
      // Optional: možeš dodati funkcionalnost za Back dugme
      break;

    case 13: // OK/Enter
      event.preventDefault();
      if (startOverlay.style.display !== "none") {
        // Ako je overlay prisutan, pokreni stream
        startBtn.click();
      } else if (controls.classList.contains("show")) {
        togglePlayPause(); // ako su kontrole već vidljive, izvrši toggle
      } else {
        showControlsTemporarily(); // inače samo pokaži kontrole
      }
      break;
  }
});

// Function za toggle play/pause (izvuci logiku iz event listener-a)
function togglePlayPause() {
  if (!video.src && !hls) return;

  console.log("Video is playing:", !video.paused);

  if (video.paused) {
    video.play();
    console.log("Playing via remote");
  } else {
    video.pause();
    console.log("Paused via remote");
  }

  showControlsTemporarily();
}

// Takođe refaktorisi postojeći button event listener
playPauseBtn.addEventListener("click", togglePlayPause);

// WebOS specific - registruj media keys
if (typeof webOSSystem !== "undefined") {
  try {
    // Registruj potrebne media keys
    webOSSystem.keyboard.isShowing = false;
  } catch (e) {
    console.log("webOSSystem not available:", e);
  }
}

let controlsTimeout;

function showControlsTemporarily() {
  controls.classList.add("show");
  playPauseBtn.textContent = video.paused ? playText : pauseText;

  clearTimeout(controlsTimeout);
  controlsTimeout = setTimeout(() => {
    controls.classList.remove("show");
  }, 3000); // Sakrij nakon 3 sekunde
}
