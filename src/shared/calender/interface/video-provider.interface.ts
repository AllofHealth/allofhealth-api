//  Video Provider Interface - For video consultation platforms (Doxy.me)
export interface IVideoProvider {
    // Create a video room
    createRoom(params: CreateRoomParams): Promise<VideoRoomResponse>;

    // Get room details
    getRoom(roomId: string): Promise<VideoRoomResponse>;

    // Delete/disable a room
    deleteRoom(roomId: string): Promise<void>;
}

// Room Creation Parameters
export interface CreateRoomParams {
    name: string;
    privacy?: 'public' | 'private';
    properties?: {
        enableRecording?: boolean;
        maxParticipants?: number;
        expiresAt?: Date;
    };
    metadata?: Record<string, any>;
}

// Video Room Response
export interface VideoRoomResponse {
    id: string;
    name: string;
    url: string;
    meetingToken?: string;
    config?: Record<string, any>;
    expiresAt?: Date;
}