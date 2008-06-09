function TransportStub() {
}

AjaxRequestStub = Class.create();
AjaxRequestStub.Events = 
  ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];

AjaxRequestStub.requests = [];
AjaxRequestStub.clear = function () {
  AjaxRequestStub.requests = [];
}

AjaxRequestStub.prototype = (new Ajax.Base()).extend({
  initialize: function(url, options) {
    AjaxRequestStub.requests.push(this);
    this.transport = new TransportStub();
    this.setOptions(options);
    this.request_called_count = 0;
    this.request(url);
  },

  request: function(url) {
    this.requested_url = url;
    this.request_called_count += 1;
    console.log("request(%s)", url);
  },

  setRequestHeaders: function() {
    console.log("setRequestHeaders");
  },

  onStateChange: function() {
    console.log("onStateChange");
  },

  respondToReadyState: function(readyState) {
    console.log("respondToReadyState");
  },

  fireOnSuccess: function() {
    this.options.onSuccess(this.transport);
  },

  fireOnComplete: function() {
    this.options.onComplete(this.transport);
  },

  setResponseXML: function(xml) {
    var parser=new DOMParser();
    this.transport.responseXML = parser.parseFromString(xml, "text/xml");
  }
});
