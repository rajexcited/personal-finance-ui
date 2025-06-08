## Local Setup

The end 2 end test are developed with cypress framework.

### Pre-requisite

- Install latest NodeJs and NPM. minimum required NodeJs v22.x and NPM v10.x 
  commands to verify installed versions
  ```
  node --version
  npm --version
  ```

### Install Dependencies

Run `npm install` command to install all required node packages.

### Set up env files

To run tests for `localhost`, create `.env.local` file in project directory with following

```properties
CYPRESS_ENV_ID=local
SITE_BASE_URL=http://localhost:3000/personal-finance
# local doesn't have
# CYPRESS_API_BASE_URL=/api
# the value to generated for each environment and release. can find id through deployed stack 
CYPRESS_E2E_TEST_COOKIE_VALUE=local-e2e
```

To run tests hosted in aws environments, create file name with pattern `.env.<NODE_ENV>.local` in project root directory with following. Replace with appropriate details.


```properties
CYPRESS_ENV_ID=development
SITE_BASE_URL=https://d1m2py23aqao8j.cloudfront.net/personal-finance
CYPRESS_API_BASE_URL=https://d1m2py23aqao8j.cloudfront.net/api
# the value to generated for each environment and release. can find id through deployed stack tag `testAttrConditionId`
CYPRESS_E2E_TEST_COOKIE_VALUE=c7b4c646-a965-412e-a18b-e97e08dea3a9
CYPRESS_UI_VERSION=v0.2.2
```

### Useful commands

- `npm run build`: To compile test files

- `npm run tests:developer`: to develop automation cypress tests in interactive mode with local browsers

- `npm run tests:regression`: to run regression automation tests in headless browser mode

### Precausions: 

- make sure to set the `NODE_ENV` before running the tests to make sure proper env properties are loaded.
examples,
```
NODE_ENV=development
NODE_ENV=testplan
NODE_ENV=production
```