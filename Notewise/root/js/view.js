new Ajax.Autocompleter('mysearchfield', 'mysearchresults', '[%base%]s',
                        {frequency: .1,
                         min_chars: 2,
                         on_select: function (selected_element){
                            value = Element.collectTextNodesIgnoreClass(selected_element, 'informal').unescapeHTML();
                            var link=selected_element.getElementsByTagName('a')[0];
                            if(link.href.search(/^http:\/\/[^\/]+\/0$/) != -1){
                                name = $('mysearchfield').value;
                                printfire("Creating new "+name);
                                window.location=JSDBI.base_url()+'kernel/add?name='+encodeURIComponent(name);
                            } else {
                                printfire("going to old "+link.href);
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
                                 return 1;
                             } else {
                                 // don't show the results - they're too old
                                 return 0;
                             }
                         }
                        });
$('mysearchfield').focus();

function show_confirm_delete(e){
    $('permanent_delete').innerHTML = "Permanently delete this kernel? <a href='"+JSDBI.base_url()+"kernel/delete/"+viewKernelId+"'>yes</a> <a id='permanent_delete_no' href='#'>no</a>";
    Utils.preventDefault(e);
    Event.observe($('permanent_delete_no'),'click', hide_confirm_delete);
}

function hide_confirm_delete(e){
    $('permanent_delete').innerHTML = '<a href="#" id="permanent_delete_link">delete this kernel</a></div>';
    Utils.preventDefault(e);
    Event.observe($('permanent_delete_link'),'click', show_confirm_delete);
}
Event.observe($('permanent_delete_link'),'click', show_confirm_delete);
