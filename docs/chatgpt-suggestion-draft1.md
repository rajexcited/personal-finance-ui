# Page Navigations

- [Question 1 - Q1 - beginner asking for suggestions](#question-1---que-1---q1---beginner-asking-for-suggestions)
- [Question 2 - Que 2 - Q2: examples and templates](#question-2---que-2---q2-examples-and-templates)
- [Question 3 - Que 3 - Q3: manage multi repo of project](#question-3---que-3---q3---manage-multi-repo-of-project)
- [Question 4 - Que 4 - Q4: test template and best practices](#question-4---que-4---q4---test-template-and-best-practices)

# Question 1 - Que 1 - Q1 - beginner asking for suggestions

suggestions to use Github issues, discussions and project ? what working flow should I follow ? is there any best practices ? how can determine where all resolved issues and enhancements ready for my prod release ? how can I get summary or detail list of what is going into release? how do I determine % of completions for release ?

## Answer of Q1

To effectively use GitHub Issues, Discussions, and Projects, you can follow a structured workflow and adopt best practices. Here's a breakdown addressing your questions:

---

### **1. Using GitHub Issues, Discussions, and Projects:**

#### **GitHub Issues**:

- **Purpose**: For tracking bugs, tasks, and feature requests.
- **Workflow**:
  - Create detailed issues with clear titles, descriptions, and labels.
  - Use templates to standardize reporting (e.g., bug report, feature request).
  - Assign issues to team members and link them to milestones or projects.

#### **GitHub Discussions**:

- **Purpose**: For open-ended conversations, brainstorming, and Q&A.
- **Workflow**:
  - Use Discussions for pre-planning, idea validation, and team collaboration.
  - Convert relevant discussions into issues when actionable work is identified.
  - Categorize discussions (e.g., ideas, help, general).

#### **GitHub Projects**:

- **Purpose**: For visual project management (Kanban boards, timelines).
- **Workflow**:
  - Organize issues into Projects.
  - Use columns (e.g., To Do, In Progress, Done) to track work progress.
  - Define custom fields for priorities, estimated time, or other needs.

---

### **2. Working Flow**:

Here’s a recommended workflow to integrate these tools:

1. **Discussion Phase**:
   - Use GitHub Discussions to gather feedback, share ideas, and validate work before creating issues.
2. **Planning Phase**:
   - Create detailed GitHub Issues for tasks, bugs, or enhancements.
   - Assign labels, milestones, and link them to releases or sprints in Projects.
3. **Execution Phase**:
   - Use GitHub Projects to track progress visually.
   - Move issues across columns (To Do → In Progress → Done).
4. **Review Phase**:
   - Ensure all issues are linked to pull requests (PRs) for traceability.
   - Conduct code reviews and close issues once merged.

---

### **3. Best Practices**:

- Use **labels** to categorize issues (e.g., bug, enhancement, documentation).
- Define **milestones** for releases and link issues to them.
- Use **automation** to move issues or PRs based on status changes.
- Write clear and actionable issue descriptions (include "Steps to Reproduce," "Expected Behavior," etc.).
- Encourage team collaboration via comments, mentions, and discussions.

---

### **4. Tracking Resolved Issues and Enhancements for Release**:

- Use **milestones** to group issues by release version.
- Filter issues by milestone and status (e.g., "Closed").
- Regularly review the GitHub Project board for completed tasks.
- Automate status updates using GitHub Actions or integrations.

---

### **5. Getting a Summary or Detailed List for a Release**:

- **Generate a Release Note**:
  - Use GitHub’s release feature to draft release notes automatically.
  - Include a summary of all resolved issues, PRs, and enhancements.
- **Custom Queries**:
  - Use GitHub’s issue search to filter by milestone, labels, or assignees and export results (e.g., `is:closed milestone:v1.0`).

---

### **6. Determining % Completion for a Release**:

- Use **Project Analytics**:
  - If enabled, check GitHub Project statistics for completed vs. pending tasks.
- Calculate manually:
  - Query total issues in a milestone and count resolved issues (e.g., `is:closed milestone:v1.0`).
  - Formula: `(Closed Issues / Total Issues) * 100 = % Completion`.

---

# Question 2 - Que 2 - Q2: examples and templates

Provide examples

## Answer of Q2

Here are examples and templates to help you set up workflows, automate tasks, and generate insights for your GitHub project management:

---

## **1. GitHub Issue Templates**

Create **Issue Templates** to standardize your issue reporting. Save these templates in the `.github/ISSUE_TEMPLATE/` directory of your repository.

### **Bug Report Template** (`bug_report.md`)

```markdown
---
name: Bug Report
about: Report a bug to help us improve
title: "[Bug]: "
labels: bug
assignees:
---

### **Describe the Bug**

A clear and concise description of what the bug is.

### **Steps to Reproduce**

Steps to reproduce the behavior:

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

### **Expected Behavior**

Describe what you expected to happen.

### **Screenshots/Logs**

If applicable, add screenshots or logs to help explain your problem.

### **Environment**

- OS: [e.g., Windows 10, macOS Ventura]
- Browser [e.g., Chrome, Safari]
- Version [e.g., v1.0.0]

### **Additional Context**

Add any other context about the problem here.
```

---

### **Feature Request Template** (`feature_request.md`)

```markdown
---
name: Feature Request
about: Suggest a new feature or enhancement
title: "[Feature]: "
labels: enhancement
assignees:
---

### **Feature Description**

A clear and concise description of what the feature is and why it is needed.

### **Proposed Solution**

Describe how you think this should be implemented.

### **Alternatives Considered**

List any alternative approaches or workarounds you've considered.

### **Additional Context**

Add any other context or screenshots about the feature request here.
```

---

### **Custom Task Template** (`task_template.md`)

```markdown
---
name: Task
about: Create a new task or sub-task
title: "[Task]: "
labels: task
assignees:
---

### **Task Description**

Provide a short description of the task.

### **Acceptance Criteria**

- [ ] Clearly defined success criteria.
- [ ] Measurable and testable outcomes.

### **Dependencies**

List any dependent tasks or blockers.

### **Additional Notes**

Add any other information or context here.
```

---

## **2. GitHub Automation Examples**

### **Automate Project Updates with GitHub Actions**

Use GitHub Actions to automatically move issues and pull requests based on events.

#### Example Workflow: Auto-Move Issues to “In Progress” on Assignment

Save this file as `.github/workflows/auto-move-issues.yml`:

```yaml
name: Auto Move Issues

on:
  issues:
    types: [assigned]

jobs:
  move-to-in-progress:
    runs-on: ubuntu-latest
    steps:
      - name: Move issue to "In Progress" in the project
        uses: actions/github-script@v6
        with:
          script: |
            const projectNumber = 1; // Update this with your project number
            const columnName = "In Progress";
            const issue = context.payload.issue;

            const projects = await github.projects.listForRepo({
              owner: context.repo.owner,
              repo: context.repo.repo
            });

            const project = projects.data.find(p => p.number === projectNumber);
            const columns = await github.projects.listColumns({
              project_id: project.id
            });

            const column = columns.data.find(c => c.name === columnName);

            await github.projects.createCard({
              column_id: column.id,
              content_id: issue.id,
              content_type: "Issue"
            });
```

---

## **3. Release Note Generation**

### Example GitHub Release Template

When creating a release in GitHub, you can automate release notes using the following template:

```markdown
## Release vX.Y.Z

### 🆕 New Features

- #123 Add dark mode support
- #234 Improve search functionality

### 🐛 Bug Fixes

- #345 Fix login crash on mobile devices
- #456 Resolve API timeout issues

### 🛠 Enhancements

- #567 Update UI for better accessibility
- #678 Optimize database queries

### 📊 Stats

- **Closed Issues**: 20
- **Merged Pull Requests**: 15

### 🚀 Deployment Notes

- Ensure database migrations are applied.
- Update environment variables: `API_KEY`, `ENABLE_FEATURE_X`.
```

---

## **4. Milestone and Progress Tracking**

### Example Query for Tracking Completion:

Run this search query to track milestone progress:

```
is:issue is:closed milestone:"v1.0"
```

### Completion % Calculation:

Use a script or manual query:

- Query total issues: `is:issue milestone:"v1.0"`
- Query closed issues: `is:issue is:closed milestone:"v1.0"`

Formula:

```text
% Completion = (Closed Issues / Total Issues) * 100
```

---

## **5. Summary or Detail List for Release**

Export a CSV with GitHub CLI:

```bash
gh issue list --milestone "v1.0" --state closed --label bug,enhancement > release_summary.csv
```

The CSV will include issue details, such as titles and assignees, for easy sharing.

---

## **6. Best Practices for GitHub Project Boards**

- **Columns**:

  - `Backlog`: For all incoming issues or tasks.
  - `To Do`: Approved issues ready to be worked on.
  - `In Progress`: Actively being worked on.
  - `Review`: Waiting for code review or testing.
  - `Done`: Completed tasks.

- **Automation**:
  - Automatically move items to `In Progress` when assigned.
  - Move items to `Done` when PRs are merged.

---

Would you like assistance implementing these templates or scripts into your repository?

# Question 3 - Que 3 - Q3 - manage multi repo of project

My project is split between 2 repositories. How do I manage and integrate 2 repos with task and issues ?

## Answer Of Q3

Managing and integrating tasks and issues across two repositories requires synchronization, clear processes, and consistent tooling to ensure a seamless workflow. Below are strategies and best practices to effectively manage tasks and issues for your project split across two repositories.

---

## **1. Define the Role of Each Repository**

Clearly define the purpose of each repository to avoid confusion:

- **Repository A**: Focus on core functionalities or backend.
- **Repository B**: Focus on frontend, integrations, or a specific component.

**Example**:

- Repo A: Backend API and services.
- Repo B: Frontend/UI that consumes the API from Repo A.

---

## **2. Use a Shared GitHub Project Board**

Leverage **GitHub Projects** (beta or classic) to manage tasks across both repositories in a single place:

- **Multi-repo support**: You can associate issues from multiple repositories in a single GitHub Project board.
- Use columns like `To Do`, `In Progress`, `Review`, and `Done` to visually track tasks.

### **Setup Steps for Shared Project**:

1. **Create a Project Board**:

   - Navigate to your GitHub Organization or Account.
   - Create a new **organization-level project** or **user-level project**.
   - Set it to manage tasks/issues from both repositories.

2. **Link Issues from Both Repositories**:

   - Add issues from Repo A and Repo B to the shared project board.
   - Use filters to view issues per repository or milestones (e.g., `repo:org/repo-a`).

3. **Automation**:
   - Automate the movement of tasks between columns (e.g., move to `In Progress` when a PR is linked).
   - Use **GitHub Actions** to synchronize task updates between repos.

---

## **3. Centralize Cross-Repo Tasks**

For tasks affecting both repositories (e.g., a new feature requiring backend and frontend changes):

- **Option 1: Create a Parent Issue in One Repo**:

  - Create a parent issue in one repo (e.g., Repo A) to track the overall progress.
  - Link related issues in Repo B to the parent issue using `Linked Issues`.

- **Option 2: Use Epics** (If Using GitHub Projects Beta):
  - Use the **"Group by"** feature to organize issues from both repos under an "Epic" or parent task.

### Example Workflow:

1. **Parent Issue in Repo A**:

   ```markdown
   **Feature: User Authentication**

   - [x] Backend: Add token-based authentication (#123 in Repo A)
   - [x] Frontend: Add login/logout UI (#456 in Repo B)
   ```

2. **Subtasks in Both Repositories**:

   - Backend (Repo A): `#123`
   - Frontend (Repo B): `#456`

3. **Link Issues**:
   - Use GitHub's `Linked Issues` feature to connect related tasks.

---

## **4. Use Labels to Differentiate Repositories**

Create consistent labeling across both repositories:

- Label issues based on their **functional domain**.
- Examples:
  - Repo A: `backend`, `API`, `database`
  - Repo B: `frontend`, `UI`, `integration`

Use labels like `cross-repo` to highlight tasks spanning both repos.

---

## **5. Track Dependencies Between Repositories**

When tasks depend on each other (e.g., the frontend needs a backend API), use the **"Linked Issues"** feature or GitHub Project's **dependencies** to track the relationship:

- Backend Issue (`Repo A`):
  - Title: "Create `/auth/login` API"
  - Link: "Blocked by frontend integration (#456 in Repo B)"
- Frontend Issue (`Repo B`):
  - Title: "Integrate `/auth/login` API"
  - Link: "Depends on backend (#123 in Repo A)"

---

## **6. Release Management Across Repositories**

To manage and integrate releases:

1. **Create Milestones**:

   - Use the same milestone name in both repositories for shared releases (e.g., `v1.0`).
   - Add issues from both repos to the milestone.

2. **Generate Release Notes**:

   - Use GitHub’s CLI or API to fetch closed issues and PRs across both repositories.
   - Example CLI Command:
     ```bash
     gh issue list --state closed --milestone "v1.0" --repo org/repo-a
     gh issue list --state closed --milestone "v1.0" --repo org/repo-b
     ```

3. **Summary Example**:

   ```markdown
   ## Release v1.0

   ### Backend (Repo A)

   - [#123] Add authentication API
   - [#124] Fix database connection bug

   ### Frontend (Repo B)

   - [#456] Implement login UI
   - [#457] Improve error handling
   ```

---

## **7. Automation for Cross-Repo Integration**

### **GitHub Actions for Issue Syncing**

Automate syncing between the two repos with GitHub Actions.

#### **Example Workflow: Sync Labels Across Repos**

```yaml
name: Sync Labels Across Repositories

on:
  push:
    branches:
      - main

jobs:
  sync-labels:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v3
      - name: Sync Labels
        uses: repo-sync/github-sync-labels@v2
        with:
          source_repo: org/repo-a
          destination_repo: org/repo-b
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

### **Example Workflow: Auto-Close Issues in Related Repo**

Automatically close related issues in Repo B when a linked issue in Repo A is closed:

```yaml
name: Auto-Close Related Issues

on:
  issues:
    types: [closed]

jobs:
  close-related-issues:
    runs-on: ubuntu-latest
    steps:
      - name: Find and Close Related Issues
        uses: actions/github-script@v6
        with:
          script: |
            const issue = context.payload.issue;
            const related = issue.body.match(/Related: #(\d+)/); // Find linked issue ID
            if (related) {
              const relatedIssueId = related[1];
              await github.issues.update({
                owner: context.repo.owner,
                repo: "repo-b", // Replace with your related repo
                issue_number: relatedIssueId,
                state: "closed"
              });
            }
```

---

## **8. Monitoring Progress**

Use tools and queries to monitor progress across repos:

1. **Milestone Completion**:

   ```bash
   gh issue list --milestone "v1.0" --repo org/repo-a --state closed
   gh issue list --milestone "v1.0" --repo org/repo-b --state closed
   ```

2. **Completion Percentage**:
   Use a script or query to calculate % completion:
   ```bash
   TOTAL_A=$(gh issue list --milestone "v1.0" --repo org/repo-a | wc -l)
   CLOSED_A=$(gh issue list --milestone "v1.0" --repo org/repo-a --state closed | wc -l)
   PERCENT_A=$((CLOSED_A * 100 / TOTAL_A))
   ```

---

# Question 4 - Que 4 - Q4 - test template and best practices

I would like to record test scenario as github issue and label with feature, impact, regression enable, etc. I want to create test execution plan referencing all eligible test scenarios and details and want to record matrix for release / feature / patch deployment. Suggest a github template for test case, release test execution plan and regression test plan along with best practice guidelines.

## Answer of Q4

Here's a comprehensive approach to creating GitHub issue templates for test scenarios, test execution plans, and regression test plans. Additionally, I’ve provided best practices for managing test records and matrices for releases, features, and deployments.

---

### **GitHub Templates**

#### **1. Test Case (Scenario) Template**

This template is for logging test scenarios as GitHub issues, with relevant metadata for tracking.

```yaml
---
name: Test Scenario
about: Record a specific test scenario
labels: [test-scenario, feature, impact, regression]
---

# Test Scenario

**Title**:
Provide a brief title for the test scenario.

**Description**:
Describe the test scenario, including context and purpose.

**Preconditions**:
List any prerequisites or setup steps (e.g., environment, configurations).

**Steps to Execute**:
1. Step 1
2. Step 2
3. Step 3

**Expected Outcome**:
Clearly state the expected result of the test scenario.

**Impact Area**:
Specify which part of the application this impacts (e.g., component/module).

**Type of Test**:
- [ ] Functional
- [ ] Integration
- [ ] Regression
- [ ] Performance

**Labels**:
Apply relevant labels, e.g., `feature`, `regression`, `impact-high`.

**Attachments**:
Attach any screenshots, logs, or additional information if applicable.

**Notes/Comments**:
Any additional information or considerations.
```

---

#### **2. Test Execution Plan Template**

This template is for creating a plan for test execution, referencing multiple test scenarios and their statuses.

```yaml
---
name: Test Execution Plan
about: Create a plan for test execution
labels: [test-plan, release-testing]
---

# Test Execution Plan

**Release/Feature Name**:
Specify the name of the release, feature, or patch.

**Execution Scope**:
- Release Version: [Version]
- Environment: [Staging/Production/QA]
- Target Deployment Date: [Date]

**Test Scenarios**:
| ID  | Title                      | Type       | Priority | Status     | Reference Issue ID |
| ----|----------------------------|------------|----------|------------|--------------------|
| 1   | Login Functionality        | Functional | High     | Pending    | #123               |
| 2   | Cart Checkout              | Regression | Medium   | Passed     | #124               |
| 3   | API Response Validation    | Integration| High     | Failed     | #125               |

**Summary of Coverage**:
- Total Scenarios: [Number]
- Passed: [Number]
- Failed: [Number]
- Pending: [Number]

**Risk Assessment**:
Identify any high-risk areas based on test results.

**Approvals/Reviewers**:
- Reviewer 1: [Name/Handle]
- Reviewer 2: [Name/Handle]

**Notes/Comments**:
Add any additional information about the execution plan.
```

---

#### **3. Regression Test Plan Template**

This template helps plan regression testing for releases and deployments.

```yaml
---
name: Regression Test Plan
about: Plan and track regression testing
labels: [regression-testing, release-testing]
---

# Regression Test Plan

**Regression Scope**:
- Feature/Release: [Feature/Release Name]
- Modules Impacted: [Modules/Components]
- Test Environment: [Environment Name]

**Test Scenarios for Regression**:
| ID  | Title                     | Priority | Status     | Reference Issue ID |
| ----|---------------------------|----------|------------|--------------------|
| 1   | User Login Validation     | High     | Pending    | #101               |
| 2   | Payment Gateway Testing   | Medium   | Passed     | #102               |
| 3   | Profile Update API        | High     | Failed     | #103               |

**Regression Test Results**:
| Metric                  | Count | Percentage |
|-------------------------|-------|------------|
| Total Scenarios         | 10    | 100%       |
| Passed                  | 8     | 80%        |
| Failed                  | 2     | 20%        |

**Pass/Fail Criteria**:
Define the criteria for a successful regression test (e.g., all high-priority tests must pass).

**Risk Mitigation**:
- [Specific measures to address failed tests or risks]

**Execution Timeline**:
- Start Date: [Date]
- End Date: [Date]

**Approvals/Sign-offs**:
- QA Lead: [Name/Handle]
- Product Manager: [Name/Handle]

**Notes/Comments**:
Provide any additional context or considerations.
```

---

### **Best Practices for Managing Test Scenarios, Plans, and Results**

1. **Standardization**:

   - Use consistent templates for test cases, execution plans, and regression plans.
   - Define a clear naming convention for issues and labels (e.g., `feature`, `impact-high`, `regression`).

2. **Automation**:

   - Use **GitHub Actions** to trigger workflows when labels or statuses are updated (e.g., sending alerts for failed test cases).
   - Link regression plans to automated test scripts for real-time tracking.

3. **Tagging and Categorization**:

   - Use labels like `impact-high`, `regression`, or `feature` to organize and filter test scenarios.
   - Group test cases by modules or features for easier navigation.

4. **Traceability**:

   - Link each test scenario to a corresponding feature or release issue for better traceability.
   - Use the `Projects` feature in GitHub to group issues for a specific release.

5. **Version Control**:

   - Maintain test cases and plans for previous releases in separate branches or markdown files for historical reference.

6. **Collaborative Reviews**:

   - Involve relevant stakeholders (QA leads, developers, product managers) in reviewing and approving test execution plans and results.

7. **Visualization**:
   - Use GitHub’s Projects or external tools like **Excel**, **Jira**, or **Trello** to create dashboards and visual summaries of test progress and results.

---
