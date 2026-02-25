# Specification

## Summary
**Goal:** Add a simulated OTP verification step to the signup and login flow in `LoginSignup.tsx`.

**Planned changes:**
- After the user enters their mobile number and taps Continue, generate a random 6-digit OTP in React component state and display it in a styled gold info box on screen (e.g., "Your OTP is: XXXXXX — for demo purposes").
- Render a numeric input field for the user to enter the OTP.
- Store the OTP and a 5-minute expiry timestamp in React component state only (no backend calls).
- On correct OTP entry, proceed to name entry (new user) or home screen (returning user), then immediately invalidate the OTP.
- On incorrect OTP entry, show an inline error message below the input.
- After 3 failed attempts, invalidate the OTP and prompt the user to restart the flow.

**User-visible outcome:** Users must verify a displayed demo OTP before completing signup or login, with clear feedback for wrong codes and automatic lockout after 3 failed attempts.
