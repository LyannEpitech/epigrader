export interface Criterion {
    id: string;
    name: string;
    description: string;
    maxPoints: number;
    category?: string;
}
export interface Rubric {
    id: string;
    name: string;
    criteria: Criterion[];
    totalPoints: number;
    createdAt: string;
}
//# sourceMappingURL=rubric.d.ts.map