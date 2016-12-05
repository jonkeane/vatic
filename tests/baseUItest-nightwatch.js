module.exports = {
  'UI' : function (browser) {
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
      browser.pause(500);
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
      browser.pause(1000);
      // the alert has the right text
      browser.getAlertText(function(result){
        this.assert.equal(result.value, 'End frame must be after the start frame');
        browser.acceptAlert();
      });      
      // the end button is still visible
      browser.pause(1000);
      browser.expect.element('#endbutton').to.be.visible
        .to.have.attribute("aria-disabled").equals("false");
      // move the slider

      // // click the end button
      // browser.click('#endbutton');
      // browser.expect.element("#endbutton").to.have.attribute("aria-disabled").equals("true");
      // browser.pause(500);
      // // check that the annotation shows up
      // browser.expect.element('#objectcontainer .trackobject').to.be.visible;
      // browser.expect.element('#objectcontainer .trackobject p').to.be.visible;
      // browser.expect.element('#objectcontainer div p:nth-child(5) strong').text.to.equal('Start - Frame:0');
      // // check that there is an end button, and it is enable (aria-disabled = false)
      // browser.expect.element('#endbutton').to.be.visible
      //   .to.have.attribute("aria-disabled").equals("false");
      },

  'Test end' : function (browser) {
  	browser
	  .end();
  }
};
