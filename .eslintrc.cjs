module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react", "react-hooks", "import", "jsx-a11y", "unicorn", "promise", "sonarjs"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:jsx-a11y/recommended",
    "plugin:unicorn/recommended",
    "plugin:promise/recommended",
    "plugin:sonarjs/recommended-legacy",
    "prettier"
  ],
  settings: { 
    react: { version: "detect" },
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"]
      }
    }
  },
  env: { browser: true, es2022: true, node: true },
  rules: {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "import/order": "off",
    "unicorn/prevent-abbreviations": "off",
    "unicorn/filename-case": ["error", { "cases": { "pascalCase": true, "kebabCase": true, "camelCase": true } }],
    "unicorn/no-null": "off",
    "unicorn/numeric-separators-style": "off",
    "unicorn/prefer-query-selector": "off",
    "unicorn/no-negated-condition": "off",
    "unicorn/prefer-at": "off",
    "unicorn/prefer-node-protocol": "off",
    "unicorn/prefer-module": "off",
    "jsx-a11y/click-events-have-key-events": "off",
    "jsx-a11y/no-static-element-interactions": "off",
    "promise/no-multiple-resolved": "error",
    "sonarjs/cognitive-complexity": ["warn", 15],
    "import/no-unresolved": "off",
    "import/namespace": "off",
    "import/default": "off",
    "import/no-named-as-default": "off",
    "import/no-named-as-default-member": "off"
  },
  overrides: [
    { "files": ["**/*.tsx"], "rules": { "react/prop-types": "off" } }
  ]
};