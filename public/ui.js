var ui_disabled = 0;
// maximum number of tries when validating
max_tries = 4;

function ui_build(job)
{
    console.log(max_tries);
    var screen = ui_setup(job);
    var videoframe = $("#videoframe");
    var player = new VideoPlayer(videoframe, job);
    var tracks = new TrackCollection(player, job);
    var objectui = new TrackObjectUI($("#startbutton"), $("#objectcontainer"), videoframe, job, player, tracks, $("#endbutton"));

    ui_setupbuttons(job, player, tracks);
    ui_setupslider(player);
    ui_setupsubmit(job, tracks, objectui);
    ui_setupreport(job, tracks, objectui);

    // disable submit button until an annotation is made (or the end of the video has been reached)
    $("#submitbutton").button("option", "disabled", true);
    $("#reportOffensive").button("option", "disabled", false);

    ui_setupclickskip(job, player, tracks, objectui);
    // ui_setupkeyboardshortcuts(job, player);
    ui_setupkeyboardshortcuts_inputsafe(job, player);
    // commented because loading the already made annotations will fail when training.
    // this means old annotations will not be displayed, however this is likely to be
    // fine for our purposes.
    // ui_loadprevious(job, objectui);

    $("#startbutton").click(function() {
        if (!mturk_submitallowed())
        {
            $("#turkic_acceptfirst").effect("pulsate");
        }
    });
    $("#endbutton").click(function() {
        if (!mturk_submitallowed())
        {
            $("#turkic_acceptfirst").effect("pulsate");
        }
    });
}

function ui_setup(job)
{
    var screen = $("<div id='annotatescreen'></div>").appendTo(container);
//            "<td><div id='instructionsbutton' class='button'>Instructions</div><div id='instructions'>Annotate every object, even stationary and obstructed objects, for the entire video.</td>" +
    var actionstring = null;
    for ( var key in job.labels )
	actionstring = job.labels[key];
    $("<table>" +
        "<tr>" +
            "<td><div id='instructionsbutton' class='button'>Instructions</div><div id='instructions'>Annotate the beginning and end of any fingerspelled word in the following video. <br/> Then type the word that was fingerspelled into the box to the right of the video.</td>" +
            "<td><div id='topbar'></div></td>" +
        "</tr>" +
        "<tr>" +
              "<td><div id='videoframe'></div></td>" +
              "<td rowspan='2'><div id='sidebar'></div></td>" +
          "</tr><tr style='height: 15px;' ></tr>" +
          "<tr>" +
              "<td/>" +
              "<td><div id='frameinfobar'></div></td>" +
          "</tr>" +
          "<tr>" +
          "<td><div id='bottombar' style='float: left;'></div><div id='advancedoptions'></div></td>" +
              "<td><div id='submitbar'></div></td>" +
          "</tr>" +
          "<tr>" +
              "<td><div id='startendbar'></div></td>" +
          "</tr>" +
      "</table>").appendTo(screen).css("width", "100%");

//    job.width = job.width + 200;
//    job.height = job.height + 200;
    var playerwidth = Math.max(720, job.width);

    $("#videoframe").css({"width": job.width + "px",
                          "height": job.height + "px",
                          "margin": "0 auto"})
                    .parent().css("width", playerwidth + "px");
    // place slider just below video (to line up with marks)
    $("#videoframe").append("<div id='playerslider'></div>");


    $("#sidebar").css({"height": job.height + "px",
                       "width": "205px"});

    $("#annotatescreen").css("width", (playerwidth + 205) + "px");

    $("#frameinfobar").css({"padding-left": "20px", "width": "150px"});
    $("#frameinfobar").append("<div style='float: left;'><strong>Frame: </strong></div><div id='frameinfo'></div>");
    $("#frameinfo").css({"width": "30px", "padding-left": "10px", "float": "left"});

    // place slider next to rewind / play buttons
    // $("#bottombar").append("<div id='playerslider'></div>");
    $("#bottombar").append("<div class='button' id='rewindbutton'>Rewind</div> ");
    $("#bottombar").append("<div class='button' id='playbutton'>Play</div> ");

    $("#startendbar").append("<div id='newobjectcontainer'>" +
        "<div class='button' id='startbutton'>Start</div>" +
        "<div class='button' id='endbutton'>End</div></div></div>");

    $("<div id='objectcontainer'></div>").appendTo("#sidebar");

    // enable / disable the advanced options button to hide the speed options
    // $("<div class='button' id='openadvancedoptions'>Options</div>")
    //     .button({
    //         icons: {
    //             primary: "ui-icon-wrench"
    //         }
    //     }).appendTo($("#advancedoptions").parent()).click(function() {
    //             eventlog("options", "Show advanced options");
    //             $(this).remove();
    //             $("#advancedoptions").show();
    //         });

    $("#advancedoptions").show();

    $("#advancedoptions").append(
    "<input type='checkbox' id='annotateoptionsresize'>" +
    // "<label for='annotateoptionsresize'>Disable Resize?</label> " +
    "<input type='checkbox' id='annotateoptionshideboxes'>");

    $("#advancedoptions").append(
    "<div id='speedcontrol'>" +
    "<input type='radio' name='speedcontrol' " +
        "value='5,1' id='speedcontrolslower'>" +
    "<label for='speedcontrolslower'>Slower</label>" +
    "<input type='radio' name='speedcontrol' " +
        "value='15,1' id='speedcontrolslow'>" +
    "<label for='speedcontrolslow'>Slow</label>" +
    "<input type='radio' name='speedcontrol' " +
        "value='30,1' id='speedcontrolnorm' checked='checked'>" +
    "<label for='speedcontrolnorm'>Normal</label>" +
    "<input type='radio' name='speedcontrol' " +
        "value='90,1' id='speedcontrolfast'>" +
    "<label for='speedcontrolfast'>Fast</label>" +
    "</div>");

    $("#advancedoptions").append(
    "<div id='reportOffensive' class='button'>Report offensive video</div>");

    $("#submitbar").append("<div id='submitbutton' class='button'>Submit HIT</div>");

    if (mturk_isoffline())
    {
        $("#submitbutton").html("Save Work");
    }

    return screen;
}

