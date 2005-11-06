var Kernel = Class.create();
Kernel.extend(JSDBI);
Kernel.prototype = (new JSDBI()).extend( {

});
Kernel.fields(['id', 'name', 'uri', 'source', 'created', 'lastModified', 'lastViewed']);
Kernel.url('/rest/kernel');
