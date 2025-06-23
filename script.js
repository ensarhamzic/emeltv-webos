const video = document.getElementById("video");
const playPauseBtn = document.getElementById("playPauseBtn");
const muteBtn = document.getElementById("muteBtn");
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
  controls.style.display = "block";
  playPauseBtn.textContent = "Pause";
  muteBtn.textContent = video.muted ? "Unmute" : "Mute";
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
  muteBtn.textContent = video.muted ? "Unmute" : "Mute";
});