function ui_setupbuttons(job, player, tracks)
{
    $("#instructionsbutton").click(function() {
        player.pause();
        ui_showinstructions(job);
    }).button({
        icons: {
            primary: "ui-icon-newwin"
        }
    });

    $("#playbutton").click(function() {
        if (!$(this).button("option", "disabled"))
        {
            player.toggle();

            if (player.paused)
            {
                eventlog("playpause", "Paused video");
            }
            else
            {
                eventlog("playpause", "Play video");
            }
        }
    }).button({
        disabled: false,
        icons: {
            primary: "ui-icon-play"
        }
    });

    $("#rewindbutton").click(function() {
        if (ui_disabled) return;
        player.pause();
        player.seek(player.job.start);
        eventlog("rewind", "Rewind to start");
    }).button({
        disabled: true,
        icons: {
            primary: "ui-icon-seek-first"
        }
    });

    player.onplay.push(function() {
        $("#playbutton").button("option", {
            label: "Pause",
            icons: {
                primary: "ui-icon-pause"
            }
        });
    });

    player.onpause.push(function() {
        $("#playbutton").button("option", {
            label: "Play",
            icons: {
                primary: "ui-icon-play"
            }
        });
    });

    player.onupdate.push(function() {
        if (player.frame == player.job.stop)
        {
            $("#playbutton").button("option", "disabled", true);
            // enable the submit button if the end of the track has been reached
            $("#submitbutton").button("option", "disabled", false);
        }
        else if ($("#playbutton").button("option", "disabled"))
        {
            $("#playbutton").button("option", "disabled", false);
        }

        if (player.frame == player.job.start)
        {
            $("#rewindbutton").button("option", "disabled", true);
        }
        else if ($("#rewindbutton").button("option", "disabled"))
        {
            $("#rewindbutton").button("option", "disabled", false);
        }
    });

    $("#speedcontrol").buttonset();
    $("input[name='speedcontrol']").click(function() {
        player.fps = parseInt($(this).val().split(",")[0]);
        player.playdelta = parseInt($(this).val().split(",")[1]);
        console.log("Change FPS to " + player.fps);
        console.log("Change play delta to " + player.playdelta);
        if (!player.paused)
        {
            player.pause();
            player.play();
        }
        eventlog("speedcontrol", "FPS = " + player.fps + " and delta = " + player.playdelta);
    });

    tracks.resizable(false);
    tracks.draggable(false);

    $("#annotateoptionsresize").button().click(function() {
        var resizable = !$(this).attr("checked")
        tracks.resizable(resizable);

        if (resizable)
        {
            eventlog("disableresize", "Objects can be resized");
        }
        else
        {
            eventlog("disableresize", "Objects can not be resized");
        }
    });

    $("#annotateoptionshideboxes").button().click(function() {
        var visible = !$(this).attr("checked");
        tracks.visible(visible);

        if (visible)
        {
            eventlog("hideboxes", "Boxes are visible");
        }
        else
        {
            eventlog("hideboxes", "Boxes are invisible");
        }
    });

    $("#annotateoptionshideboxtext").button().click(function() {
        var visible = !$(this).attr("checked");

        if (visible)
        {
            $(".boundingboxtext").show();
        }
        else
        {
            $(".boundingboxtext").hide();
        }
    });
}

