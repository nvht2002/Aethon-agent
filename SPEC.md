# Mobile Shell Terminal (iOS Web/App) — Specification

## Project Overview

**Project Name**: Mobile Shell Terminal  
**Type**: Real shell environment accessible via iPhone Safari  
**Core Functionality**: A working terminal that executes REAL system commands on a Linux backend, accessible from mobile browsers  
**Target Users**: Developers who need command-line access from iPhone

---

## Architecture

```
┌─────────────────┐     WebSocket      ┌─────────────────┐
│   iPhone        │◄─────────────────►│   Next.js        │
│   Safari        │    socket.io       │   Server         │
│   + xterm.js   │                    │   + node-pty     │
└─────────────────┘                    └─────────────────┘
                                              │
                                              ▼
                                        ┌───────────┐
                                        │   bash    │
                                        │   shell   │
                                        └───────────┘
```

---

## UI/UX Specification

### Layout Structure

- **Fullscreen terminal** — 100vh, no scrolling on container
- **Fixed header** — 44px height with session info
- **Terminal area** — Remaining viewport height
- **Mobile keyboard aware** — Viewport meta tag for iOS

### Responsive Breakpoints

- **Mobile** (< 768px): Fullwidth, touch-optimized
- **Tablet** (768px - 1024px): Same as mobile
- **Desktop** (> 1024px): Centered terminal at 800px max

### Visual Design

| Element | Value |
|---------|-------|
| Background | `#0D0D0D` |
| Foreground | `#00FF41` (classic terminal green) |
| Cursor | `#00FF41` with blink |
| Font | `JetBrains Mono`, monospace |
| Font Size | 14px desktop, 12px mobile |
| Line Height | 1.2 |
| Padding | 12px |

### Components

1. **TerminalHeader**
   - Session status indicator (dot: green=connected, red=disconnected)
   - Session ID display
   - New session button

2. **Terminal**
   - xterm.js instance
   - Fit addon for resize
   - WebLinks addon for clickable URLs

3. **TouchToolbar**
   - Quick buttons: ESC, TAB, CTRL, ARROWS
   - Hideable on desktop

---

## Functionality Specification

### Core Features

1. **Real Shell Execution**
   - Spawn bash process via node-pty
   - Per-session isolated processes
   - Support for: bash, sh, zsh

2. **WebSocket Bridge**
   - socket.io for real-time bidirectional communication
   - Events: `input`, `output`, `resize`, `session-create`, `sessionDestroy`
   - Automatic reconnection

3. **Session Management**
   - Create new session on connect
   - Auto-kill after 30 min inactivity
   - Manual session destroy

4. **Command Support** (Real Execution)
   - node, npm, pnpm, yarn
   - python, pip
   - git
   - curl, wget
   - ssh

5. **Filesystem**
   - Home directory per session: `/tmp/terminal-{sessionId}`
   - Persistent across session lifetime
   - Upload/download support via drag-drop

### User Interactions

- Connect → Auto-create session → Shell ready
- Type commands → Real-time execution → Real output
- Resize window → PTY resize → Proper rendering
- Close tab → Session destroy

### Edge Cases

- Network disconnect → Show reconnecting state
- Shell crash → Display error, offer new session
- Long-running command ��� Allow interrupt (Ctrl+C)
- Large output → Virtual scrolling in xterm

---

## Technical Implementation

### Server (API Route for WebSocket)

```typescript
// src/app/api/terminal/route.ts
import { Server } from 'socket.io'
import * as pty from 'node-pty'
```

### Client (Terminal Component)

```typescript
// src/components/Terminal.tsx
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { io } from 'socket.io-client'
```

### Dependencies

| Package | Purpose |
|---------|---------|
| xterm | Terminal UI |
| xterm-addon-fit | Auto-resize |
| xterm-addon-web-links | Clickable URLs |
| socket.io | WebSocket bridge |
| node-pty | PTY spawning |
| @xterm/addon-serialize | State preservation |

---

## Acceptance Criteria

### Must Demonstrate

- [ ] git clone a public repo works
- [ ] npm install installs packages
- [ ] npm run dev runs dev server
- [ ] Files persist and can be edited
- [ ] SSH connection possible to remote

### Visual Checkpoints

- [ ] Terminal fills viewport on iPhone
- [ ] Green text on black background
- [ ] Cursor blinks
- [ ] Output appears in real-time
- [ ] Touch toolbar visible on mobile

### Mobile Requirements

- [ ] Viewport meta tag prevents zoom
- [ ] Touch keyboard doesn't hide terminal
- [ ] Quick access buttons for ESC, TAB, CTRL
- [ ] Works in Safari (iOS 15+)

---

## Security

- Session isolation via unique directory
- No shell injection protection (user owns session)
- Auto-kill inactive sessions
- No root access (isolated user)

---

## File Structure

```
src/
├── app/
│   ├── terminal/
│   │   └── page.tsx          # Terminal page
│   └── api/
│       └── terminal/
│           └── route.ts      # WebSocket server
├── components/
│   ├── Terminal.tsx          # Main terminal component
│   ├── TerminalHeader.tsx    # Session header
│   └── TouchToolbar.tsx      # Mobile quick buttons
└── lib/
    ├── terminal/
    │   ├── sessions.ts      # Session manager
    │   └── shell.ts         # Shell wrapper
```