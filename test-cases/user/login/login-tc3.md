---
id: login-tc3
---

# Login duplicate session

## Title:

User attempts to login in different browser/tab/device

## Description:

User has logged in successfully in windows chrome browser. And user tries to login to mobile and gets duplicate session notification.

## Preconditions:

User has logged in successfully in chrome browser / tab. Now launched the site to another tab/browser and navigated to login page.

## Steps to Execute:

1. user fills out details as following,
   - emailId: `sardar.vallabhbhai.patel@example.com`
   - password: `$Ardar123`
2. user clicks on login button
3. user gets popup notifying duplicate session with active session info.
4. user selects cancel, previous active session continues workable
5. user tries to login again
6. user gets popup notifying duplicate session with active session info.
7. user selects `Punch login` or `force login`

## Expected Outcome:

- The loading indicator is displayed for few seconds (~5).
- verify user is navigated to `secured homepage` and secured links like, expenses, payment accounts, settings, logout, etc. are showing and navigational in current browser tab.
- verify the other browser tab will be logged out as previous session is deactivated. and cannot take any action on previous tab.

## Impact Area:

### frontend

- login page
- homepage

### backend api

- login api
- stats api
- userdetails api

## Type of Test:

- Integration
- Demo site testable

## Tags:

- feature=`login`
- execution=`manual`
- impact=`high`
- type=`positive`

## Affected Versions:

v0.1.0

## Attachments:

Screenshots

## Average Performance Time:

### Test:

total=1 min

### Browser:

#### network calls:

- index.html=450 ms
- api/user/login/post=1.8 sec
- api/user/details/get=2.3 sec
- api/stats/purchase/get=1.44 sec
- api/stats/refund/get=1.24 sec
- api/stats/income/get=768 ms

### Lambda:

#### user-login

- memory provisioned=256 MB
- bill duration=1122 ms
- init duration=687 ms

## Notes/Comments:

Any additional information or considerations.