function ui_setupkeyboardshortcuts(job, player)
{
    $(window).keypress(function(e) {
        console.log("Key press: " + e.keyCode);

        if (ui_disabled)
        {
            console.log("Key press ignored because UI is disabled.");
            return;
        }

        var keycode = e.keyCode ? e.keyCode : e.which;
        eventlog("keyboard", "Key press: " + keycode);

        if (keycode == 32 || keycode == 112 || keycode == 116 || keycode == 98)
        // space, p, t, b
        {
            $("#playbutton").click();
        }
        if (keycode == 114) // r
        {
            $("#rewindbutton").click();
        }
        else if (keycode == 110) // n
        {
            $("#startbutton").click();
        }
        else if (keycode == 104) // h
        {
            $("#annotateoptionshideboxes").click();
        }
        else
        {
            var skip = 0;
            if (keycode == 44 || keycode == 100) // , and d
            {
                skip = job.skip > 0 ? -job.skip : -10;
            }
            else if (keycode == 46 || keycode == 102) // . and f
            {
                skip = job.skip > 0 ? job.skip : 10;
            }
            else if (keycode == 62 || keycode == 118) // > and v
            {
                skip = job.skip > 0 ? job.skip : 1;
            }
            else if (keycode == 60 || keycode == 99) // < and c
            {
                skip = job.skip > 0 ? -job.skip : -1;
            }

            if (skip != 0)
            {
                player.pause();
                player.displace(skip);

                ui_snaptokeyframe(job, player);
            }
        }
    });

}



function ui_setupkeyboardshortcuts_inputsafe(job, player)
{
    $(window).keypress(function(e) {
        console.log("Key press: " + e.keyCode);

        if (ui_disabled)
        {
            console.log("Key press ignored because UI is disabled.");
            return;
        }

        var keycode = e.keyCode ? e.keyCode : e.which;
        eventlog("keyboard", "Key press: " + keycode);

        // even space could be entered in the text box.
        // if (keycode == 32)
        // // space, (old: + p, t, b)
        // {
        //     $("#playbutton").click();
        // }
        var skip = 0;
        if (keycode == 44) // , old: + d
        {
            skip = job.skip > 0 ? -job.skip : -10;
        }
        else if (keycode == 46) // . old: + f
        {
            skip = job.skip > 0 ? job.skip : 10;
        }
        else if (keycode == 62) // > old: + v
        {
            skip = job.skip > 0 ? job.skip : 1;
        }
        else if (keycode == 60) // < old: + c
        {
            skip = job.skip > 0 ? -job.skip : -1;
        }

        if (skip != 0)
        {
            player.pause();
            player.displace(skip);

            ui_snaptokeyframe(job, player);
        }
    });

}





function ui_canresize()
{
    return !$("#annotateoptionsresize").attr("checked");
}

function ui_areboxeshidden()
{
    return $("#annotateoptionshideboxes").attr("checked");
}

function ui_setupslider(player)
{
    var slider = $("#playerslider");
    slider.slider({
        range: "min",
        value: player.job.start,
        min: player.job.start,
        max: player.job.stop,
        slide: function(event, ui) {
            player.pause();
            player.seek(ui.value);
            // probably too much bandwidth
            //eventlog("slider", "Seek to " + ui.value);
        }
    });

    /*slider.children(".ui-slider-handle").hide();*/
    slider.children(".ui-slider-range").css({
        "background-color": "#868686",
        "background-image": "none"});

    slider.css({
        marginTop: parseInt(slider.parent().css("height")) +20 + "px", // for under video position only
        width: parseInt(slider.parent().css("width")) + "px", // for under video position only
        float: "bottom",
        position: "absolute" // for under video position only
    });

    player.onupdate.push(function() {
        slider.slider({value: player.frame});
    });
}

