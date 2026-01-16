// Main package entry point
// This file exports all public APIs of the package

// Core component
export { default as ImageRoute } from "./imageRoute";
export { default as useRouteVideoSync } from "./VideoSync";

// Utility functions
export { calculateOptimalZoom } from "./utils";

// Custom hooks
export {
  useBoundingClientRect,
  useControlledState,
  useEventListener,
  useHistory,
  useResizeObserver,
} from "./hooks";

// TypeScript types (for type-only imports)
export type * from "./types";
