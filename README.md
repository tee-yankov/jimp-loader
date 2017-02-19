# Jimp Loader
*Currently for my own personal use*

*I will update this and make it user-friendly some day*

A loader for Webpack that performs various transforms to images, supported by [jimp](https://github.com/oliver-moran/jimp)
## Installation

```
npm install --save-dev jimp-loader
```

## Usage

```
image: require('../../image.jpg?type=blurred')
```

returns

```
{
  original: "<somehash>.jpg",
  placeholder: "<somehash>_blurred.jpg"
}
```

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
                    Version 2, December 2004

 Copyright (C) 2017 Theodore Yankov <tee.yankov@gmail.com>

 Everyone is permitted to copy and distribute verbatim or modified
 copies of this license document, and changing it is allowed as long
 as the name is changed.

            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

  0. You just DO WHAT THE FUCK YOU WANT TO.
