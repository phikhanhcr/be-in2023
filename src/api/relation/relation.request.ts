export interface IRequestFollowing {
    receiver_id: number;
}

export interface IAcceptRequest {
    sender_id: number;
}

export interface IRejectRequest {
    sender_id: number;
}

export interface IUnFollowRequest {
    receiver_id: number;
}
