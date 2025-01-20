## Deploy Demo

If unable to run `deploy to demo` workflow, and needing to deploy locally, use following instruction.

### Build for demo

Create a file named `envdemo` in project root directory with following contents

```properties
REACT_APP_BASE_PATH=/personal-finance-ui
REACT_APP_REST_API_BASE_PATH=/personal-finance-ui/api
GENERATE_SOURCEMAP=true
PUBLIC_URL=https://rajexcited.github.io/personal-finance-ui/
REACT_APP_MINIMUM_SESSION_TIME=5 minutes
```

### Update package.json

add following scripts to `package.json`. the scripts are best suited for window machine.

```json
{
  "cleanlocal": "del .env.local .env.production.local",
  "prebuilddemolocal": "npm run cleanlocal >dist/null 2>&1 && copy envdemo .env.production.local && copy src\\demo\\demo.ts src\\demo\\index.ts",
  "builddemolocal": "react-scripts build",
  "predeploydemolocal": "npm run builddemolocal",
  "deploydemolocal": "gh-pages -d build",
  "postdeploydemolocal": "npm run cleanlocal >dist/null 2>&1"
}
```

### Commands

To create build and deploy demo pages, execute command `npm run deploydemolocal`
