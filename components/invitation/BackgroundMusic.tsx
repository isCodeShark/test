"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { useYouTubePlayer } from "./useYouTubePlayer";
import styles from "./templates/envelope/Envelope.module.css";

const noop = () => () => {};
const getOrigin = () => window.location.origin;

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4z" />
      {muted ? (
        <>
          <line x1="22" y1="9" x2="16" y2="15" />
          <line x1="16" y1="9" x2="22" y2="15" />
        </>
      ) : (
        <>
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </>
      )}
    </svg>
  );
}

/**
 * Hidden YouTube embed plus a floating mute/unmute toggle.
 * Mount this only after the guest has interacted (the seal click), which is
 * what lets autoplay start on desktop and Android. On iOS the toggle's own tap
 * starts playback if autoplay was refused.
 */
export function BackgroundMusic({ youtubeId, volume }: { youtubeId: string; volume: number }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const origin = useSyncExternalStore(noop, getOrigin, () => "");
  const { status, handleLoad, play, mute, unMute } = useYouTubePlayer(iframeRef, volume);
  const [userPaused, setUserPaused] = useState(false);

  if (!youtubeId || !origin) return null;

  const params = new URLSearchParams({
    enablejsapi: "1",
    autoplay: "1",
    playsinline: "1",
    controls: "0",
    loop: "1",
    playlist: youtubeId,
    rel: "0",
    origin,
  });
  const src = `https://www.youtube.com/embed/${youtubeId}?${params.toString()}`;

  const silent = status.muted || !status.playing;
  const label = status.error
    ? "Music unavailable"
    : !status.playing
      ? "Play music"
      : status.muted
        ? "Unmute music"
        : "Mute music";

  const onToggle = () => {
    if (status.error) return;
    if (!status.playing) {
      setUserPaused(false);
      play();
    } else if (status.muted) {
      unMute();
    } else {
      setUserPaused(true);
      mute();
    }
  };

  return (
    <>
      <iframe
        ref={iframeRef}
        src={src}
        onLoad={handleLoad}
        title="Background music"
        allow="autoplay; encrypted-media"
        tabIndex={-1}
        aria-hidden="true"
        // Off-screen rather than display:none so Safari keeps it running.
        style={{ position: "absolute", width: 1, height: 1, left: -9999, top: 0, opacity: 0, border: 0 }}
      />
      <button
        type="button"
        className={styles.musicButton}
        onClick={onToggle}
        aria-label={label}
        title={label}
        data-state={status.error ? "error" : silent ? "silent" : "playing"}
        data-user-paused={userPaused ? "true" : "false"}
        disabled={status.error}
      >
        <SpeakerIcon muted={silent} />
      </button>
    </>
  );
}

/** Static stand-in for the editor preview, so YouTube isn't loaded on every keystroke. */
export function MusicPlaceholder() {
  return (
    <button type="button" className={styles.musicButton} disabled aria-label="Music plays on the live page" title="Music plays on the live page">
      <SpeakerIcon muted={false} />
    </button>
  );
}
