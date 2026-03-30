export interface IMessage {
  type:
    | 'offer'
    | 'answer'
    | 'ice-candidate'
    | 'joined'
    | 'self-joined'
    | 'joined-metadata';
  roomId?: string | null;
  roomName?: string;
  userName?: string;
  streamId?: string;
  clients?: {
    streamId: string;
    userName: string;
    socket: WebSocket;
  }[];
  data: unknown;
}

export interface IRemoteUser {
  streamId: string;
  userName: string;
  isMuted: boolean;
  isVideoOff: boolean;
  stream: MediaStream | null;
  color: string;
}
