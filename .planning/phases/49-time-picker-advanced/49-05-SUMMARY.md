---
phase: 49-time-picker-advanced
plan: 05
subsystem: time-picker
tags: [voice-input, web-speech-api, progressive-enhancement, accessibility]
depends_on:
  requires: [48-01]
  provides: [TimeVoiceInput component, voice time parsing, speech recognition integration]
  affects: [49-06]
tech-stack:
  added: []
  patterns: [progressive-enhancement, feature-detection, SSR-safe-api-access]
key-files:
  created:
    - packages/time-picker/src/time-voice-input.ts
  modified: []
decisions:
  - Progressive enhancement: component renders nothing when Speech API unavailable
  - Never import SpeechRecognition at module level (isServer guard + window runtime access)
  - Parse time only from voice input; ignore date words
  - Use any type for SpeechRecognition to avoid TS declaration issues (runtime-only API)
metrics:
  duration: ~2 min
  completed: 2026-02-02
---

# Phase 49 Plan 05: Voice Input via Web Speech API Summary

Voice input component wrapping Web Speech API with progressive enhancement -- hidden when SpeechRecognition unavailable (Firefox, SSR), renders microphone button with listening state animation and spoken time parsing to TimeValue.

## What Was Done

### Task 1: Create TimeVoiceInput component with Speech API integration

Created `lui-time-voice-input` internal component with:

- **Feature detection**: `_speechAvailable` getter checks `window.SpeechRecognition` / `webkitSpeechRecognition` with `isServer` guard
- **Speech lifecycle**: `_startListening()` creates configured SpeechRecognition instance, `_stopListening()` aborts cleanly
- **Voice parsing**: `_parseVoiceTranscript()` handles three patterns:
  1. Colon/space-separated digits with optional period ("3:30 PM", "15:30")
  2. Hour-only with optional period ("3 PM", "15")
  3. Word numbers ("three thirty PM", "three PM")
- **Event dispatch**: `ui-voice-time-select` with `{ value: TimeValue, transcript: string }`
- **Visual feedback**: Pulsing border animation during listening, error messages via `role="alert"`
- **Dark mode**: `:host-context(.dark)` styles with CSS custom property theming

**Commit:** `abf3274`

## Deviations from Plan

None -- plan executed exactly as written.

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Progressive enhancement via `nothing` return | Component completely invisible in unsupported environments |
| Runtime `window` access only | Avoids module-level SpeechRecognition import that would break SSR |
| `any` type for SpeechRecognition | No standard TS declarations; runtime-only API |
| Time-only parsing | Date words in transcript ignored to prevent confusion |

## Verification

- `npx tsc --noEmit` passes (no errors in time-voice-input.ts; pre-existing error in time-scroll-wheel.ts is unrelated)
- Feature detection, speech lifecycle, and transcript parser all present
- SSR safety confirmed via isServer guards and nothing render

## Next Phase Readiness

- TimeVoiceInput ready for composition in Plan 06 (TimePicker integration)
- Event `ui-voice-time-select` ready to be wired to time picker value setting
