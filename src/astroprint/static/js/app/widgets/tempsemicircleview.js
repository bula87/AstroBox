var TempSemiCircleView = Backbone.View.extend({
  className: 'semi-circle-temps',
  type: null,
  lastSent: null,
  lastSentTimestamp: null,
  target: 0,
  actual: 0,
  last_temp: null,
  temp_presets: [],
  tool : null,
  waitAfterSent: 2000, //During this time, ignore incoming target sets
  template: _.template( $("#semi-circle-template").html() ),
  enableOff: true,
  events: {
    'click button.temp-off': 'turnOff',
    'click button.temp-on': 'turnOn',
    'blur .other-preset' : "onBlurcustomTemp",
    'keydown .other-preset' : "onCustomTemp",
    'change select ' :  "onChangePreset"
  },
  initialize: function(params)
  {
    var tool = params.tool;
    this.enableOff = params.enableOff;
    this.temp_presets = params.temp_presets;
    var last_preset = this.temp_presets[0];


    if (params.last_temp){
      if(params.last_temp.id == "custom"){
        last_preset = params.last_temp
      } else {
        for (let temp_preset of this.temp_presets){
          if (temp_preset.id == params.last_temp.id){
            last_preset = params.last_temp
            break;
          }
        }
      }
    }

    this.last_preset = last_preset;

    if (tool != null) {
      this.type = 'tool';
      this.tool = tool
      this.$el.attr('id', this.type+this.tool);

    } else {
      this.type = 'bed';
      this.tool = 'bed';
      this.$el.attr('id', 'bed');
    }
    this.$el.attr('align', 'center');
  },
  render: function ()
  {
    console
    this.$el.html(this.template({
      temp_presets : this.temp_presets,
      last_preset : this.last_preset,
      tool : this.tool
    }));

    if (this.type == 'bed') {
      if (!(app.printerProfile.toJSON()).heated_bed) {
        this.$el.find('.temp-off').attr('disabled','disabled');
        this.$el.find('.temp-on').attr('disabled','disabled');
      }
    }

    this.enableTurnOff(this.enableOff);
    if (this.last_preset.id == "custom"){
      setTimeout( _.bind(function() {
          var select = $('.freq-selector-' + this.tool);
          select.prepend($('<option>', {
            value: "custom",
            text:  this.last_preset.value + "º"
          }));
          select.val(this.last_preset.id)
        }, this), 1);
    }
    return this;
  },
  updateValues: function (temps)
  {
    if (this.$(".progress-temp-circle").length && temps.current) {
      if (this.type == 'bed') {
        if ((app.printerProfile.toJSON()).heated_bed) {
          this.$(".progress-temp-circle").circleProgress('value', Math.round((temps.current / app.printerProfile.get('max_bed_temp')) * 100) / 100 );
        } else {
          this.$(".progress-temp-circle").circleProgress('value', null );
        }
      } else {
        this.$(".progress-temp-circle").circleProgress('value', Math.round((temps.current / app.printerProfile.get('max_nozzle_temp')) * 100) / 100 );
      }

      var now = new Date().getTime();

      if (this.lastSent !== null && this.lastSentTimestamp > (now - this.waitAfterSent) ) {
        target = this.lastSent;
      }

      if (isNaN(temps.current)) {
        temps.current = null;
      }

      if (isNaN(temps.target)) {
        temps.target = null;
      }

      this.target = temps.target;
      this.actual = temps.current;
      this.setTemps(temps.current, temps.target);
    }
  },
  onChangePreset : function (e){
    var elem = $(e.target);

    if (e.target.value == 'other') {
      elem.addClass('hide');
      this.$('.other-temp-' + this.tool).removeClass('hide').find('input').focus().select();
    } else {
      if ($(".freq-selector-" + this.tool +" option[value='custom']")){
        $(".freq-selector-" + this.tool +" option[value='custom']").remove();
      }
      this.last_preset = {'id' : e.target.value, 'tool' : this.tool}
      var temperatureToSet = this._getPresetTemperature(e.target.value)
      this._changeTemperature(temperatureToSet)
    }
  },
  onCustomTemp : function (e)
  {
    if (e.keyCode == 13){
      this.onBlurcustomTemp(e)
    }
  },
  onBlurcustomTemp: function(e)
  {
    var input = $(e.target);
    var select = $('.freq-selector-' + this.tool);
    if (input.val() && input.val()!= 0){
      var custom;
      _.each( this.temp_presets, function( temp_preset ){
        if (temp_preset.id == "custom"){
          custom = temp_preset;
          return
        }
      })
      if (custom){
        custom.value = input.val()
        //ToDo
      } else {
        custom = {tool: this.tool, id: "custom", value : input.val()}
      }

      this.last_preset = custom
      //TODO SAVE LAST TEMP

      if ($(".freq-selector-" + this.tool +" option[value='custom']")){
        $(".freq-selector-" + this.tool +" option[value='custom']").remove();
      }

      select.prepend($('<option>', {
        value: "custom",
        text: input.val() + "º"
      }));
    }

    select.val(this.last_preset.id)
    $('.other-temp-' + this.tool).addClass('hide');
    select.removeClass('hide')
    if (input.val() != 0){
      this._changeTemperature(input.val())
      input.val(0)
    }
  },
  turnOn : function()
  {
    var temperature = this.last_preset.id == "custom" ? this.last_preset.value : this._getPresetTemperature(this.last_preset.id)
    this._changeTemperature(temperature);
  },
  turnOff: function(e)
  {
    var turnOffButton = $(e.currentTarget);
    if (!turnOffButton.hasClass("animate-spin")) {
      turnOffButton.addClass("animate-spin");

      this._sendToolCommand('target', this.el.id, 0);

      var target = this.$el.find('.temp-target');
      target.find('span.target-value').html(0+'&deg;');

    }
  },
  _changeTemperature: function(value)
  {

    var maxValue = null;
    if(this.type == 'bed') {
      maxValue = app.printerProfile.get('max_bed_temp');
    } else {
      maxValue = app.printerProfile.get('max_nozzle_temp');
    }

    if (value < 0) {
      value = 0;
    } else if (value > maxValue) {
      value = maxValue;
    }

    if (value != this.lastSent && !isNaN(value) ) {
      var loadingBtn = this.$('.temp-on');
      loadingBtn.addClass('loading');
      this._sendToolCommand('target', this.el.id, value);
      this._saveLastTemp()
    }
  },
  setTemps: function(actual, target)
  {
    var now = new Date().getTime();

    if (this.lastSent !== null && this.lastSentTimestamp > (now - this.waitAfterSent) ) {
      target = this.lastSent;
    }

    if (isNaN(actual)) {
      actual = null;
    }

    if (isNaN(target)) {
      target = null;
    }

    this.target = target;
    this.actual = actual;

    this.renderTemps(actual, target);
  },
  renderTemps: function(actual, target)
  {
    if (actual !== null) {
      this.$el.find('.current').html(Math.round(actual)+'&deg;');
    }

    if (target !== null) {

      var turnOffButton = this.$el.find('.temp-off');
      if (turnOffButton.hasClass("animate-spin")) {
        turnOffButton.removeClass("animate-spin");
      }

      var loadingBtn = this.$('.temp-on');
      if(loadingBtn.hasClass('loading') ){
        loadingBtn.removeClass('loading');
      }

      this.$el.find('.target-value').html(Math.round(target)+'&deg;');

      if ( this.type == 'bed') {
        var bedTarget = target;
        if (!(app.printerProfile.toJSON()).heated_bed) {
          bedTarget = 0;
        }

        this.$el.find('.target-selector').css({
          transform:'rotate('+ (bedTarget *(198/app.printerProfile.get('max_bed_temp'))-9) +'deg)'});

      } else {
        this.$el.find('.target-selector').css({
          transform:'rotate('+ (target *(198/app.printerProfile.get('max_nozzle_temp'))-9) +'deg)'});
      }
    }
  },
  _sendToolCommand: function(command, type, temp, successCb, errorCb)
  {
    if (temp == this.lastSent) return;

    var data = {
      command: command
    };

    var endpoint;
    if (type == "bed") {
      if ("target" == command) {
        data["target"] = parseInt(temp);
      } else if ("offset" == command) {
        data["offset"] = parseInt(temp);
      } else {
        return;
      }

      endpoint = "bed";
    } else {
      var group;
      if ("target" == command) {
        group = "targets";
      } else if ("offset" == command) {
        group = "offsets";
      } else {
        return;
      }
      data[group] = {};
      data[group][type] = parseInt(temp);

      endpoint = "tool";
    }

    $.ajax({
      url: API_BASEURL + "printer/" + endpoint,
      type: "POST",
      dataType: "json",
      contentType: "application/json; charset=UTF-8",
      data: JSON.stringify(data),
      success: function() { if (successCb !== undefined) successCb(); },
      error: function() { if (errorCb !== undefined) errorCb(); }
    });

    this.lastSentTimestamp = new Date().getTime();
    this.lastSent = temp;
  },
  _getPresetTemperature: function (id)
  {
    for (let temp_preset of this.temp_presets){
      if (temp_preset.id == id){
        return this.tool == "bed"? temp_preset.bed_temp : temp_preset.nozzle_temp
      }
    }
    return null
  },
  _saveLastTemp: function()
  {
    console.log("_saveLastTemp")
    var profile = app.printerProfile.toJSON();
    var newTempSaved = true;
    for (var i in profile.last_presets_used) {
      if (profile.last_presets_used[i].tool == this.tool) {
        profile.last_presets_used[i] = this.last_preset;
        newTempSaved = false
        break;
      }
    }
    if (newTempSaved){
      profile.last_presets_used.push(this.last_preset)
    }
    attrs= {}
    attrs.last_presets_used = profile.last_presets_used
    console.log(attrs)
    app.printerProfile.save(attrs, {
      patch: true,
      success: _.bind(function() {
        console.log("succes saving last temp")
      }, this),
      error: function() {
        console.log("error savind last temp")
      }
    });


  },
  enableTurnOff: function(value)
  {
    if (value) {
      this.$el.find('.container-off').removeClass('hide');
    } else {
      this.$el.find('.container-off').addClass('hide');
    }
  }
});
