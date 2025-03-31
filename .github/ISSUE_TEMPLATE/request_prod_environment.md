---
name: Request - Deploy or Rollback Production Environment
about: Use this form to request a release deployment or rollback to a previous version in the production environment.
title: "[Request] [Rollback] Provision Production Environment"
labels: [deployment, production, rollback]
---

# Request Form Production Environment

This form is intended to standardize deployment requests for production environments, ensuring clarity and completeness

### Deployment Type:
  _(Select one option by marking an "X" in the corresponding checkbox.)_  
  
- [x] **Release**  
- [ ] **Rollback**  

### Release Details:
  _(Provide version details for release or rollback)_  

- **Rollback Version to Deploy:** v0.1.0    <!-- Specify the version to rollback release deployment, e.g., v0.1.0. -->
- **Release Version to Deploy:** v0.2.0    <!-- Specify the version for a release deployment, e.g., v0.2.0. -->
- **Existing Version Deployed:** v0.1.0  
- **Release Notes:**  
    _(Provide a link to release notes or specify "Not Applicable" for rollbacks)_  


### Environment Details:
- **Environment Name:** Production Environment  

### Deployment Schedule:
  _(Use the format mm-dd-yyyy HH:MM:SS - 24-hour time. It should current CST time.)_  
  
- **Preferred Date and Time:** 03-15-2025 13:40:35  

### Deployment Reason:

#### Risk Level:  
  _(Provide level from one of the following)_
- Low
- Medium 
- High  

#### Reason/Justification:  
  _(Explain why the selected risk level is appropriate.)_  

#### Deploy / Rollback Explaination:  
  _(Provide a brief explanation, features, issue links, e.g., "Bug fixes and performance improvements" or "Rollback due to critical issue in v0.1.0.")_  

### Rollback Plan:  
  
#### Trigger Condition:  
  _(Specify the conditions under which a rollback request is created)_  

#### Rollback Reason:  
  _( Provide issues, impact analysis, etc.)_  


### Post Deployment Tasks:

#### Smoke and PPV Test Verification:  
  _(Provide list of verifications to be performed after release deployment / rollback)_  

- [ ] all public links are navigational before login  
- [ ] successful login to desktop chrome browser  
- [ ] successful login to android chrome browser  
- [ ] all links for expenses are navigational after login  
- [ ] all links for payment account are navigational after login  
- [ ] all links for settings are navigational after login  

#### Health Check Verification:  
  _(Provide list of all manual or automated verifications are included in health check. following some examples given.)_  

- [ ] cf health of site link. workflow job  
- [ ] site is launch in desktop chrome browser  
- [ ] site is launch in android chrome browser  
- [ ] rest api call are working in site  

### Additional Notes or Special Instructions:
_(Enter any additional notes, special considerations, or requirements, e.g., "Ensure zero downtime deployment.")_  
  
  

> [!IMPORTANT]
> If release Deployment fails, and roolback is required, create a rollback request form as sub issue of this.

> [!TIP]
> When verifications are performed, update the checkmark if passed. in case of failure, add details.
