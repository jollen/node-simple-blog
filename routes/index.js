var express = require('express');
var cors = require('cors');
var showdown  = require('showdown');
var router = express.Router();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.set('X-Auth-Required', 'true');
  req.session.returnUrl = req.originalUrl;
  res.redirect('/login/');
}

/** 
 * Get all posts
 */
router.get('/1/post', cors());
router.get('/1/post', function(req, res, next) {
 	var workflow = req.app.utility.workflow(req, res);

	workflow.on('validate', function() {
		workflow.emit('read');
	});
	
	workflow.on('read', function() {
		req.app.db.models.Post.find({}, function(err, posts) {
			if (err) return res.send(err);

			res.send(posts);
		});
	});

	return workflow.emit('validate');
});

/**
 * Get one post by ID
 */
router.get('/1/post', cors());
router.get('/1/post/:id', function(req, res, next) {
 	var workflow = req.app.utility.workflow(req, res);

	workflow.on('validate', function() {
		workflow.emit('read');
	});

	workflow.on('read', function() {
		req.app.db.models.Post.find({
			_id: req.params.id
		}, function(err, posts) {
			if (err) return res.send(err);

			res.send(posts);
		});		
	});

	return workflow.emit('validate');
});

/**
 * Add a new post
 */
router.post('/1/post', ensureAuthenticated);
router.post('/1/post', cors());
router.post('/1/post', function(req, res, next) {
 	var workflow = req.app.utility.workflow(req, res);	
	var converter = new showdown.Converter();
	var title = '';
	var content = '';

	workflow.on('validate', function() {
		if (!req.body.title) return workflow.emit('exception', 'title is empty');

		if (!req.body.content) return workflow.emit('exception', 'content is empty');

        if (!req.user) return workflow.emit('exception', 'not login');

        if (!req.user.id) return workflow.emit('exception', 'missing user ID');

        if (!req.user.username) return workflow.emit('exception', 'missing username');

		title = req.body.title;
		content = req.body.content;

		workflow.emit('create');
	});

	workflow.on('create', function() {
		var doc = {
			subject: title,
			body: content,
			html: converter.makeHtml(content),
			userCreated: {
				id: req.user.id,
				name: req.user.username
			}
		};		

		new req.app.db.models.Post(doc).save(function(err) {
		    if (err) return res.send(err)

		    res.send(doc);
			return workflow.emit('notify');
		});		
	});

	workflow.on('notify', function() {
		var WebSocketClient = require('websocket').client;

		var client = new WebSocketClient();

		client.on('connectFailed', function(error) {
		    console.log('Connect Error: ' + error.toString());
		});

		client.on('connect', function(connection) {
		    console.log('WebSocket Client Connected');

		    connection.sendUTF(JSON.stringify({
		        command: 'UPDATE'
		    }));
		});

		client.connect('ws://localhost:8080/', 'echo-protocol');
	});

	return workflow.emit('validate');
});

/**
 * Update one post by ID
 */
router.put('/1/post/:id', ensureAuthenticated);
router.put('/1/post/:id', cors());
router.put('/1/post/:id', function(req, res, next) {
 	var workflow = req.app.utility.workflow(req, res);
	var converter = new showdown.Converter(); 	
 	var conditions = {};
 	var fieldsToSet = {};

	workflow.on('validate', function() {
		if (req.body.title) {
			fieldsToSet['subject'] = req.body.title;
		}

		if (req.body.content) {
			fieldsToSet['body'] = req.body.content;
			fieldsToSet['html'] = converter.makeHtml(req.body.content);
		}

		conditions = {
			_id: req.params.id
		};

		console.log(fieldsToSet);

		workflow.emit('update');
	});

	workflow.on('update', function() {
		req.app.db.models.Post.findOneAndUpdate(conditions, fieldsToSet, function(err, post) {
			if (err) res.send(err);
			res.send(post);
		});
	});		

	workflow.emit('validate');
});

/**
 * Delete one post by ID
 */
router.delete('/1/post/:id', ensureAuthenticated);
router.delete('/1/post/:id', cors());
router.delete('/1/post/:id', function(req, res, next) {
 	var workflow = req.app.utility.workflow(req, res);
 	var id;

	workflow.on('validate', function() {
		id = req.params.id;

		workflow.emit('delete');
	});

	workflow.on('delete', function() {
		req.app.db.models.Post.remove({_id: id}, function(err, nRemoved) {
			if (err) res.send(err);
			res.send({
				status: 'OK',
				nRemoved: nRemoved
			});
		});
	});

	return workflow.emit('validate');
});

/**
 * Like one post by ID
 */
router.put('/1/post/:id/like', ensureAuthenticated);
router.put('/1/post/:id/like', cors());
router.put('/1/post/:id/like', function(req, res, next) {
 	var workflow = req.app.utility.workflow(req, res);
 	var conditions = {};
 	var fieldsToSet = {};

	workflow.on('validate', function() {
		var id = req.params.id;

        if (!id) return workflow.emit('exception', 'missing ID');

		conditions = {
			_id: id
		};

        if (!req.user) return workflow.emit('exception', 'not login');

        if (!req.user.id) return workflow.emit('exception', 'missing user ID');

		fieldsToSet = {
			$push: { likes: req.user.id }
		};		

		workflow.emit('update');
	});

	workflow.on('update', function() {
		req.app.db.models.Post.findOneAndUpdate(conditions, fieldsToSet, function(err, post) {
			if (err) res.send(err);
			res.send(post);
		});
	});

	return workflow.emit('validate');
});

module.exports = router;
