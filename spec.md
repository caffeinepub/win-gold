# Specification

## Summary
**Goal:** Add a Withdrawal page with amount selection UI (Step 1), accessible from within the app, using the existing dark navy/gold theme.

**Planned changes:**
- Create `frontend/src/pages/Withdrawal.tsx` with four amount buttons: ₹100, ₹200, ₹500, and ₹1000
- Selected amount button is visually highlighted; only one can be selected at a time
- Register the Withdrawal page route in `App.tsx`
- Add a "Withdraw" navigation entry or button (via BottomNav or Account page) to navigate to the Withdrawal page

**User-visible outcome:** Users can open the Withdrawal page and tap one of four preset amounts (₹100, ₹200, ₹500, ₹1000) to select it, with the selection visually indicated. No form submission or UPI input is included in this step.
