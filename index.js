var jimp = require('jimp')
var fs = require('fs')
var loaderUtils = require('loader-utils')

function getPath (config, content, name) {
  return loaderUtils.interpolateName(this, name + '.[ext]', {
    context: config.context || this.options.context,
    content: content,
    regExp: config.regExp
  })
}

module.exports = function (content) {
  this.cacheable && this.cacheable(true)

  var emitFile = this.emitFile

  var callback = this.async()

  if (!callback) throw new Error('gm loader unable to get callback for async')
  if (!emitFile) throw new Error('emitFile is required from the module system')

  var configKey = 'gmLoader'

  var defaults = {
    blur: 0,
    quality: 100,
    baseName: '[hash]',
    type: '',
  }

  var query = loaderUtils.parseQuery(this.resourceQuery)

  var options = loaderUtils.getLoaderConfig(this, configKey) || {}

  var config = Object.assign({}, defaults, options, query)

  var getOutputUrl = getPath.bind(this, config, content)

  var suffix = config.type ? '_' + config.type : ''

  var url = getOutputUrl(config.baseName + suffix + '.[ext]', config, content)

  var outputPath = url

  var publicPath = '__webpack_public_path__ + ' + JSON.stringify(url)

  if (config.outputPath) {
    outputPath = typeof config.outputPath === 'function'
      ? config.outputPath(url)
      : config.outputPath + url
  }

  if (config.publicPath) {
    publicPath = JSON.stringify(
      typeof config.publicPath === 'function'
      ? config.publicPath(url)
      : config.publicPath + url
    )
  }

  switch (config.type) {
    case 'blurred':
      jimp.read(content, function (err, image) {
        if (err) return callback(err)
        image
          .blur(parseInt(config.blur, 10))
          .quality(parseInt(config.quality, 10))
          .getBuffer(jimp.AUTO, function (err, buffer) {
            if (err) return callback(err)

            var suffix = config.type ? '_' + config.type : ''
            var placeholderPath = getOutputUrl(config.baseName + suffix)
            var originalPath = getOutputUrl(config.baseName)

            emitFile(placeholderPath, buffer)
            emitFile(originalPath, content)

            callback(null, 'module.exports = {\
              placeholder: __webpack_public_path__ + ' + JSON.stringify(placeholderPath) + ',\
              original: __webpack_public_path__ + ' + JSON.stringify(originalPath) + '\
            };')
          })
      })
      break
    default:
      emitFile(outputPath, content)
      callback(null, 'module.exports = ' + publicPath + ';')
  }
}

// Pass in the content as a Buffer, rather than a UTF-8 string
module.exports.raw = true
