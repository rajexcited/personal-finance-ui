# Project setup

The UI is based on ReactJS and bulma libraries.

## Pre-requisites

Following softwares and tools are required,

- [VS Code Editor](https://code.visualstudio.com/)
- [NodeJS v20](https://nodejs.org/en/download/current)
- npm latest
- Chrome browser latest

## Setup local

Make sure you met pre-requistite. In project directory, run `npm install` to download all dependencies.

### Start app in Development mode

Create a file `.env.local` in project root directory with these contents

```properties
VITE_BASE_PATH=/personal-finance-ui
VITE_REST_API_BASE_PATH=/
GENERATE_SOURCEMAP=true
VITE_MINIMUM_SESSION_TIME=4 minutes
```

Run command `npm start` to start application in development mode.  
This will compile and launch the page in browser.

You are now ready to development enhancements and / or resolve issues.

### Verify any Lint issue

When you execute command `npm run build`, the app is build for production ready. and it will list down any issues which is not address during development mode build.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

See the section about [deployment](https://create-react-app.dev/docs/deployment/) for more information.