function ui_iskeyframe(frame, job)
{
    return frame == job.stop || (frame - job.start) % job.skip == 0;
}

function ui_snaptokeyframe(job, player)
{
    if (job.skip > 0 && !ui_iskeyframe(player.frame, job))
    {
        console.log("Fixing slider to key frame");
        var remainder = (player.frame - job.start) % job.skip;
        if (remainder > job.skip / 2)
        {
            player.seek(player.frame + (job.skip - remainder));
        }
        else
        {
            player.seek(player.frame - remainder);
        }
    }
}

function ui_setupclickskip(job, player, tracks, objectui)
{
    if (job.skip <= 0)
    {
        return;
    }

    player.onupdate.push(function() {
        if (ui_iskeyframe(player.frame, job))
        {
            console.log("Key frame hit");
            player.pause();
            $("#startbutton").button("option", "disabled", false);
            $("#endbutton").button("option", "disabled", false);
            $("#playbutton").button("option", "disabled", false);
            tracks.draggable(false);
            tracks.resizable(false);
            //tracks.resizable(ui_canresize());
            tracks.recordposition();
            objectui.enable();
        }
        else
        {
            $("#startbutton").button("option", "disabled", true);
            $("#endbutton").button("option", "disabled", true);
            $("#playbutton").button("option", "disabled", true);
            tracks.draggable(false);
            tracks.resizable(false);
            objectui.disable();
        }
    });

    $("#playerslider").bind("slidestop", function() {
        ui_snaptokeyframe(job, player);
    });
}

function ui_loadprevious(job, objectui)
{
    var overlay = $('<div id="turkic_overlay"></div>').appendTo("#container");
    var note = $("<div id='submitdialog'>One moment...</div>").appendTo("#container");

    server_request("getboxesforjob", [job.jobid], function(data) {
        overlay.remove();
        note.remove();

        for (var i in data)
        {
            new_object = objectui.injectnewobject(data[i]["label"],
                                    data[i]["boxes"],
                                    data[i]["attributes"]);
            // added so that the new objects are in the objects array of the new UI
            objectui.objects.push(new_object);
        }
    });
}

function ui_setupsubmit(job, tracks, objectui)
{
    $("#submitbutton").button({
        icons: {
            primary: 'ui-icon-check'
        }
    }).click(function() {
        if (ui_disabled) return;
        if ($("#submitbutton")[0].classList.contains("ui-button-disabled")) return;
        ui_submit(job, tracks, objectui);
    });
}


function ui_setupreport(job, tracks, objectui)
{
  var jobid = job.jobid;
    $("#reportOffensive").button({

    }).click(function() {
        if (ui_disabled) return;
        console.log("Reporting the video segment as offensive.");
        data = JSON.stringify({"jobid": jobid}, null, 2);
        // label must be in a list or  strings/ ints longer than length 1 will separated
        server_post("offensive", [jobid], data, function(response){
          alert(response);
          ui_submit(job, tracks, objectui);
          return;
        });
    });
}

