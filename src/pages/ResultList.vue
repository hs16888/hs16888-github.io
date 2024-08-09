<script setup lang="ts">

import { Limitation } from "../types.ts";
import { useToast } from "primevue/usetoast";
import { DataViewProps } from "primevue/dataview";
import { groupBy, set, sumBy } from "lodash-es";
import { useSearchCriteriaStore } from "./useSearchCriteriaStore.ts";


const store = useSearchCriteriaStore();
const { criteria } = storeToRefs(store);

watch(criteria, () => {
  selectedClothes.value = {}
});

const dimesion = computed(() => ({ width: criteria.value.width, height: criteria.value.height }));

const railInfo = computed(() =>
    railPrices.value.find(it => it.rail_type === criteria.value?.railType && it.method === criteria.value?.curtain.curtainType)
    ?? ({ rail_type: criteria.value?.railType, method: criteria.value?.curtain.curtainType, price: 0 })
);


const colors = ["rgb(235,241,241)", "rgb(225, 224, 245)", "rgb(232,219,232)"].map(it => ({ "background-color": it }));
const { clothGroup, railPrices, isFetching } = usePrice(dimesion);
const toast = useToast();
const datatableConfig: DataViewProps = {
  dataKey: "rail_type",
  layout: "grid",
  dt: {
    header: {
      background: "{primary.700}"
    }
  },
  pt: {
    root: { class: ["flex", "flex-col"] },
    content: { class: ["flex-1", "min-h-0", "overflow-auto"] }
  }
};

function isOutOfRange(range: Limitation, value: number | undefined) {
  if (value === undefined) return true;
  return !(range[0] <= value && value <= range[1])
}

const selectedClothes = ref<Record<string, string>>({});
const selectedCount = computed(() => Object.keys(selectedClothes.value).length);
const clothTotalPrice = computed(() => sumBy(Object.values(selectedClothes.value), it => +it));

function onRowClick(clothType: string, price: string) {
  const target = selectedClothes.value[clothType];
  if (target === price) return delete selectedClothes.value[clothType];
  if (target === undefined && criteria.value?.curtain.clothCount === Object.keys(selectedClothes.value).length)
    toast.add({
      severity: "warn",
      life: 5000,
      summary: `${criteria.value?.curtain.curtainType} 只能選擇 ${criteria.value?.curtain.clothCount} 種布料，請先取消選擇`
    });
  else set(selectedClothes.value, [clothType], price);
}

function splitSequence(arr: number[]) {
  let result = [];
  let temp = [arr[0]];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] - arr[i - 1] > 1) {
      result.push(temp);
      temp = [arr[i]];
    } else {
      temp.push(arr[i]);
    }
  }
  result.push(temp);
  return result;
}


function clothListToLabel(cloths: string[]) {
  const group = groupBy(cloths, cloth => cloth.slice(0, 4));
  return Object.entries(group).map(([key, clothNames]) => {
    if (clothNames.length < 2) return clothNames[0];
    const numbers = clothNames.map(it => +it.slice(4)).sort((a, b) => a - b);
    return splitSequence(numbers).map(it => it.length > 1 ? `${key}${it[0]}~${key.slice(3)}${it[it.length - 1]}` : `${key}${it[0]}`).join("、")
  }).join("、")
}

</script>

<template>
  <DataView class="h-full" :value="railPrices" v-bind="datatableConfig">
    <template #empty>
      <BlockUI :blocked="true">
        <table class="cloth-price-table relative">
          <tbody>
          <template v-for="_ in 3">
            <tr>
              <td class="bg-white text-lg font-bold sticky z-10 top-0">
                <Skeleton width="8rem" height="1.5rem"/>
              </td>
            </tr>
            <tr v-for="_ in 5">
              <td class="font-bold">
                <div class="flex flex-wrap items-center">
                  <template v-for="__ in Math.max(3 - _, 1) * 2">
                    <Skeleton width="5rem" height="1rem"/>
                    <span v-if="__ !== Math.max(3 - _, 1) * 2">、</span>
                  </template>
                </div>
              </td>
            </tr>
          </template>
          </tbody>
        </table>
      </BlockUI>
    </template>
    <template v-if="criteria" #footer>
      <span v-if="'price' in railInfo && selectedCount === criteria?.curtain.clothCount">
        軌道價格 {{ railInfo.price }} + {{
          Object.values(selectedClothes).map((it, index) => `布料 ${index + 1} ${it}`).join(" + ")
        }} = {{ (clothTotalPrice + railInfo.price).toFixed(0) }} 元
      </span>
      <span v-else>請點擊選擇 {{ criteria?.curtain.clothCount }} 種布料以計算價格</span>
    </template>
    <template #header>
      <div class="flex text-white items-center font-bold justify-between">
        <span v-if="criteria" class="flex flex-wrap gap-2 mr-2">
          <span>當前搜尋條件：</span>
          <span>寬 {{ criteria.width }} cm</span>
          <span>高 {{ criteria.height }} cm</span>
          <span>{{ criteria.railType }}</span>
          <span>{{ criteria.curtain.curtainType }}</span>
        </span>
        <span v-else>請點擊搜尋輸入條件</span>
        <Button :loading="isFetching" :disabled="isFetching" class="whitespace-nowrap" :label="isFetching ? '搜尋中' : '搜尋'" @click="$router.replace('/')"/>
      </div>
    </template>
    <template #grid>
      <table v-if="'price' in railInfo" class="cloth-price-table relative">
        <tbody>
        <template v-for="(priceGroup, clothType,index) in clothGroup">
          <tr :style="colors[index]" class="sticky top-0">
            <td class="text-lg font-bold">{{ clothType }}
            </td>
          </tr>
          <tr v-for="(cloths, price) in priceGroup"
              :style="colors[index]"
              class="cloth-item"
              :class="{'cloth-item-selected' : selectedClothes[clothType] === price}"
              @click="onRowClick(clothType, price)"
          >
            <td class="font-bold">{{ clothListToLabel(cloths) }}</td>
          </tr>
        </template>
        </tbody>
      </table>
      <div v-else class="text-red-600 h-full text-2xl flex items-center justify-center font-bold">
        <div>
          <div>此軌道型式無法提供目前尺寸</div>
          <div v-if="isOutOfRange(railInfo.width, criteria.width)">寬度：{{ railInfo.width[0] }}~{{ railInfo.width[1] }}</div>
          <div v-if="isOutOfRange(railInfo.height, criteria.height)">高度：{{ railInfo.height[0] }}~{{ railInfo.height[1] }}</div>
        </div>
      </div>
    </template>
  </DataView>
</template>

<style lang="scss">

.cloth-price-table {
  @apply w-full h-full;
  border-collapse: collapse;
  border: 1px solid #c4c4c4;

  td {
    padding: 8px 16px;
    border: 1px solid #c4c4c4;
  }
}

.cloth-item {
  &:hover {
    filter: brightness(0.95);
  }

  @apply cursor-pointer;
}

.cloth-item-selected {
  filter: brightness(.9);
}
</style>
