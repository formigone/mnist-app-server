module.exports = {
  apps: [
    {
      name: 'mnist',
      script: './index.js',
      watch: true,
      env: {
        'PORT': 3000,
        'NODE_ENV': 'production'
      }
    }
  ]
};
