export { SOCKET_EVENTS, type SocketEventName } from './socket/events';
export { CALL_STATUSES } from './socket/types';
export type {
  CallStatus,
  SocketUser,
  CallData,
  IncomingCallData,
  ByeData,
  CallConnectedData,
  ToastData,
} from './socket/types';
export {
  SignalingSocket,
  type SignalingSocketOptions,
  type SocketHandler,
  type Unsubscribe,
  type ConnectOptions,
  type RawSocket,
} from './socket/signaling-socket';

export {
  IncomingCallProvider,
  useIncomingCall,
  useIncomingCallContext,
  type CallProviderConfig,
  type WebRTCUser,
} from './react/IncomingCallProvider';

export { default as IncomingCallModal } from './react/components/IncomingCallModal';
export {
  default as CallRoom,
  type CallRoomProps,
} from './react/components/CallRoom';

export {
  AcceptCallIcon,
  DeclineCallIcon,
  EndCallIcon,
  MaximizeIcon,
} from './react/icons';

export type {
  IncomingCallPayload,
  IncomingCallContextType,
  IncomingCallModalProps,
} from './react/types';
