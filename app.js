/** Express app for bookstore. */


const express = require("express");
const app = express();

app.use(express.json());

const bookRoutes = require("./routes/books");

app.use("/books", bookRoutes);

/** general error handler */

app.use(function (req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use(function(err, req, res, next) {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});


module.exports = app;
