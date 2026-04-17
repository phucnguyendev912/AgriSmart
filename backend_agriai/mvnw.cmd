@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF)
@REM Spring Boot Maven Wrapper script for Windows
@REM ----------------------------------------------------------------------------

@IF "%__ACIDIC_MVNW_DEBUG%"=="" GOTO init

:init
@setlocal
@SET DIRNAME=%~dp0
IF "%DIRNAME%"=="" SET DIRNAME=.
@SET APP_BASE_NAME=%~n0
@SET APP_HOME=%DIRNAME%

@SET MAVEN_PROJECTBASEDIR=%APP_HOME%
@SET MAVEN_OPTS=%MAVEN_OPTS%

@REM Determine the Java command to use to start the JVM.
if not "%JAVA_HOME%"=="" goto OkJHome

@echo.
@echo Error: JAVA_HOME is not set and no 'java' command could be found in your PATH.
@echo Please set the JAVA_HOME variable in your environment to match the location of your Java installation.
@goto fail

:OkJHome
SET JAVA_EXE=%JAVA_HOME%\bin\java.exe
if exist "%JAVA_EXE%" goto init2

@echo.
@echo Error: JAVA_HOME is set to an invalid directory: %JAVA_HOME%
@goto fail

:init2
@SET MAVEN_WRAPPER_JAR=%APP_HOME%\.mvn\wrapper\maven-wrapper.jar
@SET MAVEN_WRAPPER_PROPERTIES=%APP_HOME%\.mvn\wrapper\maven-wrapper.properties

@FOR /F "usebackq tokens=1,2 delims==" %%A IN ("%MAVEN_WRAPPER_PROPERTIES%") DO (
    @IF "%%A"=="distributionUrl" (
        @SET DISTRIBUTION_URL=%%B
    )
)

"%JAVA_EXE%" -Dmaven.multiModuleProjectDirectory="%MAVEN_PROJECTBASEDIR%" org.apache.maven.wrapper.MavenWrapperMain %WRAPPER_LAUNCHER% %* 2>NUL
if ERRORLEVEL 1 goto error

goto end

:error
set ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%

if not "%MAVEN_SKIP_RC%"=="" goto skipRcPost
@REM check for post script, once with legacy .postmvn support.
if exist "%HOME%\mavenrc_post" call "%HOME%\mavenrc_post"
if exist "%HOME%\.mavenrc_post" call "%HOME%\.mavenrc_post"
:skipRcPost

@REM pause the script if MAVEN_BATCH_PAUSE is set to 'on'
if "%MAVEN_BATCH_PAUSE%"=="on" pause

if "%MAVEN_TERMINATE_CMD%"=="on" exit %ERROR_CODE%

exit /B %ERROR_CODE%
