function instructions(job, h)
{
    var spacer_div = "<div style='clear:both;margin:50px'></div>";
    var no_spacer_div = "<div style='clear:both;margin:5px'></div>";
    h.append("<h1>Important Instructions</h1>");
    h.append("<p>In this task, we ask you to annotate a video. You are to mark the start and end of all fingerspelled words in the video. Then you will be asked to type in what word was fingerspelled. These instructions will give you tips on how to best use our tool.</p>");
    h.append("<video preload='none' width='360' height='240' src='Instructions_videos/01%20-%20Introduction/01%20-%20Intro.mov' controls>");
    h.append("<video preload='none' width='360' height='240' src='Instructions_videos/01%20-%20Introduction/02%20-%20Please watch.mov' controls>");

    h.append('<p></p>');
    h.append("<img src='images/start-stop.png' alt='An image showing the start and stop buttons' align='right' style='border:1px solid black; border-style: inset; margin-right: 100px' width=250>");
    h.append("<h2>Crash Course</h2>");
    // English
    h.append("<div class='eng'><ul> \
    <li>There might be more than one fingerspelled word in the video shown.</li> \
    <li>Make the beginning and end annotations for the fingerspelled word as close to the beginning and ending of the word as possible.</li> \
    <li>The start of the fingerspelled word should always be before the end.</li> \
    <li>We will hand review your work.</li> \
    <li>Please only annotate fingerspelled words. Plese, don't annotate initialized signs with just one letter handshape like <a href='https://youtu.be/RXFxKLQPDz0'  target='_blank'> LIBRARY</a> or <a href='https://youtu.be/Yuif86dOrEY'  target='_blank'>FAMILY</a>.</li> \
    <li>Sometimes the fingerspelled word might be cut off at the beginning or the end of the video. If it is, please type in just the letters that you can see.</li> \
    <li>If the fingerspelled word is not clear, has a pause, has a mistake, or the signer uses both hands, see the section <strong>What if the fingerspelling is not clear or there are other differences?</strong> below for instructions about how to annotate these.</li> \
    <li>Sometimes the fingerspelled word might include numbers. If it does inclue numbers, do not annotate that word.</li> \
    <li>If the video includes any offensive or adult content, please press the <strong>Report offensive video</strong> button to report the video as offensive.</li> \
    <li>It is possible that the video might not have any fingerspelled words. But it is important to check carefully. After viewing the whole video, if there are no fingerspelled words, please press the <strong>Submit HIT</strong> button</li> \
    </ul></div>");
    // ASL
    h.append("<div class='asl'> \
    <video preload='none' width='360' height='240' src='Instructions_videos/02%20-%20Crash%20course/01%20-%20There%20might%20be%20more.mov' controls/>\
    <video preload='none' width='360' height='240' src='Instructions_videos/02%20-%20Crash%20course/02%20-%20Make%20the%20beginning.mov' controls/>\
    <video preload='none' width='360' height='240' src='Instructions_videos/02%20-%20Crash%20course/03%20-%20The%20start%20of.mov' controls/>\
    <video preload='none' width='360' height='240' src='Instructions_videos/02%20-%20Crash%20course/04%20-%20We%20will%20hand.mov' controls/>\
    <video preload='none' width='360' height='240' src='Instructions_videos/02%20-%20Crash%20course/05%20-%20Please%20only%20annotate.mov' controls/>\
    <video preload='none' width='360' height='240' src='Instructions_videos/02%20-%20Crash%20course/06%20-%20Sometimes%20the%20fingerspelled%20cut%20off.mov' controls/>\
    <video preload='none' width='360' height='240' src='Instructions_videos/02%20-%20Crash%20course/07%20-%20If%20fingerspelled%20word%20is%20not%20%20clear.mov' controls/>\
    <video preload='none' width='360' height='240' src='Instructions_videos/02%20-%20Crash%20course/08%20-%20Sometimes%20fingerspelled%20word%20incl%20%20nbr.mov' controls/>\
    <video preload='none' width='360' height='240' src='Instructions_videos/02%20-%20Crash%20course/09%20-%20If%20video%20incl%20any%20offensive.mov' controls/>\
    <video preload='none' width='360' height='240' src='Instructions_videos/02%20-%20Crash%20course/10%20-%20It%20is%20possible%20video%20might%20not%20have%20%20any.mov' controls/>\
    </div>");

    h.append(spacer_div);
    h.append("<h2>Getting Started</h2>");
    // h.append("<div style='float: right; width:375px'></div>");

    h.append("<p>Press the <strong>Play</strong> button to play the video. <strong>Pause</strong> the video when you reach the frame where the fingerspelled word starts. Adjust the player slider to go to the exact frame in which the fingerspelled word starts</p>");

    h.append(spacer_div);
    h.append("<img src='images/start-crop.png' alt='An image of the start button having been pressed and is now disabled. Below that a start annotation has appeared in a light purple box.'  align='right' style='border:1px solid black; border-style: inset; margin-right: 100px' width=250>")
    h.append("<p>Click the <strong>Start</strong> button to mark the start of the fingerspelled word. </p>");

    h.append("<p>On the right, directly below the Start button, you will find a colorful box. The box shows you the frame number corresponding to the start or end of the fingerspelled word you just annotated.</p>");

    if (job.skip > 0)
    {
        h.append("<p>Press the <strong>Play</strong> button. The video will play.</p>");
    }
    else
    {
        h.append("<p>Press the <strong>Play</strong> button. The video will begin to play forward. </p>");
    }

    h.append(spacer_div);
    h.append("<img src='images/text-box.png'  align='right' alt='An image showing the textbox to ener the word value.' style='border:1px solid black; border-style: inset; clear:both; margin-right: 100px' width=250>")
    h.append("<p>Similarly, click the <strong>End</strong> button to mark the end of the fingerspelled word.</p>");
    h.append("<p>After you click <strong>End</strong>, a text box will appear for you to type in what word was fingerspelled.</p>")
    h.append(no_spacer_div);
    h.append("<img src='images/submit-word.png' alt='An image of a mouse clicking on the checkmark to submit the new word annotation.'  align='right' style='border:1px solid black; border-style: inset; clear:both' width=350>")
    h.append("<p>Once you have typed the word in, click the checkmark next to it or press enter.</p>");

    h.append("<p>If you make a mistake typing in the word, don't worry, you can always change it by clicking on the word or the wrench icon. (This process is described more in the section below)</p>");
    h.append("<p>If you need to change the location of the start or end of the word, just press the trash can icon to delete either, and then use the <strong>Start</strong> or <strong>End</strong> button above to make a new annotation in the correct place. (This process is described more in the section below)</p>");

    h.append(spacer_div);
    h.append("<img src='images/boxes.png'  align='right' alt='An image showing the annotation bar along the bottom of the video.' style='border:1px solid black; border-style: inset; clear:both; margin-right: 100px' width=250>")
    h.append("<p>Boxes will appear below the video to provide information about the temporal location of start and end annotations along the player slider.</p>");

    h.append(no_spacer_div);
    h.append("<img src='images/full-word-anno-only.png' align='right' alt='An image showing the start and end of a word with the same label: only' style='border:1px solid black; border-style: inset; clear:both; margin-right: 100px' width=250>");
    h.append("<p>There may be more than one fingerspelled word in the video: Now repeat this process for each fingerspelled word in the video.</p>");
    h.append("<p>Each word must have a start and a stop. Each word will have its own color: the start and the stop boxes for each word will be the same color and have the same word label. If they do not match in color or have different word labels, please delete both of them and start again.</p>");
    h.append("<p>There may also be no fingerspelled words at all. If there are no fingerspelled words, watch the whole video and then press the <strong>Submit HIT</strong> button</p>")

    h.append(no_spacer_div);
    h.append("<p>When you are ready to submit your work, rewind the video and watch it through one more time. Do the start and end annotations you specified cover the complete fingerspelled word? After you have checked your work, press the <strong>Submit HIT</strong> button. We will pay you as soon as possible.</p>");

    h.append(spacer_div);
    h.append("<h2>Making changes to words</h2>")
    h.append("<p>To check if the start label was marked on the correct frame, drag the video player slider to a frame where you think the fingerspelled word started, and verify if the frame number specified on the colorful box on the right and the current frame number shown beside the video player's slider are the same.</p>");

    h.append(spacer_div);
    h.append("<img src='images/change.png' alt='An image showing a mouse hovering over the change button (wrench) of an annotation.' align='right' style='border:1px solid black; border-style: inset; clear: both' width=350>");
    h.append("<p>If you want to make changes to the word itself, click the wrench icon or click on the word itself.</p>");
    h.append(no_spacer_div);
    h.append("<img src='images/change-text-box.png' alt='An image showing a textbox appear for changing a word' align='right' style='border:1px solid black; border-style: inset; clear: both; margin-right: 100px' width=250>");
    h.append("<p>This will bring up a new text box. Please enter the new word here.</p>");
    h.append(no_spacer_div);
    h.append("<img src='images/new-word.png' alt='An image showing a mouse hovering over the checkmark of an annotation to submit the new word.' align='right' style='border:1px solid black; border-style: inset; clear: both' width=350>");
    h.append("<p>Press the checkmark when you are done.</p>");
    h.append(no_spacer_div);
    h.append("<img src='images/full-word-anno.png' align='right' alt='An image showing the start and end of a word with the same label: new' style='border:1px solid black; border-style: inset; clear:both; margin-right: 100px' width=250>");
    h.append("<p>This process will update both the start and the end for that word, but please make sure that both thw start and the end annotation for that word match. If they don't match, please delete both start and end annotations, and start over.</p>");

    h.append(spacer_div);
    // h.append("<p>The Start and End buttons will be disabled after they have been marked in the video.</p>");
    h.append("<img src='images/delete.png' alt='An image showing a mouse hovering over the delete button of an annotation.' align='right' style='border:1px solid black; border-style: inset' width=350>");
    h.append("<p>If you want to make changes to the time of a start or stop annotation, <strong>delete</strong> the existing one by clicking the delete icon (the trashcan) on the top right corner of the colorful boxes on the right, and create a new annotation at the correct time. You will not need to re-enter the word again, but make sure that both the start and the end annotations for that word match. If they don't match, please delete both start and end annotations, and start over.</p>");


    h.append(spacer_div);
    h.append("<h2>What if the fingerspelling is not clear or there are other differences?</h2>");
    h.append("<h3>Spelling mistakes</h3>")
    h.append("<p>If the letters spelled differ from the word intended, please record both in the annotation with an asterisk separating them:</p>");
    h.append("<ul><li>[letters spelled]*[letters intended]</li></ul>");
    h.append("<p>For example, if the signer spelled B-E-L-E-V-E but intended 'believe', your annotation should be:</p>");
    h.append("<ul><li>beleve*believe</li></ul>");
    h.append("<h3>Unsure about the letters</h3>")
    h.append("<p>If you are unsure of which letters were spelled, you may indicate this with a question mark at the end:</p>");
    h.append("<ul><li>[best guess at letters]?</li></ul>");
    h.append("<p>For example, if the word could be 'glum' or 'gum', then the annotation is:</p>");
    h.append("<ul><li>glum?</li><li>gum?</li></ul>");
    h.append("<h3>A letter is not fully clear</h3>")
    h.append("<p>If a letter is not clearly articulated, but there was an attempt to spell it, include that letter in [letters spelled].  However, if the signer has blatantly left out a letter or misspelled the word, then record the mistake in [letters spelled] and the correct spelling in [letters meant].  For example, if the signer intended to spell 'veteran' and the 'r' is not fully articulated but you can still tell that they meant 'r',' then the annotation is:</p>")
    h.append("<ul><li>veteran</li></ul>");
    h.append("<p>but if the signer mixed up two letters, the annotation is:</p>");
    h.append("<ul><li>vetearn*veteran</li></ul>");
    h.append("<h3>The signer uses both hands</h3>")
    h.append("<p>If both hands fingerspell the same word, denote this as:</p>");
    h.append("<ul><li>2:[word]</li></ul>");
    h.append("<p>For example, if the signer fingerspelled O-F-F with both hands, then the annotation is:</p>");
    h.append("<ul><li>2:off</li></ul>");
    h.append("<h3>More than one word</h3>")
    h.append("<p>If a fingerspelling sequence includes multiple consecutive words with no intervening signs or the hand going down, label it as a single sequence with one start frame and one end frame.  Separate the words with a space if there is no visible break between them:<p>");
    h.append("<ul><li>[word] [word]</li></ul>");
    h.append("<p>For example, if the signer fingerspelled S-T-A-R-T U-P with no visible pause or break, then the annotation is:</p>");
    h.append("<ul><li>start up</li></ul>");

    h.append("<p>If there is a visible break between the words, use an exclamation mark to separate them (e.g. a slight pause, shift of the hand, etc).</p>")
    h.append("<ul><li>[word]![word]</li></ul>");
    h.append("<p>For example, if the signer fingerspelled B-A-R-A-C-K O-B-A-M-A, then the annotation is:</p>");
    h.append("<ul><li>barack!obama</li></ul>");
    h.append("<h3>Do not annotate words that include numbers</h3>")
    h.append("<p>Finally, if a fingerspelling sequence includes numbers, please do not annotate that word.<p>");

    h.append(spacer_div);
    h.append("<h2>How We Accept Your Work</h2>");
    h.append("<p>We will hand review your work and we will only accept high quality work. Your annotations are not compared against other workers. Follow these guidelines to ensure your work is accepted:</p>");


    h.append(spacer_div);
    h.append("<h2>Advanced Features</h2>");
    h.append("<p>We have provided some advanced tools for videos that are especially difficult. Clicking the <strong>Options</strong> button will enable the advanced options.</p>");
    h.append("<ul>" +
        // "<li>Clicking <strong>Hide Boxes?</strong> will temporarily hide the boxes on the screen. This is useful when the scene becomes too crowded. Remember to click it again to show the boxes again!</li>" +
        "<li>The <strong>Slow</strong>, <strong>Normal</strong>, <strong>Fast</strong> buttons will change how fast the video plays back. If the video becomes confusing, slowing the play back speed may help.</li>" +
    "</ul>");

    h.append("<h3>Keyboard Shortcuts</h3>");
    h.append("<p>These keyboard shortcuts are available for your convenience:</p>");
    h.append('<ul class="keyboardshortcuts">' +
        // '<li><code>t</code> toggles play/pause on the video</li>' +
        // '<li><code>r</code> rewinds the video to the start</li>' +
        // '<li><code>h</code> hides/shows the boxes (only after clicking Options button)</li>' +
        '<li><code>.</code> jump the video forward a bit</li>' +
        '<li><code>,</code> jump the video backward a bit</li>' +
        '<li><code>&gt;</code> step the video forward a tiny bit</li>' +
        '<li><code>&lt;</code> step the video backward a tiny bit</li>' +
        '</ul>');
}