function ui_submit(job, tracks, objectui)
{
    console.dir(tracks);
    console.log("Start submit - status: " + tracks.serialize());

    if (!mturk_submitallowed())
    {
        alert("Please accept the task before you submit.");
        return;
    }

    // get a set of tracks that are not deleted in order to checks
    tracks_non_deleted = tracks.tracks.filter(function(trck){
      return trck.deleted == false;
    });

    // get a list of labels from the nondeleted tracks
    var labels_non_deleted = [];
    for (var i=0; i < tracks_non_deleted.length ; ++i)
      labels_non_deleted.push(tracks_non_deleted[i]['label']);
    // make the labels unique
    var labels_to_check = $.grep(labels_non_deleted, function(v, k){
      return $.inArray(v ,labels_non_deleted) === k;
    });

    // Check the form of the labels present by grouping them by label, and then checking each group
    for (lbl in labels_to_check) {
      console.log("Checking label: "+labels_to_check[lbl]);
      var matched_tracks = $.grep(tracks_non_deleted, function(e) { return e.label == labels_to_check[lbl] });

      // check that there is one start and one end
      // this depends on the kind attribute, which is only setup when an annotation is made
      // not when the annotations are read in form the database
      var start_anno = $.grep(matched_tracks, function(e) { return e.kind == "start" });
      var end_anno = $.grep(matched_tracks, function(e) { return e.kind == "end" });
      if (start_anno.length < 1) {
        alert("There is no Start annotation for the word '"+objectui.job.labels[labels_to_check[lbl]]+"' Please add one.");
        return;
      } else if (start_anno.length > 1) {
        alert("There is more than one Start annotation for the word '"+objectui.job.labels[labels_to_check[lbl]]+"' Please delete one.");
        return;
      }
      if (end_anno.length < 1) {
        alert("There is no End annotation for the word '"+objectui.job.labels[labels_to_check[lbl]]+"' Please add one.");
        return;
      } else if (end_anno.length > 1) {
        alert("There is more than one End annotation for the word '"+objectui.job.labels[labels_to_check[lbl]]+"' Please delete one.");
        return;
      }
      console.log("stop here");

      // check if there are exactly two annotations
      // this hsould always be true given the checks above, but is good to check none the less.
      if (matched_tracks.length > 2){
        alert("There are more annotations than expected for the word '"+objectui.job.labels[labels_to_check[lbl]]+"' Please delete the extra annotations.");
        return;
      } else if (matched_tracks.length < 2){
        alert("The Start or End annotation is missing for the word '"+objectui.job.labels[labels_to_check[lbl]]+"' Please add the extra annotation.");
        return;
      }
    }

    // Go through the annotations and make sure that they are well-formed
    for (trackid in tracks_non_deleted)
    {
      console.log(tracks_non_deleted[trackid].label);
      // Check that all annotations are something other than the default, magic: ""
      if (objectui.job.labels[tracks_non_deleted[trackid].label] == magic_label ||
          objectui.job.labels[tracks_non_deleted[trackid].label] == fake_blank){
        alert("At least one label is blank. Please click the wrench in the box on the right, and type in the word that was fingerspelled");
        return;
      }

    }

    // This checks that the start and stop buttons are disabled to accept.
    // This has been disabled to allow for multiple annotations per video.
    // if ( objectui.startenabled != false || objectui.endenabled != false )
    // {
	  //   alert("Please mark both 'Start' and 'End' of the action in the video");
	  //   return;
    // }
    if ( objectui.endframe - objectui.startframe < 10 )
    {
      alert("Please select 'Start' and 'End' with a minimum separation of 10 frames");
	    return;
    }

    /*if (mturk_isassigned() && !mturk_isoffline())
    {
        if (!window.confirm("Are you sure you are ready to submit? Please " +
                            "make sure that the entire video is labeled and " +
                            "your annotations are tight.\n\nTo submit, " +
                            "press OK. Otherwise, press Cancel to keep " +
                            "working."))
        {
            return;
        }
    }*/

    var overlay = $('<div id="turkic_overlay"></div>').appendTo("#container");
    ui_disable();

    var note = $("<div id='submitdialog'></div>").appendTo("#container");

    function validatejob(callback)
    {
        // error types as defined in qa.py, these will trigger slightly different
        // warnings on the correction screen.
        var error_types = ["missing gap", "missing two hands",
        "missing star signer spelling error", "annotator spelling error",
        "spelling error", "missing annotation/misalignment"]
        server_post("validatejob", [job.jobid], tracks.serialize(),
            function(valid) {
                console.log(valid);
                if (valid == "all good")
                {
                    console.log("Validation was successful");
                    callback();
                }
                else if (max_tries < 1) {
                    note.remove();
                    overlay.remove();
                    ui_enable(1);
                    console.log("Validation failed and tries are up!");
                    total_failedvalidation();
                }
                else if (error_types.includes(valid))
                {
                    console.log(valid);
                    note.remove();
                    overlay.remove();
                    ui_enable(1);
                    console.log(max_tries);
                    max_tries = max_tries-1;
                    ui_annotator_error(valid);                }
                else
                {
                    note.remove();
                    overlay.remove();
                    ui_enable(1);
                    console.log("Validation failed!");
                    console.log(max_tries);
                    max_tries = max_tries-1;
                    ui_submit_failedvalidation();
                }
            });
    }

    function respawnjob(callback)
    {
        server_request("respawnjob", [job.jobid], function() {
            callback();
        });
    }

    function savejob(callback)
    {
        server_post("savejob", [job.jobid],
            tracks.serialize(), function(data) {
                callback()
            });
    }

    function finishsubmit(redirect)
    {
        if (mturk_isoffline())
        {
            window.setTimeout(function() {
                // note.remove();
                // overlay.remove();
                // ui_enable(1);
                redirect();
            }, 1000);
        }
        else
        {
            window.setTimeout(function() {
                redirect();
            }, 1000);
        }

    }

    if (job.training)
    {
        console.log("Submit redirect to train validate");

        note.html("Checking...");
        validatejob(function() {
            savejob(function() {
                mturk_submit(function(redirect) {
                    respawnjob(function() {
                        note.html("Good work! Please remember to accept the next HIT in order to move on and start annotating.");
                        finishsubmit(redirect);
                    });
                });
            });
        });
    }
    else
    {
        note.html("Saving... Please wait...");
        savejob(function() {
            mturk_submit(function(redirect) {
                finishsubmit(redirect);
                if (mturk_isoffline())
                {
                    note.html("Saved!");
                }
            });
        });
    }
}

