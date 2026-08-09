import { useEffect } from 'react';

// Global registry of back button interceptors
const backHandlers = [];

/**
 * Executes the back button action.
 * Iterates through registered handlers from newest to oldest.
 * The first handler to return `true` consumes the event, stopping propagation.
 * @returns {boolean} true if an interceptor handled the event, false otherwise.
 */
export const executeBackAction = () => {
  for (let i = backHandlers.length - 1; i >= 0; i--) {
    const handler = backHandlers[i];
    if (handler()) {
      return true; // Event consumed
    }
  }
  return false; // Not consumed
};

/**
 * Registers a back button interceptor.
 * @param {Function} handler - Function to call on back press. Should return true if it consumed the event.
 * @param {boolean} isActive - Whether the interceptor is currently active (e.g., is the modal open?).
 */
export default function useBackButton(handler, isActive = true) {
  useEffect(() => {
    if (!isActive) return;

    backHandlers.push(handler);

    return () => {
      const index = backHandlers.indexOf(handler);
      if (index !== -1) {
        backHandlers.splice(index, 1);
      }
    };
  }, [handler, isActive]);
}
