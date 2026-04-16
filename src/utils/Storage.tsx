// Key name for Login Agent Campaign
export const LoginAgentCampaignKey = "login_agent_campaign_name";


// Set loginUser Campaign in localStorage
export const setLoginAgentCampaign = (value: string) => {
  try {
    localStorage.setItem(LoginAgentCampaignKey, value);
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};


// Get loginUser Campaign from localStorage
export const getLoginAgentCampaign = (): string | null => {
  try {
    return localStorage.getItem(LoginAgentCampaignKey);
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return null;
  }
};


// Delete login user campaign from localStorage
export const deleteLoginAgentCampaign = () => {
  try {
    localStorage.removeItem(LoginAgentCampaignKey);
  } catch (error) {
    console.error("Error removing from localStorage:", error);
  }
};