import axios from "axios";

const XENY_AI_BASE_URL = "https://app.xeny.ai/apis/api";
const XENY_API_KEY = "ringingo_7b385992b5a935134eef4ee2d9ad8fd781f3873ca3556fca";

export const getBotLeadInfo = async (phone: string, companyCode: string, history: boolean = false) => {
  try {
    console.log(companyCode,"companyddddd")
    const response = await axios.get(`${XENY_AI_BASE_URL}/callsummary`, {
      params: {
        external_number: phone,
        companycode:"691311f507ae53c747269164",
        // companycode: companyCode,
        // companycode:companyCode?.toLocaleLowerCase()=="offdutycc"?"691311f507ae53c747269164":"",
        history: true,
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
}