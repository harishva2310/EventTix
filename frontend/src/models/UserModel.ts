export interface UserResponse {
    user_id: number;
    firstName: string | null;
    lastName: string | null;
    address: string | null;
    phoneNumber: string | null;
    email: string;
}