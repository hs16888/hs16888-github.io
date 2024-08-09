import { useQuery } from "@tanstack/vue-query";
import { Ref } from "vue";
import { ApiResponse, PriceData, SearchPriceParams } from "../types";
import { sortBy } from "lodash-es";
import axios from "axios";


async function fetchPriceFromApi(params: SearchPriceParams) {
    const response = await axios.get<ApiResponse<PriceData>>("https://script.google.com/macros/s/AKfycbwdbosGhHfC-O5lUgYPntMFjUejBtMhyOl__lEF98HkCkM-aaaugfBrNAaPGmsZFp0FyQ/exec", {
        params: {
            ...params,
            action: "search"
        }
    });
    const data = response.data;
    if (data.success) return data.data;
    throw Error(data.error)
}

// async function fetchPriceFromMemory(params: SearchPriceParams) {
//     return data.data as PriceData;
// }


export function usePrice(params: Ref<SearchPriceParams>) {
    const enabled = computed(() => params.value.width > 0 && params.value.height > 0)
    const { data: priceData, isFetching } = useQuery({
        queryKey: ["price", params],
        queryFn: () => fetchPriceFromApi(params.value),
        // queryFn: () => fetchPriceFromMemory(params.value),
        enabled,
        staleTime: 60000,
        retry: 1,
        refetchOnWindowFocus: false
    });

    const railPrices = computed(() => sortBy(priceData.value?.railPrices ?? [], it => it.rail_type));
    const clothGroup = computed(() => priceData.value?.clothPrices ?? {});
    const standardDimension = computed(() => ({ width: priceData.value?.width, height: priceData.value?.height }))
    return { railPrices, clothGroup, standardDimension, isFetching }
}
