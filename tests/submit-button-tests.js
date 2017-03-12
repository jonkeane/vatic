module.exports = {
  'submit button becomes enabled after viewing the video' : function (browser) {
    browser.url('https://vatic.ttic.edu/?id=49&hitId=offline'); // this must be the greg/s084 video
    // browser.url('https://vatic-dev.ttic.edu/?id=1&hitId=offline'); // this must be the greg/s084 video

    // check that the save work button is disabled
    browser.expect.element('#submitbutton').to.be.visible.after(100000);
    browser.expect.element('#submitbutton').to.have.attribute("aria-disabled").equals("true");

    // move the slider to the end
    browser
      .useCss()
      .moveToElement('#playerslider > a',  2,  2)
      .mouseButtonDown(0)
      .moveToElement('#playerslider',  200000,  0) // Move to offset position of 200(x) 0(y)
      .mouseButtonUp(0);

    // check that the save work button has been enabled
    browser.expect.element('#submitbutton').to.be.visible
      .to.have.attribute("aria-disabled").equals("false");

    // move the slider to the end
    browser
      .useCss()
      .moveToElement('#playerslider > a',  2,  2)
      .mouseButtonDown(0)
      .moveToElement('#playerslider',  100,  0) // Move to offset position of 200(x) 0(y)
      .mouseButtonUp(0);

    // check that the save work button continues to be enabled even if there are no annotations
    browser.expect.element('#submitbutton').to.be.visible
      .to.have.attribute("aria-disabled").equals("false");

    browser.end();
  }
};
