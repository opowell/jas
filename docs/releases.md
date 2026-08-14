# Releases

Releases exist so JAS can be downloaded and run on a machine with no Node.js
installed: each platform archive carries its own Node runtime under
`server/node/`, which `jas.sh` and `jas.cmd` find automatically.

## Cutting a release

1. Bump `version` in [package.json](../package.json).
2. Commit it.
3. Tag and push:

   ```sh
   git tag v1.1.0
   git push origin main --tags
   ```

The [release workflow](../.github/workflows/release.yml) then checks the tag
matches `package.json`, builds every archive, and publishes them to a GitHub
release for that tag. Pushing a tag whose version disagrees with
`package.json` fails the build rather than publishing mislabelled archives.

Running the workflow manually (`workflow_dispatch`) builds the archives and
attaches them as workflow artifacts without creating a release — useful for
checking a build before tagging.

## Building archives locally

```sh
npm run build-release
```

Archives land in `dist/`. Useful flags:

```sh
node scripts/build-release.mjs --targets linux-x64,win-x64   # subset of platforms
node scripts/build-release.mjs --node-version v22.11.0       # pin the bundled Node
node scripts/build-release.mjs --ref v1.0.0                  # build from a tag
node scripts/build-release.mjs --out /tmp/jas-dist           # write elsewhere
```

Without `--node-version`, the build bundles the current Node.js LTS, looked up
from `nodejs.org/dist/index.json`. Downloaded runtimes are checked against the
release's published `SHASUMS256.txt` and cached in `dist/node-cache/`.

## What goes into an archive

The contents come from `git archive`, so a release holds exactly what is
committed at that ref — minus the paths marked `export-ignore` in
[.gitattributes](../.gitattributes) (CI config, this build script, editor
config). `node_modules/` is then reinstalled from `package-lock.json` with
`npm ci --omit=dev`, so a release can never ship a stale dependency tree.

`apps/` is not included: it is the user's own folder, and is created on first
run.
