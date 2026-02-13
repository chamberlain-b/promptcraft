/**
 * Export and Import utilities for prompts
 */

import type { HistoryItem } from '../context/PromptContext.d';

export interface ExportData {
  version: string;
  exportDate: string;
  prompts: HistoryItem[];
}

export const exportToJSON = (data: HistoryItem[], filename = 'prompt-craft-export.json') => {
  const exportData: ExportData = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    prompts: data,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToCSV = (data: HistoryItem[], filename = 'prompt-craft-export.csv') => {
  const headers = ['ID', 'Input', 'Output', 'Timestamp'];
  const rows = data.map((item) => [
    item.id,
    `"${item.input.replace(/"/g, '""')}"`,
    `"${item.output.replace(/"/g, '""')}"`,
    item.timestamp,
  ]);

  const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Sanitize a string by stripping HTML tags and trimming excessive length.
 * Prevents stored XSS if rendering behavior changes in the future.
 */
const sanitizeString = (value: unknown, maxLength = 50000): string => {
  if (typeof value !== 'string') return '';
  return value.replace(/<[^>]*>/g, '').slice(0, maxLength);
};

export const importFromJSON = (file: File): Promise<ExportData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);

        // Validate the import data structure
        if (!data.version || !data.prompts || !Array.isArray(data.prompts)) {
          throw new Error('Invalid file format');
        }

        // Validate and sanitize each prompt item
        for (const prompt of data.prompts) {
          if (!prompt.id || !prompt.input || !prompt.output || !prompt.timestamp) {
            throw new Error('Invalid prompt data structure');
          }
          prompt.id = sanitizeString(prompt.id, 200);
          prompt.input = sanitizeString(prompt.input);
          prompt.output = sanitizeString(prompt.output);
          prompt.timestamp = sanitizeString(prompt.timestamp, 100);
        }

        resolve(data);
      } catch (error) {
        reject(new Error('Failed to parse JSON file. Please ensure it\'s a valid export file.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};

export const validateImportFile = (file: File): { valid: boolean; error?: string } => {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit',
    };
  }

  // Check file type
  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    return {
      valid: false,
      error: 'Only JSON files are supported',
    };
  }

  return { valid: true };
};

export const mergeImportedData = (
  existing: HistoryItem[],
  imported: HistoryItem[],
  strategy: 'replace' | 'merge' = 'merge'
): HistoryItem[] => {
  if (strategy === 'replace') {
    return imported;
  }

  // Merge strategy: add imported items that don't exist, based on ID
  const existingIds = new Set(existing.map((item) => item.id));
  const newItems = imported.filter((item) => !existingIds.has(item.id));

  return [...existing, ...newItems];
};

export default {
  exportToJSON,
  exportToCSV,
  importFromJSON,
  validateImportFile,
  mergeImportedData,
};
