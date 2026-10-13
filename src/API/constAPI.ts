// AUTHENTICATION
export const AGENT_LOGIN = "/agent";
export const FORGOT_PASSWORD = "/auth/forgot-password";
export const UPDATE_PASSWORD = "/auth/update-password";
export const UPDATE_AUTH_STATUS = "/user/update-user-auth-status";
export const ADD_AGENT_ENTRY = "/agent-call-center/add-agent-entry";
export const AGENT_ADMIN_LOGOUT = "/agent-call-center/agent-admin-logout";
export const AGENT_CALL_QUEUE_LOGOUT = "/agent-call-center/call-queue/logout";
export const ALLOWED_CAMPAIGNS = "/user/allowed_campaigns";
export const LOGIN_PAGE_LOGOUT="/agent-call-center/login-page-logout";
export const FORCE_LOGIN="/agent-call-center/force-login-role"
/* ============================== PBX MODE ============================== */

// DASHBOARD
export const CALL_STATISTIC = "/cdrs/dashboard";
export const MISSED_CALL = "/cdrs/dashboard/missed-call";
export const VOICEMAIL = "/voicemail";
export const AGENT_TODAY_STATS = "/cdrs/agent-today-stats";

// REALTIME REPORT
export const REALTIME_REPORT = "/tenant/realtime-report/agents";
export const REALTIME_REPORT_SEARCH = "/tenant/realtime-report/advanced-search";
export const CAMPAIGN = "/agent-call-center/campaign";
export const CALL_PAUSE = "/tenant/realtime-report/call-pause";

// LEAD LIST
export const LEAD_MANAGEMENT = "/lead-management";
export const UNALLOCATED_LEAD_MANAGEMENT = "/lead-management/unallocated-leads/list";
export const LEAD_STATUS = "/pbx-lead-status";
export const LEAD_GROUP = "/lead-group";
export const CREATE_LEAD = "/lead-management/agent";
export const LEAD_MANAGEMENT_SEARCH = "/lead-management/advanced-search";
export const LEAD_MANAGEMENT_INFORMATION =
  "/lead-management/leads-with-call-info";
export const LEAD_FETCH = "/lead-management/tenant-leads/list";
export const LEAD_MANAGEMENT_CUSTOM_FIELDS = "/lead-management/custom-field";

// FOLLOW UP
export const FOLLOW_UP = "/follow-up";
export const FOLLOW_UP_SEARCH = "/follow-up/advanced-search";
export const FOLLOW_UP_ARCHIVE = "/follow-up/archive";
export const FOLLOW_UP_SINGLE = "/follow-up/lead";

// CDR REPORT
export const CDRS = "/cdrs";
export const CDRS_SEARCH = "/cdrs/advanced-search";

// DISPOSITION
export const DISPOSITION = "/disposition";

// CALL
export const EXTENSION = "/extension";
export const CALL_QUEUE = "/call-queue";
export const IVR = "/ivr";
export const RING_GROUP = "/ringgroup";
export const STICKY_AGENT = "/sticky-agent";
export const OUTBOUND_TRANSFER_LIST = "/outbound-campaign/list";
export const INBOUND_TRANSFER_LIST = "/inbound-campaign/list";
export const BLENDED_TRANSFER_LIST = "/blended-campaign/list";
export const MANUAL_DIAL = "/manual-dial";
export const PRESET = "/preset";
export const DISPOSTION_CAUSE = "/cdrs/check-disposition";

// NOTES
export const NOTES = "/notes";

// RECORDINGS
export const RECORDING = "/recordings";
export const RECORDING_SEARCH = "/recordings/advanced-search";

// COUNTRY
export const COUNTRY = "/country";

// SETTING
export const CHANGE_PASSWORD = "/profile/change-password";

// LOGIN / LOGOUT REPORT
export const LOGIN_LOGOUT_REPORT =
  "/agent-call-center/login-logout-report/list";
export const LOGIN_LOGOUT_REPORT_SEARCH =
  "/agent-call-center/login-logout-report/advanced-search";
export const LOGIN_LOGOUT_ENTRIES =
  "/agent-call-center/login-logout-report/entries";

/* ============================== CALL CENTER MODE ============================== */

// CAMPAIGN
export const OUTBOUND_CAMPAIGN = "/agent-call-center/campaign";
export const OUTBOUND_CAMPAIGN_OPTION =
  "/agent-call-center/logged-in-campaign/list";
