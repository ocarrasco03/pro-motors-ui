import { api } from '@/services/api';
import type { AuthUser, LoginPayload, LoginResponse } from '@/types/types';

export const authService = {
    login: async (payload: LoginPayload): Promise<LoginResponse> => {
        const { data } = await api.post<LoginResponse>('/auth/login', payload);
        return data;
    },

    logout: async (): Promise<void> => {
        await api.post('/auth/logout');
    },

    me: async (): Promise<AuthUser> => {
        const { data } = await api.get<AuthUser>('/auth/me');
        return data;
    }
};