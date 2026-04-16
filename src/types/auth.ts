export type AuthContextType = {
    user: any;
    isLoggedIn: boolean;
    login: (
        username: string,
        password: string,
        tenant_domain: string,
        browserToken: string,
        rememberMe: boolean,
        campaign_uuid: string

    ) => Promise<void>;
    logout: (userId: string, autologout?: string) => Promise<void>;
    forgotPassword: (
        username: string,
        entity: string,
        tenant_domain: string
    ) => Promise<void>;
    updatePassword: (
        password: string,
        uuid: string,
        entity: string
    ) => Promise<void>;
    switchRole: () => Promise<void>;
};
