export interface CrmFilterState {
    tags: string[];
    location: string[];
    source: string[];
    timeFilter?: 'newThisMonth' | 'uncontacted' | null;
}
