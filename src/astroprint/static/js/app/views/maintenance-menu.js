var MaintenanceMenuView = Backbone.View.extend({
  el: '#maintenance-menu-view',
  maintenanceMenuListView: null,
  upload: null,
  initialize: function()
  {
    this.maintenanceMenuListView = new MaintenanceMenuListView();
    this.uploader = new MenuUploader({
      el: this.$('input.file-upload'),
      progressBar: this.$('.upload-progress'),
      buttonContainer: this.$('.upload-buttons'),
      installedCallback: _.bind(this.onMenuInstalled,this)
    });
  },
  onMenuInstalled: function()
  {
    noty({type: "success", text: "Menu Installed", timeout: 3000});
    this.maintenanceMenuListView.deepIndex = 0;
    this.maintenanceMenuListView.refreshMaintenanceMenuList();
  }
});

// Custom actions menu
var MaintenanceMenuListView = Backbone.View.extend({
  el: '#menu-list',
  maintenanceMenu_views: [],
  parentCollection: [],
  maintenanceMenuCollection: null,
  tasks: [],
  deepIndex: 0,
  events: {
    'click a.launch': 'onLaunchClicked',
    'click #back-button': 'onBackClicked',
  },
  onLaunchClicked: function(e)
  {
    e.preventDefault();

    var targetViewID  = $(e.target).closest('.menu-row').attr('id');
    var targetView = this.maintenanceMenu_views[targetViewID];
    if (targetView.maintenanceMenuElement.get('type') == "task") {
      app.router.navigate("#additional-tasks/"+targetView.maintenanceMenuElement.get('id'), {trigger: true});
    } else {
      this.parentCollection[this.deepIndex] = new MaintenanceMenuCollection(this.maintenanceMenuCollection.toJSON());
      ++this.deepIndex;

      var targetSubmenu = targetView.maintenanceMenuElement.get('menu');
      this.refreshMaintenanceMenuList(targetSubmenu);
    }
  },
  onBackClicked: function(e)
  {
    --this.deepIndex;
    // We recover the parent stored collection and we remove it once we use it.
    this.maintenanceMenuCollection = this.parentCollection[this.deepIndex];
    this.parentCollection.splice(this.deepIndex, 1);
    this.render();
  },

  initialize: function()
  {
    this.maintenanceMenuCollection = new MaintenanceMenuCollection();
    this.getTasks()
      .done(_.bind(function () {
        this.refreshMaintenanceMenuList();
      }, this))
      .fail(_.bind(function () {
        console.error('Unable to retrieve tasks');
        noty({text: "Unable to retrieve tasks", timeout: 3000});
      }, this));
  },

  getTasks: function()
  {
    return $.getJSON(API_BASEURL + 'additional-tasks', null, _.bind(function (data) {
      if (data.utilities && data.utilities.length) {
        this.tasks = data.utilities;
      }
    }, this))
      .fail(function () {
        noty({ text: "There was an error getting additional task.", timeout: 3000 });
      })
  },

  refreshMaintenanceMenuList: function(submenu)
  {
    this.maintenanceMenuCollection.reset();
    if (!submenu) {
      $.getJSON(this.maintenanceMenuCollection.url, null, _.bind(function(data) {

        var filteredMenu = _.filter(data, function(mm){
          if (mm.type != "utility") {return true}
          return false;
        });

        if (filteredMenu && filteredMenu.length) {
          if (filteredMenu[0].type) {
            for (var i = 0; i < filteredMenu.length; i++) {
              if (filteredMenu[i].type == "task") {
                this._taskFormatData(filteredMenu[i]);
              }
              this.maintenanceMenuCollection.add(new MaintenanceMenu(filteredMenu[i]))
            }
            $('#menu-error').hide();
            $('.error-message').hide();
          } else {
            $('.error-message').show();
            $('#menu-error').show();
          }
          $('#no-menu').hide();
          this.render();
        } else {
          $('.error-message').show();
          $('#menu-error').hide();
          $('#no-menu').show();
        }
      }, this))
      .fail(function(e) {
        console.error(e);
        noty({text: "There was an error getting maintenance menu.", timeout: 3000});
      })
    } else {
      for (var i = 0; i < submenu.length; i++) {
        if (submenu[i].type == "task") {
          this._taskFormatData(submenu[i]);
        }
        this.maintenanceMenuCollection.add(new MaintenanceMenu(submenu[i]))
      }
      this.render();
    }
  },
  _taskFormatData: function(task)
  {
    for (var i = 0; i < this.tasks.length; i++) {
      if (this.tasks[i].id == task.id) {
        task['icon_filename'] = this.tasks[i].icon_filename;
        task['name'] = [];
        task['name'].en = this.tasks[i].strings['en'].name;
        task['name'].es = this.tasks[i].strings['es'].name;
      }
    }
  },

  render: function()
  {
    var menuContainer = this.$('#menu-rows-container');
    menuContainer.empty();
    // Render each box
    this.maintenanceMenuCollection.each(function (maintenanceMenuElement) {
      var row = new MaintenanceMenuRowView({ maintenanceMenuElement: maintenanceMenuElement});
      menuContainer.append(row.render().el);
      this.maintenanceMenu_views[maintenanceMenuElement.cid] = row;
    }, this);

    if (this.deepIndex) {
      this.$('#back-button').show();
    } else {
      this.$('#back-button').hide();
    }
  }
});

