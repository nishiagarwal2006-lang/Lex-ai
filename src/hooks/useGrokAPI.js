import { useState, useCallback } from 'react';
import {
  analyzeRisk,
  simplifyClauses,
  compareDocuments,
  askQuestion,
  generateChecklist,
} from '../services/grokService.js';

export function useGrokAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (fn, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn(...args);
      setData(result);
      return result;
    } catch (err) {
      const message = err.response?.data?.error?.message || err.message || 'API request failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const analyze = useCallback((text) => execute(analyzeRisk, text), [execute]);
  const simplify = useCallback((text) => execute(simplifyClauses, text), [execute]);
  const compare = useCallback((doc1, doc2) => execute(compareDocuments, doc1, doc2), [execute]);
  const ask = useCallback((text, question) => execute(askQuestion, text, question), [execute]);
  const checklist = useCallback((text) => execute(generateChecklist, text), [execute]);

  return { loading, error, data, analyze, simplify, compare, ask, checklist, setData, setError };
}
