export default interface UserState {
    token: string;
    current: object | null;
    currentFacility: object;
    instanceUrl: string;
    fieldMappings: object;
    preferredDateTimeFormat: string;
    currentMapping: object;
}