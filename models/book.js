const db = require("../db");

/** Collection of related methods for books. */

class Book {
  /** given an id, return book data with that ID. */

  static async findOne(isbn) {
    const bookRes = await db.query(
        `SELECT isbn,
                amazon_url,
                author,
                language,
                pages,
                publisher,
                title,
                year
            FROM books 
            WHERE isbn = $1`, [isbn]);

    if (bookRes.rows.length === 0) {
      let notFoundError = new Error(`There is book with an isbn '${isbn}`);
      notFoundError.status = 404;
      throw notFoundError;
    }
    return bookRes.rows[0];
  }

  /** Return array of book data. */

  static async findAll() {
    const booksRes = await db.query(
        `SELECT isbn,
                amazon_url,
                author,
                language,
                pages,
                publisher,
                title,
                year
            FROM books 
            ORDER BY title`);

    return booksRes.rows;
  }

  /** create book in database from data, return book data. */

  static async create(data) {
    const result = await db.query(
      `INSERT INTO books (
            isbn,
            amazon_url,
            author,
            language,
            pages,
            publisher,
            title,
            year) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING isbn,
                   amazon_url,
                   author,
                   language,
                   pages,
                   publisher,
                   title,
                   year`,
      [
        data.isbn,
        data.amazon_url,
        data.author,
        data.language,
        data.pages,
        data.publisher,
        data.title,
        data.year
      ]
    );
    return result.rows[0];
  }

  /** Update data with matching ID to data, return updated book. */

  static async update(isbn, data) {
    const getBook = await Book.findOne(isbn)
    const result = await db.query(
      `UPDATE books SET 
            amazon_url=($1),
            author=($2),
            language=($3),
            pages=($4),
            publisher=($5),
            title=($6),
            year=($7)
            WHERE isbn=$8
        RETURNING isbn,
                   amazon_url,
                   author,
                   language,
                   pages,
                   publisher,
                   title,
                   year`,
      [
        data.amazon_url || getBook.amazon_url,
        data.author || getBook.author,
        data.language || getBook.language,
        data.pages || getBook.pages,
        data.publisher || getBook.publisher,
        data.title || getBook.title,
        data.year || getBook.year,
        isbn
      ]
    );
    if (result.rows.length === 0) {
      let notFoundError = new Error(`There is no book with an isbn '${isbn}`
      );
      notFoundError.status = 404;
      throw notFoundError;
    }

    return result.rows[0];
  }

  /** remove book with matching ID. Returns undefined. */

  static async remove(isbn) {
    const result = await db.query(
      `DELETE FROM books 
         WHERE isbn = $1 
         RETURNING isbn`,
        [isbn]);

    if (result.rows.length === 0) {
      let notFoundError = new Error(
        `There exists no book with an isbn of '${isbn}`
      );
      notFoundError.status = 404;
      throw notFoundError;
    }
  }
}


module.exports = Book;
