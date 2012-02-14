(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  jQuery(function($) {
    
    window.NewsItem = Backbone.Model.extend({});
    
    window.NewsCollection = Backbone.Collection.extend({
        model: NewsItem,
        
        public_api_key : 'PApo3XC5UqnmVuH71JoFZx1aELsTHXbnHVWPAJgldDU',
        url_base : 'http://api.topics.io/topics/news/v1/?page=1&auth_api_key=',
        
        url: function() {
            return this.url_base + this.public_api_key
        },
                
        parse: function(response) {
            return response.response.news;
        },
            
        selectModel: function(selectedModel) {
          this.each(function(aModel) {
            return aModel.set({
              selected: false
            });
          });
          selectedModel.set({
            selected: true
          });
          this.selectedModel = selectedModel;
          return this.trigger('select', selectedModel);
        }
    });
    
    window.news = new NewsCollection();
    
    window.NewsItemView = Backbone.View.extend({
         template: "#news-item-template",
         tagName: 'li',
         className: 'news-item-cell',
         events: {
           'click': 'select'
         },
         
         initialize: function() {
             _.bindAll(this, 'render');
             this.model.bind('change', this.render);
             this.initializeTemplate();
         },

         initializeTemplate: function() {
             this.template = _.template($(this.template).html());
         },

         render: function() {
             $(this.el).html(this.template(this.model.toJSON()));
             return this;
         },
         
         select: function() {
           return this.model.collection.selectModel(this.model);
         },
         setSelected: function(isSelected) {
           return ($(this.el)).toggleClass('selected', isSelected);
         }
     });
     
     window.NewsDetailView = Backbone.View.extend({
       className: 'news-detail',
       
       initialize: function() {
         _.bindAll(this, 'render');
         this.youtube_template = _.template(($('#youtube-template')).html()); 
         return this.template = _.template(($('#news-detail-template')).html());
       },
       
       render: function() {
         var renderedContent,
             youtube_videoid,
             image;
         renderedContent = this.template(this.model.toJSON());
         ($(this.el)).html(renderedContent);
         
         youtube_videoid = _.filter(this.model.attributes.properties, 
                                    function(prop){ return prop.name == "youtube:video_id"});
         if (youtube_videoid.length > 0) {
             this.$('img').remove();
             youtube_videoid = youtube_videoid[0].value;
              renderedContent = this.youtube_template({'youtube_videoid': youtube_videoid});
              this.$('.embedded').html(renderedContent);
         }
         else {
             image  = this.model.attributes.images[0];
             if (image != undefined) {
                 this.$('img').attr('src', image.href)
                              .attr('height', Math.min(image.height || 250, 250));
             }
             else {
                 this.$('img').remove();
             }
         }
         return this;
       }
     });
     
     window.NewsCollectionView = Backbone.View.extend({
       initialize: function() {
         _.bindAll(this, 'render', 'selectViewForModel');
         this.collection.bind('reset', this.render);
         this.collection.bind('select', this.selectViewForModel);
         this.subviews = [];
         return this.subviews;
       },
       render: function() {
         var $newsItems,
             subviews,
             collection = this.collection;
         
         $newsItems = $('ul#news-items');
         subviews =  this.subviews;
         this.collection.each(function(newsItem) {
           var newsItemView = new NewsItemView({
             model: newsItem,
             collection: collection
           });
           subviews.push(newsItemView);
           $newsItems.append(newsItemView.render().el);
         });
         if (this.collection.models.length) {
           this.collection.selectModel(this.collection.at(0));
         }
         return this;
       },
       
       selectViewForModel: function(selectedModel) {
         var modelView, newsDetailView;
         ($('ul#news-items li')).removeClass('selected');
         modelView = _.detect(this.subviews, function(item) {
           return item.model === selectedModel;
         });
         modelView.setSelected(true);
         newsDetailView = new NewsDetailView({
           model: selectedModel
         });
         return ($('#detail-content')).html(newsDetailView.render().el);
       }
     });
     
     AppRouter = Backbone.Router.extend({
       initialize: function() {
         this.newsCollectionView = new NewsCollectionView({
           collection: news
         });
         return this.route('', 'index', function() {
           return ($('#list')).append(this.newsCollectionView.render().el);
         });
       }
     });
     
     window.App = App = (function() {
       function App() {
         new AppRouter;
         Backbone.history.start({
           pushState: true
         });
         news.fetch();
       }
       return App;
     })();
   }); 
}).call(this);