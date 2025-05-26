### Library and Tool Selection

In evaluating test automation frameworks for this project, I explored both **Cypress** and **Playwright**. Given the scope and testing requirements, Cypress emerged as the most suitable choice.

#### Why Choose Cypress?

Cypress is well-suited for this project due to its **ease of adoption** and **interactive test execution capabilities**, which accelerate test development. Since testing is focused solely on **Chrome browser responsiveness**, Cypress offers straightforward configuration without unnecessary overhead.

While Cypress supports BDD-style testing using **Cucumber/Gherkin**, this approach is **not a good fit** for the current project. Step documentation has already been established in **Markdown test case files**, eliminating the need for additional structured documentation at this stage. If necessary, manual documentation can be maintained as suggested by **ChatGPT**, but integrating BDD tooling would be excessive for the current scope.

#### Future Considerations: Step Documentation

To improve **test step readability**, I explored approaches to documenting Cypress test execution more effectively. Key questions considered:

- How can readable test scenario steps be **automatically** generated from Cypress spec files?
- Given that validation steps exist both **before** and **after** interactions, what logging approach ensures clarity and readability?

> **Recommended Approaches for Step Documentation:**

| Approach                         | Best Use Case                               |
| -------------------------------- | ------------------------------------------- |
| `cy.log()` + manual descriptions | Quick visibility in Cypress UI & logs       |
| Custom `step()` wrapper          | Semi-automatic and structured logging       |
| `cypress-cucumber-preprocessor`  | Fully readable BDD-style specifications     |
| Code parsing & AST analysis      | Automated documentation tools (high effort) |

Additional suggestions included reporting test steps **with proper grouping and ordering via Cypress commands**, which I find promising. More details are recorded [here](./test-step-document-suggestion.md)

#### Why Not Playwright?

Although **Playwright** supports multiple languages and platforms, its **learning curve is steep**, and test development can become slower due to its complexity. Additionally, Playwright’s extensive **browser and device emulation capabilities** are unnecessary for this application, making Cypress the more efficient choice.

Furthermore, Playwright’s **setup process is time-consuming**, which would add unnecessary overhead to this project. Given these factors, Cypress remains the optimal framework for streamlined **test execution and responsive UI testing**.
