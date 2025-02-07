---
name: Regression Test Plan
title: "[Regression TEP]: "
labels: [High, test execution]
---

# Regression Test Plan

## Regression Scope:

### Milestone:

[milestone $milestone.title](https://github.com/rajexcited/personal-finance-ui/milestone/$milestone.id)

### Impact Areas:

- $details.impact_area

### features:

- $details.tags.feature

## Test Scenarios for Regression:

| Index | Title          | Impact               | Status  | Test case Id                                                                                                           |
| ----- | -------------- | -------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------- |
| $ind  | $details.title | $details.tags.impact | Pending | [$metadata.id](https://github.com/rajexcited/personal-finance-ui/blob/testing/test-cases/$metadata.relative_file_path) |

## Pass/Fail Criteria

- all tests must pass.
- Whenever test case executed, add the comment with row details having PASS or FAIL status. if status is failed, follow risk mitigation steps.

## Risk Mitigation:

- when test is failed, you can create a subtask / issue treating this as a parent. and after fix and tested successfully, add/update comment with PASS statis.
- if the regression cannot progress because of subtask completion waiting, can temporarily change title to add `[WAITING ON SUBTASKS]`. this will destroy test env site.  
  when ready to resume regression, update title removing magic keywords to deploy test env site.

## Notes/Comments:

Provide any additional context or considerations.
