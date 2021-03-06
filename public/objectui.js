// the magic label is used to detect when a brand new annotation has been made.
// fake_blank is used when a user tries to save "" as a label to not be confused
// with magic_label
var magic_label = "";
var fake_blank = " "; 
var magic_label_id = null;

function TrackObjectUI(startbutton, container, videoframe, job, player, tracks, endbutton)
{
    var me = this;

    this.button = startbutton;
    this.endbutton = endbutton;
    this.container = container;
    this.videoframe = videoframe;
    this.job = job;
    this.player = player;
    this.tracks = tracks;
    this.startframe = job.start;
    this.endframe = job.stop;
    this.startenabled = true;
    this.endenabled = true;

    this.drawer = new BoxDrawer(videoframe);

    this.counter = 0;

    this.currentobject = null;
    this.currentcolor = null;

    this.objects = [];

    // for drawing lines (both getOffset() and connect())
    // from http://stackoverflow.com/questions/8672369/how-to-draw-a-line-between-two-divs
    this.getOffset = function( el ) {
      var rect = el.getBoundingClientRect();
      return {
          left: rect.left + window.pageXOffset,
          top: rect.top + window.pageYOffset,
          width: rect.width || el.offsetWidth,
          height: rect.height || el.offsetHeight
      };
    }

    this.connect = function(start_track, end_track, color, thickness) { // draw a line connecting elements
        var off1 = this.getOffset(start_track.handle[0]);
        var off2 = this.getOffset(end_track.handle[0]);
        // distance
        var length = (off2.left - off1.left)-4;
        // make hr
        // add in identification information for when this needs to be deleted
        var htmlLine = "<div class='crossbar', style='padding:0px; margin:0px; height:" + thickness + "px; background-color:" + color + "; position:absolute; left:2px; top:2px; width:" + length + "px; z-index:0;' />";
        //
        // alert(htmlLine);
        // document.body.innerHTML += htmlLine;
        start_track.handle.append(htmlLine)
    }

    this.update_button_ui = function(can_reset = false)
    {
      // check currentobject, and adjust button status accordingly
      // start
      if(this.tracks.all_annos.active_anno() != null && this.tracks.all_annos.active_anno().has_start == true){
        this.button.button("option", "disabled", true);
        this.startenabled = false;
      } else  {
        this.button.button("option", "disabled", false);
        this.startenabled = true;
      }

      // end
      if(this.tracks.all_annos.active_anno() != null && this.tracks.all_annos.active_anno().has_end == true){
        this.endbutton.button("option", "disabled", true);
        this.endenabled = false;
      } else {
        this.endbutton.button("option", "disabled", false);
        this.endenabled = true;
      }

      // if the label is still the magic string, do not re-enable the buttons.

      if( this.tracks.all_annos.active_anno() != null &&
          this.tracks.all_annos.active_anno().has_start == true &&
          this.tracks.all_annos.active_anno().has_end == true &&
          this.job.labels[this.tracks.all_annos.active_anno().id] == magic_label &&
          can_reset == false){
            return;
      }

      // if both ends exist, reset start and stop frames
      if(this.tracks.all_annos.active_anno() != null && this.tracks.all_annos.active_anno().has_start == true && this.tracks.all_annos.active_anno().has_end == true){
        this.startframe = job.start;
        this.endframe = job.stop;
        this.button.button("option", "disabled", false);
        this.startenabled = true;
        this.endbutton.button("option", "disabled", false);
        this.endenabled = true;
      }

      // if there is no current_annotation, reset everything
      // this is needed when someone deletes all of the annotations.
      if (this.tracks.all_annos.active_anno() == null ){
        this.startframe = job.start;
        this.endframe = job.stop;
        this.button.button("option", "disabled", false);
        this.startenabled = true;
        this.endbutton.button("option", "disabled", false);
        this.endenabled = true;
      }
    }

    this.startnewobject = function(start)
    {
        if (start == 1 && this.startenabled == false || (start == 2 && this.endenabled == false) )
        {
            return false;
        }
      	if ( start == 1 && player.frame >= this.endframe )
      	{
      	    alert('Start frame must be before the end frame');
      	    return false;
      	}

      	else if ( start == 2 && player.frame <= this.startframe )
      	{
      	    alert('End frame must be after the start frame');
      	    return false;
      	}

        // check other annos in all_annotations and error if there are overlaps
        if ( this.tracks.all_annos.within_other_anno(player.frame) ) {
          if ( start == 1 ) {
            alert('The start frame must not be inside of another fingerspelled word that has already been annotated.');
            return false;
          } else if ( start == 2 ) {
            alert('The end frame must not be inside of another fingerspelled word that has already been annotated.');
            return false;
          }
        }

        // if this is a start annotation and there is already an end annotation made or
        // if this is an end annotation and there is already a start annotation made
        // check if this annotation encompases another, if it does warn.
        if ( start == 1 && this.endenabled == false || (start == 2 && this.startenabled == false)  ) {
          if ( start == 1 ) {
            var new_start = player.frame;
            var new_end = this.tracks.all_annos.active_anno().end_frame;
          } else if ( start == 2 ){
            var new_start = this.tracks.all_annos.active_anno().start_frame;
            var new_end = player.frame;

          }
          if ( this.tracks.all_annos.contains_other_anno(start_time = new_start, end_time = new_end) ) {
            alert('The annotation cannot include another annotation. Please only mark annotations that are not overlapping.');
            return false;
          }
        }

        tracks.drawingnew(true);
        console.log("Starting new track object");

        eventlog("newobject", "Start drawing new object");

        this.instructions.fadeOut();

        // If the annotation_obj has both a start and a stop, start a new annotation
        if (this.tracks.all_annos.active_anno() != null && this.tracks.all_annos.active_anno().has_start == true &&  this.tracks.all_annos.active_anno().has_end == true) {
          this.tracks.all_annos.annotation_active = null;
        }

        if(this.tracks.all_annos.active_anno() == null) {
          // If there is no annotation_obj, pick a new color
          this.currentcolor = this.pickcolor();
          this.drawer.color = this.currentcolor[0];
        } else {
          this.currentcolor = this.tracks.all_annos.active_anno().color;
          this.drawer.color = this.currentcolor[0];
        }

        if ( start == 1 )
        {
          kind = "start"
        }
        else if ( start == 2 )
        {
          kind = "end"
        }

        // adds annotation info to the side bar.
        this.currentobject = new TrackObject(this.job, this.player,
                                             this.container,
                                             this.currentcolor, this, kind);
        this.currentobject.statedraw();

        this.tracks.resizable(false);
        this.tracks.draggable(false);

        return true;
    }

    this.stopdrawing = function(position, start)
    {
      if (start == 1 && this.startenabled == false || (start == 2 && this.endenabled == false) )
      {
          return;
    	}
    	if ( start == 1 && player.frame >= this.endframe )
    	{
    	    return;
    	}
    	else if ( start == 2 && player.frame <= this.startframe )
    	{
    	    return;
    	}

      console.log("Received new track object drawing");

      if ( start == 1 )
      {
        kind = "start"
      }
      else if ( start == 2 )
      {
        kind = "end"
      }

      var track = tracks.add(player.frame, position, this.currentcolor[0], kind);

      this.currentobject.onready.push(function() {
         // me.stopnewobject();
      });

      this.currentobject.initialize(this.counter, track, this.tracks);
      this.stopnewobject();
      this.currentobject.stateclassify(start);

      if ( start == 1 )
    	{
        this.startframe = player.frame;
    	}
    	else if ( start == 2 )
    	{
        this.endframe = player.frame;
    	}

      // check if the current annotation has both a start and a stop, if so write the bar to connect the handles
      if (this.tracks.all_annos.active_anno() != null && this.tracks.all_annos.active_anno().has_start == true && this.tracks.all_annos.active_anno().has_end == true) {
        // find the start and end track to the current track.
        var curr_lbl = track.label;
        var curr_tracks = tracks.tracks.filter(function(trck){
          return trck.label == curr_lbl;
        });
        var start_track = curr_tracks.filter(function(trck){
          return trck.kind == "start" && trck.deleted == false;
        });
        var end_track = curr_tracks.filter(function(trck){
          return trck.kind == "end" && trck.deleted == false;
        });
        // if length<1 or >1 error

        this.connect(start_track[0], end_track[0], this.tracks.all_annos.active_anno().color[0], 4)
      }

      this.update_button_ui();

    }

    this.stopnewobject = function()
    {
        console.log("Finished new track object");
        tracks.drawingnew(false);

        this.objects.push(this.currentobject);

        this.tracks.draggable(false);
        if ($("#annotateoptionsresize:checked").size() == 0)
        {
            this.tracks.resizable(false);
        }
        else
        {
            this.tracks.resizable(false);
        }

        this.tracks.dim(false);
        this.currentobject.track.highlight(false);

        //this.button.button("option", "disabled", false);

        this.counter++;
    }

    this.injectnewobject = function(label, path, attributes)
    {
        console.log("Injecting existing object");

        this.instructions.fadeOut();

        // this kind information doesn't appear to be strictly necesary
        if ( start == 1 )
        {
          kind = "start";
        }
        else if ( start == 2 )
        {
          kind = "end";
        }
        else
        {
          kind = null;
        }

        // need to add in current annotation methods?
        this.currentcolor = this.pickcolor();
        var obj = new TrackObject(this.job, this.player,
                                  container, this.currentcolor, this, kind);

        function convert(box)
        {
            return new Position(box[0], box[1], box[2], box[3],
                                box[6], box[5]);
        }

        var track = tracks.add(path[0][4], convert(path[0]),
                               this.currentcolor[0], kind);
        for (var i = 1; i < path.length; i++)
        {
            track.journal.mark(path[i][4], convert(path[i]));
        }

        obj.initialize(this.counter, track, this.tracks);
      	var start = 2, framenum = 0;
      	for (var i = 0; i < attributes.length; i++)
      	{
      	    if ( this.job.attributes[label][attributes[i][0]] == "Start" && attributes[i][2] == true )
      	    {
      		framenum = attributes[i][1];
      		start = 1;
      		this.button.button("option", "disabled", true);
      		this.startframe = framenum;
      		this.startenabled = false;
      	    }
      	    else if ( this.job.attributes[label][attributes[i][0]] == "End" && attributes[i][2] == true )
      	    {
      		framenum = attributes[i][1];
      		start = 2;
      		this.endbutton.button("option", "disabled", true);
      		this.endframe = framenum;
      		this.endenabled = false;
      	    }
      	}

        obj.finalize(label, start, framenum);

      	for (var i = 0; i < attributes.length; i++)
      	{
      	    track.attributejournals[attributes[i][0]].mark(attributes[i][1], attributes[i][2]);
      	    console.log("Injecting attribute " + attributes[i][0] + " at frame " + attributes[i][1] + " to " + attributes[i][2]);
      	}

        obj.statefolddown();
        obj.updatecheckboxes();
        obj.updateboxtext();
        this.counter++;

        return obj;
    }

    this.setup = function()
    {
      this.button.button({
        icons: {
            primary: "ui-icon-plusthick",
        },
        disabled: false
      }).click(function() {
        // start = 1
        var good_anno = me.startnewobject(1);
        if ( good_anno ) {
          // calculates the positoin of the handles
    	    xtl = (me.player.frame*$("#playerslider").width())/(me.player.job.stop);
    	    me.stopdrawing(new Position(xtl, me.player.handle.height()+2, xtl+1, me.player.handle.height()+12), 1);
          // move the trackobject handle at this point?
        }
  	  });

    	this.endbutton.button({
    	    icons: {
    		       primary: "ui-icon-plusthick",
    		   },
    	    disabled: false
    	}).click(function() {
          // end = 2
    	    var good_anno = me.startnewobject(2);
          if ( good_anno ) {
            xtl = (me.player.frame*$("#playerslider").width())/(me.player.job.stop);
      	    me.stopdrawing(new Position(xtl, me.player.handle.height()+2, xtl+1, me.player.handle.height()+12), 2);
          }
    	});

    	this.drawer.onstopdraw.push(function(position) {
    	    //    me.stopdrawing(position);
    	});

      var html = "<p>Please watch the video attentively.</p>"
      html += "<p> Whenever you see fingerspelling, mark the start and end time frames of the fingerspelling and enter the letters spelled.</p>"
      html +="<p> The segment you mark should include some buffer on either side to ensure that the entire fingerspelling portion is selected.  This does not have to be precise as long as all of the fingerspelling is included, and ideally none of the non-fingerspelled signs around it. </p>";

      this.instructions = $(html).appendTo(this.container);
    }

    this.disable = function()
    {
        for (var i in this.objects)
        {
            this.objects[i].disable();
        }
    }

    this.enable = function()
    {
        for (var i in this.objects)
        {
            this.objects[i].enable();
        }
    }

    this.setup();

    this.availcolors = [["#FF00FF", "#FFBFFF", "#FFA6FF"],
                        ["#FF0000", "#FFBFBF", "#FFA6A6"],
                        ["#FF8000", "#FFDCBF", "#FFCEA6"],
                        ["#FFD100", "#FFEEA2", "#FFEA8A"],
                        ["#008000", "#8FBF8F", "#7CBF7C"],
                        ["#0080FF", "#BFDFFF", "#A6D2FF"],
                        ["#0000FF", "#BFBFFF", "#A6A6FF"],
                        ["#000080", "#8F8FBF", "#7C7CBF"],
                        ["#800080", "#BF8FBF", "#BF7CBF"]];

    this.pickcolor = function()
    {
        return this.availcolors[this.availcolors.push(this.availcolors.shift()) - 1];
    }
}






