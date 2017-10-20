const webpack = require('webpack');
const WebpackOnBuildPlugin = require('on-build-webpack');
const fs = require('fs');
const path = require('path');
const md5File = require('md5-file');

const BUNDLES_PATH = `${__dirname}/configs/bundles.json`;

const output = {
  path: `${__dirname}/dist`,
  filename: '[name].min.js',
  library: ['com', 'rodrigo_silveira', '[name]'],
  libraryTarget: 'var',
};

const config = {
  entry: `${__dirname}/src/mnist-app-dash.js`,
  output: output,
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel',
        query: {
          plugins: ['transform-es2015-spread'],
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      }
    }),
    new WebpackOnBuildPlugin(stats => {
      if (process.env.NODE_ENV !== 'production') {
        return;
      }

      setTimeout(() => {
        console.log("\nCaching bundles...");
        getFiles(`${__dirname}/dist`)
          .then((files) => {
            return files
              .filter(filename => filename.match(/\.min\.js$|\.js\.map$/))
              .reduce((acc, filename) => {
                // Make sure .map file is named the same as the .js file
                const key = `${md5File.sync(`${__dirname}/dist/${filename.replace(/\.map$/, '')}`)}-${filename}`;
                acc[filename] = key;
                return acc;
              }, {});
          })
          .then(bundles => {
            const json = JSON.stringify(bundles, null, 2);
            console.log('Bundles: ', json);

            fs.writeFile(BUNDLES_PATH, json, (err) => {
              if (err) {
                throw err;
              }

              console.log('Done and done!');
            });
          })
          .catch(err => {
            console.error(err);
            process.exit(1);
          });
      }, 0);
    }),
  ],
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  resolve: {
    extensions: ['', '.js'],
  },
};

function getFiles(dir) {
  return new Promise(resolve => {
    fs.readdir(dir, (err, files) => {
        if (err) {
          throw err;
        }

        if (!dir.match(/\/$/)) {
          dir = `${dir}/`;
        }

        const stat = fs.statSync;
        const sorted = files.sort((a, b) => stat(dir + a).mtime.getTime() - stat(dir + b).mtime.getTime());
        resolve(sorted);
      }
    );
  });
}

module.exports = config;
