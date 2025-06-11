# Making a release

The new version number must follow [semantic versioning](https://semver.org/) and look like `X.Y.Z`. To make a new release follow these steps:

1. Create or update the release notes at `book/src/releases/vX.Y.Z.md` and make a PR to merge them into develop. The release notes should include a migration guide if there are breaking changes.
2. Run `npm run version X.Y.Z` and make a PR to merge the resulting version bump commit into develop.
3. Make a PR to merge develop into main.
4. Verify that the CI successfully builds and releases [to npm](https://www.npmjs.com/package/@samply/lens) and creates a [release on GitHub](https://github.com/samply/lens/releases).