function TrackObject(job, player, container, color, objectui, kind)
{
    var me = this;

    this.job = job;
    this.player = player;
    this.container = container;
    this.color = color;
    this.attrid = null;
    this.objectui = objectui;
    this.kind = kind;

    this.id = null;
    this.track = null;
    this.tracks = null;
    this.label = null;

    this.onready = [];
    this.onfolddown = [];
    this.onfoldup = [];

    this.handle = $("<div class='trackobject'><div>");
    this.handle.prependTo(container);
    this.handle.css({
        'background-color': color[2],
        'border-color': color[2]});
    this.handle.mouseover(function() {
        me.mouseover();
    });
    this.handle.mouseout(function() {
        me.mouseout();
    });

    this.header = null;
    this.headerdetails = null;
    this.details = null;
    this.drawinst = null;
    this.classifyinst = null;
    this.opencloseicon = null;

    this.ready = false;
    this.foldedup = false;

    this.tooltip = null;
    this.tooltiptimer = null;

    this.initialize = function(id, track, tracks)
    {
        this.id = id;
        this.track = track;
        this.tracks = tracks;

        this.track.onmouseover.push(function() {
            me.mouseover();
        });

        this.track.onmouseout.push(function() {
            me.mouseout();
            me.hidetooltip();
        });

        this.track.onstartupdate.push(function() {
            me.hidetooltip();
        });

        this.player.onupdate.push(function() {
            me.hidetooltip();
        });

        this.track.oninteract.push(function() {
            var pos = me.handle.position().top + me.container.scrollTop() - 30;
            pos = pos - me.handle.height();
            me.container.stop().animate({scrollTop: pos}, 750);

            me.toggletooltip();
        });

        this.track.onupdate.push(function() {
            me.hidetooltip();
            eventlog("interact", "Interact with box " + me.id);
        });

        this.track.notifyupdate();
        eventlog("newobject", "Finished drawing new object");
    }

    this.remove = function()
    {
      // add information back to annotation_obj
      if(this.tracks.all_annos.active_anno() != null && this.tracks.all_annos.active_anno().id != this.label) {
        // check if there is no annotation_obj already
        this.tracks.all_annos.annotation_active = this.track.label;
        // need to update to be *all* information from the annotation that was deleted.

        // this.tracks.annotation_obj.color = this.color;
        // this.tracks.annotation_obj.has_start = true;
        // this.tracks.annotation_obj.has_end = true;
      }
      if(this.tracks.all_annos.active_anno() != null && this.kind == "start"){
        this.tracks.all_annos.active_anno().has_start = null;
        this.tracks.all_annos.active_anno().start_frame = null;
        this.objectui.startframe = me.job.start;
        this.objectui.endframe = this.tracks.all_annos.active_anno().end_frame;
      }
      if(this.tracks.all_annos.active_anno() != null && this.kind == "end"){
        this.tracks.all_annos.active_anno().has_end = null;
        this.tracks.all_annos.active_anno().end_frame = null;
        this.objectui.endframe = me.job.stop;
        this.objectui.startframe = this.tracks.all_annos.active_anno().start_frame;
      }

      // check that if both the start and the end annotations have been removed, null out annotation_obj
      if( this.tracks.all_annos.active_anno() != null &&
          this.tracks.all_annos.active_anno().has_start == null &&
          this.tracks.all_annos.active_anno().has_end == null ){
        this.tracks.all_annos.annotation_active = null;
      }

      this.objectui.update_button_ui();

        this.handle.slideUp(null, function() {
            me.handle.remove();
        });
        this.track.remove();
    }

    this.add_word = function(new_word)
    {
        console.log("Change word!");
        if (me.job.training == 1){
          // grab the appropriate id for the training job
          training_job_id = me.job.train_with_id
          data = JSON.stringify({"labeltext" : new_word, "jobid": training_job_id}, null, 2);
        } else {
          data = JSON.stringify({"labeltext" : new_word, "jobid": me.job.jobid}, null, 2);
        }
        newdata = null;
        // label must be in a list or  strings/ ints longer than length 1 will separated
        server_post("newlabel", [me.label], data, function(response){me.change_word(response)});
      }

    this.change_word = function(response, old_label) {
        console.log("Started change_word callback");
        if (response == "error") {
          console.log("There was an error updating the word on the server. Check the connection when calling newlabel.");
          return;
        }

        parameters = mturk_parameters();
        // update job
        server_request("getjob", [this.job.jobid, this.job.training, parameters["assignmentid"], "vatic_job"], function(resp) {
            me.update_ui(resp, response)
        });
      }

    function track_has_label(track, lbl) {
      var output = [];
        for(var i=0; i<track.length; i++) {
            if (track[i].label == lbl)
            output.push(track[i]);
        }
        return output
    }

    this.update_ui = function(job, response) {
      // update the trackobject job and the objectui job.
      this.job = job_import(job);

      newlabelid = response['labelid'].toString();
      oldlabelid = response['oldlabelid'];
      newattributes = response['newattributes'];

      // update all_annos with the new id
      this.tracks.all_annos.change_anno_id(old_id = oldlabelid, new_id = newlabelid);

      // null out the id up for anno if both start and end buttons are endenabled
      // a bit of a hack, but it works.
      if (this.objectui.button[0].getAttribute("aria-disabled") == "false" && this.objectui.endbutton[0].getAttribute("aria-disabled") == "false") {
        // this.tracks.annotation_obj = null;
      } else {
        // change the id up for anno in the objectUI
        // happens when a word is changed with only a single annotation up.
        // need to additionally update the this.tracks.all_annos.annotation_active, as well as the labels in all_annos
        this.tracks.all_annos.annotation_active = newlabelid;
      }

      // find tracks with the old label
      var old_label_objects = track_has_label(this.objectui.objects, oldlabelid)

      // update labels, track labels, and jobs for each of the objects
      for(var i=0; i<old_label_objects.length; i++) {
        old_label_objects[i].track.label = newlabelid;
        old_label_objects[i].label = newlabelid;
        old_label_objects[i].job = this.job;
      }

      // update text on the UI
      for(var i=0; i<old_label_objects.length; i++) {
        headerobj = $( old_label_objects[i].handle[0] ).find(".trackobjectheader")[0];
        strongtag = $( headerobj ).find("strong")[0];
        $( strongtag ).text(this.job.labels[this.label]);
      }

      // create list of new attribute values
      var new_attr_values = [];
      for (attrid in newattributes) {
        new_attr_values.push(newattributes[attrid].toString());
      }

      // copy the old attributes journal to new keys
      for(var i=0; i<old_label_objects.length; i++) {
        // delete all attribute journals that aren't the new attributes
        for (attributejournalid in old_label_objects[i].track.attributejournals){
          if (new_attr_values.indexOf(attributejournalid) != -1){
            console.log("Error: one of these attributes existed already.");
          }
          else
          {
            new_attr_id = newattributes[this.job.attributes[oldlabelid][attributejournalid]];
            old_label_objects[i].track.attributejournals[new_attr_id] = old_label_objects[i].track.attributejournals[attributejournalid];
            delete old_label_objects[i].track.attributejournals[attributejournalid];
            console.log("Transfered attributes from old to new.");
          }
        }

        if (old_label_objects[i].kind == "start") {
          old_label_objects[i].attrid = newattributes["Start"].toString();
        }
        else if (old_label_objects[i].kind == "end")
        {
          old_label_objects[i].attrid = newattributes["End"].toString();
        }
        else
        {
          old_label_objects[i].attrid = null;
        }
      }

      // update the objectUI
      this.objectui.job = this.job;

      console.log("stop callback");
    }

    this.statedraw = function()
    {
        var html = "<p>Select one of these actions:</p>";

        html += "<ul>";
        for (var i in this.job.labels)
        {
            html += "<li>" + this.job.labels[i] + "</li>";
        }
        html += "</ul>";
//        html += "<p>Do not annotate the same object twice.</p>";

        this.drawinst = $("<div>" + html + "</div>").appendTo(this.handle);
        this.drawinst.hide();
        //this.drawinst.hide().slideDown();

        this.container.stop().animate({scrollTop: 0}, 750);

    }

    this.stateclassify = function(start)
    {
        this.drawinst.slideUp(null, function() {
            me.drawinst.remove();
        });

        var id_for_anno = 0;
        // do not loop over all labels, but rather start as empty string.
        // unless there's already an annotation up for annotation, then use the empty label.

        if ( this.tracks.all_annos.active_anno() == null){
          // There is no annotation currently being annotated, check if this job
          // has the magic label ""
          for (labelid in this.job.labels)
          {
            if (this.job.labels[labelid] == magic_label)
            {
              magic_label_id = labelid;
            }
          }

          if (magic_label_id == null)
          {
            // Throw an error for configuration purposes
            console.log("There is no label with the value '"+magic_label+"'. This job is not configured correctly. Please include at least '"+magic_label+"' as a label, as well as Start and End attributes (with ~Start ~End after the label).");
          } else {
            id_for_anno = magic_label_id;
          }
          // set annotation_obj object
          this.tracks.all_annos.add_anno(new annotation_obj(id = id_for_anno));
          this.tracks.all_annos.set_active_anno(id_for_anno);
          this.tracks.all_annos.active_anno().color = this.color;

          this.tracks.all_annos.active_anno().word_container = $( "<div class='wordcontainer'></div>" );
          this.tracks.all_annos.active_anno().word_container.prependTo(this.container)

          // enable the submit button
          $("#submitbutton").button("option", "disabled", false);
        }
        else {
          // There is an annotation being annotated, so use that id for new labels
          id_for_anno = this.tracks.all_annos.active_anno().id;
        }

        // Moves the track info to the word container
        this.handle.appendTo(this.tracks.all_annos.active_anno().word_container)

        // update the annotation_obj markers
        if(kind == "start"){
          this.tracks.all_annos.active_anno().has_start = true;
          this.tracks.all_annos.active_anno().start_frame = this.player.frame;
        }
        if(kind == "end"){
          this.tracks.all_annos.active_anno().has_end = true;
          this.tracks.all_annos.active_anno().end_frame = this.player.frame;
        }

        this.finalize(id_for_anno, start);
        this.statefolddown();

    }

    this.finalize = function(labelid, start, currentframe)
    {
        this.label = labelid;
        this.track.label = labelid;

        this.headerdetails = $("<div style='float:right;'></div>").appendTo(this.handle);
        // this.header = $("<p class='trackobjectheader'><strong>" + this.job.labels[this.label] + " " + (this.id + 1) + "</strong></p>").appendTo(this.handle).hide().slideDown();
        this.header = $("<p class='trackobjectheader change" + this.id + "word'><strong>" + this.job.labels[this.label] + "</strong></p>").appendTo(this.handle).hide().slideDown();

        // need place holder for when the string is empty. text box? square?
        this.opencloseicon = $('<div class="ui-icon ui-icon-triangle-1-e"></div>').prependTo(this.header);
        this.details = $("<div class='trackobjectdetails'></div>").appendTo(this.handle).hide();

      	// this.setupdetails(start);
      	this.player.pause();

      	if ( typeof currentframe == 'undefined' )
      	    currentframe = this.player.frame;

        this.track.initattributes(this.job.attributes[this.track.label]);
      	currentattr = "0";
      	for ( i in this.job.attributes[this.track.label] )
      	{
      	    if ( start == 1 && this.job.attributes[this.track.label][i] == 'Start' )
      		currentattr = i;
      	    else if ( start == 2 && this.job.attributes[this.track.label][i] == 'End' )
      		currentattr = i;
      	}
      	if ( currentattr == "0" )
      	    return;

      	this.track.setattribute(currentattr, true);
      	this.track.notifyupdate();
      	this.attrid = currentattr;

      	// this.header = $("<p class='trackobjectheader'><strong>" + this.job.labels[this.label] + " " + this.job.attributes[me.track.label][me.attrid] + " - Frame:" + currentframe + "</strong></p>").appendTo(this.handle).hide().slideDown();
        this.header = $("<p class='trackobjectheader'><strong>" + this.job.attributes[me.track.label][me.attrid] + " - Frame:" + currentframe + "</strong></p>").appendTo(this.handle).hide().slideDown();

      	this.headerdetails.append("<div style='float:right;'><div class='ui-icon ui-icon-trash' id='trackobject" + this.id + "delete' title='Delete this annotation'></div></div>");
        $("#trackobject" + this.id + "delete").click(function() {

            if (window.confirm("Delete the " + me.job.labels[me.label] + fake_blank + me.job.attributes[me.track.label][me.attrid] + " annotation?"))
            {
                me.remove();
                eventlog("removeobject", "Deleted an annotation");

                // if this is an end annotation, delete the crossbar as well.
                // this is not needed for start annotations, because the crossbar
                // is specifically embedded in the start handle.
                if ( me.job.attributes[me.track.label][me.attrid] == "End" )
                // if ( me.track.kind == "end" )
            		{
                  var start_tracks = me.tracks.tracks.filter(function(trck){
                    return trck.label == me.track.label && trck.kind == "start";
                  });
                  for(i in start_tracks){
                    var hndl = start_tracks[i].handle
                    hndl.find(".crossbar").remove()
                  }

                  eventlog("Deleted the crossbar associated with the start");
            		}
                // else if ( me.job.attributes[me.track.label][me.attrid] == "Start" )
                // // else if ( me.track.kind == "start" )
            		// {
            		//     $("#startbutton").button("option", "disabled", false);
            		//     me.objectui.startframe = me.job.start;
            		//     me.objectui.startenabled = true;
            		// }

            }
        });

        this.wrench = $("<div style='float:right;'><div class='ui-icon ui-icon-wrench change" + this.id + "word' title='Change the label for this annotation'></div></div>").appendTo(this.headerdetails);
        // add check for submit, hidden by default
        this.check = $("<div style='float:right;'><div class='ui-icon ui-icon-check submit" + this.id + "word' title='Submit the label for this annotation'></div></div>").appendTo(this.headerdetails).hide();
        // add close for cancel, hidden by default
        this.close = $("<div style='float:right;'><div class='ui-icon ui-icon-close close" + this.id + "word' title='Delete changes to this word.'></div></div>").appendTo(this.headerdetails).hide();

        // end init functions for finalize, from here down are functions.

        $(".change" + this.id + "word").click(function() {
          elem_up = this;
          // Add a check here, if there are other open words, close them. (With a pop-up warning)
          $("div.ui-icon-close").each(function () {
            var $this = $(this);
            console.log("Are there other closes visible?");

            // only act if the delete icon is visibile and not in the same annotation as the one we are currently changing
            if($this[0].parentElement.parentElement.parentElement != elem_up.parentElement && $this.is(':visible')) {
              alert('Please only change one label at a time. When you press ok the open edit box will be closed without saving the word in it. Remeber, after you change each word, please press the checkmark next to it to save it before moving on to the next word.');
              $this.click();
            }
          })

          var word_id = this.id;

          headerobj = $( me.handle[0] ).find(".trackobjectheader")[0];
          strongfield = $( headerobj ).find("strong")[0];
          $( strongfield ).replaceWith('<input type="text" id="newWord", value="'+me.job.labels[me.label]+'">');
          textinput = $( headerobj ).find("input")[0];

          $(textinput).unbind("keyup"); // unbind any that are already bound
          // catch the keys
          $(textinput).keyup(function(e){
              if(e.keyCode == 13)
              {
                $(this).trigger("enterKey");
              }
              else if (e.keyCode == 27)
              {
                $(this).trigger("escKey");
              }
          });


          // If the enter key is pressed, submit the new word
          $(textinput).unbind("enterKey"); // unbind any that are already bound
          $(textinput).bind("enterKey", function(e){
            //search two parents up for a checkmark to click (this is pretty fragile!)
            // throws an error to the console, but still works
            // tried troubleshooting but cannot seem to locate the problem, possibly asynchronous execution?
            check = $( this.parentElement.parentElement ).find(".ui-icon-check")[0];
            $(check).click();
          });

          // If the escape key is pressed, submit the new word
          $(textinput).unbind("escKey"); // unbind any that are already bound
          $(textinput).bind("escKey",function(e){
            //search two parents up for a checkmark to click (this is pretty fragile!)
            check = $( this.parentElement.parentElement ).find(".ui-icon-close")[0];
             $(check).click();
          });


          // force focus into the text field and select the contents
          $( textinput ).focus();
          $( textinput ).select();

          // hide the wrench show the cancel button
          me.wrench.hide();
          me.close.show();

          // need to update the delete function for noncurrent ids

          // show check for submit
          me.check.show();
        });

        $(".submit" + this.id + "word").click(function() {
            // grab new word from field
            new_word = $("#newWord").val();

            // don't save the magic label accidentally
            if ( new_word == magic_label )
            {
              // save a space, but could be the old word too?
              new_word = fake_blank;
            }

            // remove check, close and add wrench when submited.
            // wrench goes wonky after a word is submitted once. Possibly due to id issues?
            me.wrench.show();
            me.close.hide();
            me.check.hide();

            me.add_word(new_word);

            // change back to text
            headerobj = $( me.handle[0] ).find(".trackobjectheader")[0];
            strongfield = $( headerobj ).find("input")[0];
            $( strongfield ).replaceWith("<strong>" + me.job.labels[me.label] + "</strong>");

            // update the UI incase this is the first time editing a label
            me.objectui.update_button_ui(can_reset = true);
        });

        $(".close" + this.id + "word").click(function() {
            // if the word is still the magic string "", we can't let it
            // actually cancel. Instead, we should save a single space.
            if ( me.job.labels[me.label] == magic_label )
            {
              alert('You must enter a word for the label. It cannot be left blank.');
              return;
            }


            // change back to text
            headerobj = $( me.handle[0] ).find(".trackobjectheader")[0];
            strongfield = $( headerobj ).find("input")[0];
            $( strongfield ).replaceWith("<strong>" + me.job.labels[me.label] + "</strong>");

            // remove check, close and add wrench when closed.
            me.wrench.show(); // wrench doesn't function after cancel
            me.close.hide();
            me.check.hide();
        });

	this.updateboxtext();

        this.header.mouseup(function() {
            me.click();
        });

        this.ready = true;
        this._callback(this.onready);

        this.player.onupdate.push(function() {
            me.updateboxtext();
        });


      // if there is an empty string, trigger the change word dialog.
      // Currently only pops up when the annotations is ended.
      if(this.job.labels[this.label] == magic_label && this.kind == "end")
      {
        console.log("The empty string!");
        $(".change" + this.id + "word").click();
      }
    }

    this.updateboxtext = function()
    {
        //var str = "<strong>" + this.job.labels[this.label] + " " + (this.id + 1) + "</strong>";
        var str = magic_label;

        var count = 0;
        for (var i in this.job.attributes[this.track.label])
        {
            if (this.track.estimateattribute(i, this.player.frame))
            {
//                str += "<br>";
                str += this.job.attributes[this.track.label][i];
                count++;
            }
        }

        this.track.settext(str);

        if ($("#annotateoptionshideboxtext").attr("checked"))
        {
            $(".boundingboxtext").hide();
        }
    }

    this.setupdetails = function(start)
    {
//        this.details.append("<input type='checkbox' id='trackobject" + this.id + "lost'> <label for='trackobject" + this.id + "lost'>Outside of view frame</label><br>");
//        this.details.append("<input type='checkbox' id='trackobject" + this.id + "occluded'> <label for='trackobject" + this.id + "occluded'>Occluded or obstructed</label><br>");

        for (var i in this.job.attributes[this.track.label])
        {
            this.details.append("<input type='checkbox' id='trackobject" + this.id + "attribute" + i + "'> <label for='trackobject" + this.id + "attribute" + i +"'>" + this.job.attributes[this.track.label][i] + "</label><br>");

            // create a closure on attributeid
            (function(attributeid) {

                $("#trackobject" + me.id + "attribute" + i).click(function() {
                    me.player.pause();

                    var checked = $(this).attr("checked");
                    me.track.setattribute(attributeid, checked ? true : false);
                    me.track.notifyupdate();

                    me.updateboxtext();

                    if (checked)
                    {
                        eventlog("markattribute", "Mark object as " + me.job.attributes[me.track.label][attributeid]);
                    }
                    else
                    {
                        eventlog("markattribute", "Mark object as not " + me.job.attributes[me.track.label][attributeid]);
                    }
                });

            })(i);
        }


        $("#trackobject" + this.id + "lost").click(function() {
            me.player.pause();

            var outside = $(this).attr("checked");
            me.track.setoutside(outside);
            me.track.notifyupdate();

            if (outside)
            {
                eventlog("markoutside", "Mark object outside");
            }
            else
            {
                eventlog("markoutside", "Mark object inside");
            }
        });
        $("#trackobject" + this.id + "occluded").click(function() {
            me.player.pause();

            var occlusion = $(this).attr("checked");
            me.track.setocclusion(occlusion);
            me.track.notifyupdate();

            if (occlusion)
            {
                eventlog("markocclusion", "Mark object as occluded");
            }
            else
            {
                eventlog("markocclusion", "Mark object as not occluded");
            }
        });

        this.player.onupdate.push(function() {
            me.updatecheckboxes();
        });

        //this.details.append("<br><input type='button' id='trackobject" + this.id + "label' value='Change Type'>");
        this.headerdetails.append("<div style='float:right;'><div class='ui-icon ui-icon-trash' id='trackobject" + this.id + "delete' title='Delete this track'></div></div>");
        this.headerdetails.append("<div style='float:right;'><div class='ui-icon ui-icon-unlocked' id='trackobject" + this.id + "lock' title='Lock/unlock to prevent modifications'></div></div>");
        this.headerdetails.append("<div style='float:right;'><div class='ui-icon ui-icon-image' id='trackobject" + this.id + "tooltip' title='Show preview of track'></div></div>");

        $("#trackobject" + this.id + "delete").click(function() {
            if (window.confirm("Delete the " + me.job.labels[me.label] + " " + (me.id + 1) + " track? If the object just left the view screen, click the \"Outside of view frame\" check box instead."))
            {
                me.remove();
                eventlog("removeobject", "Deleted an object");
            }
        });

        $("#trackobject" + this.id + "lock").click(function() {
            if (me.track.locked)
            {
                me.track.setlock(false);
                $(this).addClass("ui-icon-unlocked").removeClass("ui-icon-locked");
            }
            else
            {
                me.track.setlock(true);
                $(this).removeClass("ui-icon-unlocked").addClass("ui-icon-locked");
            }
        });

        $("#trackobject" + this.id + "tooltip").click(function() {
            me.toggletooltip(false);
        }).mouseout(function() {
            me.hidetooltip();
        });
    }

    this.updatecheckboxes = function()
    {
        var e = this.track.estimate(this.player.frame);
        $("#trackobject" + this.id + "lost").attr("checked", e.outside);
        $("#trackobject" + this.id + "occluded").attr("checked", e.occluded);

        for (var i in this.job.attributes[this.track.label])
        {
            if (!this.track.estimateattribute(i, this.player.frame))
            {
                $("#trackobject" + this.id + "attribute" + i).attr("checked", false);
            }
            else
            {
                $("#trackobject" + this.id + "attribute" + i).attr("checked", true);
            }
        }
    }

    this.toggletooltip = function(onscreen)
    {
        if (this.tooltip == null)
        {
            this.showtooltip(onscreen);
        }
        else
        {
            this.hidetooltip();
        }
    }

    this.showtooltip = function(onscreen)
    {
        if (this.tooltip != null)
        {
            return;
        }

        var x;
        var y;

        if (onscreen || onscreen == null)
        {
            var pos = this.track.handle.position();
            var width = this.track.handle.width();
            var height = this.track.handle.height();

            var cpos = this.player.handle.position();
            var cwidth = this.player.handle.width();
            var cheight = this.player.handle.height();

            var displacement = 15;

            x = pos.left + width + displacement;
            if (x + 200 > cpos.left + cwidth)
            {
                x = pos.left - 200 - displacement;
            }

            y = pos.top;
            if (y + 200 > cpos.top + cheight)
            {
                y = cpos.top + cheight - 200 - displacement;
            }
        }
        else
        {
            var pos = this.handle.position();
            x = pos.left - 210;

            var cpos = this.player.handle.position();
            var cheight = this.player.handle.height();

            y = pos.top;
            if (y + 200 > cpos.top + cheight)
            {
                y = cpos.top + cheight - 215;
            }
        }

        var numannotations = 0;
        var frames = [];
        for (var i in this.track.journal.annotations)
        {
            if (!me.track.journal.annotations[i].outside)
            {
                numannotations++;
                frames.push(i);
            }
        }

        if (numannotations == 0)
        {
            return;
        }

        frames.sort();

        this.tooltip = $("<div class='boxtooltip'></div>").appendTo("body");
        this.tooltip.css({
            top: y + "px",
            left: x + "px"
        });
        this.tooltip.hide();
        var boundingbox = $("<div class='boxtooltipboundingbox boundingbox'></div>").appendTo(this.tooltip);

        var annotation = 0;
        var update = function() {
            if (annotation >= numannotations)
            {
                annotation = 0;
            }

            var frame = frames[annotation];
            var anno = me.track.journal.annotations[frame];
            var bw = anno.xbr - anno.xtl;
            var bh = anno.ybr - anno.ytl;

            var scale = 1;
            if (bw > 200)
            {
                scale = 200 / bw;
            }
            if (bh > 200)
            {
                scale = Math.min(scale, 200 / bh);
            }

            var x = (anno.xtl + (anno.xbr - anno.xtl) / 2) * scale - 100;
            var y = (anno.ytl + (anno.ybr - anno.ytl) / 2) * scale - 100;

            var bx = 100 - (anno.xbr - anno.xtl) / 2 * scale;
            var by = 100 - (anno.ybr - anno.ytl) / 2 * scale;
            bw = bw * scale;
            bh = bh * scale;

            if (x < 0)
            {
                bx += x;
                x = 0;
            }
            if (x > me.job.width * scale - 200)
            {
                bx = 200 - (me.job.width - anno.xtl) * scale;
                x = me.job.width * scale - 200;
            }
            if (y < 0)
            {
                by += y;
                y = 0;
            }
            if (y > me.job.height * scale - 200)
            {
                by = 200 - (me.job.height - anno.ytl) * scale;
                y = (me.job.height) * scale - 200;
            }

            x = -x;
            y = -y;

            console.log("Show tooltip for " + frame);
            me.tooltip.css("background-image", "url('" + me.job.frameurl(frame) + "')");
            me.tooltip.css("background-position", x + "px " + y + "px");
            var bgsize = (me.job.width * scale) + "px " + (me.job.height * scale) + "px";
            me.tooltip.css("background-size", bgsize);
            me.tooltip.css("-o-background-size", bgsize);
            me.tooltip.css("-webkit-background-size", bgsize);
            me.tooltip.css("-khtml-background-size", bgsize);
            me.tooltip.css("-moz-background-size", bgsize);
            annotation++;

            boundingbox.css({
                top: by + "px",
                left: bx + "px",
                width: (bw-4) + "px",
                height: (bh-4) + "px",
                borderColor: me.color[0]
            });
        }


        this.tooltiptimer = window.setInterval(function() {
            update();
        }, 500);

        this.tooltip.hide().slideDown(250);
        update();
    }

    this.hidetooltip = function()
    {
        if (this.tooltip != null)
        {
            this.tooltip.slideUp(250, function() {
                $(this).remove();
            });
            this.tooltip = null;
            window.clearInterval(this.tooltiptimer);
            this.tooltiptimer = null;
        }
    }

    this.disable = function()
    {
        if (this.ready)
        {
            $("#trackobject" + this.id + "lost").attr("disabled", true);
            $("#trackobject" + this.id + "occluded").attr("disabled", true);
        }
    }

    this.enable = function()
    {
        if (this.ready)
        {
            $("#trackobject" + this.id + "lost").attr("disabled", false);
            $("#trackobject" + this.id + "occluded").attr("disabled", false);
        }
    }

    this.statefoldup = function()
    {
        this.handle.addClass("trackobjectfoldedup");
        this.handle.removeClass("trackobjectfoldeddown");
        this.details.slideUp();
        this.headerdetails.fadeOut();
        this.foldedup = true;
        this._callback(this.onfoldup);

        //this.opencloseicon.removeClass("ui-icon-triangle-1-s");
        //this.opencloseicon.addClass("ui-icon-triangle-1-e");
    }

    this.statefolddown = function()
    {
        this.handle.removeClass("trackobjectfoldedup");
        this.handle.addClass("trackobjectfoldeddown");
        this.details.slideDown();
        this.headerdetails.fadeIn();
        this.foldedup = false;
        this._callback(this.onfolddown);

        //this.opencloseicon.removeClass("ui-icon-triangle-1-e");
        //this.opencloseicon.addClass("ui-icon-triangle-1-s");
    }

    this.mouseover = function()
    {
        this.highlight();

        if (this.track)
        {
            this.tracks.dim(true);
            this.track.dim(false);
            this.track.highlight(true);
        }

        if (this.opencloseicon)
        {
            this.opencloseicon.addClass("ui-icon-triangle-1-se");
        }
    }

    this.highlight = function()
    {
        this.handle.css({
            'border-color': me.color[0],
            'background-color': me.color[1],
        });
    }

    this.mouseout = function()
    {
        this.unhighlight();

        if (this.track)
        {
            this.tracks.dim(false);
            this.track.highlight(false);
        }

        if (this.opencloseicon)
        {
            this.opencloseicon.removeClass("ui-icon-triangle-1-se");
        }
    }

    this.unhighlight = function()
    {
        this.handle.css({
            'border-color': me.color[2],
            'background-color': me.color[2],
        });
    }

    this.click = function()
    {
        return; // disable fold down
        if (this.ready)
        {
            if (this.foldedup)
            {
                this.statefolddown();
            }
            else
            {
                this.statefoldup();
            }
        }
    }

    this._callback = function(list)
    {
        for (var i = 0; i < list.length; i++)
        {
            list[i](me);
        }
    }
}
