import axios from "axios";

export const LIMECHAT_OUTBOUND_URL = "https://outbound.limechat.ai";

/**
 * Safely opens the LimeChat outbound portal in a new tab.
 * Returns true if the browser allowed opening the tab, false if blocked.
 */
export const openLimechatOutboundTab = (): boolean => {
  try {
    const opened = window.open(LIMECHAT_OUTBOUND_URL, "_blank");
    if (opened) {
      return true;
    }
    console.warn(">>> [LimeChat] Browser popup blocker prevented automatic tab open. Tab will open on Answer button click.");
    return false;
  } catch (err) {
    console.warn(">>> [LimeChat] Failed to open window:", err);
    return false;
  }
};

/**
 * Triggers LimeChat Custom Events API directly from the client, then opens the LimeChat outbound portal in a new tab.
 *
 * @param rawNumber - The caller's phone number
 * @param onTabOpened - Optional callback receiving whether the tab opened successfully
 */
export const triggerLimechatInboundCallAction = async (
  rawNumber: string,
  onTabOpened?: (opened: boolean) => void
) => {
  const digits = String(rawNumber || "").replace(/[^0-9]/g, "");
  const distinct_id = digits || rawNumber;
  const phone = digits ? `+${digits}` : rawNumber;

  const token = process.env.NEXT_PUBLIC_LIMECHAT_TOKEN || "YOUR_TOKEN";
  const accountId = process.env.NEXT_PUBLIC_LIMECHAT_ACCOUNT_ID || "YOUR_ACCOUNT_ID";
  const apiUrl = process.env.NEXT_PUBLIC_LIMECHAT_API_URL || "https://flow-builder.limechat.ai/api/v1/cvf-events";

  const payload = {
    distinct_id,
    phone,
    event: "inbound_call_received",
    data: { source: "ringingo" }
  };

  console.log("==================================================");
  console.log(">>> [LimeChat API] Calling flow-builder directly from frontend");
  console.log(">>> Target URL:", apiUrl);
  console.log(">>> Headers: x-limechat-uat:", token ? `${token.substring(0, 8)}...` : "(none)", "x-fb-account-id:", accountId);
  console.log(">>> Payload:", JSON.stringify(payload, null, 2));
  console.log("==================================================");

  try {
    const res = await axios.post(apiUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        "x-limechat-uat": token,
        "x-fb-account-id": accountId,
      }
    });
    console.log(">>> [LimeChat API] Direct response:", res.data);
  } catch (err: any) {
    console.error(">>> [LimeChat API] Direct call error (opening tab anyway):", err?.response?.data || err?.message || err);
  } finally {
    console.log(`>>> [INCOMING CALL] Opening new tab: ${LIMECHAT_OUTBOUND_URL}`);
    const opened = openLimechatOutboundTab();
    if (onTabOpened) {
      onTabOpened(opened);
    }
  }
};
