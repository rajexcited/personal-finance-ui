const compare = (a: any, b: any) => {
  let diff = 0;
  if (a === undefined && b === undefined) {
    diff = 0;
  } else if (a === undefined) {
    diff = 1;
  } else if (b === undefined) {
    diff = -1;
  } else if (a instanceof Date && b instanceof Date) {
    diff = a.getTime() - b.getTime();
  } else if (!isNaN(a) && !isNaN(b)) {
    diff = Number(a) - Number(b);
  } else if (typeof a === "string" && "string" === typeof b) {
    diff = a.localeCompare(b);
  } else if (typeof a === "function" && typeof b === "function") {
    diff = a() - b();
  } else if (Array.isArray(a) && Array.isArray(b)) {
    diff = a.join().localeCompare(b.join());
  }

  return diff > 0 ? 1 : diff < 0 ? -1 : 0;
};

export const ascCompare = (a: any, b: any) => compare(a, b);
export const descCompare = (a: any, b: any) => compare(b, a);
