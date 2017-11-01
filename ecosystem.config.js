module.exports = {
  apps: [
    {
      name: 'mnist',
      script: './server/index.js',
      watch: false,
      env: {
        'PORT': 3003,
        'NODE_ENV': 'production'
      }
    }
  ]
};
