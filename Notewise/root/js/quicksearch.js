new Ajax.Autocompleter('mysearchfield', 'mysearchresults', '/s',
                        {frequency: .1,
                         min_chars: 2,
                         on_select: function (selected_element){
                            value = Element.collectTextNodesIgnoreClass(selected_element, 'informal').unescapeHTML();
                            var link=selected_element.getElementsByTagName('a')[0];
                            if(link.href.search(/^http:\/\/[^\/]+\/0$/) != -1){
                                name = $('mysearchfield').value;
                                window.location=base_url+'kernel/add?name='+encodeURIComponent(name);
                            } else {
                                window.location=link.href;
                            }
                            $('mysearchfield').value = value;
                         },
                         on_complete: function(autocompleter){
                            if(autocompleter.entry_count <= 2){
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
                             if(match[1] == $('mysearchfield').value){
                                 // show the results
                                 printfire("showing results for "+match[1]);
                                 return 1;
                             } else {
                                 // don't show the results - they're too old
                                 printfire("skipping out of date results for "+match[1]);
                                 return 0;
                             }
                         },

                         on_inactive_select: function (autocompleter) {
                            window.location=base_url+'search/find_or_create/'+$('mysearchfield').value;
                         }
});
$('mysearchfield').focus();
