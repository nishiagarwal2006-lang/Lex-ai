import { useState, useCallback } from 'react';
import { parseFile } from '../utils/documentParser.js';

export function useDocumentParser() {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState(null);

  const parse = useCallback(async (file) => {
    setParsing(true);
    setParseError(null);
    try {
      const result = await parseFile(file);
      setText(result);
      setFileName(file.name);
      return result;
    } catch (err) {
      setParseError(err.message);
      throw err;
    } finally {
      setParsing(false);
    }
  }, []);

  const setManualText = useCallback((value) => {
    setText(value);
    setFileName('pasted-text.txt');
  }, []);

  const reset = useCallback(() => {
    setText('');
    setFileName('');
    setParseError(null);
  }, []);

  return { text, fileName, parsing, parseError, parse, setManualText, reset, setText };
}
