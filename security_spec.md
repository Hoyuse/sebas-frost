# Security Specification & Threat Model - Sebas Frost

This document establishes the Attribute-Based Access Control (ABAC) and Zero-Trust Firestore Security model for Sebas Frost's user profiles and cart persistence.

## 1. Data Invariants
* **Identity Isolation**: A user's profile and cart at `/users/{userId}` can only be accessed (read, write) by the authenticated user whose `request.auth.uid` matches the document's `{userId}` path parameter.
* **Immutability of UID**: The `uid` inside the document must be immutable during updates and must exactly match the authenticated user's `uid`.
* **Immutability of Email**: The `email` inside the document must be immutable after creation and must equal the authorized JWT token email.
* **Validation of Inputs**: 
  - `email` must be a valid email string.
  - `uid` must meet `isValidId` patterns.
  - `displayName` must be a string up to 128 characters.
  - `cart` must be a list containing at most 50 items to prevent Denial-of-Wallet attacks.
  - `updatedAt` must match `request.time` on updates and creation.

---

## 2. The "Dirty Dozen" Malicious Payloads (Adversarial Testing)

Each of the following payloads must return `PERMISSION_DENIED` at `/users/{userId}`:

1. **Unauthenticated Read**: Attempting to read a user's record without being logged in.
2. **Unauthenticated Write**: Attempting to create or modify a user's record without being logged in.
3. **Cross-User Hijacking Read**: Logged in as User `A` (`uid: "alice123"`), attempting to read User `B`'s profile (`/users/bob456`).
4. **Cross-User Hijacking Write**: Logged in as User `A` (`uid: "alice123"`), attempting to overwrite User `B`'s profile (`/users/bob456`).
5. **Ghost Field Spoof**: Logged in as User `A` (`uid: "alice123"`), writing to `/users/alice123` with an unallowed field (e.g., `{ ..., isAdmin: true }`).
6. **UID Spoofing**: Writing a payload where the document ID is `alice123` but the inner `uid` is set to `bob456`.
7. **Email Hijack/Spoof**: Attempting to write a payload where the inner `email` field is someone else's email address instead of the verified auth email.
8. **Immutability Break**: Attempting to update `email` or `uid` to a different value once created.
9. **Timestamp Spoofing**: Supplying a client-side timestamp for `updatedAt` instead of `request.time` (e.g., writing a future timestamp).
10. **Array Flood (Cart Flooding)**: Sending a massive cart array with 1,000,000 items to exhaust memory/disk storage.
11. **Malicious ID Injection**: Creating a document with a malicious non-alphanumeric ID string like `/users/` + a huge string or SQL-like chars.
12. **Type Corruption**: Attempting to save the `cart` field as a `string` instead of a list/array.

---

## 3. Test Runner Specification

We target these scenarios and ensure they fail in the Firestore emulator test suite or are guarded natively in our `firestore.rules`.
