import { apiSlice } from "@/lib/apiBaseQuery";

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface InventoryItem {
  id: string;
  reference: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: string;
  dateAdded: string;
  expiryDate?: string | null;
  supplier?: string | null;
  lowStockThreshold: number;
  status: StockStatus;
}

interface ItemsResponse {
  items: InventoryItem[];
}
interface ItemResponse {
  item: InventoryItem;
}
interface LowStockResponse {
  count: number;
  items: InventoryItem[];
}

export const inventoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInventory: builder.query<InventoryItem[], void>({
      query: () => "/inventory",
      transformResponse: (r: ItemsResponse) => r.items,
      providesTags: (result) =>
        result
          ? [
              ...result.map((i) => ({ type: "Inventory" as const, id: i.id })),
              { type: "Inventory" as const, id: "LIST" },
            ]
          : [{ type: "Inventory", id: "LIST" }],
    }),

    getLowStockSummary: builder.query<LowStockResponse, void>({
      query: () => "/inventory/low-stock",
      providesTags: [{ type: "Inventory", id: "LOW_STOCK" }],
    }),

    createInventoryItem: builder.mutation<
      InventoryItem,
      Record<string, unknown>
    >({
      query: (body) => ({ url: "/inventory", method: "POST", body }),
      transformResponse: (r: ItemResponse) => r.item,
      invalidatesTags: [
        { type: "Inventory", id: "LIST" },
        { type: "Inventory", id: "LOW_STOCK" },
      ],
    }),

    updateInventoryItem: builder.mutation<
      InventoryItem,
      { id: string; data: Record<string, unknown> }
    >({
      query: ({ id, data }) => ({
        url: `/inventory/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (r: ItemResponse) => r.item,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Inventory", id },
        { type: "Inventory", id: "LIST" },
        { type: "Inventory", id: "LOW_STOCK" },
      ],
    }),

    adjustQuantity: builder.mutation<
      InventoryItem,
      { id: string; delta: number }
    >({
      query: ({ id, delta }) => ({
        url: `/inventory/${id}/quantity`,
        method: "PATCH",
        body: { delta },
      }),
      transformResponse: (r: ItemResponse) => r.item,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Inventory", id },
        { type: "Inventory", id: "LIST" },
        { type: "Inventory", id: "LOW_STOCK" },
      ],
    }),

    deleteInventoryItem: builder.mutation<void, string>({
      query: (id) => ({ url: `/inventory/${id}`, method: "DELETE" }),
      invalidatesTags: [
        { type: "Inventory", id: "LIST" },
        { type: "Inventory", id: "LOW_STOCK" },
      ],
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useGetLowStockSummaryQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useAdjustQuantityMutation,
  useDeleteInventoryItemMutation,
} = inventoryApi;
