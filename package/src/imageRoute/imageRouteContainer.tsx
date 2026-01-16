import styled from "styled-components";
import {
  type HTMLAttributes,
  type Dispatch,
  type ReactNode,
  type RefObject,
  type TouchList,
  useRef,
} from "react";
import { useEventListener } from "../hooks";
import { type Point } from "../types";
import { clamp, clampPosition, mouseToContainer } from "../utils";
import React from "react";

const Container = styled.div`
  overflow: hidden;
  cursor: crosshair;
  touch-action: none;
  background-color: black;
`;

const InnerBox = styled.div<{
  $mapOffset: Point;
  $scale: number;
  $isAnimating: boolean;
  $animationDuration: number;
  $animationDelay: number;
}>`
  position: relative;
  transform: translate(
      ${(props) => props.$mapOffset.x}px,
      ${(props) => props.$mapOffset.y}px
    )
    scale(${(props) => props.$scale});
  transform-origin: 50% 50%;
  width: 100%;
  height: 100%;
  transition: ${(props) =>
    props.$isAnimating
      ? `transform ${props.$animationDuration}ms ease`
      : "none"};
  transition-delay: ${(props) => props.$animationDelay}ms;
`;

export default function ImageRouteContainer({
  containerRef,
  containerSize,
  scale,
  setScale,
  mapOffset,
  setMapOffset,
  isAnimating,
  setIsAnimating,
  minZoom,
  maxZoom,
  zoomSensitivity,
  animationDuration,
  animationDelay,
  tapThreshold,
  onHoverRoute,
  onClickRoute,
  children,
  style,
  ...props
}: {
  containerRef: RefObject<HTMLDivElement>;
  containerSize: DOMRect;
  scale: number;
  setScale: Dispatch<number>;
  mapOffset: Point;
  setMapOffset: Dispatch<Point>;
  isAnimating: boolean;
  setIsAnimating: Dispatch<boolean>;
  minZoom: number;
  maxZoom: number;
  zoomSensitivity: number;
  animationDuration: number;
  animationDelay: number;
  tapThreshold: number;
  onHoverRoute?: (point: { x: number; y: number }) => void;
  onClickRoute?: (point: { x: number; y: number }) => void;
  innerChildren?: ReactNode;
  style?: React.CSSProperties;
} & Omit<HTMLAttributes<HTMLDivElement>, "ref">) {
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastTouchDistance = useRef<number>(null);
  const touchStartTime = useRef<number>(0);
  const interactionStartPos = useRef<Point>(null);

  const startDrag = (clientX: number, clientY: number) => {
    isDragging.current = true;
    interactionStartPos.current = { x: clientX, y: clientY };
    dragStart.current = { x: clientX - mapOffset.x, y: clientY - mapOffset.y };
    touchStartTime.current = Date.now();
  };

  const performDrag = (clientX: number, clientY: number) => {
    if (!containerSize) return;
    const newX = clientX - dragStart.current.x;
    const newY = clientY - dragStart.current.y;
    setMapOffset(clampPosition(containerSize, newX, newY, scale));
  };

  const performZoom = (zoomCenter: Point, scaleDelta: number) => {
    if (!containerSize) return;
    setIsAnimating?.(false);

    const centerX = containerSize.width / 2;
    const centerY = containerSize.height / 2;
    const pointX =
      (zoomCenter.x - containerSize.x - centerX - mapOffset.x) / scale;
    const pointY =
      (zoomCenter.y - containerSize.y - centerY - mapOffset.y) / scale;
    const imageX = (pointX - mapOffset.x) / scale;
    const imageY = (pointY - mapOffset.y) / scale;

    const newScale = clamp(scale * scaleDelta, { min: minZoom, max: maxZoom }) || 1;

    const newX = pointX - imageX * newScale;
    const newY = pointY - imageY * newScale;

    setScale(newScale);
    setMapOffset(clampPosition(containerSize, newX, newY, newScale));
  };

  const handleClick = (click: { x: number; y: number }) => {
    if (!containerSize) return;

    const centerX = containerSize.width / 2;
    const centerY = containerSize.height / 2;
    const containerPoint = {
      x: (click.x - containerSize.x - centerX - mapOffset.x) / scale,
      y: (click.y - containerSize.y - centerY - mapOffset.y) / scale,
    };
    onClickRoute?.(containerPoint);
  };

  const endDrag = () => {
    isDragging.current = false;
    lastTouchDistance.current = null;
    interactionStartPos.current = null;
  };

  const getTouchDistance = (touches: TouchList) => {
    if (touches.length < 2) return null;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touches: TouchList) => {
    if (touches.length < 2) return null;
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  };

  // eslint-disable-next-line react-hooks/refs
  useEventListener(containerRef.current, "wheel", (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 - zoomSensitivity : 1 + zoomSensitivity;
    performZoom({ x: e.clientX, y: e.clientY }, delta);
  });

  return (
    <Container
      ref={containerRef}
      style={style}
      onMouseDown={(e) => {
        if (e.button !== 2) return;
        e.preventDefault();
        startDrag(e.clientX, e.clientY);
      }}
      onMouseMove={(e) => {
        if (isDragging.current) {
          performDrag(e.clientX, e.clientY);
          return;
        }

        if (!containerSize) return;
        onHoverRoute?.(mouseToContainer(e, containerSize, mapOffset, scale));
      }}
      onMouseUp={endDrag}
      onClick={(e) => {
        if (isDragging.current || !containerSize) return;
        onClickRoute?.(mouseToContainer(e, containerSize, mapOffset, scale));
      }}
      onContextMenu={(e) => e.preventDefault()}
      onTouchStart={(e) => {
        if (e.touches.length === 1) {
          const touch = e.touches[0];
          startDrag(touch.clientX, touch.clientY);
        } else if (e.touches.length === 2) {
          lastTouchDistance.current = getTouchDistance(e.touches);
        }
      }}
      onTouchMove={(e) => {
        e.preventDefault();

        if (e.touches.length === 1) {
          const touch = e.touches[0];
          performDrag(touch.clientX, touch.clientY);
        } else if (e.touches.length === 2) {
          const distance = getTouchDistance(e.touches);
          const center = getTouchCenter(e.touches);

          if (distance && center && lastTouchDistance.current) {
            const scaleDelta = distance / lastTouchDistance.current;
            performZoom(center, scaleDelta);
            lastTouchDistance.current = distance;
          }
        }
      }}
      onTouchEnd={(e) => {
        if (e.touches.length === 0) {
          const touchDuration = Date.now() - touchStartTime.current;
          const wasTap = touchDuration < tapThreshold && !isDragging.current;

          if (wasTap && interactionStartPos.current) {
            handleClick(interactionStartPos.current);
          }

          endDrag();
        } else if (e.touches.length === 1) {
          lastTouchDistance.current = null;
        }
      }}
      {...props}
    >
      <InnerBox
        $mapOffset={mapOffset}
        $scale={scale}
        $isAnimating={isAnimating}
        $animationDuration={animationDuration}
        $animationDelay={animationDelay}
      >
        {children}
      </InnerBox>
    </Container>
  );
}
