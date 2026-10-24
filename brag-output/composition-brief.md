# Hyperframes Composition Brief: Verso

## Objective
Create a full commercial-style product video for Verso with narration that explains what it is and how to use it.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 52s (narration-led; user asked for a full how-to commercial)

## Source Material
- Project root: E:\Projects New\spectrum
- Primary files read: src/app/globals.css, src/components/brand/logo.tsx, src/app/page.tsx, src/app/today/page.tsx, src/app/story/[id]/page.tsx, src/components/story/*, src/components/landing/headline-quiz.tsx, README.md, DESIGN.md
- Live data: lead story "DOJ files lawsuit to block Alaska Senate election certification pending outcome" (8 outlets) and its real headlines, claims and loaded terms from the Neon database.
- Copy that must appear verbatim:
  - "The other side of every story."
  - "Read the other side."
  - Real headlines (Mother Jones, The New York Times, CBS News, BBC News, Reason, Breitbart) as fetched.

## Creative Direction
- Tone preset: polished
- Creative direction: editorial product film for a news tool
- Hook: three real headlines on the same event slam in.
- Outro: "Read the other side."
- Avoid: generic SaaS language, abstract filler, any person's private data, violent stories.

## Visual Identity
- Background #e6e6e1, sheet #f3f3ef, ink #131314, cyan #0086c3, magenta #c8006a, yellow #ffe14a, rule #c9c9c3
- Display: Source Serif 4 (local woff2). UI: Archivo variable (local woff2, font-stretch 62-125%).

## Audio
- Music: assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3, ~0.13 under voice, lift at the end, fades.
- Voiceover: assets/vo/vo1-8.wav, placed per scene (Kokoro af_heart).
- Cue guidance: brag skill preset for vol-12; strong cue 18.56s locks the spectrum slide-in.
- SFX: chosen from the brag skill library after animation, copied into assets/sfx/.
- Audio-reactive: subtle RMS glow on the registration rule / outro mark, if extraction is available.
