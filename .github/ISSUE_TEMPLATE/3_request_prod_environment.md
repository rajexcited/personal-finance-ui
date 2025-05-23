---
name: Request - Deploy or Rollback Production Environment
about: Submit a request for release deployment or rollback to a previous version in the production environment.
title: "[Request] [Rollback] Provision Production Environment"
labels: [deployment, "env: production", rollback, request]
---

# Production Environment Deployment Form

This form standardizes deployment requests for production environment, ensuring clarity and completeness.

### Deployment Type:

> **Note:** _Select one option by marking an "X" in the corresponding checkbox._

- [ ] **Release**
- [ ] **Rollback**

### Release Deployment / Rollback Details:

> **Note:** _Provide details for the release or rollback_

- **Version to Deploy (Release/Rollback):** v0.2.0 <!-- Specify the version for release or rollback deployment. -->
- **Existing Deployed Version:** v0.1.0 <!-- Indicate the current production version. -->
- [ ] use existing tag if available

#### Release Notes

> **Note:** _Provide priority changes or specify "Not Applicable" for rollbacks_ > https://github.com/rajexcited/personal-finance-ui/releases/tag/v0.2.0 <!--  tag version  -->

- Not Applicable for rollbacks

### Reason for Deployment / Rollback:

> **Note:** _Briefly explan purpose, e.g., feature updates, bug fixes, performance improvements._

- **Trigger Conditions (for Rollback):**
  > **Note:** _Specify conditions initiating rollback, e.g., critical failures detected._
  <!--  Remove this trigger conditions item if rollback is selected  -->

#### Risk Assessment

- **Risk Level:** Low / Medium / High
- **Justification for Risk level:**
  > **Note:** _Provide reasoning for the chosen risk level. Include why risk level is chosen for release notes, not the notes itself_

### Environment Details:

- **Environment Name:** Production Environment

### Deployment Schedule:

> **Note:** _Use the format mm-dd-yyyy HH:MM:SS in 24-hour CST time._

- **Preferred Date and Time:** 03-15-2025 13:40:35

### Pre Deployment Validations:

> **Note:** _Checks off tasks to verify readiness for deployment._

- [ ] Milestone Pull Requests validated
- [ ] Regression test plan executed (provide link to test plan)
- [ ] All related issues are resolved

### Post Deployment Tasks:

#### Smoke Test Verification:

> **Note:** _Provide verification tasks to be performed after release deployment / rollback_

- [ ] All public links are navigable before login
- [ ] Successful login on Desktop Chrome browser v134.x
- [ ] Successful login on Android(15) Chrome browser v135.x
- [ ] All links for "Expenses" are navigable after login
- [ ] All links for "Payment Account" are navigable after login
- [ ] All links for "Settings" are navigable after login

#### Health Check Verification:

> **Note:** _List manual or automated verification tasks for system health._

- [ ] Deployment downtime is under one hour
- [ ] Site is accessible via desktop chrome browser
- [ ] Site is accessible via android chrome browser
- [ ] Rest Api calls are functioning properly

### Additional Notes or Special Instructions:

> **Note:** _Include any additional notes, considerations, or requirements, e.g. major upgrade, ensure backups are created_

> [!IMPORTANT]  
> If a release deployment fails and a rollback is required, submit a rollback request form as a sub-issue of this request.

> [!TIP]  
> Update the sub-issue with post-deployment verification results. If failure occurs, include detailed explanations.
