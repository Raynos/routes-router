# routes-router

[![dependency status][3]][4]
<!-- [![build status][1]][2]  -->

<!-- [![browser support][5]][6] -->

Simplest router possible

## Example

```js
var Router = require("routes-router")
var http = require("http")

var router = Router()

http.createServer(router)

router.addRoute("/foo", function (req, res) {
    res.end("hello!")
})

router.addRoute("/bars/:barName", function (req, res, params) {
    res.end("you request bars " + params.barName)
})
```

## Installation

`npm install routes-router`

## Contributors

 - Raynos

## MIT Licenced

  [1]: https://secure.travis-ci.org/Colingo/routes-router.png
  [2]: http://travis-ci.org/Colingo/routes-router
  [3]: https://david-dm.org/Colingo/routes-router/status.png
  [4]: https://david-dm.org/Colingo/routes-router
  [5]: https://ci.testling.com/Colingo/routes-router.png
  [6]: https://ci.testling.com/Colingo/routes-router
