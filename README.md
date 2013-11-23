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

## Error handling with a router

You can use a router to do central error handling

```js
var Router = require("routes-router")
var sendError = require("send-data/error")
var uuid = require("uuid")

var router = Router({
  errorHandler: function (req, res, err) {
    err.id = uuid()

    // log it somewhere
    logError(req, res, err)

    // if req is json
    if (isJson(req)) {
      sendError(req, res, err)
    } else {
      // render HTML 500 page
      renderErrorPage(req, res, err)
    }
  },
  teardown: function (req, res, err) {
    // an unexcepted exception occured
    // process is in corrupted state
    // you have to shut it down
    // see node domains docs
  },
  notFound: function (req, res) {
    // render a custom 404 page
    renderNotfoundPage(req, res)
  }
})
```

## Installation

`npm install routes-router`

## Contributors

 - Raynos

## MIT Licenced

  [1]: https://secure.travis-ci.org/Raynos/routes-router.png
  [2]: http://travis-ci.org/Raynos/routes-router
  [3]: https://david-dm.org/Raynos/routes-router/status.png
  [4]: https://david-dm.org/Raynos/routes-router
  [5]: https://ci.testling.com/Raynos/routes-router.png
  [6]: https://ci.testling.com/Raynos/routes-router