export const CAMPAIGN_LIST = "agent-call-center/campaign/list";
export const RESUME_CAMPAIGN = "/agent-call-center/resume";
export const PAUSE_CAMPAIGN = "/agent-call-center/pause";
export const AGENT_STATUS = "/agent-call-center/agent-status";
export const AGENT_CAMPAIGN = "/agent-call-center/agent-campaign";
export const ADD_LIVE_AGENT_ENTRY = "/agent-call-center/add-entry-live-report";
export const UPDATE_LIVE_AGENT_ENTRY =
  "/agent-call-center/update-entry-live-report";
export const DELETE_LIVE_AGENT_ENTRY = "/agent-call-center/live-report";
export const CALL_QUEUE_LIST = "/agent-call-center/call-queue/list";
export const MANUAL_CALLER_IDS = "/agent-call-center/manual-caller-ids";
export const UPDATE_LEAD_STATUS = "/agent-call-center/update-lead-status-sent";
export const UPDATE_DIAL_LEVEL = "/agent-call-center/update-dial-level";
export const INBOUND_CALL_QUEUE = "/inbound-campaign/call-queue";
export const ADD_REPORT = "/agent-call-center";
export const CAMPAIGN_WEBFORMS = "/outbound-campaign/list";
export const BLENDED_CAMPAIGN_WEBFORMS = "/blended-campaign/list";
export const INBOUND_CAMPAIGN_WEBFORMS = "/inbound-campaign/list";
export const CAMPAIGN_WEBFORM_SEND = "/agent-call-center/send-webform";

// DASHBOARD
export const ALL_NOTES = "/agent-call-center/all-notes";
export const TOP_CDRS = "/agent-call-center/top10-cdrs";
export const ALL_LEADS = "/agent-call-center/all-leads";
export const HANGUP_CAUSE = "/outbound-campaign/dialable";
export const LEAD_SKIP = "/agent-call-center/skip";
export const LEAD_HANGUP = "/agent-call-center/hangup";

// BLACKLIST
export const BLACK_LIST = "/agent-call-center/add-blacklist-entry";


// BREAK CODES
export const BREAK_CODES = "/breakcode";
export const IN_BREAK = "/breakcode/inbreak";

//REPORT CALL WAITING COUNT
export const CALLWAITING_COUNT = "/agent-call-center/getcallwaitingcount/count";

// CHAT
export const CALL_WAITING_COUNT = "/agent-call-center/getcallwaitingcount/count";
export const WHATS_APP_MESSAGE_LIST = "/OmnichannelMessage/all_whatsappmessage";
// export const WHATS_APP_MESSAGE_LIST = "/WhatsappMessage/all_whatsappmessage";
export const ACTIVE_UNREAD_CHAT_LIST = "/OmnichannelSync/read_unreadsection";
// export const ACTIVE_UNREAD_CHAT_LIST = "/WhatsappMessage/read_unreadsection";
export const ACCEPT_CHAT = "/OmnichannelSync/webhook";
// export const ACCEPT_CHAT = "/Whatsappsync";
export const ACCEPT_OMNI_CHAT ="omnichannelsync/instagram"
export const SEND_INSTA_MESSAGE = "/OmnichannelMessage/instagram/send";
export const SEND_MESSAGE = "/OmnichannelMessage/WhatsApp/send";
export const SEND_FACEBOOK_MESSAGE = "/OmnichannelMessage/facebook/send";
export const END_CHAT = "/agent-call-center/omnichannel/end-chat";
export const TRANSFER_CHAT = "/agent-call-center/transfer-chat";
export const QUEUE_LIST = "/WhatsappMessage/select_queue";
export const CHANNEL_LIST = "/WhatsappMessage/messaging_queue_channel";
export const UPDATE_CHANNEL = "/agent-call-center/update-default-messaging-channel";
export const CHAT_HISTORY = "/agent-call-center/omnichannel/get-history";

// Tenant Personalize
export const TENANT_PERSONALIZE = "/tenant/tenantpersonalization";

// MAIL CONFIGURATION
export const MAIL_CONFIGURATION = "/mail-configuration";
export const ALLOWED_TEMPLATES = "/mail-configuration/allowed-templates";
export const SEND_EMAIL = "/mail-configuration/send-email";
export const SEND_API_EMAIL = "/api-configuration/send-email";
export const SEND_MESSAGE_CONFIG = "/message-configuration/send-message";
export const MESSAGE_CONFIGURATION = "/message-configuration";
// WABA SSO
export const GENERATE_WABA_SSO_TOKEN = "/tenant/sso/waba/token";