function total_failedvalidation()
{
    $('<div id="turkic_overlay"></div>').appendTo("#container");
    var h = $('<div id="failedverificationdialog"></div>')
    h.appendTo("#container");

    h.append("<h1>Low Quality Work</h1>");
    h.append("<p>Sorry, but your work is low quality. We cannot allow you to continue annotating.</p>");
    h.append("<p>To leave, please press the Return <i>HIT button</i> above.</p>");
}

function ui_getjob_error(msg)
{
    $('<div id="turkic_overlay"></div>').appendTo("#container");
    var h = $('<div id="failedverificationdialog"></div>')
    h.appendTo("#container");

    h.append("<h1>Oops!</h1>");
    h.append(msg);
}

function ui_annotator_error(error_code)
{
    $('<div id="turkic_overlay"></div>').appendTo("#container");
    var h = $('<div id="failedverificationdialog"></div>')
    h.appendTo("#container");

    h.append("<h1>Low Quality Work</h1>");
    h.append("<p>Sorry, but your work is low quality. We would normally <strong>reject this assignment</strong>, but we are giving you the opportunity to correct your mistakes since you are a new user.</p>");

    h.append("<p>Please review the instructions again, double check your annotations, and submit again. Remember annotate only the letters that are fingerspelled.</p>");

    if (error_code == "missing gap")
    {
          h.append("<p>It looks like there was an error with annotating when the signer fingerspelled more than one word.</p>");
          h.append("<h3>More than one word</h3>")
          h.append("<p class='eng'>If a fingerspelling sequence includes multiple consecutive words with no intervening signs or the hand going down, label it as a single sequence with one start frame and one end frame.  Separate the words with a space if there is no visible break between them:<p>");
          h.append("<ul class='eng'><li>[word] [word]</li></ul>");
          h.append("<video class='asl'preload='none' width='360' height='240' src='Instructions_videos/05%20-%20What%20if%20the%20fingerspelling%20is%20not%20clear%20or%20there%20are%20other%20differences%3F/05%20-%20More%20than%20one%20word.mov' poster='Instructions_videos/05%20-%20What%20if%20the%20fingerspelling%20is%20not%20clear%20or%20there%20are%20other%20differences%3F/05%20-%20More%20than%20one%20word.png' controls />");

          h.append("<p>For example, if the signer fingerspelled S-T-A-R-T U-P with no visible pause or break, then the annotation is:</p>");
          h.append("<ul><li>start up</li></ul>");

          h.append("<p class='eng'>If there is a visible break between the words, use an exclamation mark to separate them (e.g. a slight pause, shift of the hand, etc).</p>")
          h.append("<ul class='eng'><li>[word]![word]</li></ul>");
          h.append("<p>For example, if the signer fingerspelled B-A-R-A-C-K O-B-A-M-A, then the annotation is:</p>");
          h.append("<ul><li>barack!obama</li></ul>");
    }
    else if (error_code == "missing two hands")
    {
      h.append("<p>It looks like there was an error with how many hands the signer was using.</p>");
      h.append("<h3>The signer uses both hands</h3>")
      h.append("<p class='eng'>If both hands fingerspell the same word, denote this as:</p>");
      h.append("<ul class='eng'><li>2:[word]</li></ul>");
      h.append("<video class='asl'preload='none' width='360' height='240' src='Instructions_videos/05%20-%20What%20if%20the%20fingerspelling%20is%20not%20clear%20or%20there%20are%20other%20differences%3F/04%20-%20The%20signer%20uses%20both%20hands.mov' poster='Instructions_videos/05%20-%20What%20if%20the%20fingerspelling%20is%20not%20clear%20or%20there%20are%20other%20differences%3F/04%20-%20The%20signer%20uses%20both%20hands.png' controls />");
      h.append("<p>For example, if the signer fingerspelled O-F-F with both hands, then the annotation is:</p>");
      h.append("<ul><li>2:off</li></ul>");

    }
    else if (error_code == "missing star signer spelling error")
    {
      h.append("<p>It looks like there was an error with the signer misspelling the word.</p>");
      h.append("<h3>Spelling mistakes</h3>")
      h.append("<p class='eng'>If the letters spelled differ from the word intended, please record both in the annotation with an asterisk separating them:</p>");
      h.append("<ul class='eng'><li>[letters spelled]*[letters intended]</li></ul>");
      h.append("<video class='asl'preload='none' width='360' height='240' src='Instructions_videos/05%20-%20What%20if%20the%20fingerspelling%20is%20not%20clear%20or%20there%20are%20other%20differences%3F/01%20-%20Spellling%20mistakes.mov' poster='Instructions_videos/05%20-%20What%20if%20the%20fingerspelling%20is%20not%20clear%20or%20there%20are%20other%20differences%3F/01%20-%20Spellling%20mistakes.png' controls />");
      h.append("<p>For example, if the signer spelled B-E-L-E-V-E but intended 'believe', your annotation should be:</p>");
      h.append("<ul><li>beleve*believe</li></ul>");
    }
    else if (error_code == "annotator spelling error")
    {
      h.append("<p>It looks like there was an error with how you spelled the word the signer was trying to fingerspell.</p>");
      h.append("<h3>Spelling mistakes</h3>")
      h.append("<p class='eng'>If the letters spelled differ from the word intended, please record both in the annotation with an asterisk separating them:</p>");
      h.append("<ul class='eng'><li>[letters spelled]*[letters intended]</li></ul>");
      h.append("<video class='asl'preload='none' width='360' height='240' src='Instructions_videos/05%20-%20What%20if%20the%20fingerspelling%20is%20not%20clear%20or%20there%20are%20other%20differences%3F/01%20-%20Spellling%20mistakes.mov' poster='Instructions_videos/05%20-%20What%20if%20the%20fingerspelling%20is%20not%20clear%20or%20there%20are%20other%20differences%3F/01%20-%20Spellling%20mistakes.png' controls />");
      h.append("<p>For example, if the signer spelled B-E-L-E-V-E but intended 'believe', your annotation should be:</p>");
      h.append("<ul><li>beleve*believe</li></ul>");
    }
    else if (error_code == "spelling error")
    {
      h.append("<p>It looks like you misspelled or mis-labelled one of the words.</p>");
    }
    else if (error_code == "missing annotation/misalignment")
    {
      h.append("<p>It looks like you are missing an annotation, have too many annotations, or the annotations are very misaligned. Please check the annotation beginnings and endings very carefully, and make sure that you have annotated every single fingerspelled word.</p>");
    }

    h.append("<p>When you are ready to continue, press the button below.</p>");

    $('<div class="button" id="failedverificationbutton">Try Again</div>').appendTo(h).button({
        icons: {
            primary: "ui-icon-refresh"
        }
    }).click(function() {
        $("#turkic_overlay").remove();
        h.remove();
    }).wrap("<div style='text-align:center;padding:5x 0;' />");
}

