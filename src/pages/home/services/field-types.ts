import { ConfigTypeStatus } from "../../../shared";
import { ExpenseBelongsTo } from "../../expenses/services";
import { PymtAccStatus } from "../../pymt-accounts/services";

export interface MonthlyStatResource {
  total: string;
  count: number;
  monthNo: number;
  monthName: string;
}

export interface StatisticsBaseResource {
  total: string;
  monthlyTotal: MonthlyStatResource[];
  description: string;
  count: number;
}

export interface StatisticsConfigTypeResource extends StatisticsBaseResource {
  id: string;
  name: string;
  value: string;
  status: ConfigTypeStatus;
}

export interface StatisticsTagResource extends StatisticsBaseResource {
  tag: string;
}

export interface StatisticsPymtAccResource extends StatisticsBaseResource {
  id: string;
  shortName: string;
  status: PymtAccStatus;
}

export enum StatBelongsTo {
  Purchase = "stats-purchase",
  Refund = "stats-refund",
  PurchaseMinusRefund = "stats-purchase-minus-refund",
  Income = "stats-income",
}

export interface StatsExpenseResource {
  id: string;
  year: string;
  belongsTo: StatBelongsTo;
  details: StatisticsBaseResource;
  byType: StatisticsConfigTypeResource[];
  byTags: StatisticsTagResource[];
  byTypeTags: StatisticsTagResource[];
  byPersonTags: StatisticsConfigTypeResource[];
  byPymtAcc: StatisticsPymtAccResource[];
}
