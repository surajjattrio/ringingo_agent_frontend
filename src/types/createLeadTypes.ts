export interface DynamicFormFields {
    [key: string]: string | number | boolean | Date | any;
}

export interface createLeadTypes {
    lead_group_uuid?: string,
    lead_status?: string,
    first_name: string;
    last_name: string;
    gender: string;
    address: string;
    city: string;
    state: string;
    country_uuid: string;
    province: string;
    postal_code: string;
    dob: string | Date;
    email: string;
    phone_code: string;
    phone_number: string;
    alternate_phone_number: string;
    description: string;
    pbx_lead_status_uuid? : string;
    custom_fields?: DynamicFormFields;
}
