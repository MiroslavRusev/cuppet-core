## Development Workflow

### 1. Local Development Setup

```bash
# Clone the core package repo
git clone https://github.com/yourusername/cuppet-core.git
cd cuppet-core

# Install dependencies
npm install

# Link the package locally for testing
npm link

# In your main project, link to the local version
cd ../cuppet
npm link @cuppet/core
```

### 2. Making Changes

```bash
# In cuppet-core repository
# Make your changes to the core functionality

# Test in your main project
cd ../cuppet
npm test
```

### 3. Publishing Updates

```bash
# In cuppet-core repository
# Update version (patch, minor, or major)
npm version patch  # or minor, major

# Publish to npm
npm publish

# Push to git
git push --tags
```
