// TYPES IMPORT
import { OptionTypes } from "@/types/formTypes";

// ADVANCE SEARCH OPTIONS
export const advanceSearchOptions: OptionTypes[] = [
    { value: "1", label: "Begin with" },
    { value: "2", label: "Contains" },
    { value: "3", label: "Does not contain" },
    { value: "4", label: "Is equal to" },
    { value: "5", label: "Is not equal to" },
    { value: "6", label: "Ends with" },
];

// HANG UP CASES TYPE OPTIONS
export const typeOptions: OptionTypes[] = [
    { value: "ATTENDED_TRANSFER", label: "ATTENDED_TRANSFER" },
    { value: "CALLQUEUE_TIMEOUT", label: "CALLQUEUE_TIMEOUT" },
    { value: "IVR_TIMEOUT", label: "IVR_TIMEOUT" },
    { value: "NO_ANSWER", label: "NO_ANSWER" },
    { value: "NO_ROUTE_DESTINATION", label: "NO_ROUTE_DESTINATION" },
    { value: "NORMAL_CLEARING", label: "NORMAL_CLEARING" },
    { value: "ORIGINATOR_CANCEL", label: "ORIGINATOR_CANCEL" },
    { value: "USER_BUSY", label: "USER_BUSY" },
];

// CALL MODE OPTIONS
export const callModeOptions: OptionTypes[] = [
    { value: "0", label: "PBX" },
    { value: "1", label: "Call Center" },
];

// PAGINATION OPTIONS
export const options = [
    { value: "10", label: 10 },
    { value: "20", label: 20 },
    { value: "30", label: 30 },
    { value: "40", label: 40 },
    { value: "50", label: 50 },
    { value: "100", label: 100 },
];

// Follow Up TYPES OPTIONS
export const followUpTypeOptions: OptionTypes[] = [
    { value: "Callback", label: "Callback" },
    { value: "Email", label: "Email" },
    { value: "Whatsapp", label: "Whatsapp" },
    { value: "Escalation", label: "Escalation" },
    { value: "Other Task", label: "Other Task" },
];

// Follow Up TYPES OPTIONS
// export const followUpStatusOptions: OptionTypes[] = [
//     { value: "0", label: "Close" },
//     { value: "1", label: "Open" },
//     { value: "2", label: "Upcoming" },
//     { value: "3", label: "Completed" },  
//     { value: "4", label: "Past Due" },      
// ];
export const followUpStatusOptions: OptionTypes[] = [
    { value: "0", label: "Upcoming" },
    { value: "1", label: "Past Due" },
    { value: "2", label: "Completed" },     
];

export const agentOptions: OptionTypes[] = [
    { value: "Adison Jack", label: "Adison Jack" },
    { value: "Adison John", label: "Adison John" }
];

export const platformOptions: OptionTypes[] = [
    { value: "whatsapp", label: "WhatsApp" },
    // { value: "sms", label: "SMS" },
    // { value: "email", label: "Email" },
    // { value: "chat", label: "Chat" },
];