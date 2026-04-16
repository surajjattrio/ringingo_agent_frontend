// PROJECT IMPORTS
import { IN_BREAK, BREAK_CODES } from "@/API/constAPI";
import { apiInstance } from "../axiosApi";

/* ============================== BREAK SERVICES ============================== */

export const breakOptionListGet = () => {
  return apiInstance.get(BREAK_CODES);
};

export const goToInBreak = (payload: any) => {
  return apiInstance.post(IN_BREAK, payload);
};

const getTwoDigitTime = (time: number) => {
  if (time < 10 && time > -10)
    return Math.abs(time).toString().padStart(2, "0");
  else return Math.abs(time).toString();
};

export const getTimerString = (now: Date, endDate: Date) => {
  const distance = endDate.getTime() - now.getTime();
  let hours: any = Math.floor((distance % (1000 * 60 * 60 * 60)) / (1000 * 60 * 60));
  hours = hours > -1 ? hours : hours + 1;
  const formatedHours = getTwoDigitTime(hours);
  let minutes: any = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  minutes = minutes > -1 ? minutes : minutes + 1;
  const formatedMinutes = getTwoDigitTime(minutes);
  let seconds: any = Math.floor((distance % (1000 * 60)) / 1000);
  const formatedSeconds = getTwoDigitTime(seconds);
  return `${seconds < 0 ? "-" : ""}${formatedHours}:${formatedMinutes}:${formatedSeconds}`;
};

export const getWrapUpTimerString = (now: Date, endDate: Date) : string => {
  const distance = endDate.getTime() - now.getTime();
  let minutes: any = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  minutes = minutes > -1 ? minutes : minutes + 1;
  const formatedMinutes = getTwoDigitTime(minutes);
  let seconds: any = Math.floor((distance % (1000 * 60)) / 1000);
  const formatedSeconds = getTwoDigitTime(seconds);
  return `${formatedMinutes}:${formatedSeconds}`;
};