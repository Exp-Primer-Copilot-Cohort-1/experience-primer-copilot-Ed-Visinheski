// Create web server
var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Comment = require('../models/comment');
var middleware = require('../middleware/index');

// New Comment
router.get('/new', middleware.isLoggedIn, function(req, res) {
    res.render('comments/new', {campgroundId: req.params.id});
});

// Create Comment
router.post('/', middleware.isLoggedIn, function(req, res) {
    var campgroundId = req.body.campgroundId;
    var comment = req.body.comment;
    Comment.create(comment, function(err, comment) {
        if (err) {
            console.log(err);
        } else {
            // Add username and id to comment
            comment.author.id = req.user._id;
            comment.author.username = req.user.username;
            // Save comment
            comment.save();
            // Add comment to campground
            User.findById(req.user._id, function(err, user) {
                if (err) {
                    console.log(err);
                } else {
                    user.comments.push(comment);
                    user.save();
                }
            });
            res.redirect('/campgrounds/' + campgroundId);
        }
    });
});

// Edit Comment
router.get('/:comment_id/edit', middleware.checkCommentOwnership, function(req, res) {
    Comment.findById(req.params.comment_id, function(err, comment) {
        if (err) {
            console.log(err);
        } else {
            res.render('comments/edit', {campgroundId: req.params.id, comment: comment});
        }
    });
});

// Update Comment
router.put('/:comment_id', middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, comment) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});

// Delete Comment
router.delete('/:comment_id', middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err, comment) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});

module.exports = router;