#!/bin/sh
# Cuts a JAS release: sets the version, commits, tags, and pushes. Pushing the
# tag is what triggers .github/workflows/release.yml, which builds the platform
# archives and publishes them to a GitHub release.
#
#   ./scripts/release.sh patch          1.0.0 -> 1.0.1
#   ./scripts/release.sh minor          1.0.0 -> 1.1.0
#   ./scripts/release.sh major          1.0.0 -> 2.0.0
#   ./scripts/release.sh 1.4.2          an explicit version
#   ./scripts/release.sh patch --dry-run   check everything, change nothing
set -e

JAS_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$JAS_DIR"

BRANCH=main

usage() {
  echo "usage: ./scripts/release.sh patch|minor|major|<version> [--dry-run]" >&2
  exit 1
}

[ $# -ge 1 ] || usage
target=$1
shift
dry_run=false
for arg in "$@"; do
  case $arg in
    --dry-run) dry_run=true ;;
    *) usage ;;
  esac
done

case $target in
  patch | minor | major) ;;
  [0-9]*.[0-9]*.[0-9]*) target=${target#v} ;;
  *) usage ;;
esac

. "$JAS_DIR/server/find-node.sh"
if [ -z "$node_bin" ]; then
  jas_no_node_message
  exit 1
fi

fail() {
  echo "release: $1" >&2
  exit 1
}

# --- preflight -------------------------------------------------------------

branch=$(git rev-parse --abbrev-ref HEAD)
[ "$branch" = "$BRANCH" ] || fail "on branch '$branch', expected '$BRANCH'"

[ -z "$(git status --porcelain)" ] || fail "working tree has uncommitted changes"

echo "- fetching $BRANCH from origin"
git fetch -q origin "$BRANCH"
local_head=$(git rev-parse HEAD)
remote_head=$(git rev-parse FETCH_HEAD)
if [ "$local_head" != "$remote_head" ]; then
  if git merge-base --is-ancestor "$remote_head" "$local_head"; then
    echo "- note: $BRANCH is ahead of origin; those commits go out with the tag"
  else
    fail "$BRANCH has diverged from origin/$BRANCH — pull or rebase first"
  fi
fi

current=$("$node_bin" -p "require('$JAS_DIR/package.json').version")

# npm computes the bump so the semver rules are never hand-rolled here.
if [ "$target" = patch ] || [ "$target" = minor ] || [ "$target" = major ]; then
  version=$("$node_bin" -e "
    const [major, minor, patch] = '$current'.split('.').map(Number)
    const bumped = { major: [major + 1, 0, 0], minor: [major, minor + 1, 0], patch: [major, minor, patch + 1] }
    console.log(bumped['$target'].join('.'))
  ")
else
  version=$target
fi

tag="v$version"
git rev-parse -q --verify "refs/tags/$tag" > /dev/null && fail "tag $tag already exists locally"
if [ -n "$(git ls-remote --tags origin "refs/tags/$tag")" ]; then
  fail "tag $tag already exists on origin"
fi

echo
echo "  current version : $current"
echo "  releasing       : $version  (tag $tag)"
echo "  from            : $branch at $(git rev-parse --short HEAD)"
echo

if [ "$dry_run" = true ]; then
  echo "- dry run: nothing changed. Re-run without --dry-run to release."
  exit 0
fi

# --- release ---------------------------------------------------------------

if [ "$version" != "$current" ]; then
  # Rewrites package.json and package-lock.json without committing or tagging,
  # so the commit message and tag below stay in this script's hands.
  "$npm_bin" version "$version" --no-git-tag-version --allow-same-version > /dev/null
  git add package.json package-lock.json
  git commit -q -m "$tag"
  echo "- committed version bump"
else
  echo "- package.json is already $version, tagging the current commit"
fi

git tag -a "$tag" -m "JAS $tag"
echo "- tagged $tag"

# --follow-tags sends the branch and the annotated tag together, so the
# workflow never sees a tag whose commit is not yet on origin.
git push -q origin "$BRANCH" --follow-tags
echo "- pushed $BRANCH and $tag"

remote_url=$(git remote get-url origin)
slug=$(echo "$remote_url" | sed -E 's|.*github\.com[:/]||; s|\.git$||')
echo
echo "The release workflow is now building the archives:"
echo "  https://github.com/$slug/actions"
echo "When it finishes, the release appears at:"
echo "  https://github.com/$slug/releases/tag/$tag"

if command -v gh > /dev/null 2>&1; then
  echo
  echo "- waiting for the workflow run to appear"

  # `gh run watch` prompts for a run when given none, which fails outright with
  # no terminal to prompt at, so the run is looked up by tag. It takes a few
  # seconds for GitHub to register it after the push.
  run_id=
  attempt=1
  while [ $attempt -le 12 ]; do
    run_id=$(gh run list --workflow release.yml --branch "$tag" --limit 1 --json databaseId --jq '.[0].databaseId' 2> /dev/null || true)
    [ -n "$run_id" ] && break
    sleep 5
    attempt=$((attempt + 1))
  done

  if [ -z "$run_id" ]; then
    echo "- the run has not appeared yet; follow it on the Actions page above"
  else
    echo "- watching run $run_id (Ctrl-C to stop; the build continues regardless)"
    if gh run watch "$run_id" --exit-status --compact; then
      echo
      echo "Released: https://github.com/$slug/releases/tag/$tag"
    else
      echo "- the run did not succeed: https://github.com/$slug/actions/runs/$run_id" >&2
      exit 1
    fi
  fi
fi
