export interface Timestamp {
    seconds: number;
    nanoseconds: number;
}
export interface Location {
    city: string;
    state: string;
    country: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
}
export interface PaginationParams {
    limit?: number;
    offset?: number;
    cursor?: string;
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    hasMore: boolean;
    nextCursor?: string;
}
export type UserType = 'job_seeker' | 'employer';
export type NotificationChannel = 'email' | 'push' | 'sms';
export interface NotificationSettings {
    email: boolean;
    push: boolean;
    sms: boolean;
    matches: boolean;
    messages: boolean;
    meetings: boolean;
}
export interface PrivacySettings {
    profileVisibility: 'public' | 'private' | 'network_only';
    showLocation: boolean;
    showContact: boolean;
}
//# sourceMappingURL=common.d.ts.map