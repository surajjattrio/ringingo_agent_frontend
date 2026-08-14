import axios from "axios";

const XENY_AI_BASE_URL = "https://app.xeny.ai/api";
const XENY_API_KEY = "ringingo_7b385992b5a935134eef4ee2d9ad8fd781f3873ca3556fca";

export const getBotLeadInfo = async (phone: string, companyCode: string, history: boolean = false) => {
  try {
    const response = await axios.get(`${XENY_AI_BASE_URL}/callsummary`, {
      params: {
        did: phone,
        companycode: companyCode,
        history: history,
      },
      headers: {
        "x-api-key": XENY_API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching bot lead info:", error);
    throw error;
  }
};