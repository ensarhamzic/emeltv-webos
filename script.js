const video = document.getElementById("video");
const playPauseBtn = document.getElementById("playPauseBtn");
const startOverlay = document.getElementById("startOverlay");
const startBtn = document.getElementById("startBtn");
const controls = document.querySelector(".controls");
const videoSrc = "https://emelplayout.ddnsguru.com/live/tv_emel_test101.m3u8";

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
        .then(showControls)
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
        .then(showControls)
        .catch((err) => {
          console.error("Autoplay error:", err);
        });
    });
  }

  startOverlay.style.display = "none";
});

function showControls() {
  controls.classList.add("show");
  playPauseBtn.textContent = "Pause";
}

playPauseBtn.addEventListener("click", () => {
  if (video.paused) {
    video.play();
    playPauseBtn.textContent = "Pause";
  } else {
    video.pause();
    playPauseBtn.textContent = "Play";
  }
});

muteBtn.addEventListener("click", () => {
  video.muted = !video.muted;
});

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

    case 13: // Enter/OK button
      event.preventDefault();
      togglePlayPause();
      break;
  }
});

// Function za toggle play/pause (izvuci logiku iz event listener-a)
function togglePlayPause() {
  if (!video.src && !hls) return; // Ne radi ništa ako video nije učitan

  if (video.paused) {
    video.play();
    playPauseBtn.textContent = "Pause";
    console.log("Playing via remote");
  } else {
    video.pause();
    playPauseBtn.textContent = "Play";
    console.log("Paused via remote");
  }
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
