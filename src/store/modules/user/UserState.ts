export default interface UserState {
    token: string;
    current: object | null;
    currentFacility: object;
    instanceUrl: string;
    fieldMappings: {};
    preferredDateTimeFormat: string;
    currentMapping: object;
}