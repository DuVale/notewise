var KernelDraggable = Class.create();

ajaxEngine.registerRequest('updateContainedObject', '/containedobject/do_update');

KernelDraggable.prototype = (new Rico.Draggable()).extend( {

   initialize: function( htmlElement, kernel ) {
      this.type        = 'Custom';
      this.htmlElement = $(htmlElement);
      this.kernel        = kernel;
   },

   startDrag: function() {
   },

   endDrag: function() {
       var x = this.htmlElement.style.left;
       var y = this.htmlElement.style.top;
       ajaxEngine.sendRequest( 'updateContainedObject',
                               'contained_id='+this.kernel.id,
                               'container_id=1',
                               'x='+x,
                               'y='+y);
   },

   duringDrag: function() {
       window.status = "duringDrag called: "+this.htmlElement.style.left+"x"+this.htmlElement.style.top;
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
