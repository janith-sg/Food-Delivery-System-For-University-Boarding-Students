import { useState, useCallback } from 'react';

/**
 * State for FeedbackModal (animated success / error dialog).
 * @returns {{
 *   feedback: { variant: 'success' | 'error'; title: string; message: string } | null;
 *   dismissFeedback: () => void;
 *   showFeedback: (variant: 'success' | 'error', title: string, message: string) => void;
 * }}
 */
export function useFeedbackModal() {
  const [feedback, setFeedback] = useState(null);
  const dismissFeedback = useCallback(() => setFeedback(null), []);
  const showFeedback = useCallback((variant, title, message) => {
    setFeedback({ variant, title, message });
  }, []);
  return { feedback, dismissFeedback, showFeedback };
}