var MaintenanceMenuRowView = Backbone.View.extend({
  className: 'menu-row',
  tagName: 'li',
  maintenanceMenuElement: null,
  parent: null,
  template: _.template($("#maintenance-menu-row-template").html()),
  initialize: function (params)
  {
    this.maintenanceMenuElement = params.maintenanceMenuElement;
    this.$el.attr('id', this.maintenanceMenuElement.cid);
  },
  render: function ()
  {
    var item = this.maintenanceMenuElement;
    var name = item.get('name');
    var type = item.get('type');
    var id = item.get('id');

    this.$el.html(this.template({
      id: id,
      type: type,
      icon: type == 'task' ? item.get('icon_filename') : id+'.png',
      name: name && name.en ? name.en : "Name missing for "+id
    }));

    if (item.get('menu')) {
      this.$el.addClass('menu');
    }

    return this;
  }
});

var MenuUploader = FileUploadBase.extend({
  progressBar: null,
  buttonContainer: null,
  installedCallback: null,
  initialize: function(options)
  {
    FileUploadBase.prototype.initialize.call(this, options);

    this.progressBar = options.progressBar;
    this.buttonContainer = options.buttonContainer;
    this.$el.attr('accept', '.zip');
    this.acceptFileTypes = /(\.|\/)(zip)$/i;
    this.uploadUrl = API_BASEURL + 'maintenance-menu';
    this.installedCallback = options.installedCallback;
  },
  started: function(data)
  {
    if (data.files && data.files.length > 0) {
      this.buttonContainer.hide();
      this.progressBar.show();
      FileUploadBase.prototype.started.call(this, data);
    }
  },
  failed: function(error)
  {
    var message = null;
    switch(error) {
      case 'invalid_file':
        message = 'The file is not a valid menu';
      break;

      case 'invalid_menu_file':
        message = 'The menu file has errors';
      break;

      case 'error_checking_file':
        message = 'There was an error checking the menu file';
      break;

      case 'incompatible_menu':
        message = 'The API version used by the menu is not compatible.';

      case 'already_installed':
        message = "The Menu is already installed. Please remove old version first.";
      break;
    }

    this.onError(message);
  },
  success: function(data)
  {
    if (data.result.tmp_file) {
      $.ajax({
        url: API_BASEURL + 'maintenance-menu/install',
        method: 'POST',
        type: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
          file: data.result.tmp_file
        })
      })
        .done(_.bind(function(){
          this.onPrintFileUploaded();
          this.installedCallback(data.result);
        }, this))
        .fail(_.bind(function(){
          this.onError('Unable to install menu');
        }, this))
    } else {
      this.onError('Unable to install menu');
    }
  },
  progress: function(progress, message)
  {
    var intPercent = Math.round(progress);

    this.progressBar.find('.meter').css('width', intPercent+'%');
    if (!message) {
      message = "Uploading ("+intPercent+"%)";
    }
    this.progressBar.find('.progress-message span').text(message);
  },
  onError: function(error)
  {
    noty({text: error ? error : 'There was an error uploading your file', timeout: 3000});
    this.resetUploadArea();
    console.error(error);
  },
  onPrintFileUploaded: function()
  {
    this.resetUploadArea();
  },
  resetUploadArea: function()
  {
    this.progressBar.hide();
    this.buttonContainer.show();
    this.progress(0);
  }
});
