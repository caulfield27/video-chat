export interface IMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'joined' | 'self-joined' | 'joined-metadata';
  roomId?: string | null;
  roomName?: string;
  userName?: string;
  streamId?: string
  data: unknown;
}

export interface IRemoteUser {
  streamId: string;
  username: string;
  isMuted: boolean;
  isVideoOff: boolean;
  stream: MediaStream | null
  color: string;
}
