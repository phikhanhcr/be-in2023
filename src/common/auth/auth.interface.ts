export interface IAuthUser {
    id: number;
    name: string;
    device_id?: string;
}

export interface IResetPassword {
    old_password: string;
    new_password: string;
    new_duplicated_password: string;
    force_logout: boolean;
}

export interface IRefreshToken {
    device_id: string;
    refresh_token: string;
}
