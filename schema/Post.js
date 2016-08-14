'use strict';

exports = module.exports = function(app, mongoose) {
  var postSchema = new mongoose.Schema({
    subject: { type: String, default: '' },
    body: { type: String, default: '' },
    html: { type: String, default: '' },    
    tags: [String],
    userCreated: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: '' },
      time: { type: Date, default: Date.now }
    }
  });
  app.db.model('Post', postSchema);
};
