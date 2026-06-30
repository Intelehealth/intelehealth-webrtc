export const CALL_STATUSES = {
  CALLING: 'calling',
  IN_CALL: 'in_call',
  DR_REJECTED: 'dr_rejected',
  HW_REJECTED: 'hw_rejected',
  DR_CANCELLED: 'dr_cancelled',
  HW_CANCELLED: 'hw_cancelled',
  IDLE: 'available',
  SUCCESS: 'success',
  UNSUCCESS: 'failure',
} as const;

export type CallStatus = (typeof CALL_STATUSES)[keyof typeof CALL_STATUSES];

export interface SocketUser {
  socketId: string;
  uuid: string;
  name?: string;
  status?: string;
  callStatus?: CallStatus | string;
  room?: string | null;
  nurseId?: string;
  recordId?: string | number;
}

export interface CallData {
  nurseId: string;
  roomId: string;
  doctorId?: string;
  doctorName?: string;
  connectToDrId?: string;
  visitId?: string;
  [key: string]: unknown;
}

export interface IncomingCallData {
  patientId?: string;
  nurseId?: string;
  connectToDrId?: string;
  roomId?: string;
  appSocketId?: string;
  doctorName?: string;
  patientName?: string;
  visitId?: string;
  [key: string]: unknown;
}

export interface ByeData {
  socketId?: string;
  appSocketId?: string;
  doctorId?: string;
  nurseId?: string;
  roomId?: string;
  recordId?: string | number;
  [key: string]: unknown;
}

export interface CallConnectedData {
  room?: string;
  roomId?: string;
  initiator?: 'dr' | 'hw';
  socketId?: string;
  nurseId?: string;
  connectToDrId?: string;
  appSocketId?: string;
  [key: string]: unknown;
}

export interface ToastData {
  duration: number;
  message: string;
}
