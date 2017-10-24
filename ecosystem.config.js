module.exports = {
  apps: [
    {
      name: 'mnist',
      script: './index.js',
      watch: false,
      env: {
        'PORT': 3000,
        'NODE_ENV': 'production'
      }
    }
  ]
};
