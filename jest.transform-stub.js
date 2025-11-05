// Transform stub for CSS imports in Jest tests
module.exports = {
  process() {
    return 'module.exports = {};';
  },
  getCacheKey() {
    return 'css-stub';
  },
};
