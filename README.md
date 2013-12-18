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
    res.end("you request bars " + opts.barName)
})

router.addRoute("/foos/:fooName", function (req, res, opts, cb) {
    db.get(opts.fooName, function (err, value) {
        if (err) return cb(err)

        res.end(JSON.stringify(value))
    })
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
  },
  useDomains: true
})
```

## Cascading errors in a tree of routers

Since a `Router` just returns a `function (req, res) {}` you can 
  add routers to a router

Here we use a `ChildRouter` for the sub routes. The specifics of
  a child router is that they have different default error
  handlers and not found handlers. Their defaults will delegate
  up the error to the parent router so you can define all error
  handling globally

```js
var Router = require("routes-router")
var ChildRouter = require("routes-router/child")

var app = Router({
  errorHandler: function (req, res) {
    res.statusCode = 500
    res.end("no u")
  },
  notFound: function (req, res) {
    res.statusCode = 404
    res.end("oh noes")
  }
})

var users = ChildRouter({ prefix: "/user" })
var posts = ChildRouter({ prefix: "/post" })

app.addRoute("/user*?", users)
app.addRoute("/post*?", posts)

users.addRoute("/", function (req, res) {
  res.end("all users")
})
users.addRoute("/:id", function (req, res, opts) {
  res.end("user " + opts.id)
})

posts.addRoute("/", function (req, res) {
  res.end("all posts")
})
posts.addRoute("/:id", function (req, res, opts) {
  res.end("post " + opts.id)
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
