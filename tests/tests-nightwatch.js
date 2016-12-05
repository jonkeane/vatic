module.exports = {
  'basic UI' : function (browser) {
    browser.url('https://vatic-dev.ttic.edu/?id=1&hitId=offline');
    // check for the instructionsbutton, allow waiting up to 10 seconds
    browser.expect.element('#instructionsbutton').to.be.visible.before(10000);

    // check that there is a start button, and it is enable (aria-disabled = false)
    browser.expect.element('#startbutton').to.be.visible
      .to.have.attribute("aria-disabled").equals("false");

    // check that there is an end button, and it is enable (aria-disabled = false)
    browser.expect.element('#endbutton').to.be.visible
      .to.have.attribute("aria-disabled").equals("false");

    // check that the intro on the right is visible
    browser.expect.element('#objectcontainer p:nth-child(1)').to.be.visible
      .text.to.equal('Please watch the video attentively.');
    browser.expect.element('#objectcontainer p:nth-child(2)').to.be.visible;
    browser.expect.element('#objectcontainer p:nth-child(2)').text.to.contain('Whenever you see fingerspelling, mark the start and');
    browser.expect.element('#objectcontainer p:nth-child(3)').to.be.visible;
    browser.expect.element('#objectcontainer p:nth-child(3)').text.to.contain('The segment you mark should include');

    // check that the play button is present, and disabled and the rewind is disabled
    browser.expect.element('#bottombar #playbutton').to.be.visible
      .to.be.enabled;
    browser.expect.element('#bottombar #rewindbutton').to.be.visible
      .to.have.attribute('disabled').equals('true');
    },


  'add one annotation' : function (browser) {
    // click the start button
    browser.click('#startbutton');
    browser.expect.element("#startbutton").to.have.attribute("aria-disabled").equals("true");
    // check that the annotation shows up
    browser.expect.element('#objectcontainer .trackobject').to.be.visible;
    browser.expect.element('#objectcontainer .trackobject p').to.be.visible;
    browser.expect.element('#objectcontainer div p:nth-child(5) strong').text.to.equal('Start - Frame:0');
    browser.expect.element('#videoframe > div.boundingbox.ui-resizable.ui-draggable.ui-draggable-disabled.ui-state-disabled.ui-resizable-disabled.boundingboxlocked.ui-resizable-autohide').to.be.visible;
    // check the color coordinates

    // check that there is an end button, and it is enable (aria-disabled = false)
    browser.expect.element('#endbutton').to.be.visible
      .to.have.attribute("aria-disabled").equals("false");

    // check that there is a warning if the slider isn't moved
    browser.click('#endbutton');
    // the alert has the right text
    browser.getAlertText(function(result){
      this.assert.equal(result.value, 'End frame must be after the start frame');
      browser.acceptAlert();
    });
    // the end button is still visible
    browser.expect.element('#endbutton').to.be.visible
      .to.have.attribute("aria-disabled").equals("false");

    // move the slider
    browser
      .useCss()
      .moveToElement('#playerslider',  0,  0)
      .mouseButtonDown(0)
      .moveToElement('#playerslider',  200,  0) // Move to offset position of 200(x) 0(y)
      .mouseButtonUp(0);

    // click the end button
    browser.click('#endbutton');
    // the end button will be visible again
    // browser.expect.element("#endbutton").to.have.attribute("aria-disabled").equals("true");
    // check that the annotation shows up
    browser.expect.element('#objectcontainer .trackobject').to.be.visible;
    browser.expect.element('#objectcontainer .trackobject p').to.be.visible;
    browser.expect.element('#objectcontainer > div:nth-child(1) > p:nth-child(5) > strong').text.to.equal('End - Frame:45');
    // check that there is an end button, and it is enable (aria-disabled = false)
    // browser.expect.element('#endbutton').to.be.visible
    //   .to.have.attribute("aria-disabled").equals("false");

    // enter text: #newWord
    browser.expect.element('#newWord').to.be.visible;
    browser.setValue('#newWord', ['testword', browser.Keys.ENTER]);

    // check that the word is the same
    browser.expect.element('#objectcontainer > div:nth-child(1) > p.trackobjectheader.change1word > strong').text.to.equal('testword').before(1000);
    browser.expect.element('#objectcontainer > div:nth-child(2) > p.trackobjectheader.change0word > strong').text.to.equal('testword');
  },


  'cancel the annotation change' : function (browser) {
    browser.click('#objectcontainer > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div.ui-icon.ui-icon-wrench.change1word');
    browser.expect.element('#newWord').to.be.visible;

    // cancel
    browser.setValue('#newWord', 'testworddontsave');
    // click the cancel
    browser.click('#objectcontainer > div:nth-child(1) > div:nth-child(2) > div:nth-child(4) > div.ui-icon.ui-icon-close.close1word')
    browser.expect.element('#objectcontainer > div:nth-child(1) > p.trackobjectheader.change1word > strong').text.to.equal('testword').before(1000);
    browser.expect.element('#objectcontainer > div:nth-child(2) > p.trackobjectheader.change0word > strong').text.to.equal('testword');
  },

  'change the annotation value' : function (browser) {
    browser.click('#objectcontainer > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div.ui-icon.ui-icon-wrench.change1word');
    browser.expect.element('#newWord').to.be.visible;

    browser.setValue('#newWord', 'testwordtwo');
    // use the check mark
    browser.click('#objectcontainer > div:nth-child(1) > div:nth-child(2) > div:nth-child(3) > div.ui-icon.ui-icon-check.submit1word')
    browser.expect.element('#objectcontainer > div:nth-child(1) > p.trackobjectheader.change1word > strong').text.to.equal('testwordtwo').before(1000);
    browser.expect.element('#objectcontainer > div:nth-child(2) > p.trackobjectheader.change0word > strong').text.to.equal('testwordtwo');
  },


  'delete one end annotation' : function (browser) {
    browser.expect.element('#objectcontainer > div:nth-child(1)').to.be.visible;
    browser.expect.element('#objectcontainer > div:nth-child(1) > p:nth-child(5) > strong').text.to.equal('End - Frame:45');
    browser.click('#trackobject1delete');
    // the alert has the right text
    browser.getAlertText(function(result){
      this.assert.equal(result.value, 'Delete the testwordtwo End annotation?');
      browser.acceptAlert();
    });

    browser.pause(500);
    browser.expect.element('#objectcontainer > div:nth-child(1)').to.be.visible;
    // make sure the end annotation is deleted, and the start has taken its place
    browser.expect.element('#objectcontainer > div:nth-child(1) > p:nth-child(5) > strong').text.to.not.equal('End - Frame:45');
    browser.expect.element('#objectcontainer > div:nth-child(1) > p:nth-child(5) > strong').text.to.equal('Start - Frame:0');

    // confirm the start button is disabled, and end button is enabled.
    browser.expect.element('#startbutton').to.be.visible
      .to.have.attribute("aria-disabled").equals("true");
    browser.expect.element('#endbutton').to.be.visible
      .to.have.attribute("aria-disabled").equals("false");
  },

  'add the end back' : function (browser) {
    // move the slider
    browser
      .useCss()
      .moveToElement('#playerslider > a',  2,  2)
      .mouseButtonDown(0)
      .moveToElement('#playerslider',  300,  0) // Move to offset position of 200(x) 0(y)
      .mouseButtonUp(0);

    browser.click('#endbutton');
    browser.expect.element('#objectcontainer > div:nth-child(1)').to.be.visible;
    browser.expect.element('#objectcontainer > div:nth-child(1) > p:nth-child(5) > strong').text.to.equal('End - Frame:69');

    // confirm that the value of the new annotation is the same as the old one that was deleted
    browser.expect.element('#objectcontainer > div:nth-child(1) > p.trackobjectheader.change2word > strong').text.to.equal('testwordtwo').before(1000);
    browser.expect.element('#objectcontainer > div:nth-child(2) > p.trackobjectheader.change0word > strong').text.to.equal('testwordtwo');

    // confirm the start adn end buttons are both enabled
    browser.expect.element('#startbutton').to.be.visible
      .to.have.attribute("aria-disabled").equals("false");
    browser.expect.element('#endbutton').to.be.visible
      .to.have.attribute("aria-disabled").equals("false");
  },


  'add one annotation, reverse order' : function (browser) {
    // move the slider
    browser
      .useCss()
      .moveToElement('#playerslider > a',  2,  2)
      .mouseButtonDown(0)
      .moveToElement('#playerslider',  400,  0) // Move to offset position of 200(x) 0(y)
      .mouseButtonUp(0);

    // click the end button
    browser.click('#endbutton');
    // the end button will be visible again
    // browser.expect.element("#endbutton").to.have.attribute("aria-disabled").equals("true");
    // check that the annotation shows up
    browser.expect.element('#objectcontainer .trackobject').to.be.visible;
    browser.expect.element('#objectcontainer .trackobject p').to.be.visible;
    browser.expect.element('#objectcontainer > div:nth-child(1) > p:nth-child(5) > strong').text.to.equal('End - Frame:92');
    // check that there is an end button, and it is disabled (aria-disabled = true)
    browser.expect.element('#endbutton').to.be.visible
      .to.have.attribute("aria-disabled").equals("true");
    // check that there is an start button, and it is enable (aria-disabled = false)
    browser.expect.element('#startbutton').to.be.visible
      .to.have.attribute("aria-disabled").equals("false");

    // enter text: #newWord
    browser.expect.element('#newWord').to.be.visible;
    browser.setValue('#newWord', ['newword', browser.Keys.ENTER]);
    // check that the word is the correct
    browser.expect.element('#objectcontainer > div:nth-child(1) > p.trackobjectheader.change3word > strong').text.to.equal('newword').before(1000);

    // move the slider (in the wrong direction)
    browser
      .useCss()
      .moveToElement('#playerslider > a',  2,  2)
      .mouseButtonDown(0)
      .moveToElement('#playerslider',  500,  0) // Move to offset position of 200(x) 0(y)
      .mouseButtonUp(0);

    // check that there is a warning if the slider is moved in the wrong direction
    browser.click('#startbutton');
    // the alert has the right text
    browser.getAlertText(function(result){
      this.assert.equal(result.value, 'Start frame must be before the end frame');
      browser.acceptAlert();
    });
    // the end button is still visible
    browser.expect.element('#startbutton').to.be.visible
      .to.have.attribute("aria-disabled").equals("false");

    // move the slider (in the wrong direction)
    browser
      .useCss()
      .moveToElement('#playerslider > a',  2,  2)
      .mouseButtonDown(0)
      .moveToElement('#playerslider',  350,  0) // Move to offset position of 200(x) 0(y)
      .mouseButtonUp(0);

    // click the start button
    browser.click('#startbutton');
    // check that the annotation shows up
    browser.expect.element('#objectcontainer .trackobject').to.be.visible;
    browser.expect.element('#objectcontainer .trackobject p').to.be.visible;
    browser.expect.element('#objectcontainer div p:nth-child(5) strong').text.to.equal('Start - Frame:80');
    // check that the word is the correct
    browser.expect.element('#objectcontainer > div:nth-child(1) > p.trackobjectheader.change4word > strong').text.to.equal('newword').before(1000);
    // check that the word is the correct
    browser.expect.element('#objectcontainer > div:nth-child(2) > p.trackobjectheader.change3word > strong').text.to.equal('newword').before(1000);
  },


  'delete start and end annotation' : function (browser) {
    browser.expect.element('#objectcontainer .trackobject p').to.be.visible;
    browser.expect.element('#objectcontainer div p:nth-child(5) strong').text.to.equal('Start - Frame:80');
    browser.expect.element('#objectcontainer .trackobject p').to.be.visible;
    browser.expect.element('#objectcontainer > div:nth-child(2) > p:nth-child(5) > strong').text.to.equal('End - Frame:92');

    // delete the start track
    browser.click('#trackobject4delete');

    // the alert has the right text
    browser.getAlertText(function(result){
      this.assert.equal(result.value, 'Delete the newword Start annotation?');
      browser.acceptAlert();
    });

    browser.expect.element('#objectcontainer div p:nth-child(5) strong').text.to.not.equal('Start - Frame:80').before(1000);
    browser.expect.element('#objectcontainer div p:nth-child(5) strong').text.to.equal('End - Frame:92');


    // delete the start track
    browser.click('#trackobject3delete');

    // the alert has the right text
    browser.getAlertText(function(result){
      this.assert.equal(result.value, 'Delete the newword End annotation?');
      browser.acceptAlert();
    });

    browser.expect.element('#objectcontainer div p:nth-child(5) strong').text.to.not.equal('End - Frame:92').before(1000);
    browser.expect.element('#objectcontainer div p:nth-child(5) strong').text.to.equal('End - Frame:69');

    // check that the start/end buttons are enabled (aria-disabled = false)
    browser.expect.element('#endbutton').to.be.visible
      .to.have.attribute("aria-disabled").equals("false");
    browser.expect.element('#startbutton').to.be.visible
      .to.have.attribute("aria-disabled").equals("false");
  },

  'Test end' : function (browser) {
  	browser
    .pause(2000)
	  .end();
  }
};
