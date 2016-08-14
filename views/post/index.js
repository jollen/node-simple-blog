'use strict';

/*
 * Read single post.
 *
 * /post/:id
 */
exports.readOneById = function(req, res){
	req.app.db.models.Post.findOne({
		_id: req.params.id
	}, function(err, post) {
		console.log(post.html);
		res.render('post/single', {
			subject: post.subject,
			html: post.html
		})
	});
};
