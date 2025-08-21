module.exports = {
  ci: {
    collect: { staticDistDir: 'dist' },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'uses-optimized-images': 'warn',
        'uses-rel-preconnect': 'warn'
      }
    }
  }
};