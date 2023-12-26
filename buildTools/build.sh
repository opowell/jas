# PROCEDURE
# **************************************
# 1. Call this file from root folder (/$PROJECT_NAME), which should be two levels up from this file ($PROJECT_NAME/build-tools/win/build$PROJECT_NAME.bat).
# 2. Update README.md.
# 3. Update docs/README.md.
# 4. Commit to Github.
PROJECT_NAME='vic-vac-voe'
VERS="0.0.1"

# ------- Prepare output folders.
rm -rf "./releases/$VERS"
mkdir "./releases"
mkdir "./releases/$VERS"
mkdir "./releases/$VERS/files"
mkdir "./releases/$VERS/files/client"
mkdir "./releases/$VERS/files/internal"
mkdir "./releases/$VERS/win64"
mkdir "./releases/$VERS/macos"
mkdir "./releases/$VERS/linux"

# ------- Compile program.
pkg --targets win-x64,linux,macos --out-path "./releases/$VERS/files" ./src/vic-vac-voe.js

# ------- Copy files to release folder.
cp -R "./src/client" "./releases/$VERS/files/client"
cp -R "./src/server.js" "./releases/$VERS/files/internal"

# ------- Create zip files
#zip "./release/$PROJECT_NAME-$VERS-winxp.zip" "./release/$PROJECT_NAME-win-x86.exe" "./release/apps" "./release/internal" "./release/help.html"
zip -r "./releases/$VERS/$PROJECT_NAME-$VERS-win-x64.zip" "./releases/$VERS/files/$PROJECT_NAME-win-x64.exe" "./releases/$VERS/files/client" "./releases/$VERS/files/internal"
zip -r "./releases/$VERS/$PROJECT_NAME-$VERS-macos-arm64.zip" "./releases/$VERS/files/$PROJECT_NAME-macos-arm64" "./releases/$VERS/files/client" "./releases/$VERS/files/internal"
zip -r "./releases/$VERS/$PROJECT_NAME-$VERS-linux-arm64.zip" "./releases/$VERS/files/$PROJECT_NAME-linux-arm64" "./releases/$VERS/files/client" "./releases/$VERS/files/internal"