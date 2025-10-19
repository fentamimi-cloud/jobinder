export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    errors?: ValidationError[];
    meta?: {
        total?: number;
        page?: number;
        limit?: number;
        hasMore?: boolean;
    };
}
export interface ValidationError {
    field: string;
    message: string;
    code: string;
}
export interface AuthenticatedRequest {
    user: {
        uid: string;
        email?: string;
        emailVerified: boolean;
        customClaims?: any;
    };
}
export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}
//# sourceMappingURL=api.d.ts.map