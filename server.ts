import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { MOCK_DECOMPOSITION } from './src/lib/starterPrompts.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

const agileDecompositionSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: 'A high-level 1-2 sentence executive summary of the decomposition.',
    },
    epics: {
      type: Type.ARRAY,
      description: 'List of high-level milestone epics grouping the feature work.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'Epic ID, e.g. EPIC-01' },
          title: { type: Type.STRING, description: 'Concise title of the milestone epic' },
          objective: { type: Type.STRING, description: 'Core business and technical outcome of this epic' },
        },
        required: ['id', 'title', 'objective'],
      },
    },
    userStories: {
      type: Type.ARRAY,
      description: 'Granular user stories with Gherkin acceptance criteria and technical dependency tags.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'Story ID, e.g. US-01' },
          epicId: { type: Type.STRING, description: 'Parent Epic ID, e.g. EPIC-01' },
          title: { type: Type.STRING, description: 'Action-oriented story title' },
          asA: { type: Type.STRING, description: 'Persona role (e.g. mobile banking user)' },
          iWant: { type: Type.STRING, description: 'Specific capability requested' },
          soThat: { type: Type.STRING, description: 'Business or user value achieved' },
          acceptanceCriteria: {
            type: Type.ARRAY,
            description: "3 to 4 strict Gherkin criteria in 'Given [context], When [action], Then [outcome]' format",
            items: { type: Type.STRING },
          },
          complexity: {
            type: Type.STRING,
            description: 'Relative complexity estimate: S, M, or L',
          },
          dependsOn: {
            type: Type.ARRAY,
            description: 'Story IDs that must be completed before this story (prerequisites)',
            items: { type: Type.STRING },
          },
          blocks: {
            type: Type.ARRAY,
            description: 'Story IDs that cannot start until this story is finished',
            items: { type: Type.STRING },
          },
          technicalRisks: {
            type: Type.ARRAY,
            description: '1-2 critical technical failure modes, architectural dependencies, or edge risks',
            items: { type: Type.STRING },
          },
        },
        required: [
          'id',
          'epicId',
          'title',
          'asA',
          'iWant',
          'soThat',
          'acceptanceCriteria',
          'complexity',
          'dependsOn',
          'blocks',
          'technicalRisks',
        ],
      },
    },
    mermaidDiagram: {
      type: Type.STRING,
      description: "A valid Mermaid.js flowchart string (using 'graph TD' with nodes like US01[\"US-01: Title\"] --> US02[\"US-02: Title\"]) visualizing the prerequisite execution sequence.",
    },
  },
  required: ['summary', 'epics', 'userStories', 'mermaidDiagram'],
};

app.post('/api/decompose', async (req: Request, res: Response) => {
  try {
    const { promptText } = req.body;
    console.log('[API] /api/decompose called. Body:', req.body);
    if (!promptText || typeof promptText !== 'string' || promptText.trim().length < 10) {
      return res.status(400).json({ error: 'Please provide a valid feature request with at least 10 characters.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    console.log('[API] GEMINI_API_KEY present?', Boolean(apiKey && apiKey.trim()));

    if (!apiKey || apiKey.trim() === '' || apiKey === 'mock-key') {
      console.log('[API] Using mock decomposition fallback');
      // Simulate brief network delay for preview testing when key isn't provided
      await new Promise((resolve) => setTimeout(resolve, 800));
      return res.json(MOCK_DECOMPOSITION);
    }
    console.log('[API] Calling Gemini API...');

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: agileDecompositionSchema,
        systemInstruction: `You are an elite Agile Delivery Lead and Principal Software Architect.
Decompose ambiguous business feature requests into strictly structured, production-ready Agile artifacts:
1. Milestone Epics.
2. User Stories in 'As a... I want... So that...' format with 3-4 bulleted Gherkin acceptance criteria (Given/When/Then).
3. Explicit prerequisite ('dependsOn') and blocking ('blocks') story relationships.
4. Concrete technical risks and failure modes.
5. A valid Mermaid.js flowchart ('graph TD') visualizing the dependency graph with node IDs matching story IDs.
Do not include conversational fluff. Return strictly valid JSON adhering to the response schema.`,
      },
    });

    if (!response.text) {
      return res.status(502).json({ error: 'No response content received from Gemini model.' });
    }

    const parsed = JSON.parse(response.text);
    return res.json(parsed);
  } catch (err: unknown) {
    console.error('Error in /api/decompose:', err);
    const message = err instanceof Error ? err.message : 'Internal server error while decomposing feature.';
    return res.status(500).json({ error: message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`SprintClarify server running at http://0.0.0.0:${port}`);
  });
}

startServer();
