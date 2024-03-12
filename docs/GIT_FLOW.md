## Branching
### Gitflow:

1. The branch `develop` is created from `main`
2. The branch `release` is created from `develop`
3. `Feature` branches are created from `develop`
4. When a feature is complete it is merged into the `develop` branch
5. When the `release` branch is done it is merged into `develop` *and* `main`
6. If an urgent issue in `main` is detected a `hotfix` branch is created from `main`
7. Once the `hotfix` is complete it is merged to both `develop` and `main`

*[For reference](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)*

## Versioning
#### For MAIN/ RELEASE branches

Given a version number `MAJOR.MINOR.PATCH`, increment the:

- MAJOR version when you make incompatible (BREAKING) API changes
- MINOR version when you add functionality in a backward compatible manner
- PATCH version when you make backward compatible bug fixes

*Additional labels for pre-release and build metadata are available as extensions to the MAJOR.MINOR.PATCH format.*

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

## Issues Templates:

### Bug report

```
## General Summary

## Expected Behavior

## Current Behavior

## Possible Solution
<!--- Suggest a fix/reason for the bug (optional) -->

## Steps to Reproduce
<!--- Provide a link to a live example if possible -->
1.
2.
3.
4.

## Context (Environment)

## Detailed Description

## Possible Implementation
```

### Feature request

```
## Suggested Change
<!--- What kind of change does this PR introduce? -->

## Is This Breaking?
<!--- Does this PR introduce a breaking change? -->

## Current Behavior

## New Behavior

## Detailed Description

```

### Vulnerability report

```
# Vulnerability Report

I identified potential security vulnerabilities in [Component].

## Summary
<!--- Short summary: E.g. An unsafe deserialization vulnerability allows any unauthenticated user to execute arbitrary code on the server. -->

## Component

## Impact

## Remediation
<!--- Propose a remediation suggestion if you have one. Make it clear that this is just a suggestion, as the maintainer might have a better idea to fix the issue. -->

## Steps to Reproduce
<!--- Provide a link to a live example if possible -->
1.
2.
3.
4.

## Detailed Description
<!--- Give all details on the vulnerability; especially the code -->

```

## PR Template
```
<!--- Please check if the PR fulfills these requirements -->
- [ ] The commit message follows guidelines
- [ ] Tests for the changes have been added
- [ ] Documentation has been added/ updated

## General Summary

## Description
<!--- Describe changes in detail -->

## Related Issue
<!--- Please link to the issue here: -->

## Motivation and Context

## How Has This Been Tested?
<!--- Please describe in detail how you tested your changes. -->
<!--- Include details of your testing environment, and the tests you ran to -->

## Screenshots (if appropriate):
```

For reference: *[Using templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository)*

