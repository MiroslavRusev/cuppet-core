# Contributing to @cuppet/core

Thank you for your interest in contributing to @cuppet/core!

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/cuppet-core.git`
3. Install dependencies: `yarn install`
4. Create a feature branch: `git checkout -b feature/CUPC-{number}`

## Code Style

- Use ESLint for code linting
- Follow existing code style
- Add tests for new functionality
- Update documentation as needed

## Testing

Run tests before submitting:

```bash
yarn test
```

## Pull Request Process

### Commit Message Format

This project follows [Conventional Commits](https://www.conventionalcommits.org/) for semantic versioning. All commit messages must follow this format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

#### Examples

```
feat: add new accessibility testing step definitions
fix(api): resolve timeout issue in API response validation
docs: update README with new installation instructions
refactor(stepDefinitions): improve error handling in general steps
```

### PR Requirements

1. **Commit Messages**: Ensure all commits follow the conventional commit format
2. **Branch Naming**: Use `feature/CUPC-{number}` or `fix/CUPC-{number}` format
3. **Tests**: All new functionality must include tests
4. **Documentation**: Update relevant documentation files
5. **Code Review**: Address all review comments before merge

**Note**: The CHANGELOG.md and version updates are automatically handled by semantic-release based on your commit messages.

### Version Updates

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated versioning and changelog generation. The version bump and changelog updates are automatically determined based on your commit messages:

- **PATCH** (0.0.x): Bug fixes and minor improvements (`fix:` commits)
- **MINOR** (0.x.0): New features (backward compatible) (`feat:` commits)
- **MAJOR** (x.0.0): Breaking changes (`feat!:` or `fix!:` commits with `BREAKING CHANGE:` in body)

**Important**: You do not need to manually update the version or changelog. The semantic-release workflow will automatically:

- Analyze your commit messages
- Determine the appropriate version bump
- Update the CHANGELOG.md
- Create a GitHub release
- Publish to npm

The PR will be merged once you have the sign-off of maintainers and all requirements are met.
