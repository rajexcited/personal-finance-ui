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

export const getFormData = <T extends ExpenseFields>(formData: FormData, formKey: keyof T) => {
  const formValue = formData.get(formKey as string);

  if (formValue !== null && formValue !== undefined) {
    try {
      const jsonstr = formValue.toString();
      const jsonObj = JSON.parse(jsonstr);
      if (typeof jsonObj === "object") {
        return jsonObj;
      }
      return formValue.toString();
    } catch (ignore) {
      return formValue.toString();
    }
  }
  return null;
};
