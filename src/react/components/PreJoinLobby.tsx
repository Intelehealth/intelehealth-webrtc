import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckIcon, MicIcon, VideoIcon } from '../icons.js';

export interface PreJoinDevices {
  audioDeviceId?: string;
  videoDeviceId?: string;
  cameraEnabled: boolean;
}

export interface PreJoinLobbyProps {
  doctorName?: string;
  patientName?: string;
  doctorPresent?: boolean;
  joining?: boolean;
  onJoin: (devices: PreJoinDevices) => void;
}

const getInitials = (name?: string) => {
  const parts = (name || '').trim().split(' ').filter(Boolean).slice(0, 2);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const PreJoinLobby = ({
  doctorName,
  patientName,
  doctorPresent = false,
  joining = false,
  onJoin,
}: PreJoinLobbyProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDeviceId, setAudioDeviceId] = useState<string | undefined>();
  const [videoDeviceId, setVideoDeviceId] = useState<string | undefined>();
  const [cameraOn, setCameraOn] = useState(true);
  const [micReady, setMicReady] = useState(false);
  const [busy, setBusy] = useState(true);
  const [permissionError, setPermissionError] = useState<string | undefined>();
  const [cameraNote, setCameraNote] = useState<string | undefined>();

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(
    async (aId: string | undefined, vId: string | undefined, wantCam: boolean) => {
      setBusy(true);
      const audioConstraint: MediaTrackConstraints | boolean = aId
        ? { deviceId: { exact: aId } }
        : true;
      const videoConstraint: MediaTrackConstraints | boolean = wantCam
        ? vId
          ? { deviceId: { exact: vId } }
          : true
        : false;
      let stream: MediaStream | null = null;
      let camApplied = wantCam;
      try {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: audioConstraint,
            video: videoConstraint,
          });
        } catch (err) {
          if (wantCam) {
            stream = await navigator.mediaDevices.getUserMedia({
              audio: audioConstraint,
              video: false,
            });
            camApplied = false;
            setCameraNote('Camera unavailable — you can still join with audio.');
          } else {
            throw err;
          }
        }
        stopStream();
        streamRef.current = stream;
        const aTrack = stream.getAudioTracks()[0];
        const vTrack = stream.getVideoTracks()[0];
        setMicReady(!!aTrack);
        setCameraOn(!!vTrack && camApplied);
        if (vTrack) setCameraNote(undefined);
        if (videoRef.current) videoRef.current.srcObject = stream;
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAudioDevices(devices.filter(d => d.kind === 'audioinput' && d.deviceId));
        setVideoDevices(devices.filter(d => d.kind === 'videoinput' && d.deviceId));
        setAudioDeviceId(aTrack?.getSettings().deviceId ?? aId);
        setVideoDeviceId(vTrack?.getSettings().deviceId ?? vId);
        setPermissionError(undefined);
      } catch {
        stopStream();
        setMicReady(false);
        setPermissionError(
          'Microphone access is needed to join. Tap "Allow microphone & camera" below — if nothing happens, enable them in your browser site settings.'
        );
      } finally {
        setBusy(false);
      }
    },
    [stopStream]
  );

  useEffect(() => {
    start(undefined, undefined, true);
    return () => stopStream();
  }, [start, stopStream]);

  const onAudioChange = (id: string) => start(id, videoDeviceId, cameraOn);
  const onVideoChange = (id: string) => start(audioDeviceId, id, true);
  const toggleCamera = () => start(audioDeviceId, videoDeviceId, !cameraOn);

  const handleJoin = () => {
    if (!micReady || busy || joining) return;
    stopStream();
    onJoin({ audioDeviceId, videoDeviceId, cameraEnabled: cameraOn });
  };

  const requestAccess = () => start(audioDeviceId, videoDeviceId, true);

  const heading = doctorPresent ? 'Doctor is waiting' : 'Doctor will join soon';
  const sub = doctorPresent
    ? 'You can now join the consultation.'
    : 'You can join now and wait in the room — the doctor will join shortly.';
  const name = patientName || 'You';

  return (
    <div className="ihrtc-lobby">
      <div className="ihrtc-lobby__card">
        <div className="ihrtc-lobby__brand">Intelehealth</div>

        <div className="ihrtc-lobby__preview">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="ihrtc-lobby__video"
            style={{ display: cameraOn ? 'block' : 'none' }}
          />
          {!cameraOn && (
            <div className="ihrtc-lobby__preview-off">
              <div className="ihrtc-lobby__avatar">{getInitials(name)}</div>
              <span>Camera is off</span>
            </div>
          )}
          <div className="ihrtc-lobby__preview-bar">
            <span
              className={`ihrtc-lobby__mic-state${micReady ? '' : ' ihrtc-lobby__mic-state--bad'}`}
            >
              <MicIcon on={micReady} />
              {micReady ? 'Mic ready' : 'No mic'}
            </span>
            <button
              type="button"
              onClick={toggleCamera}
              disabled={busy}
              aria-label="Toggle camera"
              className={`ihrtc-lobby__toggle${cameraOn ? '' : ' ihrtc-lobby__toggle--off'}`}
            >
              <VideoIcon on={cameraOn} />
            </button>
          </div>
        </div>

        <div
          className={`ihrtc-lobby__status${doctorPresent ? ' ihrtc-lobby__status--ready' : ''}`}
        >
          <span className="ihrtc-lobby__status-icon">
            <CheckIcon className="ihrtc-icon-sm" />
          </span>
          <div>
            <p className="ihrtc-lobby__status-title">{heading}</p>
            <p className="ihrtc-lobby__status-sub">{sub}</p>
          </div>
        </div>

        <div className="ihrtc-lobby__devices">
          <label className="ihrtc-lobby__device">
            <span className="ihrtc-lobby__device-label">Microphone</span>
            <select
              className="ihrtc-lobby__select"
              value={audioDeviceId ?? ''}
              disabled={busy || !audioDevices.length}
              onChange={e => onAudioChange(e.target.value)}
            >
              {!audioDevices.length && <option value="">Default microphone</option>}
              {audioDevices.map((d, i) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Microphone ${i + 1}`}
                </option>
              ))}
            </select>
          </label>
          <label className="ihrtc-lobby__device">
            <span className="ihrtc-lobby__device-label">Camera</span>
            <select
              className="ihrtc-lobby__select"
              value={videoDeviceId ?? ''}
              disabled={busy || !cameraOn || !videoDevices.length}
              onChange={e => onVideoChange(e.target.value)}
            >
              {!videoDevices.length && <option value="">No camera</option>}
              {videoDevices.map((d, i) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Camera ${i + 1}`}
                </option>
              ))}
            </select>
          </label>
        </div>

        {cameraNote && <p className="ihrtc-lobby__note">{cameraNote}</p>}
        {permissionError && <p className="ihrtc-lobby__error">{permissionError}</p>}

        {micReady ? (
          <button
            type="button"
            className="ihrtc-lobby__join"
            disabled={busy || joining}
            onClick={handleJoin}
          >
            {joining ? 'Joining…' : busy ? 'Checking devices…' : 'Join Consultation'}
          </button>
        ) : (
          <button
            type="button"
            className="ihrtc-lobby__join"
            disabled={busy}
            onClick={requestAccess}
          >
            {busy ? 'Requesting access…' : 'Allow microphone & camera'}
          </button>
        )}

        {micReady && cameraNote && (
          <button
            type="button"
            className="ihrtc-lobby__link-btn"
            disabled={busy}
            onClick={requestAccess}
          >
            Enable camera
          </button>
        )}

        <p className="ihrtc-lobby__terms">
          {doctorName ? `Consultation with ${doctorName}` : 'Secure video consultation'}
        </p>
      </div>
    </div>
  );
};

export default PreJoinLobby;
