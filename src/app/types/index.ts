export interface IMessage {
  type:
    | 'offer'
    | 'answer'
    | 'ice-candidate'
    | 'joined'
    | 'self-joined'
    | 'joined-metadata'
    | 'disconnected'
    | 'toggle-mute'
    | 'toggle-video-off'
    | 'chat-message';
  roomId?: string | null;
  roomName?: string;
  userName?: string;
  streamId?: string;
  message?: string;
  client: IClient;
  clients?: IClient[];
  data: unknown;
}

interface IClient {
  streamId: string;
  userName: string;
  socket?: WebSocket;
}

export interface IRemoteUser {
  streamId: string;
  userName: string;
  isMuted: boolean;
  isVideoOff: boolean;
  stream: MediaStream | null;
  color: string;
}

export interface IChatMessage {
  message: string;
  type: 'me' | 'other';
  user: Omit<IClient, 'socket'>;
}
