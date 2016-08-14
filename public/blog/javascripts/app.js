/**
* SETUP
**/
var app = app || {};


/**
* MODELS
**/
app.Message = Backbone.Model.extend({
    url: function() {
         return 'http://localhost:3000/1/post' 
                    + ( this.id === null ? '' : '/' + this.id );
    },
    id: null,
    defaults: {
        success: false,
        errfor: {},
        posts: [],
        title: '',
        content: ''
    }
});

/**
* VIEWS
**/
app.FormView = Backbone.View.extend({
    el: '#form',
    events: {
        'click #save-post': 'save'
    },
    // constructor
    initialize: function() {
        this.model = new app.Message();        
    },
    save: function(e) {
        e.preventDefault();

        var title = this.$el.find('input[name="subject"]').val();
        var content = this.$el.find('textarea[name="content"]').val();
        
        this.model.save({
            title: title,
            content: content
        }, { 
            success: function(model, response, options) {
                app.contentView.model.fetch();
            }
        });
    }
});

$(document).ready(function(){
    app.formView = new app.FormView();
});
