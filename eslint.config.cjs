module.exports = [
  {
    ignores: ["node_modules/**"]
  },
  {
    files: ["**/*.js"],
    languageOptions: { ecmaVersion: 2021, sourceType: 'module' },
    rules: {
      'no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_' }],
      'no-console': 'off',
      'eqeqeq': ['warn', 'smart']
    }
  }
];
