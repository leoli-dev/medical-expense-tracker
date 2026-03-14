# iOS Password Manager Autofill Fix Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make iOS Safari / iOS PWA (A2HS) trigger Keychain and LastPass autofill on the login form.

**Architecture:** All changes are confined to `LoginPage.tsx`. The `Input` component already forwards all props via `...props`, so no changes are needed there. We add HTML attributes that password managers rely on to detect and fill login forms.

**Tech Stack:** React + TypeScript (frontend only, no backend changes)

---

## Why Autofill Fails Today

iOS password managers (Keychain, LastPass) use heuristics to detect login forms:

1. **Form must signal it's a submit form** — needs `method="post"` on `<form>`
2. **Form must opt into autofill** — needs `autoComplete="on"` on `<form>`
3. **Inputs must suppress iOS autocorrect/capitalisation** — `autoCapitalize="none"`, `autoCorrect="off"`, `spellCheck={false}` — without these iOS may interfere with filled values
4. **`autoComplete` values already correct** — `"username"` and `"current-password"` are the WHATWG standard values that Keychain and LastPass recognise

## Files Changed

| File | Change |
|------|--------|
| `packages/frontend/src/pages/LoginPage.tsx` | Add `method="post"` + `autoComplete="on"` to `<form>`; add `autoCapitalize`, `autoCorrect`, `spellCheck` to both inputs |

## Chunk 1: LoginPage.tsx changes

### Task 1: Add autofill attributes to the login form

**Files:**
- Modify: `packages/frontend/src/pages/LoginPage.tsx`

- [ ] **Step 1: Add `method` and `autoComplete` to `<form>`**

  Change:
  ```tsx
  <form
    onSubmit={handleSubmit}
    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4"
  >
  ```
  To:
  ```tsx
  <form
    onSubmit={handleSubmit}
    method="post"
    autoComplete="on"
    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4"
  >
  ```

- [ ] **Step 2: Add suppression attributes to username input**

  Change:
  ```tsx
  <Input
    label="Username"
    id="username"
    name="username"
    type="text"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    autoComplete="username"
    required
  />
  ```
  To:
  ```tsx
  <Input
    label="Username"
    id="username"
    name="username"
    type="text"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    autoComplete="username"
    autoCapitalize="none"
    autoCorrect="off"
    spellCheck={false}
    inputMode="text"
    required
  />
  ```

- [ ] **Step 3: Add suppression attributes to password input**

  Change:
  ```tsx
  <Input
    label="Password"
    id="password"
    name="password"
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    autoComplete="current-password"
    required
  />
  ```
  To:
  ```tsx
  <Input
    label="Password"
    id="password"
    name="password"
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    autoComplete="current-password"
    autoCapitalize="none"
    autoCorrect="off"
    spellCheck={false}
    required
  />
  ```

- [ ] **Step 4: Build and verify no TypeScript errors**

  ```bash
  cd /home/openclaw/coding/medical-expense-tracker
  npm run build
  ```
  Expected: clean build, no TS errors (`autoCapitalize`, `autoCorrect`, `spellCheck`, `inputMode` are all valid `InputHTMLAttributes`)

- [ ] **Step 5: Commit**

  ```bash
  git add packages/frontend/src/pages/LoginPage.tsx
  git commit -m "fix: improve iOS password manager autofill compatibility on login form"
  ```

- [ ] **Step 6: Push and redeploy**

  ```bash
  git push origin main
  ```
  Then follow redeploy instructions for the hosting environment.
