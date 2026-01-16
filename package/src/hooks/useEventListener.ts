import { useEffect, useRef } from "react";

export default function useEventListener<K extends keyof WindowEventMap>(
  event: Window | Document | HTMLElement,
  name: K,
  listener: (ev: WindowEventMap[K]) => void,
  callOnce?: boolean,
): void;
export default function useEventListener(
  event:
    | { on: Function; off: Function }
    | { addListener: Function; removeListener: Function }
    | { addEventListener: Function; removeEventListener: Function },
  name: string,
  listener: (...args: any[]) => void,
  callOnce?: boolean,
) {
  const ref = useRef(listener);

  useEffect(() => {
    ref.current = listener;
  }, [listener]);

  useEffect(() => {
    if (!event) return;

    const eventTarget = event as any;
    const add = eventTarget.addEventListener || eventTarget.addListener || eventTarget.on;
    const remove = eventTarget.removeEventListener || eventTarget.removeListener || eventTarget.off;

    const func = (...args) => ref.current(...args);
    if (callOnce) func();
    add.bind(event)(name, func);
    return () => remove.bind(event)(name, func);
  }, [event, name, callOnce]);
}
