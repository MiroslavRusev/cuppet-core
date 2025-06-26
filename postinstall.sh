#!/bin/bash

# Only run if we're in the root of the cuppet-core package (not as a dependency)
if [ -f "developmentGuide.md" ]; then
  mkdir -p jsonFiles
  mkdir -p reports
  mkdir -p screenshots
  echo "Created jsonFiles, reports, and screenshots folders."
fi