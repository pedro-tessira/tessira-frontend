# Tessira Frontend Agent

## Repo Purpose
This repository is the visual and interaction layer of Tessira. It owns screens, flows, navigation, and presentation of platform and tenant experiences.

## Canonical Shared Context
This repo follows the canonical shared agent model from `tessira-agents`. Do not recreate or locally fork the shared system here.

## Local Context
Before acting, load:
- `LOCAL_CONTEXT.md`
- `README.md`
- routing, page, and component structure in `src/`

## Preferred Specialists
- frontend-specialist

## Preferred Skills
- frontend-screen-review
- frontend-doc-gap-analysis
- lovable-prompt-builder
- frontend-backend-alignment-check
- feature-to-module-mapping

## Local Rules
- Preserve canonical module meaning in UI: Core, People, Horizon, Skills, Signals, Work, Insights.
- Keep clear separation between source data, operational signals, and higher-level insights.
- Prefer clarity and task comprehension over visual complexity.
- Do not assume unsupported backend capabilities or hidden APIs.
- Do not assume the older 5-module model is current.
- Treat Work and Insights as valid current modules wherever module mapping is needed.
- If the frontend contains legacy or cross-cutting UI surfaces, do not silently redefine canonical ownership.

## Do Not Do
- Mix editable source data with derived signals without clear labeling.
- Duplicate navigation concepts or create competing information architecture.
- Introduce unsupported actions without backend validation.
- Ignore module boundaries or repurpose modules casually in UI copy or flows.
