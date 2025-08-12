## Development Workflow

### 1. Local Development Setup

```bash
# Clone the core package repo
git clone https://github.com/yourusername/cuppet-core.git
cd cuppet-core

# Install dependencies
yarn install

# Link the package locally for testing
yarn link

# In your main project, link to the local version
cd ../cuppet
yarn link @cuppet/core
```

### 2. Making Changes

```bash
# In cuppet-core repository
# Make your changes to the core functionality

# Test in your main project
cd ../cuppet
yarn test
```

### 3. Publishing Updates

Follow the [README.MD](./README.MD)
