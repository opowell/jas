# Releases

Releases exist so JAS can be downloaded and run on a machine with no Node.js
installed: each platform archive carries its own Node runtime under
`server/node/`, which `jas.sh` and `jas.cmd` find automatically.

## Cutting a release

```sh
./scripts/release.sh patch      # 1.0.0 -> 1.0.1
./scripts/release.sh minor      # 1.0.0 -> 1.1.0
./scripts/release.sh major      # 1.0.0 -> 2.0.0
./scripts/release.sh 1.4.2      # an explicit version
```

The script bumps `package.json` and `package-lock.json`, commits, tags `vX.Y.Z`,
and pushes the branch and tag together. Pushing the tag is what starts the
[release workflow](../.github/workflows/release.yml), which builds every archive
and publishes them to a GitHub release. It then prints the Actions URL, and
follows the run if the [GitHub CLI](https://cli.github.com) is installed.

Add `--dry-run` to run every check and print the plan without changing
anything.

Before touching the repository it refuses to continue if you are not on `main`,
the working tree is dirty, `main` has diverged from origin, or the tag already
exists locally or on origin. When `package.json` already holds the requested
version — as it does for the very first release — it tags the current commit
instead of making an empty bump.

Doing it by hand is the same three steps: set the version in
[package.json](../package.json), commit, then `git tag v1.1.0` and
`git push origin main --follow-tags`. The workflow checks the tag matches
`package.json` and fails rather than publishing mislabelled archives.

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
