const video = document.getElementById("video");
const playPauseBtn = document.getElementById("playPauseBtn");
const startOverlay = document.getElementById("startOverlay");
const startBtn = document.getElementById("startBtn");
const controls = document.querySelector(".controls");

const pauseText = "|| Pause";
const playText = "▶ Play";

let hls;

startBtn.addEventListener("click", () => {
  startStream();
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
    case 404: // Green button
      event.preventDefault();
      refreshStream();
      break;

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

function startStream() {
  console.log("Fetching stream URL from local backend…");

  fetch("http://localhost:3000/stream-url")
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Stream URL fetch failed: ${res.status} ${text}`);
      }
      return res.json();
    })
    .then((data) => {
      const hlsUrl = data.stream_url;
      console.log("Received stream URL:", hlsUrl);
      playStream(hlsUrl);
    })
    .catch((err) => {
      console.error("Error during stream start:", err);
      retryLater();
    });
}

function refreshStream() {
  console.log("Refreshing stream...");

  if (hls) {
    hls.destroy();
    hls = null;
  }

  video.pause();
  video.src = "";
  video.load();

  startStream(); // Ponovo pokreni stream koristeći novu logiku
}

// helper funkcija za retry
function retryLater() {
  console.log("Retrying in 10 seconds…");
  setTimeout(startStream, 10000);
}

// helper funkcija za pokretanje HLS playera
function playStream(hlsUrl) {
  if (hls) {
    hls.destroy();
    hls = null;
  }

  if (Hls.isSupported()) {
    hls = new Hls();
    hls.loadSource(hlsUrl);
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

    hls.on(Hls.Events.ERROR, (event, data) => {
      console.error("HLS error:", data);
      if (data.fatal) {
        refreshStream();
      }
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = hlsUrl;
    video.addEventListener("loadedmetadata", () => {
      video.muted = false;
      video
        .play()
        .then(setupControls)
        .catch((err) => {
          console.error("Autoplay error:", err);
        });
    });

    video.addEventListener("error", () => {
      refreshStream();
    });
  }
}

// automatski restart i na playback error
video.addEventListener("error", () => {
  console.error("Playback error detected, restarting stream.");
  refreshStream();
});
