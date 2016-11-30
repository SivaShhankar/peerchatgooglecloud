//Script file showing users list while mouse hover on the Online button

$(document).ready(function() {

    var panel = $('#userList');
    var timeout;

    $('.UserWidget').hover(
        function() {
            clearTimeout(timeout);
            timeout = setTimeout(function() { panel.trigger('open'); }, 500);
        },
        function() {
            clearTimeout(timeout);
            timeout = setTimeout(function() { panel.trigger('close'); }, 500);
        }
    );

    var loaded = false;

    panel.bind('open', function() {
        panel.slideDown(function() {
            if (!loaded) {
                executeQuery();     // It will fetch and load recent list on the div while hover on on the div
                loaded = true;
            }
        });
    }).bind('close', function() {
        loaded = false;
        panel.slideUp();
    });

});