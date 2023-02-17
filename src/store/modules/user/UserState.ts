export default interface UserState {
    token: string;
    current: object | null;
    currentFacility: object;
    instanceUrl: string;
    fieldMappings: {};
    preferredDateTimeFormat: string;
    pwaState: any;
    currentMapping: {
        id: string;
        mappingType: string;
        name: string;
        value: object;
    };
}