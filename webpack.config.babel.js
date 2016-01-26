import webpack from 'webpack'

const config= {
  entry: './src/index.js',
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ['babel-loader'],
      },
    ],
  },
}

switch(process.env.npm_lifecycle_event){
  case 'build':
    config.output= {
      path: __dirname,
      filename: "bundle.js"
    }
    config.plugins= [
      new webpack.optimize.UglifyJsPlugin({compress:{warnings:false}})
    ]
    break

  default:
    config.devtool= '#source-map'
}

export default config