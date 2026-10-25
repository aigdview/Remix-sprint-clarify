import { DecompositionResult } from '../types/agile';

export async function decomposeFeature(
  promptText: string
): Promise<DecompositionResult> {
  const response = await fetch('/api/decompose', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ promptText }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data as DecompositionResult;
}
