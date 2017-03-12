module.exports = {
  'basic UI' : function (browser) {
    browser.url('https://vatic.ttic.edu/?id=49&hitId=offline');       // this must be the greg/s084 video
    // browser.url('https://vatic-dev.ttic.edu/?id=1&hitId=offline'); // this must be the greg/s084 video
    // check for the instructionsbutton, allow waiting up to 100 seconds
    browser.expect.element('#instructionsbutton').to.be.visible.before(100000);

    // check that there is a start button, and it is enable (aria-disabled = false)
    browser.expect.element('#startbutton').to.be.visible
      .to.have.attribute("aria-disabled").equals("false");

    // check that there is an end button, and it is enable (aria-disabled = false)
    browser.expect.element('#endbutton').to.be.visible
      .to.have.attribute("aria-disabled").equals("false");

    // check that the save work button is disabled
    browser.expect.element('#submitbutton').to.be.visible
      .to.have.attribute("aria-disabled").equals("true")

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
    // move the slider
    browser
      .useCss()
      .moveToElement('#playerslider > a',  2,  2)
      .mouseButtonDown(0)
      .moveToElement('#playerslider',  100,  0) // Move to offset position of 200(x) 0(y)
      .mouseButtonUp(0);

    // click the start button
    browser.click('#startbutton');
    browser.expect.element("#startbutton").to.have.attribute("aria-disabled").equals("true");
    // check that the annotation shows up
    browser.expect.element('#objectcontainer .trackobject').to.be.visible;
    browser.expect.element('#objectcontainer .trackobject p').to.be.visible;
    browser.expect.element('#objectcontainer > div:nth-child(1) > div:nth-child(1) > p:nth-child(5) > strong').text.to.equal('Start - Frame:25');
    //browser.expect.element('#videoframe > div.boundingbox.ui-resizable.ui-draggable.ui-draggable-disabled.ui-state-disabled.ui-resizable-disabled.boundingboxlocked.ui-resizable-autohide').to.be.visible;
    // check the color coordinates

    // check that there is an end button, and it is enable (aria-disabled = false)
    browser.expect.element('#endbutton').to.be.visible
      .to.have.attribute("aria-disabled").equals("false");

    // check that the save work button has been enabled
    browser.expect.element('#submitbutton').to.be.visible
      .to.have.attribute("aria-disabled").equals("false")

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
      .moveToElement('#playerslider > a',  2,  2)
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
    browser.expect.element('#objectcontainer > div:nth-child(1) > div:nth-child(2) > p:nth-child(5) > strong').text.to.equal('End - Frame:47');
    // check that there is an end button, and it is enable (aria-disabled = false)
    // browser.expect.element('#endbutton').to.be.visible
    //   .to.have.attribute("aria-disabled").equals("false");

    // enter text: #newWord
    browser.expect.element('#newWord').to.be.visible;
    browser.setValue('#newWord', ['testword', browser.Keys.ENTER]);

    // check that the word is the same
    browser.expect.element('#objectcontainer > div:nth-child(1) > div:nth-child(1) > p.trackobjectheader.change0word > strong').text.to.equal('testword').before(1000);
    browser.expect.element('#objectcontainer > div:nth-child(1) > div:nth-child(2) > p.trackobjectheader.change1word > strong').text.to.equal('testword');
  },



  'add one annotation, start is between first annotation' : function (browser) {
    // move the slider
    browser
      .useCss()
      .moveToElement('#playerslider > a',  2,  2)
      .mouseButtonDown(0)
      .moveToElement('#playerslider',  150,  0) // Move to offset position of 200(x) 0(y)
      .mouseButtonUp(0);

    // check that there is a warning if the slider is within an annotation
    browser.click('#startbutton');
    // the alert has the right text
    browser.getAlertText(function(result){
      this.assert.equal(result.value, 'The start frame must not be inside of another fingerspelled word that has already been annotated.');
      browser.acceptAlert();
    });

    // check that there is a warning if the slider is within an annotation
    browser.click('#endbutton');
    // the alert has the right text
    browser.getAlertText(function(result){
      this.assert.equal(result.value, 'The end frame must not be inside of another fingerspelled word that has already been annotated.');
      browser.acceptAlert();
    });
  },


  'add one annotation, that spans another annotation' : function (browser) {
    // move the slider
    browser
      .useCss()
      .moveToElement('#playerslider > a',  2,  2)
      .mouseButtonDown(0)
      .moveToElement('#playerslider',  50,  0) // Move to offset position of 200(x) 0(y)
      .mouseButtonUp(0);

    // check that there is a warning if the slider is within an annotation
    browser.click('#startbutton');
    // check that the UI is correct
    browser.expect.element("#startbutton").to.have.attribute("aria-disabled").equals("true");
    // check that the annotation shows up
    browser.expect.element('#objectcontainer .trackobject').to.be.visible;
    browser.expect.element('#objectcontainer .trackobject p').to.be.visible;
    browser.expect.element('#objectcontainer > div:nth-child(1) > div:nth-child(1) > p:nth-child(5) > strong').text.to.equal('Start - Frame:13');


    // move the slider
    browser
      .useCss()
      .moveToElement('#playerslider > a',  2,  2)
      .mouseButtonDown(0)
      .moveToElement('#playerslider',  250,  0) // Move to offset position of 200(x) 0(y)
      .mouseButtonUp(0);

    // check that there is a warning if the slider is within an annotation
    browser.click('#endbutton');
    // the alert has the right text
    browser.getAlertText(function(result){
      this.assert.equal(result.value, 'The annotation cannot include another annotation. Please only mark annotations that are not overlapping.');
      browser.acceptAlert();
    });
  },

  'after errors, can complete the annotations' : function (browser) {
    // move the slider
    browser
      .useCss()
      .moveToElement('#playerslider > a',  2,  2)
      .mouseButtonDown(0)
      .moveToElement('#playerslider',  75,  0) // Move to offset position of 200(x) 0(y)
      .mouseButtonUp(0);

    browser.click('#endbutton');
    // the end button will be visible again
    browser.expect.element('#objectcontainer .trackobject').to.be.visible;
    browser.expect.element('#objectcontainer .trackobject p').to.be.visible;
    browser.expect.element('#objectcontainer > div:nth-child(1) > div:nth-child(2) > p:nth-child(5) > strong').text.to.equal('End - Frame:19');
  },

  'Test end' : function (browser) {
  	browser
	  .end();
  }
};
