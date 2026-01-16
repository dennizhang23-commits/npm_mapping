import React, { useEffect, useRef, useState } from "react";
import { useBoundingClientRect, useControlledState } from "../hooks";
import ImageRouteContainer from "./imageRouteContainer";
import ImageRoutePaths from "./imageRoutePaths";
import ImageRoutePoints from "./imageRoutePoints";
import { type ImageRouteProps, type Spot } from "../types";
import { getClosestPointOnPath } from "../utils";

export default function ImageRoute({
  routeRef,
  points,
  addPoint,
  activeSpot: _activeSpot,
  setActiveSpot: _setActiveSpot,
  RenderPoint,
  RenderPath,
  RenderExtra,
  getInitialPosition = () => ({ scale: 1, offset: { x: 0, y: 0 } }),
  getAnimatedPosition,
  style,
  children,
  // Configuration props with defaults
  minZoom = 1,
  maxZoom = 8,
  zoomSensitivity = 0.1,
  animationDuration = 1000,
  animationDelay = 1000,
  tapThreshold = 200,
  snapThreshold = 15,
  ...props
}: ImageRouteProps) {
  const internalRef = useRef<HTMLDivElement>(null);
  const containerRef = routeRef ?? internalRef;
  const containerSize = useBoundingClientRect(containerRef);

  const [scale, setScale] = useState(1);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });

  const [isAnimating, setIsAnimating] = useState(false);

  const [activeSpot, setActiveSpot] = useControlledState(
    _activeSpot,
    _setActiveSpot,
  );
  const [hoverSpot, setHoverSpot] = useState<Spot>(null);

  useEffect(() => {
    if (!points || !containerSize?.width || !containerSize?.height) return;
    const { scale, offset } = getInitialPosition(containerSize);
    setScale(scale);
    setMapOffset(offset);
    setIsAnimating(false);

    if (!getAnimatedPosition) return;

    const animationFrame = requestAnimationFrame(() => {
      const { scale, offset } = getAnimatedPosition(containerSize);
      setScale(scale);
      setMapOffset(offset);
      setIsAnimating(true);
    });

    return () => cancelAnimationFrame(animationFrame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    Boolean(points),
    Boolean(containerSize?.width),
    Boolean(containerSize?.height),
  ]);

  return (
    <ImageRouteContainer
      containerRef={containerRef}
      containerSize={containerSize}
      scale={scale}
      setScale={setScale}
      mapOffset={mapOffset}
      setMapOffset={setMapOffset}
      isAnimating={isAnimating}
      setIsAnimating={setIsAnimating}
      minZoom={minZoom}
      maxZoom={maxZoom}
      zoomSensitivity={zoomSensitivity}
      animationDuration={animationDuration}
      animationDelay={animationDelay}
      tapThreshold={tapThreshold}
      onHoverRoute={(point) => {
        if (addPoint) return;
        setHoverSpot(
          getClosestPointOnPath(
            points,
            point.x,
            point.y,
            snapThreshold / containerSize.width,
          ),
        );
      }}
      onClickRoute={(point) => {
        addPoint?.(point);
        if (hoverSpot) setActiveSpot(hoverSpot);
      }}
      style={style}
      {...props}
    >
      {children}
      {containerSize && (
        <svg style={{ width: "100%", height: "100%" }}>
          <ImageRoutePaths
            containerSize={containerSize}
            scale={scale}
            points={points}
            RenderPath={RenderPath}
          />
          <ImageRoutePoints
            containerSize={containerSize}
            scale={scale}
            points={points}
            activeSpot={activeSpot}
            hoverSpot={hoverSpot}
            RenderPoint={RenderPoint}
          />
          {RenderExtra && (
            <RenderExtra
              containerSize={containerSize}
              scale={scale}
              points={points}
            />
          )}
        </svg>
      )}
    </ImageRouteContainer>
  );
}
