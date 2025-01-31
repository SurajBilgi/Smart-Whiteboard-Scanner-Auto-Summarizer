/**
 * Creates a debounced function that delays invoking `func` until after `wait` milliseconds
 * have elapsed since the last time the debounced function was invoked.
 * Optionally, pass `immediate = true` to trigger the function call on the leading edge
 * instead of the trailing edge.
 *
 * @param func       The function to debounce.
 * @param wait       The number of milliseconds to delay.
 * @param immediate  If `true`, trigger the function on the leading edge.
 * @returns          A debounced function.
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null;

  return function debouncedFunction(this: unknown, ...args: Parameters<T>) {
    const shouldCallImmediately = immediate && !timeout;

    // Clear any existing timer
    if (timeout) {
      clearTimeout(timeout);
    }

    // Create a new timer
    timeout = setTimeout(() => {
      timeout = null;

      // If not immediate, then call the function after the wait
      if (!immediate) {
        func.apply(this, args);
      }
    }, wait);

    // Call the function on the leading edge
    if (shouldCallImmediately) {
      func.apply(this, args);
    }
  };
}
