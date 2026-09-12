import { useEffect, useRef } from "react";

export function useEventListener<TEvent extends Event>(
  target: EventTarget | null,
  type: string,
  listener: ((event: TEvent) => void) | null,
): void {
  const listenerRef = useRef(listener);

  useEffect(() => {
    listenerRef.current = listener;
  }, [listener]);

  useEffect(() => {
    if (!target) return;

    const handleEvent: EventListener = (event) => {
      listenerRef.current?.(event as TEvent);
    };
    target.addEventListener(type, handleEvent);
    return () => target.removeEventListener(type, handleEvent);
  }, [target, type]);
}
