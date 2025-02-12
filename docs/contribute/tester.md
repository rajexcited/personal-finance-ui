# Testing

All test case scenarios are listed in [test-cases](../../test-cases/) directory.

Both automated and manual test cases are tagged appropriately for execution.

## Create a Manual Test Case

create test case scenario files whenever required with following steps.

- to create a new test case, use the [test case template](../tests/test_case_template.md)
- the references are listed in template. make sure to fillout all metadata and preserve the layout. The build will fail otherwise
- created and updated in metadata will be same.
- id in metadata is crucial. use the format `<feature name>-tc-<number>`. the id cannot have space, use dash for seperator.
  - The build will fail, if the id already exists

## Update Test Case

The enhancements or issue fixes can affect existing test case scenario.

- to search affected scenarios, search by feature/module to list.
- update steps and expectations wherever needed.
- reference the template for any list data or layout.

**TBD:** soon there will be a pipline to list affected test case scenarios for github issue or discussion idea(enhancement)

## Feature Enhancement Test Plan

When new feature is introduced or existing feature has enhancements,

- create or update test case scenarios
- run workflow `prepare test plan` which creates test plan github issue, so tester can test it.
- this test plan needs to be executed against stage env and demo site to pass the check.

## Regression Test Plan

Before any release, the regression test plan needs to be executed.

- run workflow `prepare test plan` which creates test plan github issue, so tester can test it.
- this test plan needs to be executed agains stage env to pass release check.

## Test on Stage

The stage env gets auto deployed if matched following criteria on github issue,

- test plan issue has to be created from `prepare test plan` workflow
- test plan issue must be open
- test plan issue must be assigned to allowed tester

Once, test plan is executed, tester can close the github issue,

- which triggers Stage env destroy
- adds comment to github issue with summary of tet plan execution
- adds the complete check

The list of users are in [test users file](../tests/data/stage-users.md)

## Test on Demo site

The Demo site is very useful to troubleshoot UI issues, verify new enhancements, etc.

link: https://rajexcited.github.io/personal-finance-ui/

for login, use the email Id ending with `@demo.com` with any password.

for example,

> emailId: test1@demo.com  
> password: P@ssword1234
