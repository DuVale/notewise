new Ajax.Autocompleter('mysearchfield', 'mysearchresults', '/s',
                        {frequency: .2,
                         min_chars: 2,
                         on_select: function (selected_element){
                            value = Element.collectTextNodesIgnoreClass(selected_element, 'informal').unescapeHTML();
                            var link=selected_element.getElementsByTagName('a')[0];
                            var matches=link.href.match(/^http:\/\/.*\/(\d+)$/);
                            printfire(matches);
                            if(matches && matches[1] == 0){
                                name = $('mysearchfield').value;
                                new_view(name);
                            } else if(matches){
                                dhtmlHistory.add(''+matches[1],{}); // TODO add in username or kernel title here
                                KernelObject.prototype.do_make_view(matches[1]);
                            } else {
                                window.location=link.href;
                            }
                            $('mysearchfield').value = '';
                         },
                         on_complete: function(autocompleter){
                            if(autocompleter.entry_count == 1){
                                // if there were no actual search results, then "new..." should be
                                // the default selection
                                autocompleter.index = 0;
                            } else {
                                // The first actual search result should be selected
                                autocompleter.index = 1;
                            }
                         },
                         before_complete: function (autocompleter,request) {
                             match = request.responseText.match(/>new '(.*?)'</);
                             if(match && match[1] == $('mysearchfield').value){
                                 // show the results
                                 return 1;
                             } else {
                                 // don't show the results - they're too old
                                 return 0;
                             }
                         },

                         on_inactive_select: function (autocompleter) {
                            window.location=base_url+'search/find_or_create/'+$('mysearchfield').value;
                         }
});
$('mysearchfield').focus();
