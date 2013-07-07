# routes-router

[![dependency status][3]][4]

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

router.addRoute("/bars/:barName", function (req, res, opts) {
    res.end("you request bars " + opts.params.barName)
})

router.addRoute("/baz/:things", {
    GET: function (req, res) {
        res.end("I will give you your thing")
    },
    POST: function (req, res) {
        res.end("got your things")
    }
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
