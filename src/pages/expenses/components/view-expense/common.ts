import { ExpenseFields } from "../../services";

export type SelectedExpense = Pick<ExpenseFields, "id" | "belongsTo">;
