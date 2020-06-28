var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var { Sequelize, Model, DataTypes } = require('sequelize');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var boardRouter = require('./routes/board');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* sequelize */
const sequelize = new Sequelize({
  host: "localhost",
  port: 3307,
  database: 'node',
  username: 'root',
  password: '000000',
  dialect: 'mysql',
  pool: { max: 10 }
});

class SeqBoard extends Model {}
SeqBoard.init({
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT()
  },
  writer: {
    type: DataTypes.STRING(50)
  },
  rnum: {
    type: DataTypes.INTEGER(11),
    defaultValue: 0,
  }
}, {
  sequelize,
  modelName: 'SeqBoard',
  timestamps: true,
  charset: 'utf8',
  tableName: 'seq-boards'
});
SeqBoard.sync({force: false});  
// true옵션을 주면 기존 테이블을 삭제하고 재생성하므로 절대 실서버에서는 사용하면 안된다.

app.get("/create", async (req, res, next) => {
  try {
    const result = await SeqBoard.create({
      title: "아버지를 아버지라...3",
      writer: '홍길동',
      content: '아버지를 아버지라...형을 형이라...3',
      rnum: 0
    });
    res.json(result);
  }
  catch(e) {
    next(e);
  }
});

app.get(["/list", "/list/:page"], async (req, res, next) => {
  let page = req.params.page || 1;
  try {
    // SELECT id, title, writer FROM seq-boards WHERE id=3 ORDER BY title ASC, id DESC LIMIT 1, 2;
    let result = await SeqBoard.findAll({
      attributes: ['id', 'title', 'writer'],
      order: [["id", "asc"], ["title", "asc"]],
      // where: {"id": 3},
      offset: 1,
      limit: 2 
    });
    res.json(result); 
  }
  catch(e) {
    next(e);
  }
});





sequelize
.authenticate()
.then(() => {
  console.log("mysql에 접속되었습니다.");
})
.catch((e) => {
  throw new Error(e);
});


/* router */
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/board', boardRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
