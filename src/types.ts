export interface SearchPriceParams {
    width: number
    height: number
}

export interface Criteria {
    width: number
    height: number
    railType: string
    curtain: {
        curtainType: string,
        clothCount: number
    }
}

export enum ApiError {
    InvalidWidth = "INVALID_WIDTH",
    InvalidHeight = "INVALID_HEIGHT"
}

export type Limitation = [number, number]
export type ApiResponse<T> = { success: true, data: T } | { success: false, error: ApiError }

export interface PriceData {
    clothPrices: Record<string, Record<string, Array<string>>>,
    railPrices: Array<{ rail_type: string, method: string } & ({ price: number } | { width: Limitation, height: Limitation })>
    width: number,
    height: number
}


export interface Metadata {
    railTypes: string[],
    curtainTypes: Array<{ curtainType: string, clothCount: number }>
    limitations: Array<{ railType: string, curtainType: string, width: Limitation, height: Limitation }>
}