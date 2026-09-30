document.addEventListener("DOMContentLoaded", () => {
  const envelope = document.getElementById("envelope");
  const instruction = document.querySelector(".instruction");
  let isPlaying = false;

  const toggleMusic = () => {
    // const iframe = document.getElementById("bg-music");
    // if (iframe && iframe.contentWindow) {
    //   if (isPlaying) {
    //     iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    //     isPlaying = false;
    //   } else {
    //     iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
    //     isPlaying = true;
    //   }
    // }
  };

  const openEnvelope = () => {
    if (!envelope.classList.contains("open")) {
      envelope.classList.add("open");
      if (instruction) {
        instruction.style.opacity = "0";
      }
      
      // const iframe = document.getElementById("bg-music");
      // if (iframe && iframe.contentWindow) {
      //   iframe.contentWindow.postMessage('{"event":"command","func":"setVolume","args":[20]}', '*');
      //   iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      //   isPlaying = true;
      // }

      // Confetti celebration - fires immediately on click
      // First burst - center
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#800000', '#FAF9F6', '#FFD700', '#8B0000']
      });

      // Second burst - left side
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ['#d4af37', '#800000', '#FAF9F6', '#FFD700']
        });
      }, 250);

      // Third burst - right side
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ['#d4af37', '#800000', '#FAF9F6', '#FFD700']
        });
      }, 400);
    } else {
      // If already open, toggle music on click
      toggleMusic();
    }
  };

  // Add click listener to open the envelope
  envelope.addEventListener("click", openEnvelope);

  // Add click listener to the whole document body after opening
  document.body.addEventListener("click", (e) => {
    // Only toggle music if the envelope is already open and we didn't just click the envelope to open it
    if (envelope.classList.contains("open") && !envelope.contains(e.target)) {
      toggleMusic();
    }
  });

  // Add keyboard accessibility
  envelope.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openEnvelope();
    }
  });

  // Easter Egg: Double tap on Shanice
  const shaniceName = document.getElementById("shanice-name");
  let easterEggPlayed = false;

  const playEasterEgg = () => {
    if (!easterEggPlayed) {
      easterEggPlayed = true;
      
      // Pause main music if playing
      const mainIframe = document.getElementById("bg-music");
      if (mainIframe && isPlaying) {
        mainIframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        isPlaying = false;
      }

      // Play easter egg music
      const eggIframe = document.getElementById("easter-egg-music");
      if (eggIframe && eggIframe.contentWindow) {
        // Unmute if it was somehow muted and play
        eggIframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
        eggIframe.contentWindow.postMessage('{"event":"command","func":"setVolume","args":[100]}', '*');
        eggIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      }
    }
  };

  if (shaniceName) {
    shaniceName.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent single clicks from toggling main music
    });

    shaniceName.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      playEasterEgg();
    });

    let lastTap = 0;
    shaniceName.addEventListener("touchend", (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 500 && tapLength > 0) {
        e.preventDefault();
        e.stopPropagation();
        playEasterEgg();
      }
      lastTap = currentTime;
    });
  }
});
