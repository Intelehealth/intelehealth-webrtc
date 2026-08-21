# @intelehealth/webrtc

Drop-in video consultation UI for Intelehealth's React apps: incoming-call modal, in-call room, and a pre-join device-check lobby. Handles call signaling over Socket.IO and media over [LiveKit](https://livekit.io/).

## Used by

Published to npm as a pluggable package (not a monorepo-local workspace package) and consumed by [`hw-webapp-react`](../hw-webapp-react) (`^1.1.0` in its `package.json`), in two distinct places:

- **`App.tsx`** wraps the whole app in `IncomingCallProvider`, wired to `VITE_PORTAL_SOCKET_URL` / `VITE_WEBRTC_SDK_SERVER_URL`, with `onAccept`/`onDecline`/`onEnd` used to dismiss FCM push-notification call banners (`fcmService.closeCallNotifications()`) and show an end-of-call toast. This is the doctor-initiated-call path (health worker receives the ring, the provider auto-mounts `CallRoom`).
- **`pages/join-call/join-call.page.tsx`** uses `PreJoinLobby` and `CallRoom` directly (outside the provider) for the "join via link" flow: `PreJoinLobby`'s `onJoin` result (selected mic/camera device IDs) is held in local state and passed straight into `CallRoom`'s `audioDeviceId`/`videoDeviceId`/`initialCameraOn` props once the user leaves the lobby.

No other repo in this workspace depends on it today — `intelehealth-doctor-webapp` has its own, unrelated call-UI code and does not import this package.

## Architecture

Two separate transports, kept deliberately decoupled:

- **Signaling (`SignalingSocket`)** — a thin wrapper around `socket.io-client` v2. Carries call setup/teardown events (`call`, `bye`, `cancel_hw`, `hw_call_reject`, presence via `allUsers`, etc.) between doctor, health worker, and patient app. It does **not** carry media.
- **Media (`CallRoom`)** — connects to a LiveKit room using a server URL + access token. Audio/video tracks, mic/camera toggles, connection-quality indicator, and call-duration timer all live here. The LiveKit token/room URL must come from your own backend (this package has no opinion on how the token was minted).

`IncomingCallProvider` is the glue: it owns the `SignalingSocket` connection, listens for `call`/`incoming_call` events, shows `IncomingCallModal`, and on accept mounts `CallRoom` with the token from the incoming-call payload. `PreJoinLobby` is exported separately and is **not** wired into the provider — if you want a device-check step before joining, render it yourself and pass its output into your own join flow.

## Prerequisites

This package is a **client only** — it has no server, and no code that mints LiveKit tokens (it depends on `livekit-client`, never `livekit-server-sdk`). Before wiring it into an app, two backend pieces need to already exist and be reachable:

