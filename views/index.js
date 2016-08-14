'use strict';

exports.init = function(req, res){
	req.app.db.models.Post.find({}, function(err, posts) {
		if (err) return res.send(err);

		res.render('index', {
			posts: posts
		});
	});
};
