# UI Testing

Here, we are organizing test cases and relavant details. the all test cases are functional. the cosmetic issue fixes don't get recorded in test case, but screenshot will give away some idea on site UX.

The testing can be performed on demo site or test environment too.

## Test case

Test case status - active or retire.  
we will keep only active test case in repo. the retire test case will be delete from repo.

each test case is its own directory. the test scenario details are recorded in md file.

capture and attach the files to markdown test case file. all related files goes in attachment directory.

tag/label features, components, pages, regression enablement, imact (high, medium, low), type, involvement, manual/automated, milestone version added, positive/negative, etc.

type:

- Integration Testing
- End to end Testing

involvement can be backend and/or frontend

## Test Case Summary

Generating summary of test cases for below fields. You can download the latest artifacts from the workflow run.

- Type of Test
- Impact Area
- Tags.impact
- Tags.feature

[![Validate Test cases](https://github.com/rajexcited/personal-finance-ui/actions/workflows/tc-build.yml/badge.svg?branch=testing)](https://github.com/rajexcited/personal-finance-ui/actions/workflows/tc-build.yml)

## Create Test Execution Plan

Follow the steps

- Run the workflow to create TEP (Test Execution Plan) of your choosing. and wait for TEP artifact
- When TEP is prepared, use it to create an TEP issue. This will create the test env site.
- Execute all tests and record the results in TEP issue.
- Once all tested, you can close the issue with all results. In case, you can't execute more test cases or need time for other issues to be fixed, can closed issue without recording all results. - Keep in mind that the closing issue will destroy the test env site.
- If TEP issue is closed with all results PASS, PR is eligible to merge to master branch. and ready for prod release.

### Regression

One of the requisite of milestone to deploy in prod is to run regression TEP with 100%. each milestone has its own milestone branch consists of issues fix and/or feature enhancement.

To prep for regression,

- Run the [TEP workflow](https://github.com/rajexcited/personal-finance-ui/actions/workflows/test-exec-plan.yml)
- Enter the milestone version. e.g. if milestone is v0.1.0 then enter `0.1.0`
- Select `Regression` in execution type
- Make sure to select `testing` branch

Wait for artifact to be created

### Featured

## Automated Testing

For a detailed analysis of framework selection, refer to [Library and Tool Selection Analysis](.github/docs/library-tools-selection.md).

### Cypress Setup

#### Prerequisites

- **Node.js:** It is recommended to use the latest version. The current automation setup is configured with **Node.js v22.15.0** and **npm 11.3.0**.  
  To verify installed versions, run:

  ```bash
  node -v
  npm -v
  ```

#### Useful Commands

- **Install Dependencies:** Run `npm install` to install or update required packages.
- **Compile Code:** Use `npm run build` to compile test code and validate syntax/linting errors.
- **Run Regression Tests:** Execute automated regression tests with:
  ```bash
  npm run tests:regression
  ```
- **Start Interactive Development Mode:** Enable test development and execute specs using:
  ```bash
  npm run tests:developer
  ```

#### Environment Configuration

Before running any tests or development tasks, ensure the `.env` file is correctly configured with necessary properties.

##### Example: Development Configuration

```properties
ENV_ID=local
SITE_BASE_URL=http://localhost:3000/personal-finance-ui
```

##### Example: Test Plan Configuration (Regression Tests)

```properties
ENV_ID=testplan
SITE_BASE_URL=https://d2wfayzoko7f48.cloudfront.net/personal-finance
UI_VERSION=0.2.0
API_VERSION=0.2.0
```

### Execute Regression Tests

Currently, automated regression tests can be executed **locally**, and consolidated test reports can be uploaded to the **Test Plan Execution Task** for review.

#### Prerequisites

Before running the tests, ensure that the `.env` file is properly configured with the necessary environment variables.

#### Execution

Once the environment is set up, use the appropriate command to initiate test execution.
