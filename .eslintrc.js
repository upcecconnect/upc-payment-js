module.exports = {
  "root": true,
  "env": {
    "browser": true,
    "node": true,
  },
  "extends": [
      "eslint:all",
      "plugin:@typescript-eslint/all",
      "plugin:import/errors",
      "plugin:import/typescript",
      "plugin:import/warnings",
      "plugin:promise/recommended"
  ],
  "ignorePatterns": [
      "node_modules",
      "cdn-lib",
      "npm-lib",
      ".vscode",
  ],
  "parserOptions": {
      "parser": "@typescript-eslint/parser",
      "tsconfigRootDir": ".",
      "project": "tsconfig.json",
      "sourceType": "module"
  },
  "plugins": [
      "@typescript-eslint"
  ],
  rules: {
      "@typescript-eslint/object-curly-spacing": [
          "error",
          "always"
      ],
      "@typescript-eslint/quotes": [
          "error",
          "single"
      ],
      "sort-imports": [
          "error",
          {
              "ignoreCase": true,
              "ignoreMemberSort": true,
              "memberSyntaxSortOrder": [
                  "none",
                  "all",
                  "single",
                  "multiple"
              ]
          }
      ],
      "import/no-unresolved": "off",
      "no-console": "warn",
      "semi-style": "off",
      "semi": "off",
      "max-len": "off",
      "indent": "off",
      "arrow-body-style": "off",
      "no-ternary": "off",
      "@typescript-eslint/comma-dangle": [
          "error",
          {
              "enums": "always",
              "generics": "never",
              "tuples": "always-multiline",
              "arrays": "always-multiline",
              "objects": "always-multiline",
              "imports": "always-multiline",
              "exports": "always",
              "functions": "always-multiline"
          }
      ],
      "@typescript-eslint/naming-convention": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/space-infix-ops": "off",
      "no-undefined": "warn",
      "@typescript-eslint/no-magic-numbers": "off",
      "function-call-argument-newline": "off",
      "class-methods-use-this": "warn",
      "sort-keys": "off",
      "comma-dangle": [
          "error",
          {
              "arrays": "always-multiline",
              "objects": "always-multiline",
              "functions": "always-multiline"
          }
      ],
      "@typescript-eslint/no-type-alias": "off",
      "import/no-duplicates": "off",
      "@typescript-eslint/prefer-reduce-type-parameter": "warn",
      "capitalized-comments": "off",
      "multiline-comment-style": "off",
      "@typescript-eslint/space-before-function-paren": [
          "error",
          {
              "anonymous": "always",
              "named": "never",
              "asyncArrow": "always"
          }
      ],
      "space-before-function-paren": [
          "error",
          {
              "anonymous": "always",
              "named": "never",
              "asyncArrow": "always"
          }
      ],
      "@typescript-eslint/strict-boolean-expressions": "warn",
      "@typescript-eslint/prefer-readonly-parameter-types": "off",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "max-statements": "off",
      "dot-notation": "warn",
      "@typescript-eslint/promise-function-async": "warn",
      "newline-per-chained-call": "off",
      "promise/always-return": "off",
      "prefer-destructuring": "off",
      "no-undef": "off",
      "no-warning-comments": "off",
      "quote-props": "off",
      "one-var": "off",
      "multiline-ternary": "off",
      "padded-blocks": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/prefer-ts-expect-error": "off",
      "lines-around-comment": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/prefer-includes": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/ban-tslint-comment": "off",
      "@typescript-eslint/consistent-indexed-object-style": "off",
      "max-lines-per-function": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/indent": [
          "error",
          2
      ],
      "object-curly-newline": "off",
      "max-lines": "off",
      "dot-location": "off",
      "@typescript-eslint/lines-between-class-members": "off",
      "object-property-newline": [
          "error",
          {
              "allowAllPropertiesOnSameLine": true
          }
      ],
      "array-element-newline": ["error", {
          "ArrayExpression": "consistent",
          "ArrayPattern": { "minItems": 3 }
      }],
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/no-extra-parens": "off",
      "@typescript-eslint/no-misused-promises": "warn",
      "require-unicode-regexp": "off",
      "@typescript-eslint/no-unsafe-return": "warn",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "no-underscore-dangle": "warn",
      "@typescript-eslint/sort-type-union-intersection-members": "off",
      "no-undef-init": "off",
      "no-negated-condition": "off",
      "id-length": "off",
      "complexity": "off",
      "@typescript-eslint/sort-type-constituents": "off",
      "no-plusplus": "off",
      "no-continue": "off",
      "no-param-reassign": "warn",
      "@typescript-eslint/keyword-spacing": "off",
      "no-alert": "warn",
      "no-control-regex": "warn",
      "no-duplicate-imports": "off",
      "max-classes-per-file": "off",
      "no-bitwise": "off",
      "sort-vars": "off",
      "@typescript-eslint/restrict-template-expressions": "warn",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "comma-dangle": "off",
      "class-methods-use-this": "off",
  }
}
