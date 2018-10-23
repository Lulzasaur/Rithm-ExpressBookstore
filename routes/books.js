const express = require("express");
const router = new express.Router();
const Book = require("../models/book");
const { validate } = require('jsonschema');
const bookSchema = require(`../schema/bookSchema.json`)
const editBookSchema = require(`../schema/editBookSchema.json`)

router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    const book = await Book.findOne(req.params.id);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

router.post("/", async function (req, res, next) {
  try {
    const result = validate(req.body, bookSchema);

    if(!result.valid){
      return next(result.errors.map(error => error.stack));
    } else{
      const book = await Book.create(req.body);
      return res.status(201).json({ book });
    }
  } catch (err) {
    return next(err);
  }
});

router.patch("/:isbn", async function (req, res, next) {
  try {
    const result = validate(req.body, editBookSchema);

    if(!result.valid){
      return next(result.errors.map(error => error.stack));
    } else{   
      const book = await Book.update(req.params.isbn, req.body);
      return res.json({ book });
    }
  } catch (err) {
    return next(err);
  }
});

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
