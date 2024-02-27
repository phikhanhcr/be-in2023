export interface ISignInRequest {
    username: string;
    password: string;
    device_id: string;
}

export interface ISignUpRequest {
    email: string;
    username: string;
    password1: string;
    password2: string;
}
