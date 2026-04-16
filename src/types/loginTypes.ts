export interface LoginFormValues {
  username: string;
  password: string;
  tenant_domain: string;
  browserToken: string;
  rememberMe: boolean;
  campaign_uuid: string; // ← ✅ Add this line

}
