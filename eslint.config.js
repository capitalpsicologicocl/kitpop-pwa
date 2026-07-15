import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['api/**/*.js', 'e2e/**/*.js', 'playwright.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'react-refresh/only-export-components': [
        'error',
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: [
      'src/context/**/*.{js,jsx}',
      'src/icons/**/*.{js,jsx}',
      'src/components/activity/ActivityTabs.jsx',
      'src/components/profile/PlanUpgradeHint.jsx',
      'src/components/workshop/AiProgressPanel.jsx',
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