function ui_submit_failedvalidation()
{
    $('<div id="turkic_overlay"></div>').appendTo("#container");
    var h = $('<div id="failedverificationdialog"></div>')
    h.appendTo("#container");

    h.append("<h1>Low Quality Work</h1>");
    h.append("<p>Sorry, but your work is low quality. We would normally <strong>reject this assignment</strong>, but we are giving you the opportunity to correct your mistakes since you are a new user.</p>");

    h.append("<p>Please review the instructions, double check your annotations, and submit again. Remember:</p>");

    var str = "<ul>";
    str += "<li>Make your action interval as tightly as possible.</li>";
    str += "<li>Start of the action should always precede the End.</li>";
    str += "</ul>";

    h.append(str);

    h.append("<p>When you are ready to continue, press the button below.</p>");

    $('<div class="button" id="failedverificationbutton">Try Again</div>').appendTo(h).button({
        icons: {
            primary: "ui-icon-refresh"
        }
    }).click(function() {
        $("#turkic_overlay").remove();
        h.remove();
    }).wrap("<div style='text-align:center;padding:5x 0;' />");
}

function ui_showinstructions(job)
{
    console.log("Popup instructions");

    if ($("#instructionsdialog").size() > 0)
    {
        return;
    }

    eventlog("instructions", "Popup instructions");

    $('<div id="turkic_overlay"></div>').appendTo("#container");
    var h = $('<div id="instructionsdialog"></div>').appendTo("#container");
    var inst_controls = $('<div id="instructionscontrols"></div>').appendTo(h);

    $('<div class="button" id="instructionsclosetop" style="float: right;">Dismiss Instructions</div>').appendTo(inst_controls).button({
        icons: {
            primary: "ui-icon-circle-close"
        }
    }).click(ui_closeinstructions);

    $("<div id='languagecontrol'> \
    <label for='switchASL'>ASL</label> \
    <input type='checkbox' id='switchASL' checked = true/> \
    <label for='switchEnglish'>English</label> \
    <input type='checkbox' id='switchEnglish' /> \
    </div>").appendTo(inst_controls);

    instructions(job, h)

    // setup button set, and functions for toggling
    $("#languagecontrol").buttonset();

    // language controls setup
    // By default disable English and click on asl
    $(".eng").toggle();

    $("#switchEnglish").click(function() {
        $(".eng").toggle();
        // Check if both english and asl are disabled
        if (document.getElementById('switchASL').checked == false & document.getElementById('switchEnglish').checked == false ) {
          document.getElementById('switchASL').click();
        }
    });

    $("#switchASL").click(function() {
        $(".asl").toggle();

        // Check if both english and asl are disabled
        if (document.getElementById('switchASL').checked == false & document.getElementById('switchEnglish').checked == false ) {
          document.getElementById('switchEnglish').click();
        }
    });

    ui_disable();

    document.body.addEventListener("click", function(e) {
      var target = e.target || e.srcElement;
      var instructions_area = document.getElementById("instructionsdialog");
      var instructions_button = document.getElementById("instructionsbutton");

      // if the clicked object is in the instructions area or the instructions
      // button itself ignore the click. Additionally if the instructions are not up
      // ignore the click. If the instructions are up, and the click is outside of the
      // instructions, then close the instructions.
      if ( ( instructions_area != null && target !== instructions_area && !isChildOf(target, instructions_area) ) &&
           ( instructions_button != null && target !== instructions_button && !isChildOf(target, instructions_button) ) ) {
             ui_closeinstructions();
      }
    }, false);
}

