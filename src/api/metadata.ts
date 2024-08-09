import { useQuery } from "@tanstack/vue-query";
import axios from "axios";
import { ApiResponse, Limitation, Metadata } from "../types.ts";
import { set } from "lodash-es";

async function getMetadata() {
    const response = await axios.get<ApiResponse<Metadata>>("https://script.google.com/macros/s/AKfycbwdbosGhHfC-O5lUgYPntMFjUejBtMhyOl__lEF98HkCkM-aaaugfBrNAaPGmsZFp0FyQ/exec", {
        params: { action: "metadata" }
    });
    const data = response.data;
    if (!data.success) throw Error(data.error);
    const { railTypes, curtainTypes, limitations } = data.data;
    const map: Record<string, Record<string, { width: Limitation, height: Limitation }>> = {};

    limitations.forEach(it => {
        set(map, [it.railType, it.curtainType], { width: it.width, height: it.height })
    });

    return { railTypes, curtainTypes, limitations: map }
}


export function useMetadata() {
    const { data: metadata, isFetching } = useQuery({
        queryKey: ["metadata"],
        queryFn: () => getMetadata(),
        staleTime: Infinity,
        refetchOnWindowFocus: false
    });

    return { metadata, isFetching }
}
