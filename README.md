# verilog-training

A static React-based HDL learning and interview-prep app designed for GitHub Pages.

## Included
- 20 lessons
- 400 MCQs with topic, difficulty, and company-track metadata
- 50 RTL problems
- 30 waveform drills
- 20 timed tests
- RTL playground with local heuristic feedback
- Study planner and company-track filters

## Why this deploys easily
This repo uses React in the browser through CDN scripts, so you can upload it directly to GitHub and enable GitHub Pages without a build pipeline.

## GitHub Pages steps
1. Create a new GitHub repo.
2. Upload the contents of this zip to the repo root.
3. In GitHub, open **Settings → Pages**.
4. Set source to **Deploy from a branch**.
5. Choose **main** branch and **/(root)** folder.
6. Save.

## Where to customize
- `content/lessons/*.md`
- `content/questions/questions.json`
- `content/problems/problems.json`
- `content/waveforms/waveforms.json`
- `content/tests/tests.json`
- `content/videos/videos.json`

## Notes
- Progress is saved in browser localStorage.
- The RTL Playground is heuristic only. It is not a simulator or synthesizer.
- If you later want a production build pipeline, you can migrate this UI into Vite or Next static export.


## v2 UI update
- MCQ practice now supports select + submit + correctness feedback
- Test mode now shows per-question result review after submission
- Video shelf now includes curated YouTube links
