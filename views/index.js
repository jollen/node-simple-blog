'use strict';

exports.init = function(req, res){
 	var workflow = req.app.utility.workflow(req, res);
 	var data = {}

 	workflow.on('read', function() {
		req.app.db.models.Post.find({}, function(err, posts) {
			if (err) return res.send(err);

			data['posts'] = posts;
			workflow.emit('render');
		});
 	});

 	workflow.on('render', function() {
		res.render('index', {
			posts: data.posts
		}); 		
 	});

 	workflow.emit('read');
};
