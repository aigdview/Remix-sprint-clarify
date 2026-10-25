# Changelog

All notable changes to **SprintClarify** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-10-25

### Added - "Build With AI: Basics" Devpost Hackathon Enhancements
- **Devpost Planning Pack Generator (`scope.md`, `prd.md`, `spec.md`)**:
  - Implemented `HackathonPackModal.tsx` and `src/lib/devpostExporter.ts` to auto-generate the 3 planning documents required by the Devpost Learn Skill Pack directly from the Agile decomposition results.
  - Added multi-tab markdown viewer, single-file clipboard copy, individual file download, and a 1-click "Download All 3 Files" in `ExportBar.tsx`.
- **Agent Slice Prompts with Negative Constraints (Anti-Hallucination Guardrails)**:
  - Added 1-click "Agent Prompt" export on every story card via `src/lib/agentPromptGenerator.ts` tailored for Claude Code, Cursor Composer, GitHub Copilot, and Codex.
  - Formatted prompts with task boundaries, prerequisite locks, Gherkin verification steps, and strict negative constraints (*"DO NOT rewrite existing working files", "DO NOT break existing API contracts"*).
  - Added expandable in-card prompt drawer in `StoryCard.tsx` to preview prompt contents directly.
- **Syntax-Highlighted Gherkin Criteria & Interactive Verification Checklist**:
  - Built `GherkinCriterion.tsx` featuring high-contrast colored keyword badges (`GIVEN` in cyan, `WHEN` in indigo, `THEN` in emerald, and `AND` in zinc).
  - Added interactive checkboxes on every acceptance criterion to mark criteria as verified during testing.
  - Added dynamic verification progress badge on story card headers (e.g., `2/3 Verified` and `All Criteria Verified`).
- **Header Status Badge Alignment**:
  - Updated `Header.tsx` status indicator to display active `Gemini 3.8 Flash` connectivity matching the engine model.
- **Backend Model Alignment**:
  - Updated `/api/decompose` endpoint in `server.ts` to call `gemini-3.8-flash`.
- **Workspace Feature Pillars**:
  - Updated `EmptyPlaceholder.tsx` highlighting Gherkin verification, AI coding agent prompts, and the Devpost Hackathon Pack.
- **Application Wiring**:
  - Passed feature prompt context through `App.tsx` into `ExportBar.tsx` to enrich generated planning doc headers.

---

## [0.3.0] - 2026-10-25

### Changed - GitHub Import & Full-Stack Server-Side Architecture
- **Full-Stack Server-Side Proxy**: Adapted the imported GitHub codebase (`Samgorleung/sprint-clarify`) to an Express server (`server.ts`) hosting Vite middleware on port 3000 to comply with AI Studio runtime requirements.
- **Secure Gemini Route**: Implemented `/api/decompose` backend endpoint with server-side `@google/genai` integration using `process.env.GEMINI_API_KEY` and model `gemini-3.1-flash-lite`, preventing client-side API key exposure.
- **Client Decoupling**: Updated `src/lib/gemini.ts` to query the local `/api/decompose` route instead of bundling client-side credentials.
- **Dev & Build Scripts**: Added `tsx server.ts` dev/start execution scripts in `package.json` with `@types/express`.
- **Capability Metadata**: Configured `metadata.json` declaring `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`.

---

## [0.2.0] - 2026-10-08

### Changed
- **Gemini 3.8 Flash Engine Upgrade**: Upgraded the core decomposition model from `gemini-2.5-flash` to `gemini-3.8-flash` using the official Google Gen AI SDK (`@google/genai`).
- **Header Status Badge**: Updated the live model indicator in `Header.tsx` to reflect active Gemini 3.8 Flash connectivity.
- **Documentation**: Updated architecture map (`devpost/app-map.html`) and project `README.md` to reference Gemini 3.8 Flash.

---

## [0.1.0] - 2026-10-07

### Added

#### Slice 1: Scaffold & Structured Gemini Decomposition Engine
- Initialized React 18 + Vite 6 Single Page Application with TypeScript.
- Configured Tailwind CSS utility styling with Linear/Raycast dark theme (`#09090b` / `#18181b`).
- Integrated `@google/genai` with strict `responseSchema` enforcing typed JSON payloads:
  - Epics (`id`, `title`, `objective`).
  - User Stories (`id`, `epicId`, `title`, `asA`, `iWant`, `soThat`, `acceptanceCriteria`, `complexity`, `dependsOn`, `blocks`, `technicalRisks`).
  - Mermaid diagram syntax string.
- Created `PromptInput` with character counter and 3 preset starter pills ("Mobile Biometric Auth", "CSV Export & Scheduled Reports", "Webhook Event Notifications").
- Implemented `LoadingSkeleton` shimmer state for zero layout shift during API execution.
- Added deterministic offline mock fallback in `src/lib/starterPrompts.ts` for instant testing without an active API key.

#### Slice 2: Interactive Backlog Workspace & Jira Exports
- Implemented `StoryCard` component with collapsible accordion state.
- Rendered Gherkin acceptance criteria (`Given / When / Then`) with emerald check icons.
- Added technical risk warnings with amber alert indicators and relative complexity tags (`S`, `M`, `L`).
- Implemented 1-click single story Markdown copy formatted for direct Jira, Linear, or GitHub Issue creation.
- Implemented `ExportBar` with aggregate sprint metrics (total epics, stories, and risks) and master "Export All Markdown" / "Export JSON" clipboard actions.
- Built `src/lib/markdownExporter.ts` and verified with automated assertions.

#### Slice 3: Visual Dependency Matrix & Error Resilience
- Implemented `MermaidVisualizer` using client-side `mermaid` SVG rendering with dark theme variables.
- Added syntax fallback boundary in `MermaidVisualizer` that preserves flow text if SVG generation encounters syntax anomalies.
- Implemented `DependencyMatrix` right-column container displaying directional prerequisite badges ("Depends on:", "Blocks:").
- Added runtime `ApiKeyModal` with password visibility toggle and browser local storage persistence.
- Built `ErrorBanner` component providing non-destructive API error notifications with an instant "Retry" action.
- Generated standalone architecture map `devpost/app-map.html`.
