import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ConnectionQuality,
  DisconnectReason,
  Participant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent,
  Track,
  TrackPublication,
} from 'livekit-client';
import {
  EndCallIcon,
  MaximizeIcon,
  MicIcon,
  MinimizeIcon,
  VideoIcon,
} from '../icons.js';

export type CallEndReason =
  | 'local'
  | 'remote-left'
  | 'duplicate'
  | 'removed'
  | 'server'
  | 'network';

export interface CallEndInfo {
  reason: CallEndReason;
  message: string;
}

export interface CallRoomProps {
  serverUrl: string;
  token: string;
  callerName?: string;
  minimized?: boolean;
  audioDeviceId?: string;
  videoDeviceId?: string;
  initialCameraOn?: boolean;
  waitingText?: string;
  onEnd?: (info?: CallEndInfo) => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const mapDisconnect = (reason?: DisconnectReason): CallEndInfo => {
  switch (reason) {
    case DisconnectReason.CLIENT_INITIATED:
      return { reason: 'local', message: '' };
    case DisconnectReason.DUPLICATE_IDENTITY:
      return { reason: 'duplicate', message: 'You joined this call from another device.' };
    case DisconnectReason.PARTICIPANT_REMOVED:
      return { reason: 'removed', message: 'You were removed from the call.' };
    case DisconnectReason.SERVER_SHUTDOWN:
    case DisconnectReason.ROOM_DELETED:
      return { reason: 'server', message: 'The call was ended.' };
    default:
      return {
        reason: 'network',
        message: 'Call disconnected. Please check your connection.',
      };
  }
};

const getInitials = (name?: string) => {
  const parts = (name || '').trim().split(' ').filter(Boolean).slice(0, 2);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const formatDuration = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const qualityLevel = (q: ConnectionQuality) => {
  if (q === ConnectionQuality.Excellent) return 3;
  if (q === ConnectionQuality.Good) return 2;
  if (q === ConnectionQuality.Poor) return 1;
  return 0;
};

const NetworkBars = ({ quality }: { quality: ConnectionQuality }) => {
  const level = qualityLevel(quality);
  const tone = level >= 2 ? 'good' : level === 1 ? 'poor' : 'lost';
  const label =
    level >= 3 ? 'Excellent' : level === 2 ? 'Good' : level === 1 ? 'Weak' : 'Connecting';
  return (
    <div
      className={`ihrtc-netbars ihrtc-netbars--${tone}`}
      title={`Network: ${label}`}
      aria-label={`Network quality: ${label}`}
    >
      {[1, 2, 3].map(b => (
        <span
          key={b}
          className={`ihrtc-netbars__bar${b <= level ? ' ihrtc-netbars__bar--on' : ''}`}
        />
      ))}
    </div>
  );
};

const CallRoom = ({
  serverUrl,
  token,
  callerName,
  minimized = false,
  audioDeviceId,
  videoDeviceId,
  initialCameraOn = true,
  waitingText = 'Waiting for the doctor to join…',
  onEnd,
  onMinimize,
  onMaximize,
}: CallRoomProps) => {
  const remoteRef = useRef<HTMLVideoElement>(null);
  const localRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<Room | null>(null);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;
  const remoteEverJoinedRef = useRef(false);
  const endedRef = useRef(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(initialCameraOn);
  const [remoteCamOn, setRemoteCamOn] = useState(false);
  const [remotePresent, setRemotePresent] = useState(false);
  const [connected, setConnected] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [quality, setQuality] = useState<ConnectionQuality>(
    ConnectionQuality.Unknown
  );

  useEffect(() => {
    if (!serverUrl || !token) return undefined;
    const room = new Room({ adaptiveStream: true, dynacast: true });
    roomRef.current = room;

    const fireEnd = (info?: CallEndInfo) => {
      if (endedRef.current) return;
      endedRef.current = true;
      onEndRef.current?.(info);
    };

    const isRemoteVideo = (pub: TrackPublication, p: Participant) =>
      !p.isLocal && pub.kind === Track.Kind.Video;
    const syncRemotePresence = () => {
      const present = room.remoteParticipants.size > 0;
      if (present) remoteEverJoinedRef.current = true;
      setRemotePresent(present);
    };

    room
      .on(RoomEvent.TrackSubscribed, (track: RemoteTrack, pub: RemoteTrackPublication) => {
        if (track.kind === Track.Kind.Video && remoteRef.current) {
          track.attach(remoteRef.current);
          setRemoteCamOn(!pub.isMuted);
        } else if (track.kind === Track.Kind.Audio) {
          track.attach();
        }
      })
      .on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
        track.detach();
        if (track.kind === Track.Kind.Video) setRemoteCamOn(false);
      })
      .on(RoomEvent.TrackMuted, (pub, p) => {
        if (isRemoteVideo(pub, p)) setRemoteCamOn(false);
      })
      .on(RoomEvent.TrackUnmuted, (pub, p) => {
        if (isRemoteVideo(pub, p)) setRemoteCamOn(true);
      })
      .on(RoomEvent.ParticipantConnected, syncRemotePresence)
      .on(RoomEvent.ParticipantDisconnected, () => {
        syncRemotePresence();
        if (remoteEverJoinedRef.current && room.remoteParticipants.size === 0) {
          fireEnd({
            reason: 'remote-left',
            message: 'The doctor has left the call.',
          });
        }
      })
      .on(RoomEvent.ConnectionQualityChanged, (q, p) => {
        if (p?.isLocal) setQuality(q);
      })
      .on(RoomEvent.Disconnected, (reason?: DisconnectReason) => {
        if (!cancelled) fireEnd(mapDisconnect(reason));
      });

    let cancelled = false;
    const stopLocalTracks = () =>
      room.localParticipant.trackPublications.forEach(pub => {
        pub.track?.stop();
        const mst = (pub.track as { mediaStreamTrack?: MediaStreamTrack } | undefined)
          ?.mediaStreamTrack;
        if (mst && mst.readyState !== 'ended') mst.stop();
      });

    (async () => {
      try {
        await room.connect(serverUrl, token);
        if (cancelled) {
          room.disconnect();
          return;
        }
        setConnected(true);
        syncRemotePresence();
        const micPub = await room.localParticipant.setMicrophoneEnabled(
          true,
          audioDeviceId ? { deviceId: audioDeviceId } : undefined
        );
        if (cancelled) return micPub?.track?.stop();
        const camPub = await room.localParticipant.setCameraEnabled(
          initialCameraOn,
          videoDeviceId ? { deviceId: videoDeviceId } : undefined
        );
        if (cancelled) {
          micPub?.track?.stop();
          camPub?.track?.stop();
          return;
        }
        if (camPub?.track && localRef.current) camPub.track.attach(localRef.current);
      } catch {
        fireEnd({
          reason: 'network',
          message: 'Could not connect to the call. Please try again.',
        });
      }
    })();

    return () => {
      cancelled = true;
      stopLocalTracks();
      room.disconnect();
      roomRef.current = null;
    };
  }, [serverUrl, token, audioDeviceId, videoDeviceId, initialCameraOn]);

  useEffect(() => {
    if (!connected) return undefined;
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [connected]);

  const toggleMic = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;
    const next = !room.localParticipant.isMicrophoneEnabled;
    room.localParticipant.setMicrophoneEnabled(next).catch(() => {});
    setMicOn(next);
  }, []);

