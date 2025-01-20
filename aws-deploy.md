## Deploy to AWS

If need to deploy to AWS, we need to clone repository and setup locally `personal-finance-backend-aws`

### Build for AWS locally

Create a file named `envaws` in project root directory with following contents

```properties
REACT_APP_BASE_PATH=/personal-finance
REACT_APP_REST_API_BASE_PATH=/api
GENERATE_SOURCEMAP=false
PUBLIC_URL=/ui/
REACT_APP_MINIMUM_SESSION_TIME=30 minutes
```

### Update package.json

add following scripts to `package.json`. the scripts are best suited for window machine.

```json
{
  "cleanlocal": "del .env.local .env.production.local",
  "prebuildlocalaws": "npm run build && copy envaws .env.local",
  "buildlocalaws": "npm run buildwithoutmocklocal",
  "postbuildlocalaws": "npm run cleanlocal >dist/null 2>&1",
  "prebuildwithoutmocklocal": "copy src\\demo\\dummy.ts src\\demo\\index.ts",
  "buildwithoutmocklocal": "react-scripts build",
  "postbuildwithoutmocklocal": "copy src\\demo\\demo.ts src\\demo\\index.ts",
  "precopytoinfralocal": "rmdir /S /Q ..\\personal-finance-backend-aws\\dist\\ui",
  "copytoinfralocal": "xcopy /E build ..\\personal-finance-backend-aws\\dist\\ui\\"
}
```

### bat Scripts

The files `deploy-finance-ui.bat` and `invalidate-ui.bat` should be created in parent directory, where both of repositories are existed.

Location example,

> personal-finance-ui repo located at `%user%\Documents\GitHub\personal-finance-ui`
>
> personal-finance-backend-aws repo located at `%user%\Documents\GitHub\personal-finance-backend-aws`
>
> deploy-finance-ui.bat should be at `%user%\Documents\deploy-finance-ui.bat`
>
> invalidate-ui.bat should be at `%user%\Documents\invalidate-ui.bat`

The file `deploy-finance-ui.bat` should have following script contents

```bat
setlocal

echo Start: %date% %time%
set starttime=%time%

cd finance-journal-ui

call npm run buildlocalaws
if %ERRORLEVEL% neq 0 goto :error

call npm run copytoinfra
if %ERRORLEVEL% neq 0 goto :error

cd ..\personal-finance-backend-aws

call cdk deploy MyFinanceUiDeployStack --exclusively
if %ERRORLEVEL% neq 0 goto :error

cd ..
call invalidate-ui.bat
if %ERRORLEVEL% neq 0 goto :error


:error
echo Completed: %date% %time%
set endtime=%time%

FOR /F "tokens=1-4 delims=:.," %%a IN ("%starttime%") DO (
   SET /A "tstart=(((%%a*60)+1%%b %% 100)*60+1%%c %% 100)*100+1%%d %% 100"
)

FOR /F "tokens=1-4 delims=:.," %%a IN ("%endtime%") DO (
   SET /A "tend=(((%%a*60)+1%%b %% 100)*60+1%%c %% 100)*100+1%%d %% 100"
)

set /a total=end-start
echo Total Time: %total%s

endlocal
```

The file `invalidate-ui.bat` should have following script contents

```bat
setlocal

@echo off

rem loop through all cfn outputs, because result could have in any random order
FOR /F "tokens=*" %%F IN ('aws --profile local cloudformation describe-stacks --stack-name prsfin-%INFRA_ENV%-infra-stack --query "Stacks[0].Outputs[?starts_with(OutputKey,`DistributionId`) == `true`].OutputValue" --output text') DO (
    set DistributionId=%%F
    echo %%F | findstr /i "DistributionId" >nul && (
        echo Found a match in: %%F
		set DistributionIdOutput=%%F
    )
)

rem set DistributionId=%DistributionIdOutput:~-14%
echo Cf DistributionId=%DistributionId%

FOR /F "tokens=1" %%F IN ('aws --profile local cloudfront create-invalidation --distribution-id %DistributionId% --paths "/personal-finance/index.html" --query "Invalidation.Id" --output text') DO SET InvalidationId=%%F
echo InvalidationId=%InvalidationId%

call aws --profile local cloudfront get-invalidation --id %InvalidationId% --distribution-id %DistributionId%

:getinvalidatestatus
FOR /F "tokens=1" %%F IN ('aws --profile local cloudfront get-invalidation --id %InvalidationId% --distribution-id %DistributionId% --query "Invalidation.Status" --output text') DO SET InvalidationStatus=%%F

echo InvalidationStatus=%InvalidationStatus%

if not "%InvalidationStatus%" == "Completed" (
 timeout /t 15
 goto getinvalidatestatus
)

echo "invalidate index.html is completed."

endlocal
```

### Commands

To create build for aws deploy, execute command `npm run buildlocalaws`

In order to deploy the UI code, we have to first copy to another repository. execute command to copy `npm run copytoinfralocal`

To deploy UI and invalidate cloudfront cache, run bat file `deploy-finance-ui.bat`
