//create web server
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var port = 3000;
var mongoose = require('mongoose');
var db = mongoose.connection;
var Comment = require('./models/comment');
var router = express.Router();

//db connection
mongoose.connect('mongodb://localhost:27017/comment');
db.on('error', console.error);
db.once('open', function(){
  console.log('Connected to mongod server');
});

//define static file
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//define router
router.get('/comments', function(req, res){
  Comment.find(function(err, comments){
    if(err) return res.status(500).send({error: 'database failure'});
    res.json(comments);
  })
});

router.get('/comments/:comment_id', function(req, res){
  Comment.findOne({_id: req.params.comment_id}, function(err, comment){
    if(err) return res.status(500).json({error: err});
    if(!comment) return res.status(404).json({error: 'comment not found'});
    res.json(comment);
  })
});

router.post('/comments', function(req, res){
  var comment = new Comment();
  comment.name = req.body.name;
  comment.contents = req.body.contents;

  comment.save(function(err){
    if(err){
      console.error(err);
      res.json({result: 0});
      return;
    }
    res.json({result: 1});
  });
});

router.put('/comments/:comment_id', function(req, res){
  Comment.findById(req.params.comment_id, function(err, comment){
    if(err) return res.status(500).json({error: 'database failure'});
    if(!comment) return res.status(404).json({error: 'comment not found'});

    if(req.body.name) comment.name = req.body.name;
    if(req.body.contents) comment.contents = req.body.contents;

    comment.save(function(err){
      if(err) res.status(500).json({error: 'failed to update'});
      res.json({message: 'comment updated'});
    });
  });
});

router.delete('/comments/:comment_id', function(req, res){
  Comment.remove({_id: req.params.comment_id}, function(err, output){
    if(err) return res.status(500).json();
  });
});
