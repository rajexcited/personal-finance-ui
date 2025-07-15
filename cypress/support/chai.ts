/// <reference types="chai" />

chai.Assertion.addMethod("loaded", function () {
  const el = this._obj[0] as HTMLElement;
  const tagName = el.tagName.toLowerCase();

  if (tagName === "img") {
    const loaded = (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0;
    this.assert(loaded, "expected image to be loaded", "expected image not to be loaded", true, loaded);
  } else if (tagName === "embed") {
    const loaded = el.clientWidth > 0 && el.clientHeight > 0;
    this.assert(loaded, "expected embed content to be loaded (non-zero size)", "expected embed content not to be loaded", true, loaded);
  } else {
    throw new Error(`.should('be.loaded') is not supported for <${tagName}> elements.`);
  }
});
