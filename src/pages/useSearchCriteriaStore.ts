import { Criteria } from "../types.ts";

export const useSearchCriteriaStore = defineStore("搜尋條件", () => {
    const criteria = useLocalStorage<Criteria>("search params", null);
    return { criteria }
});