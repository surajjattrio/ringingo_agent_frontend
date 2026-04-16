/* ============================== ADVANCE FILTER FIELDS ============================== */

interface AdvancedFilterTypes {
  key: string;
  val: string | number | Date | null;
  dropdown?: string;
}

/* ============================== MY LEAD TABLE ============================== */

export interface MyLeadFilterTypes {
  first_name: AdvancedFilterTypes;
  last_name: AdvancedFilterTypes;
  custom_phone_number: AdvancedFilterTypes;
}

/* ============================== RECORDING TABLE ============================== */

export interface RecordingFilterTypes {
  callstart: AdvancedFilterTypes;
  callend: AdvancedFilterTypes;
  caller_id_name: AdvancedFilterTypes;
  destination_number: AdvancedFilterTypes;
  caller_id_number: AdvancedFilterTypes;
}

/* ============================== CDR REPORT TABLE ============================== */

export interface CdrsReportFilterTypes {
  callstart: AdvancedFilterTypes;
  callend: AdvancedFilterTypes;
  destination_number: AdvancedFilterTypes;
  disposition: AdvancedFilterTypes;
  call_mode: AdvancedFilterTypes;
}
