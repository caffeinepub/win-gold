# Specification

## Summary
**Goal:** Fix the game loading issue in `GamePlay.tsx` where all 6 games get stuck on a loading spinner and never render the actual game UI.

**Planned changes:**
- Remove or resolve blocking async calls, actor initialization guards, and conditional rendering logic in `GamePlay.tsx` that prevent game screens from rendering.
- Ensure tapping any game card navigates to the corresponding game play screen and renders it immediately (or within a short deterministic timeout).
- Implement fallback to local game logic when the backend actor is unavailable or slow to initialize, so the game UI never hangs indefinitely.
- Verify all 6 games (Dragon vs Tiger, 7 Up Down, Andar Bahar, Ludo, Mines, Crash) render correctly with bet selection, game board/controls, and Play button visible and interactive.
- Ensure the back/close button on game screens correctly returns the user to the Home screen.
- Eliminate unhandled promise rejections or console errors related to actor initialization that block game rendering.

**User-visible outcome:** Tapping any game card on the Home screen now navigates to that game's fully interactive play screen within 2 seconds, with no stuck loading spinners regardless of backend availability.