  const toggleCam = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;
    const next = !room.localParticipant.isCameraEnabled;
    room.localParticipant.setCameraEnabled(next).catch(() => {});
    setCamOn(next);
    const camPub = room.localParticipant.getTrackPublication(Track.Source.Camera);
    if (next && camPub?.track && localRef.current) camPub.track.attach(localRef.current);
  }, []);

  if (!serverUrl || !token) return null;

  const name = callerName || 'Doctor';
  const fallbackSub = !connected
    ? 'Connecting…'
    : !remotePresent
      ? waitingText
      : 'Camera is off';

  return (
    <div className={`ihrtc-room${minimized ? ' ihrtc-room--min' : ''}`}>
      <video
        ref={remoteRef}
        autoPlay
        playsInline
        className="ihrtc-room__remote"
        style={{ display: remoteCamOn ? 'block' : 'none' }}
      />
      {!remoteCamOn && (
        <div className="ihrtc-room__fallback">
          <div className="ihrtc-room__avatar">{getInitials(name)}</div>
          <p className="ihrtc-room__fallback-name">{name}</p>
          <p className="ihrtc-room__fallback-sub">{fallbackSub}</p>
        </div>
      )}

      <div className="ihrtc-room__caller">
        <span className="ihrtc-room__caller-name">{name}</span>
        <span className="ihrtc-room__caller-role">General Physician</span>
      </div>

      {connected && !minimized && <NetworkBars quality={quality} />}

      {connected && <div className="ihrtc-room__timer">{formatDuration(seconds)}</div>}

      {!minimized && onMinimize && (
        <button
          type="button"
          onClick={onMinimize}
          aria-label="Minimize call"
          className="ihrtc-room__min-btn"
        >
          <MinimizeIcon />
        </button>
      )}

      <div className="ihrtc-room__pip">
        <video
          ref={localRef}
          autoPlay
          playsInline
          muted
          className="ihrtc-room__local"
          style={{ display: camOn ? 'block' : 'none' }}
        />
        {!camOn && <div className="ihrtc-room__pip-off">Camera off</div>}
        <span className="ihrtc-room__pip-label">You</span>
      </div>

      {minimized ? (
        <div className="ihrtc-room__bar ihrtc-room__bar--min">
          <button
            type="button"
            onClick={onMaximize}
            aria-label="Expand call"
            className="ihrtc-room__ctrl ihrtc-room__ctrl--sm"
          >
            <MaximizeIcon className="ihrtc-icon-sm" />
          </button>
          <button
            type="button"
            onClick={() => onEnd?.()}
            aria-label="End call"
            className="ihrtc-room__ctrl ihrtc-room__ctrl--sm ihrtc-room__ctrl--end"
          >
            <EndCallIcon className="ihrtc-icon-sm" />
          </button>
        </div>
      ) : (
        <div className="ihrtc-room__bar">
          <button
            type="button"
            onClick={toggleMic}
            aria-label="Toggle microphone"
            className={`ihrtc-room__ctrl${micOn ? '' : ' ihrtc-room__ctrl--off'}`}
          >
            <MicIcon on={micOn} />
          </button>
          <button
            type="button"
            onClick={toggleCam}
            aria-label="Toggle camera"
            className={`ihrtc-room__ctrl${camOn ? '' : ' ihrtc-room__ctrl--off'}`}
          >
            <VideoIcon on={camOn} />
          </button>
          <button
            type="button"
            onClick={() => onEnd?.()}
            aria-label="End call"
            className="ihrtc-room__ctrl ihrtc-room__ctrl--end"
          >
            <EndCallIcon className="ihrtc-icon" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CallRoom;
