"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

/**
 * Drive a YouTube embed through the IFrame widget postMessage protocol,
 * without loading YouTube's iframe_api script. The iframe must be created
 * with `enablejsapi=1` and an `origin` parameter.
 *
 * Reference: https://developers.google.com/youtube/iframe_api_reference
 */

export type PlayerStatus = {
  ready: boolean;
  playing: boolean;
  muted: boolean;
  error: boolean;
};

const YT_ORIGINS = new Set(["https://www.youtube.com", "https://www.youtube-nocookie.com"]);
const PLAYER_ID = "bg-music";

type YtMessage = {
  event?: string;
  id?: string;
  info?: { playerState?: number; muted?: boolean; volume?: number } | number;
};

export function useYouTubePlayer(iframeRef: RefObject<HTMLIFrameElement | null>, volume: number) {
  const [status, setStatus] = useState<PlayerStatus>({
    ready: false,
    playing: false,
    muted: false,
    error: false,
  });
  const volumeRef = useRef(volume);
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  const post = useCallback(
    (payload: Record<string, unknown>) => {
      const win = iframeRef.current?.contentWindow;
      if (!win) return;
      win.postMessage(JSON.stringify({ ...payload, id: PLAYER_ID }), "*");
    },
    [iframeRef],
  );

  const command = useCallback(
    (func: string, args: unknown[] = []) => post({ event: "command", func, args }),
    [post],
  );

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (!YT_ORIGINS.has(e.origin)) return;
      if (e.source !== iframeRef.current?.contentWindow) return;
      let data: YtMessage;
      try {
        data = typeof e.data === "string" ? (JSON.parse(e.data) as YtMessage) : (e.data as YtMessage);
      } catch {
        return;
      }
      if (!data || typeof data !== "object") return;

      if (data.event === "onReady") {
        setStatus((s) => ({ ...s, ready: true }));
        command("setVolume", [volumeRef.current]);
        command("playVideo");
      } else if (data.event === "infoDelivery" && data.info && typeof data.info === "object") {
        const info = data.info;
        setStatus((s) => ({
          ...s,
          ready: true,
          playing: typeof info.playerState === "number" ? info.playerState === 1 : s.playing,
          muted: typeof info.muted === "boolean" ? info.muted : s.muted,
        }));
      } else if (data.event === "onError") {
        setStatus((s) => ({ ...s, error: true, playing: false }));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [command, iframeRef]);

  /** Call from the iframe's onLoad so the widget starts sending events. */
  const handleLoad = useCallback(() => {
    post({ event: "listening", channel: "widget" });
  }, [post]);

  const play = useCallback(() => {
    command("unMute");
    command("setVolume", [volumeRef.current]);
    command("playVideo");
  }, [command]);

  const pause = useCallback(() => command("pauseVideo"), [command]);
  const mute = useCallback(() => command("mute"), [command]);
  const unMute = useCallback(() => {
    command("unMute");
    command("setVolume", [volumeRef.current]);
  }, [command]);

  return { status, handleLoad, play, pause, mute, unMute };
}
