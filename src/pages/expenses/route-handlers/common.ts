import { SharePersonResource, sharePersonService } from "../../settings/services";
import { ExpenseFields } from "../services";

const getPersonIds = async (expenseListPromise: Promise<ExpenseFields[]> | null, expense: ExpenseFields | null) => {
  let pset: Set<string> | null = null;
  if (expenseListPromise) {
    pset = new Set((await expenseListPromise).flatMap((xpns) => xpns.personIds));
  }
  if (expense) {
    pset = new Set(expense.personIds);
  }
  return pset ? [...pset] : [];
};

export const getMissingSharePersons = async (
  sharePersonsPromise: Promise<SharePersonResource[]>,
  expenseListPromise: Promise<ExpenseFields[]> | null,
  expense: ExpenseFields | null
) => {
  const sharePersonIds = (await sharePersonsPromise).map((sp) => sp.id);
  const pidList = await getPersonIds(expenseListPromise, expense);
  const missingSharePersonPromises = pidList.filter((pid) => !sharePersonIds.includes(pid)).map(sharePersonService.getSharePerson);
  const sharePersonList = await Promise.all(missingSharePersonPromises);
  return sharePersonList;
};
