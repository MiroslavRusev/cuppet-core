const fs = require('fs');

const isRoot = process.cwd() === process.env.INIT_CWD;
if (isRoot) {
  fs.mkdirSync('jsonFiles', { recursive: true });
  fs.mkdirSync('reports', { recursive: true });
  fs.mkdirSync('screenshots', { recursive: true });
  console.log('Created jsonFiles, reports, and screenshots folders.');
}