1. **A running LiveKit server.** In this workspace it's self-hosted (not LiveKit Cloud) — evidenced by `backend-services/web-rtc`'s config using a `LIVEHOST`/`LIVEKIT_ROOM_HOST` address plus explicit TCP/UDP media ports (`7881`/`7882`, LiveKit's defaults for a self-hosted deploy) rather than a LiveKit Cloud project URL. Its WebSocket URL is what you pass as `liveKitUrl`.
2. **A token-minting endpoint.** `backend-services/web-rtc` is that service here: `GET /api/getToken` (auth-protected, `main.controller.ts`) uses `livekit-server-sdk`'s `AccessToken`/`VideoGrant` (`services/webrtc.service.ts`) to mint a room-scoped JWT, using that service's own `API_KEY`/`SECRET` env vars (the LiveKit server's API key pair — unrelated to any npm/package credentials). A separate guest-token path (`getGuestToken`) backs the `/api/magic-link/*` routes for the turn.io "join by WhatsApp link" flow. **This package never talks to that backend for you** — the consuming app calls it, and passes the resulting `token` (for `CallRoom`/`PreJoinLobby` flows) or embeds it in the incoming-call payload (for `IncomingCallProvider`, which reads `activeCall.token`) itself.

If either piece isn't set up, `CallRoom` renders `null` (no `serverUrl`/`token`) or fails the room connection silently into an `onEnd({ reason: 'network' })` callback — there's no other error surface, so a blank call screen is the first symptom of a missing LiveKit server or token endpoint.

## Install

```bash
npm install @intelehealth/webrtc
```

`livekit-client` and `socket.io-client` are regular dependencies of this package (installed automatically); `react` and `react-dom` (>=18) are peer dependencies — install those in the consuming app if not already present. (`hw-webapp-react` additionally pins `livekit-client` itself at the same version in its own `package.json`, though nothing in its source imports from it directly — do the same only if you need to import LiveKit types/APIs yourself.)

Import the stylesheet once, globally:

```ts
import '@intelehealth/webrtc/styles.css';
```

All class names are prefixed `ihrtc-` to avoid collisions with app styles.

## Quick start

```tsx
import { IncomingCallProvider, useIncomingCall } from '@intelehealth/webrtc';
import '@intelehealth/webrtc/styles.css';

function App() {
  return (
    <IncomingCallProvider
      config={{
        socketUrl: 'https://your-signaling-server',
        liveKitUrl: 'wss://your-livekit-server',
        user: { uuid: currentUser.uuid, name: currentUser.name },
      }}
    >
      <Dashboard />
    </IncomingCallProvider>
  );
}
```

`IncomingCallProvider` renders the incoming-call modal and the active-call room itself — nothing else to mount. Use `useIncomingCall()` anywhere under the provider to read call state or trigger actions (e.g. a manual "end call" button elsewhere in the UI):

```tsx
const { isActiveCallOpen, endActiveCall } = useIncomingCall();
```

## API reference

### `IncomingCallProvider` / `useIncomingCall`

`config` (`CallProviderConfig`), all optional except noted:

| field | type | notes |
|---|---|---|
| `socketUrl` | `string` | Required to actually connect. Without it (or without `user.uuid`) the provider renders children only, no socket. |
| `liveKitUrl` | `string` | Passed through to `CallRoom` as `serverUrl`. |
| `user` | `{ uuid: string; name: string }` | Identity sent as socket query params (`userId`, `name`). |
| `autoConnect` | `boolean` (default `true`) | Passed to `SignalingSocket`. |
| `socketOptions` | `Record<string, unknown>` | Raw socket.io-client connect options. |
| `mapIncomingCall` | `(raw) => IncomingCallPayload` | Override how a raw `call`/`incoming_call` socket payload is normalized. See `defaultMapIncomingCall` in `IncomingCallProvider.tsx` for the default field mapping (`doctorName`→`callerName`, `roomId`/`visitId` fallback chain, `autoJoin`/`isTurnServer` truthy check, etc). |
| `enableTestTrigger` | `boolean` (default `true`) | Exposes `window.triggerIncomingCall(partialPayload?)` for manually firing a fake incoming call from the browser console — useful for UI testing without a real caller. Disable in production if you don't want this on `window`. |
| `ringtone` / `ringtoneUrl` | `boolean` / `string` | Ringtone while the incoming-call modal is open. See `useRingtone` below. |
| `onAccept` / `onDecline` / `onEnd` | callbacks | Fired on the corresponding action; each receives the `SignalingSocket` instance so you can emit app-specific events. `onEnd` also receives `CallEndInfo` (see `CallRoom` below) explaining *why* the call ended. |

Notes on behavior:
- Duplicate incoming-call events for the same `roomId`/`visitId` within 4s are deduped (`DEDUPE_MS`).
- `autoJoin: true` payloads skip the modal and join directly, using the browser's [Web Locks API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API) (`navigator.locks`) to prevent the same call auto-joining twice across multiple open tabs. Falls back to joining immediately if Web Locks isn't available.
- Declining calls `socket.hwCallReject(doctorId)` and ending calls `socket.bye({...})` automatically — you don't need to emit these yourself.
- The active call renders as a fixed-position overlay (`.ihrtc-call-shell`) that can be minimized to a draggable picture-in-picture (dragging is handled internally via Pointer Events).

`useIncomingCall()` (alias of `useIncomingCallContext()`) returns `IncomingCallContextType`: `isIncomingCallOpen`, `isActiveCallOpen`, `isCallMinimized`, `incomingCall`, `activeCall`, `showIncomingCall`, `acceptIncomingCall`, `declineIncomingCall`, `endActiveCall`, `minimizeCall`, `maximizeCall`. Throws if called outside `IncomingCallProvider`.

### `SignalingSocket`

Use directly if you need signaling outside the React provider (e.g. a health-worker queue screen showing `allUsers` presence).

```ts
import { SignalingSocket } from '@intelehealth/webrtc';

const socket = new SignalingSocket({ url, userId, name });
const unsubscribe = socket.onIncomingCall(payload => { /* ... */ });
socket.call({ nurseId, roomId, doctorId });
// later
unsubscribe();
socket.disconnect();
```

- `connect()` / `disconnect()` / `reconnect(identity?)` manage the underlying socket; `reconnect` can swap `userId`/`name` (e.g. after login) without losing registered listeners — they're replayed onto the fresh socket.
- `on`/`once`/`off`/`emit` are low-level; typed convenience methods exist for every event the backend actually uses (`call`, `createOrJoinHw`, `bye`, `callConnected`, `cancelHw`, `cancelDr`, `hwCallReject`, `drCallReject`, `callTimeUp`, `ackMessageReceived`, `createOrJoin`, `sendMessage`) and their `on*` listener counterparts (`onAllUsers`, `onIncomingCall`, `onCall`, `onCallConnected`, `onCancelHw`, `onCancelDr`, `onHwCallReject`, `onDrCallReject`, `onCallTimeUp`, `onToast`).
- `SOCKET_EVENTS` (raw event name strings) and payload types (`CallData`, `IncomingCallData`, `ByeData`, `CallConnectedData`, `SocketUser`, `ToastData`) are exported for consumers who need to talk to the same backend without the wrapper.
- `CALL_STATUSES` enumerates the status strings the backend puts on `SocketUser.callStatus` (`calling`, `in_call`, `dr_rejected`, `hw_rejected`, `dr_cancelled`, `hw_cancelled`, `available`, `success`, `failure`).

### `CallRoom`

The LiveKit-backed in-call view. Normally mounted for you by `IncomingCallProvider`; use it directly only if you're building a custom call flow.

Key props: `serverUrl`, `token` (both required — renders `null` if either is empty), `callerName`, `minimized`, `audioDeviceId`/`videoDeviceId` (from `PreJoinLobby`), `initialCameraOn`, `waitingText`, `onEnd(info?: CallEndInfo)`, `onMinimize`, `onMaximize`.

`CallEndInfo.reason` is one of `'local' | 'remote-left' | 'duplicate' | 'removed' | 'server' | 'network'` — use it to show a specific message (e.g. "You joined this call from another device" for `duplicate`) rather than a generic "call ended" toast. The room also auto-fires `onEnd` with `reason: 'remote-left'` if the remote participant disconnects after having actually joined (not just failing to connect).

### `PreJoinLobby`

Standalone device-check screen (mic/camera permission prompt, device pickers, live preview). Not connected to anything else in this package — call `onJoin(devices: PreJoinDevices)` yourself and feed `devices.audioDeviceId`/`videoDeviceId`/`cameraEnabled` into wherever you mint the LiveKit token / render `CallRoom`.

### `IncomingCallModal`

The ringing-call UI shown by `IncomingCallProvider`. Exported in case you need to render it standalone; expects `open`, `callerName`, `patientName`, `openMrsId?`, `onAccept`, `onDecline`.

### `useRingtone(active, options?)`

`options.url` plays a looped `<audio>` element; without it, falls back to a generated two-tone `AudioContext` beep repeating every 3s. `options.enabled` (default `true`) and `options.volume` (default `0.18`) tune it. Cleans up fully (stops audio / closes the `AudioContext`) when `active` goes false or the component unmounts.

### Icons

`AcceptCallIcon`, `DeclineCallIcon`, `EndCallIcon`, `MaximizeIcon` are exported individually for reuse in custom UI; the rest (`MicIcon`, `VideoIcon`, `MinimizeIcon`, `CheckIcon`) are internal to `CallRoom`/`PreJoinLobby`.

## Local development

```bash
npm run dev     # tsc --watch, plus copies src/styles.css -> dist/styles.css once up front
npm run build    # one-shot build (tsc + copy styles)
npm run clean    # remove dist/
```

To iterate against a consuming app without publishing, symlink this package's `dist/` into the consumer's `node_modules/@intelehealth/webrtc` and keep `npm run dev` running here — the consumer's dev server needs a restart (not just a browser refresh) to pick up changes through a symlink, since most bundlers don't watch symlinked `node_modules` content.

There is currently no test suite or lint config in this repo — verify changes by exercising the actual call flow in a consuming app (`window.triggerIncomingCall()` is useful for this, see `enableTestTrigger` above).

## Publishing

`npm run prepublishOnly` (clean + build) runs automatically on `npm publish`. Version bumps and publishing are manual — this package is not on an automated release pipeline.
