var ui_disabled = 0;

function ui_build(job)
{
    var screen = ui_setup(job);
    var videoframe = $("#videoframe");
    var player = new VideoPlayer(videoframe, job);
    var tracks = new TrackCollection(player, job);
    var objectui = new TrackObjectUI($("#startbutton"), $("#objectcontainer"), videoframe, job, player, tracks, $("#endbutton"));

    ui_setupbuttons(job, player, tracks);
    ui_setupslider(player);
    ui_setupsubmit(job, tracks, objectui);
    ui_setupclickskip(job, player, tracks, objectui);
    // ui_setupkeyboardshortcuts(job, player);
    ui_setupkeyboardshortcuts_inputsafe(job, player);
    ui_loadprevious(job, objectui);

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
            "<td><div id='instructionsbutton' class='button'>Instructions</div><div id='instructions'>Annotate the beginning and end of the fingerspelled word in the following video. <br/> Then type the word that was finerspelled into the box to the right of the video.</td>" +
            "<td><div id='topbar'></div></td>" +
        "</tr>" +
        "<tr>" +
              "<td><div id='videoframe'></div></td>" +
              "<td rowspan='2'><div id='sidebar'></div></td>" +
          "</tr><tr style='height: 15px;' ></tr>" +
          "<tr>" +
              "<td><div id='bottombar'></div></td>" +
              "<td><div id='frameinfobar'></div></td>" +
          "</tr>" +
          "<tr>" +
              "<td><div id='advancedoptions'></div></td>" +
              "<td><div id='submitbar'></div></td>" +
          "</tr>" +
      "</table>").appendTo(screen).css("width", "100%");

//    job.width = job.width + 200;
//    job.height = job.height + 200;
    var playerwidth = Math.max(720, job.width);

    $("#videoframe").css({"width": job.width + "px",
                          "height": job.height + "px",
                          "margin": "0 auto"})
                    .parent().css("width", playerwidth + "px");

    $("#sidebar").css({"height": job.height + "px",
                       "width": "205px"});

    $("#annotatescreen").css("width", (playerwidth + 205) + "px");

    $("#frameinfobar").css({"padding-left": "20px", "width": "150px"});
    $("#frameinfobar").append("<div style='float: left;'><strong>Frame: </strong></div><div id='frameinfo'></div>");
    $("#frameinfo").css({"width": "30px", "padding-left": "10px", "float": "left"});

    $("#bottombar").append("<div id='playerslider'></div>");
    $("#bottombar").append("<div class='button' id='rewindbutton'>Rewind</div> ");
    $("#bottombar").append("<div class='button' id='playbutton'>Play</div> ");

    $("#topbar").append("<div id='newobjectcontainer'>" +
        "<div class='button' id='startbutton'>Start</div>" +
        "<div class='button' id='endbutton'>End</div></div></div>");

    $("<div id='objectcontainer'></div>").appendTo("#sidebar");

    $("<div class='button' id='openadvancedoptions'>Options</div>")
        .button({
            icons: {
                primary: "ui-icon-wrench"
            }
        }).appendTo($("#advancedoptions").parent()).click(function() {
                eventlog("options", "Show advanced options");
                $(this).remove();
                $("#advancedoptions").show();
            });

    $("#advancedoptions").hide();

    $("#advancedoptions").append(
    "<input type='checkbox' id='annotateoptionsresize'>" +
    // "<label for='annotateoptionsresize'>Disable Resize?</label> " +
    "<input type='checkbox' id='annotateoptionshideboxes'>" +
    "<label for='annotateoptionshideboxes'>Hide Boxes?</label> " +
    "<input type='checkbox' id='annotateoptionshideboxtext'>" +
    "<label for='annotateoptionshideboxtext'>Hide Labels?</label> ");

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
        marginTop: "6px",
        width: parseInt(slider.parent().css("width")) - 200 + "px",
        float: "right"
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
        ui_submit(job, tracks, objectui);
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


    // Go through the annotations and make sure that they are well-formed
    var magic_label = ""; // magic label to ensure the annotations are not default
    for (trackid in tracks_non_deleted)
    {
      console.log(tracks_non_deleted[trackid].label);
      // Check that all annotations are something other than the default, magic: ""
      if (objectui.job.labels[tracks_non_deleted[trackid].label] == magic_label){
        alert("At least one label is blank. Please click the wrench in the box on the right, and type in the word that was fingerspelled");
        return;
      }

    }

    // Currently this checks that the start and stop buttons are disabled to accept.
    // This should be changed to look through the (not deleted) tracks like is done above
    // and confirm that each annotation has a start and end.
    if ( objectui.startenabled != false || objectui.endenabled != false )
    {
	    alert("Please mark both 'Start' and 'End' of the action in the video");
	    return;
    }
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
        server_post("validatejob", [job.jobid], tracks.serialize(),
            function(valid) {
                if (valid)
                {
                    console.log("Validation was successful");
                    callback();
                }
                else
                {
                    note.remove();
                    overlay.remove();
                    ui_enable(1);
                    console.log("Validation failed!");
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
                note.remove();
                overlay.remove();
                ui_enable(1);
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
                        note.html("Good work!");
                        finishsubmit(redirect);
                    });
                });
            });
        });
    }
    else
    {
        note.html("Saving...");
        savejob(function() {
            mturk_submit(function(redirect) {
                note.html("Saved!");
                finishsubmit(redirect);
            });
        });
    }
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

    $('<div class="button" id="instructionsclosetop" style="position: fixed; right: 140;">Dismiss Instructions</div>').appendTo(h).button({
        icons: {
            primary: "ui-icon-circle-close"
        }
    }).click(ui_closeinstructions);

    instructions(job, h)

    ui_disable();
}

function ui_closeinstructions()
{
    console.log("Popdown instructions");
    $("#turkic_overlay").remove();
    $("#instructionsdialog").remove();
    eventlog("instructions", "Popdown instructions");

    ui_enable(1);
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
