export type BuildStatus = "in_progress" | "completed" | "sold";

export interface Build {
  id: string;
  name: string;
  status: BuildStatus;
  primary_material: string | null;
  wood_type: string | null;
  finish_type: string | null;
  other_materials: string | null;
  hours_spent: number | null;
  material_cost: number | null;
  sale_price: number | null;
  buyer_name: string | null;
  sold_via: string | null;
  date_started: string | null;
  date_completed: string | null;
  date_sold: string | null;
  notes: string | null;
  created_at: string;
}

export interface BuildPhoto {
  id: string;
  build_id: string;
  storage_url: string;
  created_at: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string | null;
  date: string;
  build_id: string | null;
  created_at: string;
}

export type ParsedBuild = Partial<Omit<Build, "id" | "created_at">>;

export interface AnalyticsData {
  totalRevenue: number;
  totalProfit: number;
  avgProfit: number;
  pieceCount: number;
  bestPiece: Build | null;
  revenueByMonth: { month: string; revenue: number; profit: number }[];
  revenueByPlatform: { platform: string; revenue: number; count: number }[];
  statusCounts: { status: BuildStatus; count: number }[];
}
