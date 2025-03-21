## Branching

### Gitflow:

1. The branch `develop` is created from `main`
2. The branch `release` is created from `develop`
3. `Feature` branches are created from `develop`
4. When a feature is complete it is merged into the `develop` branch
5. When the `release` branch is done it is merged into `develop` _and_ `main`
6. If an urgent issue in `main` is detected a `hotfix` branch is created from `main`
7. Once the `hotfix` is complete it is merged to both `develop` and `main`

_[For reference](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)_

## Versioning

#### For MAIN/ RELEASE branches

Given a version number `MAJOR.MINOR.PATCH`, increment the:

- MAJOR version when you make incompatible (BREAKING) API changes
- MINOR version when you add functionality in a backward compatible manner
- PATCH version when you make backward compatible bug fixes

_Additional labels for pre-release and build metadata are available as extensions to the MAJOR.MINOR.PATCH format._

Please see **[Semantic Versioning](https://semver.org/)**

## Commits:

```
<TYPE>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

1. FIX: a commit of the type fix patches a bug in your codebase (this correlates with PATCH in Semantic Versioning).
2. FEAT: a commit of the type feat introduces a new feature to the codebase (this correlates with MINOR in Semantic Versioning).
3. Choose one -> BREAKING CHANGE: a commit that has a footer BREAKING CHANGE:, or appends a ! after the type/scope, introduces a breaking API change (correlating with MAJOR in Semantic Versioning). A BREAKING CHANGE can be part of commits of any type.
4. Types other than fix: and feat: ci:, docs:, style:, refactor:.

**SemVer** -> fix type commits should be translated to PATCH releases. feat type commits should be translated to MINOR releases. Commits with BREAKING CHANGE in the commits, regardless of type, should be translated to MAJOR releases.

See more: [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#specification)
