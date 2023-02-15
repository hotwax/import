export default interface UserState {
    token: string;
    current: object | null;
    currentFacility: object;
    instanceUrl: string;
    fieldMappings: {
        purchaseOrder: any;
        inventory: any;
    };
    preferredDateTimeFormat: string;
    pwaState: any;
    currentMapping: {
        id: string;
        mappingType: string;
        name: string;
        value: object;
    };
}