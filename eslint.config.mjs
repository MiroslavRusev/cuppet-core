import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import html from '@html-eslint/eslint-plugin';
import htmlParser from '@html-eslint/parser';

export default defineConfig([
    globalIgnores(['**yarn.lock', '**/node_modules/', '.git/', '**/backStopData/', '**/reports/']),
    {
        files: ['**/*.js'],
        plugins: {
            js,
        },
        extends: ['js/recommended'],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.commonjs,
            },

            ecmaVersion: 'latest',
            sourceType: 'module',
        },
        rules: {
            'no-unused-vars': 'warn',
            'no-console': 'off',
        },
    },
    // HTML files configuration
    {
        files: ['**/*.html'],
        plugins: {
            '@html-eslint': html,
        },
        languageOptions: {
            parser: htmlParser,
        },
        rules: {
            '@html-eslint/require-doctype': 'error',
            '@html-eslint/no-duplicate-id': 'error',
            '@html-eslint/no-inline-styles': 'off',
            '@html-eslint/require-lang': 'error',
            '@html-eslint/require-meta-charset': 'error',
            '@html-eslint/require-meta-viewport': 'warn',
            '@html-eslint/no-target-blank': 'error',
            '@html-eslint/require-title': 'error',
        },
    },
]);
