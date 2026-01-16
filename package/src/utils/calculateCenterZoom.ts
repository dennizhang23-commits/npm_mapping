import { type Point, type Spot } from "../types";
import { clamp } from "./clamp";

export default function calculateCenterZoom(
  point: Point,
  containerSize: DOMRect,
  scale: number,
) {
  if (!point || !containerSize?.width || !containerSize?.height || !scale) {
    return { scale: 1, offset: { x: 0, y: 0 } };
  }

  // convert normalized point (0-1) to pixel coordinates
  const pointX = point.x * containerSize.width;
  const pointY = point.y * containerSize.height;

  // calculate offset to center the point
  let offsetX = (containerSize.width / 2 - pointX) * scale;
  let offsetY = (containerSize.height / 2 - pointY) * scale;

  // constrain offset to never show beyond image bounds
  const halfScaledWidth =
    (containerSize.width * scale - containerSize.width) / 2;
  const halfScaledHeight =
    (containerSize.height * scale - containerSize.height) / 2;

  offsetX = clamp(offsetX, { min: -halfScaledWidth, max: halfScaledWidth });
  offsetY = clamp(offsetY, { min: -halfScaledHeight, max: halfScaledHeight });

  return { scale, offset: { x: offsetX, y: offsetY } };
}
