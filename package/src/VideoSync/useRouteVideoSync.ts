import { useEffect, useRef, useState } from "react";
import { useIntervalWhen, useVideo } from "rooks";
import { type Point, type Spot } from "../types";
import { findSpotByTime, findTimeBySpot } from "../utils";

export default function useRouteVideoSync(
  points: Point[],
  autoplay?: boolean,
  options?: {
    autoplayDelay?: number;
    updateInterval?: number;
  },
) {
  // Default options
  const autoplayDelay = options?.autoplayDelay ?? 2000;
  const updateInterval = options?.updateInterval ?? 16.666666666666667;
  const routeRef = useRef<HTMLDivElement>(null);
  const [videoRef, videoState, videoControls] = useVideo();

  const [hideVideo, setShowVideo] = useState(false);
  const [time, setTime] = useState(0);
  const [activeSpot, setActiveSpot] = useState<Spot>(null);

  // sync activeSpot with time
  useEffect(() => {
    const spot = findSpotByTime(points, time);
    if (!spot) return;
    setActiveSpot(spot);
  }, [points, time]);

  useEffect(() => {
    setShowVideo(false);
    videoControls.pause();

    if (!points) return;
    if (!autoplay) {
      setShowVideo(true);
    } else {
      setTimeout(() => {
        setShowVideo(true);
        videoControls.play();
      }, autoplayDelay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(points)]);

  useEffect(() => {
    setTime(videoState.currentTime);
  }, [videoState.currentTime]);

  useIntervalWhen(
    () => setTime((time) => time + updateInterval / 1000),
    updateInterval,
    !videoState.isPaused,
  );

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.style.opacity = hideVideo ? "1" : "0";
  }, [hideVideo, videoRef]);

  useEffect(() => {
    if (!routeRef.current) return;
    routeRef.current.style.opacity = points ? "1" : "0";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(points), routeRef]);

  return {
    routeRef,
    videoRef,
    time,
    setTime,
    activeSpot,
    setActiveSpot: (spot: Spot) => {
      setActiveSpot(spot);

      const calculatedTime = findTimeBySpot(points, spot);
      if (calculatedTime !== null) {
        setTime(calculatedTime);
        videoControls.setCurrentTime(calculatedTime);
      }
    },
  };
}
