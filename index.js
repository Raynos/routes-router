var RoutesRouter = require("routes");
var url = require("url");
var methods = require("http-methods");
var sendError = require("send-data/error");
var extend = require("xtend");
var inherits = require("inherits");

module.exports = Router;

function NotFoundError(req) {
    Error.call(this, "resource not found " +
        JSON.stringify(req.url));
    this.url = req.url;
}

inherits(NotFoundError, Error);

NotFoundError.prototype.statusCode = 404;
NotFoundError.prototype.notFound = true;

function Router(opts) {
    opts = opts || {};

    var notFound = opts.notFound || defaultNotFound;
    var errorHandler = opts.errorHandler || defaultErrorHandler;
    var teardown = opts.teardown || rethrow;
    var useDomains = opts.useDomains;
    var domain;
    var router = new RoutesRouter();

    if (useDomains) {
        domain = require("domain");
    }

    handleRequest.addRoute = function addRoute(uri, fn) {
        if (typeof fn === "object") {
            fn = methods(fn);
        }

        router.addRoute(uri, fn);
    };
    handleRequest.routes = router.routes;
    handleRequest.routeMap = router.routeMap;
    handleRequest.match = function match(uri) {
        return router.match(uri);
    };
    handleRequest.notFound = notFound;
    handleRequest.handleError = errorHandler;
    return handleRequest;

    function handleRequest(req, res, opts, done) {
        if (typeof opts === "function") {
            done = opts;
            opts = null;
        }

        var self;
        if (done) {
            self = Object.create(handleRequest);
            self.notFound = function(req) {
                done(new NotFoundError(req));
            };
            self.handleError = function(req, res, err) {
                done(err);
            };
        } else {
            self = handleRequest;
        }

        if (useDomains) {
            var d = domain.create();
            d.add(req);
            d.add(res);
            d.on("error", function (err) {
                err.handlingError = null
                try {
                    self.handleError(req, res, err);
                } catch (error) {
                    err.handlingError = error
                    if (!res.finished) {
                        res.end()
                    }
                }
                d.exit();
                teardown(err);
            });
            try {
                d.run(runRoute);
            } catch (error) {
                d.exit()
                d.emit("error", error)
            }
        } else {
            runRoute();
        }

        function runRoute() {
            var route = router.match(url.parse(req.url).pathname);
            if (!route) {
                return self.notFound(req, res, {}, callback);
            }
            var params = extend(route.params, {
                params: route.params,
                splats: route.splats
            });
            route.fn(req, res, params, callback);
            function callback(err) {
                if (err) {
                    self.handleError(req, res, err, {}, done);
                }
            }
        }
    }
}

function defaultErrorHandler(req, res, err) {
    if (err.statusCode === 404) {
        if (err.notFound) {
            res.statusCode = 404;
            res.end("404 Not Found");
        } else {
            return this.notFound(req, res);
        }
    }

    sendError(req, res, {
        body: err,
        statusCode: err.statusCode || 500
    });
}

function defaultNotFound(req, res) {
    res.statusCode = 404;
    res.end("404 Not Found");
}

function rethrow(err) {
    process.nextTick(function () {
        throw err
    })
}
