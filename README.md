# finance-journal-ui

my finance activities. it helps me track, set goals, configure budget, tele my expenses and alert me for fraudable item, etc. helps me to track investments and savings.

## Available Scripts

In the project directory, you can run:

#### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

make sure to have a file named `envlocal` in root folder with following contents

```properties
REACT_APP_BASE_PATH=/personal-finance-ui
REACT_APP_REST_API_BASE_PATH=/
GENERATE_SOURCEMAP=true
```

#### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

#### `npm run buildlocalaws`

create aws deployable UI
make sure to have a file named `envaws` in root folder with following contents

```properties
REACT_APP_BASE_PATH=/personal-finance
REACT_APP_REST_API_BASE_PATH=/api
GENERATE_SOURCEMAP=false
PUBLIC_URL=/ui/
```

#### `npm run copytoinfra`

Copy to aws infra dist folder to get ready for UI deployment to AWS S3

#### `npm run deploydemo`

To build for demo UI and deploy to github demo branch
make sure to have a file named `envdemo` in root folder with following contents

Change the public URL according to your github account

```properties
REACT_APP_BASE_PATH=/personal-finance-ui
REACT_APP_REST_API_BASE_PATH=/personal-finance-ui/api
GENERATE_SOURCEMAP=false
PUBLIC_URL=https://rajexcited.github.io/personal-finance-ui/
```

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

https://create-react-app.dev/docs/deployment/
