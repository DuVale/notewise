var Bugs = {};
Bugs.show_window = function(){
    var iframe = document.createElement('iframe');
    iframe.id = 'bugreport';
    iframe.src = '/user/bug_report';
    var body=document.getElementsByTagName('body')[0];
    body.appendChild(iframe);
};
Bugs.close_window = function() {
    var iframe = parent.document.getElementById('bugreport');
    iframe.parentNode.removeChild(iframe);
};
