const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:8080" : "");

export interface AuthUser {
  id: string;
  email: string;
  nickname: string;
  phone: string;
  real_name: string;
  address: string;
  points: number;
}

interface ApiEnvelope<T> {
  message?: string;
  data?: T;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    ...options,
  });

  if (res.status === 204) return undefined as T;

  let body: ApiEnvelope<T> | undefined;
  try {
    body = (await res.json()) as ApiEnvelope<T>;
  } catch {
  }

  if (!res.ok) {
    throw new Error(body?.message || `請求失敗（${res.status}）`);
  }

  return body?.data as T;
}

export interface RegisterInput {
  email: string;
  password: string;
  nickname: string;
  phone: string;
  realName: string;
  address: string;
}

export function register(input: RegisterInput) {
  return request<AuthUser>("/api/register", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      nickname: input.nickname,
      phone: input.phone,
      real_name: input.realName,
      address: input.address,
    }),
  });
}

export function login(input: { email: string; password: string }) {
  return request<AuthUser>("/api/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function logout() {
  return request<void>("/api/logout", { method: "POST" });
}

export function fetchMe() {
  return request<AuthUser>("/api/me");
}

export interface UpdateProfileInput {
  nickname: string;
  phone: string;
  realName: string;
  address: string;
}

export function updateProfile(input: UpdateProfileInput) {
  return request<AuthUser>("/api/me", {
    method: "PUT",
    body: JSON.stringify({
      nickname: input.nickname,
      phone: input.phone,
      real_name: input.realName,
      address: input.address,
    }),
  });
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function changePassword(input: ChangePasswordInput) {
  return request<void>("/api/me/password", {
    method: "PUT",
    body: JSON.stringify({
      current_password: input.currentPassword,
      new_password: input.newPassword,
      confirm_password: input.confirmPassword,
    }),
  });
}

export interface BatchDrawResponse {
  points: number;
  prizes: {
    id: string;
    name: string;
  }[];
  bonus_prize?: {
    id: string;
    name: string;
  };
}

export function drawProductBatch(productId: string, slotNumbers: number[]) {
  return request<BatchDrawResponse>(
    `/api/products/${encodeURIComponent(productId)}/draw-batch`,
    {
      method: "POST",
      body: JSON.stringify({ slot_numbers: slotNumbers }),
    },
  );
}

export interface ApiPrize {
  id: string;
  tier: string;
  name: string;
  total_count: number;
  remaining_count: number;
  is_last_prize: boolean;
}

export function fetchProductPrizes(productId: string) {
  return request<ApiPrize[]>(`/api/products/${encodeURIComponent(productId)}/prizes`);
}

export function fetchTakenSlots(productId: string) {
  return request<{ taken: number[] }>(
    `/api/products/${encodeURIComponent(productId)}/slots`,
  );
}

export interface ProductStock {
  id: string;
  remaining_count: number;
  total_count: number;
}

export function fetchProductStocks() {
  return request<ProductStock[]>("/api/products");
}

export type PrizeBoxSource = "draw" | "shop";

export interface MyPrizeRecord {
  id: string;
  source: PrizeBoxSource;
  product_id: string;
  tier: string;
  category: string;
  name: string;
  cost: number;
  is_bonus: boolean;
  created_at: string;
}

export function fetchMyPrizes() {
  return request<MyPrizeRecord[]>("/api/me/prizes");
}

export interface ShippedPrizeRecord extends MyPrizeRecord {
  shipped_at: string;
}

export function fetchShippedPrizes() {
  return request<ShippedPrizeRecord[]>("/api/me/prizes/shipped");
}

export interface ShipmentItemRef {
  id: string;
  source: PrizeBoxSource;
}

export interface CreateShipmentInput {
  items: ShipmentItemRef[];
  recipientName: string;
  phone: string;
  address: string;
  note?: string;
}

export interface CreateShipmentResult {
  shipment_id: string;
  shipped_count: number;
}

export function createShipment(input: CreateShipmentInput) {
  return request<CreateShipmentResult>("/api/me/shipments", {
    method: "POST",
    body: JSON.stringify({
      items: input.items,
      recipient_name: input.recipientName,
      phone: input.phone,
      address: input.address,
      note: input.note ?? "",
    }),
  });
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: string;
  cost: number;
  remaining_count: number;
}

export function fetchShopItems() {
  return request<ShopItem[]>("/api/shop/items");
}

export function fetchShopItem(itemId: string) {
  return request<ShopItem>(`/api/shop/items/${encodeURIComponent(itemId)}`);
}

export interface RedeemResult {
  points: number;
  remaining_count: number;
  item: {
    id: string;
    name: string;
  };
}

export function redeemShopItem(itemId: string) {
  return request<RedeemResult>(`/api/shop/items/${encodeURIComponent(itemId)}/redeem`, {
    method: "POST",
  });
}

export interface ShopRedemptionRecord {
  id: string;
  shop_item_id: string;
  name: string;
  cost: number;
  created_at: string;
}

export function fetchMyShopRedemptions() {
  return request<ShopRedemptionRecord[]>("/api/me/shop-redemptions");
}

export interface LeaderboardEntry {
  rank: number;
  nickname: string;
  total_points: number;
}

export function fetchWeeklyLeaderboard() {
  return request<LeaderboardEntry[]>("/api/leaderboard/weekly");
}

export interface RecentDraw {
  id: string;
  nickname: string;
  product_id: string;
  tier: string;
  prize_name: string;
  created_at: string;
}

export function fetchRecentDraws() {
  return request<RecentDraw[]>("/api/draws/recent");
}

export interface DailySpendTier {
  tier: number;
  threshold: number;
  reward: number;
  reached: boolean;
  claimed: boolean;
}

export interface DailyTaskStatus {
  checkin: {
    claimed: boolean;
    reward: number;
  };
  spend_today: number;
  spend_tiers: DailySpendTier[];
}

export function fetchDailyTasks() {
  return request<DailyTaskStatus>("/api/me/daily-tasks");
}

export interface ClaimRewardResult {
  points: number;
  reward: number;
}

export function claimDailyCheckin() {
  return request<ClaimRewardResult>("/api/me/daily-tasks/checkin", { method: "POST" });
}

export function claimDailySpendTier(tier: number) {
  return request<ClaimRewardResult>("/api/me/daily-tasks/claim-spend-tier", {
    method: "POST",
    body: JSON.stringify({ tier }),
  });
}
