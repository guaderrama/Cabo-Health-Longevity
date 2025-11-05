import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import jsdoc from 'eslint-plugin-jsdoc'

export default [
  {
    ignores: [
      'dist/**/*',
      'node_modules/**/*',
      '.vite/**/*',
      '*.config.js',
      '*.config.ts',
      '**/coverage/**/*',
      '**/.DS_Store',
      '**/Thumbs.db'
    ]
  },
  
  // Base JavaScript/TypeScript rules
  js.configs.recommended,
  
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.es2020
      },
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@typescript-eslint': tseslint,
      'jsdoc': jsdoc
    },
    
    rules: {
      // React specific rules
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true
        }
      ],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      
      // Import/Export rules
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      
      // Medical application specific rules
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      
      // Performance rules
      'react/jsx-no-bind': 'error',
      'react/jsx-no-constructed-context-values': 'error',
      
      // Security rules for medical data
      'no-constant-condition': 'error',
      'no-async-promise-executor': 'error',
      'no-promise-executor-return': 'error'
    }
  },
  
  // Medical components specific rules
  {
    files: ['src/components/**/*.{ts,tsx}', 'src/pages/**/*.{ts,tsx}'],
    rules: {
      // Ensure proper prop types
      'react/prop-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      
      // Component naming conventions
      'react/jsx-pascal-case': 'error',
      
      // Medical data handling
      'no-var': 'error',
      'prefer-const': 'error',
      
      // Accessibility
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error'
    }
  },
  
  // API and utility rules
  {
    files: ['src/lib/**/*.{ts,tsx}', 'src/utils/**/*.{ts,tsx}', 'src/hooks/**/*.{ts,tsx}'],
    rules: {
      // Library files should export functions
      'import/prefer-default-export': 'off',
      
      // Utility functions
      'no-magic-numbers': [
        'warn',
        {
          ignore: [0, 1, -1, 100, 1000],
          ignoreDefaultValues: true
        }
      ],
      
      // Document exported functions
      'jsdoc/require-jsdoc': [
        'warn',
        {
          publicOnly: true,
          requireReturn: false,
          requireReturnType: false,
          contexts: [
            'FunctionDeclaration',
            'MethodDefinition'
          ]
        }
      ],
      'jsdoc/require-description': 'warn',
      'jsdoc/require-param': 'warn',
      'jsdoc/require-returns': 'warn',
      'jsdoc/require-throws': 'warn'
    }
  },
  
  // Context and provider rules
  {
    files: ['src/contexts/**/*.{ts,tsx}'],
    rules: {
      // Contexts should use specific naming
      'react/jsx-pascal-case': 'error',
      
      // Context providers should be properly typed
      '@typescript-eslint/explicit-function-return-type': 'off',
      
      // Document context providers
      'jsdoc/require-jsdoc': [
        'warn',
        {
          contexts: [
            'FunctionDeclaration',
            'MethodDefinition'
          ]
        }
      ]
    }
  },
  
  // Edge Functions rules (Deno)
  {
    files: ['supabase/functions/**/*.{ts,js}'],
    rules: {
      // Allow Deno globals
      'no-undef': 'off',
      
      // Edge Functions specific
      'no-console': 'off', // Console.log is useful for debugging
      '@typescript-eslint/no-explicit-any': 'off', // Deno types are complex
      
      // Security for Edge Functions
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      
      // Error handling
      'consistent-return': 'error',
      
      // CORS handling
      'require-await': 'error'
    }
  },
  
  // Test files rules
  {
    files: ['**/__tests__/**/*.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
    rules: {
      // Test files can have more relaxed rules
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react/jsx-no-bind': 'off',
      
      // But should still follow some standards
      'prefer-const': 'error',
      'no-var': 'error',
      
      // Test specific
      'prefer-arrow-callback': 'error',
      'prefer-template': 'error'
    }
  },
  
  // Configuration files rules
  {
    files: ['*.{js,ts}', '.*.{js,ts}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-var-requires': 'off'
    }
  }
]