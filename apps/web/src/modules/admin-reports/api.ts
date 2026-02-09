import { apiFetch } from "@/lib/api";

export type ReportsOverviewDto = {
  actions24h: number;
  actions7d: number;
  errors24h: number;
  errors7d: number;
  topPaths24h: { key: string; count: number }[];
  topUsers24h: { key: string; count: number }[];
};

export async function getReportsOverview() {
  return serverFetch<ReportsOverviewDto>("admin/reports/overview");
}
