interface CallPayload {
  roomId: string;
  callerId: string;
  callerName?: string;
  callerAvatar?: string | null;
  receiverId: string;
  receiverName?: string;
  receiverAvatar?: string | null;
  type?: 'AUDIO' | 'VIDEO';
  offer?: any;
  answer?: any;
  candidate?: any;
}

export default CallPayload;
