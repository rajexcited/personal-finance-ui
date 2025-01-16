import * as dateutil from "./date-utils";

describe("to verify dateutil.parseTimestamp, ", () => {
  describe("when format is given MM-DD-YYYY, ", () => {
    test("then successfully getting valid date instance for 02-15-2025", () => {
      const dateInstance = dateutil.parseTimestamp("02-15-2025", "MM-DD-YYYY");
      expect(dateInstance).not.toBeNull();
      expect(dateInstance).not.toBeUndefined();
      expect(dateInstance.toString()).not.toBe("Invalid Date");
      expect(dateInstance.getMonth()).toBe(1);
      expect(dateInstance.getDate()).toBe(15);
      expect(dateInstance.getFullYear()).toBe(2025);
    });

    test("then failing to get valid date instance for 02/15/2025", () => {
      const dateInstance = dateutil.parseTimestamp("02/15/2025", "MM-DD-YYYY");
      expect(dateInstance).not.toBeNull();
      expect(dateInstance).not.toBeUndefined();
      expect(dateInstance.toString()).toBe("Invalid Date");
      expect(dateInstance.getMonth()).toBe(NaN);
    });
  });

  describe("when format is not given, ", () => {
    test("then successfully getting valid date instance for 02-15-2025 11:35:40.654Z", () => {
      const dateInstance = dateutil.parseTimestamp("02-15-2025 11:35:40.654Z");
      expect(dateInstance).not.toBeNull();
      expect(dateInstance).not.toBeUndefined();
      expect(dateInstance.toString()).not.toBe("Invalid Date");
    });

    test("then failing to get valid date instance for 02-15-2025", () => {
      const dateInstance = dateutil.parseTimestamp("02-15-2025");
      expect(dateInstance).not.toBeNull();
      expect(dateInstance).not.toBeUndefined();
      expect(dateInstance.toString()).toBe("Invalid Date");
      expect(dateInstance.getMonth()).toBe(NaN);
    });
  });
});
