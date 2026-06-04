# intelehealth-webrtc

A React WebRTC boilerplate template for building video call components.

## Getting started

### Install dependencies

```bash
npm install
```

### Development mode

Start watch mode to compile changes automatically:

```bash
npm run dev
```

### Build for production

Create an optimized build:

```bash
npm run build
```

## Project structure

```
src/
├── index.ts          # Package exports
├── VideoCall.tsx     # React component with TODO implementations
└── useWebRTC.ts      # WebRTC hook with TODO implementations



### Use in another local React project

Add to your project's `package.json`:

```json
"dependencies": {
  "@intelehealth/webrtc": "file:../intelehealth-webrtc"
}
```

Then run `npm install` in your project.

## Basic usage

```tsx
import { VideoCall } from "@intelehealth/webrtc";
import { useState } from "react";

export function App() {
  const [remoteSdp, setRemoteSdp] = useState<RTCSessionDescriptionInit>();
  const [remoteCandidate, setRemoteCandidate] = useState<RTCIceCandidateInit>();

  return (
    <VideoCall
      onCreateOffer={async (offer) => {
        // Send offer to remote peer via signaling
      }}
      onCreateAnswer={async (answer) => {
        // Send answer to remote peer via signaling
      }}
      onSendIceCandidate={(candidate) => {
        // Send ICE candidate to remote peer
      }}
      remoteSdp={remoteSdp}
      remoteIceCandidate={remoteCandidate}
      onError={(error) => console.error(error)}
    />
  );
}
```

## Implementation

Both `src/useWebRTC.ts` and `src/VideoCall.tsx` have TODO comments marking the areas that need WebRTC implementation. Start there to add the actual functionality.

## Publishing to npm

Before publishing, implement the WebRTC logic in the TODO sections.

### 1. Update version

Edit `package.json` and update the version:

```json
"version": "0.1.0"
```

### 2. Build the package

```bash
npm run build
```

### 3. Publish to npm

```bash
npm publish --access public
```

Requires:
- npm account
- Logged in: `npm login`

## Using after publishing

Once published to npm, install in any React project:

```bash
npm install @intelehealth/webrtc
```

Then import and use:

```tsx
import { VideoCall } from "@intelehealth/webrtc";
import { useState } from "react";

export function MyApp() {
  const [remoteSdp, setRemoteSdp] = useState<RTCSessionDescriptionInit>();
  const [remoteCandidate, setRemoteCandidate] = useState<RTCIceCandidateInit>();

  return (
    <VideoCall
      onCreateOffer={async (offer) => {
        // Send offer to signaling server
      }}
      onCreateAnswer={async (answer) => {
        // Send answer to signaling server
      }}
      onSendIceCandidate={(candidate) => {
        // Send ICE candidate to signaling server
      }}
      remoteSdp={remoteSdp}
      remoteIceCandidate={remoteCandidate}
      onError={(error) => console.error(error)}
    />
  );
}
```
