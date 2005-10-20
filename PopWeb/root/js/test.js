var CustomDraggable = Class.create();

ajaxEngine.registerRequest('updateKernel', '/kernel/do_update');
ajaxEngine.registerRequest('updateContainedObject', '/containedobject/do_update');

CustomDraggable.prototype = (new Rico.Draggable()).extend( {

   initialize: function( htmlElement, name ) {
      this.type        = 'Custom';
      this.htmlElement = $(htmlElement);
      this.name        = name;
   },

   startDrag: function() {
   },

   endDrag: function() {
       var x = this.htmlElement.style.left;
       var y = this.htmlElement.style.top;
       ajaxEngine.sendRequest( 'updateContainedObject',
                               'contained_id=2',
                               'container_id=1',
                               'x='+x,
                               'y='+y);
   },

   cancelDrag: function() {
   },

   select: function() {
   }

} );

var CustomDropzone = Class.create();

CustomDropzone.prototype = (new Rico.Dropzone()).extend( {

   accept: function(draggableObjects) {
      n = draggableObjects.length;
      for ( var i = 0 ; i < n ; i++ )
         var el = draggableObjects[i].htmlElement;
         var dragObjectStyle = el.style;
         //dragObjectStyle.left = "200px";
         //dragObjectStyle.top  = "200px";
   },

   showHover: function() {
   },

   hideHover: function() {
   },

   activate: function() {
   },

   deactivate: function() {
   }
});
