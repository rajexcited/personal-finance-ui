Yes — you **can group related context entries** in the Mochawesome report by passing them as an **array of values** under a **single context title**. This makes your test report much cleaner and easier to read.

---

## ✅ Example: Group Similar Contexts into One Entry

Instead of adding individual steps like:

```ts
addContext(this, { title: "Step", value: "Visit login page" });
addContext(this, { title: "Step", value: "Enter email" });
addContext(this, { title: "Step", value: "Click login" });
```

You can do:

```ts
addContext(this, {
  title: "Test Steps",
  value: ["Visit login page", "Enter email", "Click login"],
});
```

### ✅ Output in HTML Report

It will render as:

**Test Steps:**

- Visit login page
- Enter email
- Click login

Much cleaner and grouped together.

---

## ✅ Implementation Option: Collect Steps and Add Once in `afterEach`

### 1. In your test file:

```ts
let testSteps: string[] = [];

beforeEach(() => {
  testSteps = [];
});

Cypress.Commands.add("step", (description: string) => {
  cy.log(`📝 ${description}`);
  testSteps.push(description);
});

afterEach(function () {
  if (testSteps.length) {
    addContext(this, {
      title: "Test Steps",
      value: testSteps,
    });
  }
});
```

### 2. In your test:

```ts
it("should log in successfully", () => {
  cy.step("Visit login page");
  cy.visit("/login");

  cy.step("Enter credentials");
  cy.get("#email").type("user@example.com");
  cy.get("#password").type("password123");

  cy.step("Click login");
  cy.get('button[type="submit"]').click();
});
```

---

## 🧠 Optional: Add Grouping by Sections

You can expand to group steps into sections like:

```ts
const testSteps = {
  "Login Flow": [],
  Verification: [],
};

testSteps["Login Flow"].push("Visit login page");
testSteps["Login Flow"].push("Enter email");
testSteps["Verification"].push("Check dashboard");
```

And loop in `afterEach`:

```ts
Object.entries(testSteps).forEach(([title, steps]) => {
  if (steps.length) {
    addContext(this, { title, value: steps });
  }
});
```

---

## ✅ Summary

| Goal                         | Solution                                      |
| ---------------------------- | --------------------------------------------- |
| Group similar logs in report | Add `value: string[]` under one title         |
| Dynamically collect per test | Store steps in an array, add in `afterEach()` |
| Structured/grouped steps     | Use object with section titles                |

Let me know if you want this wrapped into a reusable Cypress plugin or helper — I can scaffold one for you.
