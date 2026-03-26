export interface IMessage{
    type: 'offer' | 'answer' | 'ice-candidate' | 'joined' | 'self-joined';
    roomId?: string | null,
    data: unknown
}