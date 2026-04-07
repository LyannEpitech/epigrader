import { Criterion } from '../types/rubric.js';
export declare const rubricStorage: {
    saveRubric: (name: string, criteria: Criterion[]) => Promise<string>;
    getAllRubrics: () => Promise<any[]>;
    getRubric: (id: string) => Promise<any>;
    deleteRubric: (id: string) => Promise<void>;
};
export default rubricStorage;
//# sourceMappingURL=rubricStorage.d.ts.map