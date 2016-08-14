var express = require('express');
var cors = require('cors');
var router = express.Router();

var posts = {};

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.set('X-Auth-Required', 'true');
  req.session.returnUrl = req.originalUrl;
  res.redirect('/login/');
}

/** 取得所有文章 */
router.get('/1/post', ensureAuthenticated);
router.get('/1/post', cors());
router.get('/1/post', function(req, res, next) {
	req.app.db.models.Post.find({}, function(err, posts) {
		if (err) return res.send(err);

		res.send(posts);
	});
});

router.get('/1/post/:id', function(req, res, next) {
	req.app.db.models.Post.find({
		_id: req.params.id
	}, function(err, posts) {
		if (err) return res.send(err);

		res.send(posts);
	});
});

/**
 *
 */
router.post('/1/post', ensureAuthenticated);
router.post('/1/post', cors());
router.post('/1/post', function(req, res, next) {
	var title = req.body.title; 
	var content = req.body.content;

	var doc = {
		subject: req.body.title,
		body: req.body.content,
		userCreated: {
			id: req.user.id,
			name: req.user.username
		}
	};

	new req.app.db.models.Post(doc).save(function(err) {
	    if (err) return res.send(err)
	    return res.send(doc);
	});
});

router.put('/1/post/:id', function(req, res, next) {
	var id = req.params.id;
});

router.delete('/1/post/:id', function(req, res, next) {
	var id = req.params.id;

	delete posts[id];

	res.send({
		status: 'OK'
	});
});

module.exports = router;
