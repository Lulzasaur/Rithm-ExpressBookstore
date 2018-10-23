process.env.NODE_ENV = "test"

const db = require("../db");
const request = require("supertest");
const app = require("../app");

beforeAll(async () => {
    await db.query(`CREATE TABLE books ( isbn TEXT PRIMARY KEY,
        amazon_url TEXT,
        author TEXT,
        language TEXT, 
        pages INTEGER,
        publisher TEXT,
        title TEXT, 
        year INTEGER)`)
  });
  
beforeEach(async () => {
  // seed with some data
  await db.query(`INSERT INTO books (
      isbn,
      amazon_url,
      author,
      language,
      pages,
      publisher,
      title,
      year) 
    VALUES ('0691161518','http://a.co/eobPtX2','Matthew Lane','english','264','Princeton University Press','Power-Up: Unlocking the Hidden','2017') 
    RETURNING isbn,
              amazon_url,
              author,
              language,
              pages,
              publisher,
              title,
              year`);
  });
  
afterEach(async () => {
  await db.query("DELETE FROM books");
});

afterAll(async () => {
  await db.query("DROP TABLE books");
  db.end();
});

describe("GET /", () => {
    test("It should respond with an array of books", async () => {
      const response = await request(app).get("/books");
      expect(response.body).toEqual({
        "books": [
            {
                "isbn": "0691161518",
                "amazon_url": "http://a.co/eobPtX2",
                "author": "Matthew Lane",
                "language": "english",
                "pages": 264,
                "publisher": "Princeton University Press",
                "title": "Power-Up: Unlocking the Hidden",
                "year": 2017
            }
        ]
    });
      expect(response.statusCode).toBe(200);
    });
  });

  describe("GET /0691161518", () => {
    test("It should respond with a book", async () => {
      const response = await request(app).get("/books/0691161518");
      expect(response.body).toEqual({
        "book": 
            {
                "isbn": "0691161518",
                "amazon_url": "http://a.co/eobPtX2",
                "author": "Matthew Lane",
                "language": "english",
                "pages": 264,
                "publisher": "Princeton University Press",
                "title": "Power-Up: Unlocking the Hidden",
                "year": 2017
            }
    });
      expect(response.statusCode).toBe(200);
    });
  });

  describe("POST /", () => {
    test("It should respond with the new book added", async () => {
      const response = await request(app).post("/books").send(
            {
                "isbn": "0699998",
                "amazon_url":"http://a.co/eifPX2",
                "author": "test",
                "language": "english",
                "pages": 999999,
                "publisher": "test",
                "title": "test",
                "year": 20000
            }
      );
      expect(response.body).toEqual({
        "book": 
            {
                "isbn": "0699998",
                "amazon_url": "http://a.co/eifPX2",
                "author": "test",
                "language": "english",
                "pages": 999999,
                "publisher": "test",
                "title": "test",
                "year": 20000
            }
    });
      expect(response.statusCode).toBe(201);
    });

    test("It should respond with an error for schema validation", async () => {
      const response = await request(app).post("/books").send(
            {
                "isbn": "0699998",
                "amazon_url":"http://a.co/eifPX2",
                "author": "test",
                "language": "english",
                "pages": "wrong",
                "publisher": "test",
                "title": "test",
                "year": 20000
            }
      );
      expect(response.body).toEqual({"error": ["instance.pages is not of a type(s) integer"]}
      );
      expect(response.statusCode).toBe(500);
    });

  });

  describe("PATCH /", () => {
    test("It should edit a book", async () => {
      const response = await request(app).patch("/books/0691161518").send(
            {
              "isbn": "0691161518",
              "amazon_url": "http://a.co/eobPtX2",
              "author": "JOEL DID THIS",
              "language": "english",
              "pages": 264,
              "publisher": "Princeton University Press",
              "title": "Power-Up: Unlocking the Hidden",
              "year": 2017
            }
      );
      expect(response.body).toEqual({
        "book": 
            {
              "isbn": "0691161518",
              "amazon_url": "http://a.co/eobPtX2",
              "author": "JOEL DID THIS",
              "language": "english",
              "pages": 264,
              "publisher": "Princeton University Press",
              "title": "Power-Up: Unlocking the Hidden",
              "year": 2017
            }
    });
      expect(response.statusCode).toBe(200);
    });

    test("It should respond with an error for schema validation", async () => {
      const response = await request(app).patch("/books/0691161518").send(
            {
              "isbn": "0691161518",
              "amazon_url": "http://a.co/eobPtX2",
              "author": "JOEL DID THIS",
              "language": 42342,
              "pages": 264,
              "publisher": "Princeton University Press",
              "title": "Power-Up: Unlocking the Hidden",
              "year": 2017
            }
      );
      expect(response.body).toEqual({"error": ["instance.language is not of a type(s) string"]}
      );
      expect(response.statusCode).toBe(500);
    });
  });

  describe("DELETE /", () => {
    test("It should delete a book", async () => {
      const response = await request(app).delete("/books/0691161518");
      expect(response.body).toEqual({"message":"Book deleted"})
      expect(response.statusCode).toBe(200);
    });

    test("It should return invalid for unidentified book", async () => {
      const response = await request(app).delete("/books/06sdfsdaf518");
      expect(response.body).toEqual({"error": {"status": 404}, "message": "There exists no book with an isbn of '06sdfsdaf518"})
      expect(response.statusCode).toBe(404);
    });
  });