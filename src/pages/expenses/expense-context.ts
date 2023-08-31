import { createContext } from "react";

export interface ExpenseItemType {
  id: string;
  parentExpenseId: string;
  name: string;
  amount: string;
  category: string;
  tags: string;
  description: string;
}

export interface ExpenseData {
  expenseId: string;
  billname: string;
  amount?: string;
  pymtacc?: string;
  description?: string;
  purchasedDate: Date;
  tags?: string;
  verifiedDateTime?: Date;
  categoryId?: string;
  expenseItems?: ExpenseItemType[];
}

export const ExpenseContext = createContext<ExpenseData[]>([]);