function isChildOf(child, parent) {
  if (child.parentNode === parent) {
    return true;
  } else if (child.parentNode === null) {
    return false;
  } else {
    return isChildOf(child.parentNode, parent);
  }
}

function ui_closeinstructions()
{
    console.log("Popdown instructions");
    $("#turkic_overlay").remove();
    $("#instructionsdialog").remove();
    eventlog("instructions", "Popdown instructions");

    ui_enable();
}

function ui_disable()
{
    if (ui_disabled++ == 0)
    {
        $("#startbutton").button("option", "disabled", true);
        $("#endbutton").button("option", "disabled", true);
        $("#playbutton").button("option", "disabled", true);
        $("#rewindbutton").button("option", "disabled", true);
        $("#submitbutton").button("option", "disabled", true);
        $("#playerslider").slider("option", "disabled", true);

        console.log("Disengaged UI");
    }

    console.log("UI disabled with count = " + ui_disabled);
}

function ui_enable(flag)
{
    if (--ui_disabled == 0)
    {
	if ( typeof flag == 'undefined' ) {
	    $("#startbutton").button("option", "disabled", false);
	    $("#endbutton").button("option", "disabled", false);
	}
	$("#playbutton").button("option", "disabled", false);
	$("#rewindbutton").button("option", "disabled", false);
        $("#submitbutton").button("option", "disabled", false);
        $("#playerslider").slider("option", "disabled", false);

        console.log("Engaged UI");
    }

    ui_disabled = Math.max(0, ui_disabled);

    console.log("UI disabled with count = " + ui_disabled);
}
