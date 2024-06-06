# Requirements
# - pkg

# PROCEDURE
# **************************************
# 1. Call this file from root folder (/jtree), which should be two levels up from this file (jtree/build-tools/win/buildJTree.bat).
# 2. Update README.md.
# 3. Commit to Github.

VERS="1.0.0"

# ------- Prepare output folder.
rm -rf "./release"
mkdir "./release"

# ------- Compile program.
pkg --targets win-x64,linux,macos --out-path "./release" ./src/server/jas.js

# ------- Copy files to release folder.
cp -R "./server/source" "./release/internal"

# ------- Create zip files
zip -r "./release/jtree-$VERS-win.zip" "./release/jtree-win.exe" "./release/apps" "./release/internal" "./release/help.html"
zip -r "./release/jtree-$VERS-macos.zip" "./release/jtree-macos" "./release/apps" "./release/internal" "./release/help.html"
zip -r "./release/jtree-$VERS-linux.zip" "./release/jtree-linux" "./release/apps" "./release/internal" "./release/help.html"