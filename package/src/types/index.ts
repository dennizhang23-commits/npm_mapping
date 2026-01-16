import type { ComponentType, Dispatch, ReactNode, RefObject } from "react";

// Image component types
export type ImageComponentProps = {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
};

export type ImageComponent = ComponentType<ImageComponentProps>;

export type Point = {
  x: number;
  y: number;
  marked?: number;
  start?: number;
  end?: number;
  data?: string;
};

export type Spot = {
  point: { x: number; y: number };
  pointIndex?: number;
  percentage?: number;
};

export type ImageRouteProps = {
  routeRef?: RefObject<HTMLDivElement>;
  points: Point[];
  addPoint?: Dispatch<Point>;
  activeSpot?: Spot;
  setActiveSpot?: Dispatch<Spot>;
  RenderPoint?: ComponentType<RenderPointProps>;
  RenderPath?: ComponentType<RenderPathProps>;
  RenderExtra?: ComponentType<RenderExtraProps>;
  getInitialPosition?: (containerSize: DOMRect) => {
    scale: number;
    offset: { x: number; y: number };
  };
  getAnimatedPosition?: (containerSize: DOMRect) => {
    scale: number;
    offset: { x: number; y: number };
  };
  innerChildren?: ReactNode;
  style?: React.CSSProperties;
  // Zoom configuration
  minZoom?: number;
  maxZoom?: number;
  zoomSensitivity?: number;
  // Animation configuration
  animationDuration?: number;
  animationDelay?: number;
  // Interaction configuration
  tapThreshold?: number;
  snapThreshold?: number;
} & Omit<React.ComponentPropsWithoutRef<"div">, "ref">;

export type RenderPointProps = {
  point: Point;
  containerSize: DOMRect;
  scale: number;
  percentage?: number;
  type?: string;
};

export type RenderPathProps = {
  point1: Point;
  point2: Point;
  containerSize: DOMRect;
  scale: number;
};

export type RenderExtraProps = {
  containerSize: DOMRect;
  scale: number;
  points: Point[];
};
