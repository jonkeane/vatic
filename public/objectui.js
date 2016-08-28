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

    this.startnewobject = function(start)
    {
        if (start == 1 && this.startenabled == false || (start == 2 && this.endenabled == false) )
        {
            return;
        }
      	if ( start == 1 && player.frame >= this.endframe )
      	{
      	    alert('Start frame must be before the end frame');
      	    return;
      	}
      	else if ( start == 2 && player.frame <= this.startframe )
      	{
      	    alert('End frame must be after the start frame');
      	    return;
      	}

        tracks.drawingnew(true);
        console.log("Starting new track object");

        eventlog("newobject", "Start drawing new object");

        this.instructions.fadeOut();

        this.currentcolor = this.pickcolor();
        this.drawer.color = this.currentcolor[0];
//        this.drawer.enable();

//        this.button.button("option", "disabled", true);

        if ( start == 1 )
        {
          kind = "start"
        }
        else if ( start == 2 )
        {
          kind = "end"
        }

        this.currentobject = new TrackObject(this.job, this.player,
                                             this.container,
                                             this.currentcolor, this, kind);
        this.currentobject.statedraw();

        this.tracks.resizable(false);
        this.tracks.draggable(false);
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
          // disables start button once clicked
          // simply disabling gives errors after the first word is annotated
    	    this.button.button("option", "disabled", true);
    	    this.startframe = player.frame;
    	    this.startenabled = false;
    	}
    	else if ( start == 2 )
    	{
          // disables end button once clicked
    	    this.endbutton.button("option", "disabled", true);
    	    this.endframe = player.frame;
    	    this.endenabled = false;
    	}
    }

    this.stopnewobject = function()
    {
        console.log("Finished new track object");

//        ui_enable();
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
        me.startnewobject(1);
	    xtl = (me.player.frame*$("#playerslider").width())/(me.player.job.stop);
	    me.stopdrawing(new Position(xtl, me.player.handle.height()+2, xtl+1, me.player.handle.height()+12), 1);
  	  });

    	this.endbutton.button({
    	    icons: {
    		       primary: "ui-icon-plusthick",
    		   },
    	    disabled: false
    	}).click(function() {
          // end = 2
    	    me.startnewobject(2);
    	    xtl = (me.player.frame*$("#playerslider").width())/(me.player.job.stop);
    	    me.stopdrawing(new Position(xtl, me.player.handle.height()+2, xtl+1, me.player.handle.height()+12), 2);
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
        this.handle.slideUp(null, function() {
            me.handle.remove();
        });
        this.track.remove();
    }

    this.add_word = function(new_word)
    {
        console.log("Change word!");
        data = JSON.stringify({"labeltext" : new_word, "jobid": me.job.jobid}, null, 2);
        newdata = null;
        // label must be in a list or  strings/ ints longer than length 1 will separated
        server_post("newlabel", [me.label], data, function(response){me.change_word(response)});
      }

    this.change_word = function(response, old_label) {
        console.log("start callback");
        // update job
        server_request("getjob", [this.job.jobid, this.job.training], function(resp) {
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

      // change the id up for anno in the objectUI
      this.job.idupforanno = newlabelid;

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

        if ( this.job.idupforanno == null){
          // There is no annotation currently being annotated, check if this job
          // has the magic label ""
          var magic_label = "";
          var magic_label_id = null;
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
        }
        else {
          // There is an annotation being annotated, so use that id for new labels
          id_for_anno = this.job.idupforanno;
        }

        // set id up for anno
        this.job.idupforanno = id_for_anno;

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

            if (window.confirm("Delete the " + me.job.labels[me.label] + " " + me.job.attributes[me.track.label][me.attrid] + " annotation?"))
            {
                me.remove();
                eventlog("removeobject", "Deleted an annotation");
                if ( me.job.attributes[me.track.label][me.attrid] == "End" )
                // if ( me.track.kind == "end" )
            		{
            		    $("#endbutton").button("option", "disabled", false);
            		    me.objectui.endframe = me.job.stop;
            		    me.objectui.endenabled = true;

            		}
                else if ( me.job.attributes[me.track.label][me.attrid] == "Start" )
                // else if ( me.track.kind == "start" )
            		{
            		    $("#startbutton").button("option", "disabled", false);
            		    me.objectui.startframe = me.job.start;
            		    me.objectui.startenabled = true;
            		}

            }
        });

        this.wrench = $("<div style='float:right;'><div class='ui-icon ui-icon-wrench change" + this.id + "word' title='Change the label for this annotation'></div></div>").appendTo(this.headerdetails);
        // add check for submit, hidden by default
        this.check = $("<div style='float:right;'><div class='ui-icon ui-icon-check submit" + this.id + "word' title='Submit the label for this annotation'></div></div>").appendTo(this.headerdetails).hide();
        // add close for cancel, hidden by default
        this.close = $("<div style='float:right;'><div class='ui-icon ui-icon-close close" + this.id + "word' title='Delete changes to this word.'></div></div>").appendTo(this.headerdetails).hide();

        // end init functions for finalize, from here down are functions.

        $(".change" + this.id + "word").click(function() {

          var word_id = this.id;

          headerobj = $( me.handle[0] ).find(".trackobjectheader")[0];
          strongfield = $( headerobj ).find("strong")[0];
          $( strongfield ).replaceWith('<input type="text" id="newWord", value="'+me.job.labels[me.label]+'">');
          textinput = $( headerobj ).find("input")[0];

          // If the enter key is pressed, submit the new word
          $(textinput).bind("enterKey",function(e){
            //search two parents up for a checkmark to click (this is pretty fragile!)
            // errors if there's only one annotation?
            check = $( this.parentElement.parentElement ).find(".ui-icon-check")[0];
             $(check).click();
          });

          // If the escape key is pressed, submit the new word
          $(textinput).bind("escKey",function(e){
            //search two parents up for a checkmark to click (this is pretty fragile!)
            check = $( this.parentElement.parentElement ).find(".ui-icon-close")[0];
             $(check).click();
          });

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
        });

        $(".close" + this.id + "word").click(function() {
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
      if(this.job.labels[this.label] == "" && this.kind == "end")
      {
        console.log("The empty string!");
        $(".change" + this.id + "word").click();
      }
    }

    this.updateboxtext = function()
    {
        //var str = "<strong>" + this.job.labels[this.label] + " " + (this.id + 1) + "</strong>";
        var str = "";

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
