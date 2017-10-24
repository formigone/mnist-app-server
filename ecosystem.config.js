module.exports = {
  apps: [
    {
      name: 'mnist',
      script: './index.js',
      watch: false,
      env: {
        'PORT': 669,
        'NODE_ENV': 'production'
      }
    }
  ]
};
