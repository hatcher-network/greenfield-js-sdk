module.exports = {
  root: true,
  extends: ['plugin:@typescript-eslint/recommended'],
  rules: {
    'no-console': 'off', //2,
    'react/react-in-jsx-scope': ['off'],
  },
  plugins: ['prettier', '@typescript-eslint'],
};
