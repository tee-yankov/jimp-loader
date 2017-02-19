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

function _generateOutput (callback, originalPath, placeholderPath) {
  callback(null, 'module.exports = {\
    placeholder: __webpack_public_path__ + ' + JSON.stringify(placeholderPath) + ',\
    original: __webpack_public_path__ + ' + JSON.stringify(originalPath) + '\
  };')
}

var presets = {
  blurred: {
    blur: [20],
    quality: [60]
  }
}

module.exports = function (content) {
  this.cacheable && this.cacheable(true)
  var env = process.env.NODE_ENV

  var emitFile = this.emitFile

  var callback = this.async()

  var generateOutput = _generateOutput.bind(this, callback)

  if (!callback) throw new Error('jimp loader unable to get callback for async')
  if (!emitFile) throw new Error('emitFile is required from the module system')

  var configKey = 'jimpLoader'

  var defaults = {
    blur: 0,
    quality: 100,
    baseName: '[hash]',
    type: '',
    transforms: {}
  }

  var query = loaderUtils.parseQuery(this.resourceQuery)

  var options = loaderUtils.getLoaderConfig(this, configKey) || {}

  var config = Object.assign({}, defaults, options, query)

  var transforms = config.transforms

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
      transforms = presets.blurred
      break
  }

  if (!Object.keys(transforms).length) {
    emitFile(outputPath, content)
    callback(null, 'module.exports = ' + publicPath + ';')
    return
  }

  var suffix = config.type ? '_' + config.type : ''
  var placeholderPath = getOutputUrl(config.baseName + suffix)
  var originalPath = getOutputUrl(config.baseName)

  if (config.devMode) {
    emitFile(originalPath, content)
    emitFile(placeholderPath, content)
    generateOutput(originalPath, placeholderPath)
    return
  }

  jimp.read(content, function (err, image) {
    console.log('Processing ', getOutputUrl('[name]'))

    if (err) return callback(err)
    var jimpContext = this

    Object.keys(transforms)
      .forEach(function (transform) {
        console.log('Applying ', transform, ':', transforms[transform])
        image[transform].apply(jimpContext, transforms[transform])
      })

    image.getBuffer(jimp.AUTO, function (err, buffer) {
      if (err) return callback(err)

      emitFile(placeholderPath, buffer)
      emitFile(originalPath, content)

      generateOutput(originalPath, placeholderPath)
    })
  })
}

// Pass in the content as a Buffer, rather than a UTF-8 string
module.exports.raw = true
