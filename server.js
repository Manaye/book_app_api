const express = require('express');
const app = express();
const path = require('path');
const superagent = require('superagent');

const pg = require('pg');
require('dotenv').config()
const CONSTRING = process.env.DATABASE_URL
console.log(CONSTRING);
const client = new pg.Client(CONSTRING)
client.connect();


const PORT = process.env.PORT||300

app.use(express.urlencoded({extended: true}));

app.set('view engine', 'ejs');
app.use(express.static('./public'));

app.post('/',addBook);

app.get('/', getBook);
app.get('/books/book/:book_id', getOneBook);
app.get('books/book/edit/:id', updateBook);
app.post('/searches',createSearch);

app.listen(PORT,function(){
  console.log(`server running at ${PORT}`);
});

function Book(info){
  this.title = info.title;
  this.author = info.author;
  this.isbn = info.isbn;
  this.image_url = info.image_url;
  this.description = info.description;
  this.bookshelf = info.bookshelf;
}
let sampleBooks1 = new Book({
  author: 'Charlene Tarbox',
  title: 'The Fiction of St. Stephen\'s',   
  isbn: '5656vhvvjh5765765',
  image_url: 'http://books.google.com/books/content?id=2ai6XVABXdkC&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api', 
  description: 'amazing book',
  bookshelf: '56567576ghghjg'
});
function addBook(req, res){
  req.send('hello');
  console.log(req.body);
  // let {title, author, isbn, image_url, description} = req.body;
  let {author, title, isbn, image_url, description, bookshelf} = sampleBooks1;

  let sql = 'INSERT INTO booksshelf(author, title, isbn, image_url, description, bookshelf) values ($1, $2, $3, $4, $5, $6);';
  let values = [author, title, isbn, image_url, description, bookshelf];
  return client.query(sql, values).then(res.redirect('/')).catch(err => handleError(err, res));

}
function getBook(req, res){
  let sql = 'SELECT * FROM booksshelf;';
  return client.query(sql).then(results =>{
    console.log(results);
    res.render('pages/index', {results: results.rows});
  }).catch((e) =>console.log(e.message));
}

function getOneBook(req, res){
  let sql = 'SELECT * FROM booksshelf WHERE id=$1;';
  let values = [req.params.book_id];

  return client.query(sql, values).then(result => res.render('pages/books/detail', {book: result.rows[0]})).catch(handleError);

  // return client.query(sql).then(results =>{
  //   console.log(results);
  //   res.render('pages/books/detail', {books: results.rows});
  // });
}
function updateBook(req, res){
  let sql = 'SELECT * FROM booksshelf WHERE id=$1;';
  let values = [req.params.book_id];

  return client.query(sql, values).then(result => res.render('pages/books/edit', {book: result.rows[0]})).catch(handleError);

  // return client.query(sql).then(results =>{
  //   console.log(results);
  //   res.render('pages/books/detail', {books: results.rows});
  // });
}
// add normaliztion here  to add sql 
 
function newSearch(req,res){
  // console.log(req.query );
  res.render('pages/index');
}
function createSearch(req,res){
  // console.log(req.body.search);
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  if (req.body.search[1]==='title'){url += `+intitle:${req.body.search[0]}`;}
  if (req.body.search[1]==='author'){url += `+inauthor:${req.body.search[0]}`;}


  superagent.get(url)
    .then(apiRes=>{
      console.log(apiRes.body.items);

      return apiRes.body.items.map(bookResult=>new Book(bookResult.volumeInfo));


    })
    .then(results=>{
      console.log(results);
        
      res.render('pages/searches/show',{items: results})

    }).catch(() => res.render('pages/error'));
}

function handleError(err, res){
  res.render('pages/error');
}
