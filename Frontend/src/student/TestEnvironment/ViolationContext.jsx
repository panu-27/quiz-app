import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────────
   ViolationContext
   • Persists violations keyed by testId in localStorage
   • Shape: { [testId]: { count, log: [{type, timestamp}] } }
   • clearViolations(testId) → wipe after final submit
   ───────────────────────────────────────────────────────────────── */

const ViolationContext = createContext(null);

const STORAGE_KEY = 'exam_violations';
const MAX_VIOLATIONS = 5; // 6th triggers auto-submit

function loadStore() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {}
}

export function ViolationProvider({ children }) {
  const [store, setStore] = useState(loadStore);

  // Keep localStorage in sync
  useEffect(() => {
    saveStore(store);
  }, [store]);

  /** Returns { count, log } for a testId */
  const getViolations = useCallback((testId) => {
    return store[testId] || { count: 0, log: [] };
  }, [store]);

  /**
   * Records a new violation for testId.
   * Returns the NEW count so caller can decide to auto-submit.
   */
  const addViolation = useCallback((testId, type = 'tab_switch') => {
    let newCount = 0;
    setStore(prev => {
      const entry = prev[testId] || { count: 0, log: [] };
      newCount = entry.count + 1;
      const updated = {
        ...prev,
        [testId]: {
          count: newCount,
          log: [
            ...entry.log,
            { type, timestamp: new Date().toISOString() }
          ]
        }
      };
      saveStore(updated); // sync immediately
      return updated;
    });
    // Return optimistic count for immediate use
    return (store[testId]?.count ?? 0) + 1;
  }, [store]);

  /** Call after final submit — wipes the test's violation record */
  const clearViolations = useCallback((testId) => {
    setStore(prev => {
      const updated = { ...prev };
      delete updated[testId];
      saveStore(updated);
      return updated;
    });
  }, []);

  return (
    <ViolationContext.Provider value={{ getViolations, addViolation, clearViolations, MAX_VIOLATIONS }}>
      {children}
    </ViolationContext.Provider>
  );
}

export function useViolations() {
  const ctx = useContext(ViolationContext);
  if (!ctx) throw new Error('useViolations must be used inside <ViolationProvider>');
  return ctx;
}