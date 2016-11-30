// This script file written for handling p2p connections, Online users display and notifications
// and ajax requests for updating and retrieving user details from/to the server (PeerJS)

// pass user meta information on ajax call and update it in server collections
function updateData() {
    $.ajax({
        contentType: 'application/json',
        url: serverHost + "set",
        data: { "id": peerID, "user": user },
        dataType: "json",
        success: function (data) {
            return;
        }
    });
}

// fetch recent users list  from server and display it in a div
function executeQuery() {
    // alert('calling function to load list - Testing');
    $.ajax({
        url: serverHost + "showall",
        success: function (data) {
            $("#userList").html("");
            var html = '';
            for (i = 0; i <= data.length - 1; i++) {

                html += "<div class='userdetails'>" +
                    "<span><img class='usericon' src='images/User.png' width='32' height='32'></img></span>" +
                    "<span>"
                    + data[i]["name"] //.replace(user,'Me')
                    + "</span></div>";

            }

            html = "<div id='testscroll'>" + html
            "</div>";

            $("#userList").append(html);
            $('#testscroll').slimScroll({
                height: '230px'

            });
        }
    });
    //setTimeout(executeQuery, 5000);
}

// Handle a connection object.
function connect(c) {
    // Handle a chat connection.
    if (c.label === 'chat') {
        var chatbox = $('<div></div>').addClass('connection').addClass('active').attr('id', c.peer);
        var header = $('<h1></h1>').html('Chat with <strong>' + c.peer + '</strong>');
        //  var imgCall = $('').addClass('callRemotePeer').attr('src',);
        var messages = $('<div><em>Peer connected.</em></div>').addClass('messages');

        chatbox.append('<img class="callRemotePeer" src="/images/phone.png"></img>');
        chatbox.append('<img class="CallAudio" src="/images/AudioCall.png"></img>');
        chatbox.append(header);
        chatbox.append(messages);

        var messagebox = $('<input type="text" class="messagebox" placeholder="Enter message">');
        chatbox.append(messagebox);

        // Select connection handler.
        chatbox.on('click', function () {
            if ($(this).attr('class').indexOf('active') === -1) {
                $(this).addClass('active');
            } else {
                $(this).removeClass('active');
            }
        });
        $('.filler').hide();
        $('#connections').append(chatbox);

        c.on('data', function (data) {
            // alert("my" + c.metadata.userName);
            messages.append('<div><span class="peer">' + c.peer + ': </span> ' + data +
                '</div>');

            var elem = document.getElementById(c.peer).getElementsByClassName("messages")[0];;
            //alert(elem);
            // var height = wtf[0].scrollHeight;
            elem.scrollTop = elem.scrollHeight;
        });
        c.on('close', function () {
            displayInfo(c.peer + ' has left the chat.', 0);
            //alert(c.peer + ' has left the chat.');
            chatbox.remove();
            if ($('.connection').length === 0) {
                $('.filler').show();
            }
            delete connectedPeers[c.peer];
        });
    } else if (c.label === 'file') {
        c.on('data', function (data) {
            // If we're getting a file, create a URL for it.
            if (data.constructor === ArrayBuffer) {
                //alert(data);
                var dataView = new Uint8Array(data);
                var dataBlob = new Blob([dataView]);
                var url = window.URL.createObjectURL(dataBlob);
                $('#' + c.peer).find('.messages').append('<div><span class="file">' +
                    c.peer + ' has sent you a <a target="_blank" href="' + url + '">file</a>.</span></div>');
            }
        });
    }
    connectedPeers[c.peer] = 1;
}

$(document).ready(function () {

    // While pressing keys on the messagebox, make it current as active and others as inactive
    // capture keyenter event for sending msgs to the connected peeers

    $('input.messagebox').live("keypress", function (e) {
        var id = $(this).parent().attr('id');
        $('input.messagebox').not(this).each(function () {

            if (id != $('input.messagebox').parent().attr('id')) {

                $('input.messagebox').parent().removeClass('active');
            } else {

                $('input.messagebox').parent().addClass('active');
            }

        });
        $(this).parent().addClass('active');
        if (e.keyCode == 13) {
            var msg = $(this).val();
            if (msg == "") return;
            eachActiveConnection
                (
                function (c, $c) {
                    
                    if (c.label === 'chat' || c.label == '') {

                        c.send(msg);
                        $c.find('.messages').append('<div><span class="you">You: </span>' + msg
                            + '</div>');
                    }
                }
                );
            // alert($(this).parent().scrollHeight);
            var elem = document.getElementById($(this).parent().attr("id")).getElementsByClassName("messages")[0];

            //alert(elem);
            // var height = wtf[0].scrollHeight;
            elem.scrollTop = elem.scrollHeight;


            $(this).val("");
            $(this).focus();

            return false; // prevent the button click from happening

        }
    });

    // Connect to the selected peer by clicking on the user
    $('.userdetails').live('click', function (event) {
        var selectedPeerID = $(this).children().last().html();
        $('#rid').val(selectedPeerID);
        $("#connect").trigger("click");

    });


    // Prepare file drop box.
    var box = $('#box');
    box.on('dragenter', doNothing);
    box.on('dragover', doNothing);
    box.on('drop', function (e) {
        e.originalEvent.preventDefault();
        var file = e.originalEvent.dataTransfer.files[0];
        eachActiveConnection(function (c, $c) {
            if (c.label === 'file') {
                c.send(file);
                $c.find('.messages').append('<div><span class="file">You sent a file.</span></div>');
            }
        });
    });
    function doNothing(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Connect to a peer
    $('#connect').click(function () {
        var requestedPeer = $('#rid').val();
        $('#rid').val("");
        if (!connectedPeers[requestedPeer]) {
            // var myname = $('#peerName').val();
            // alert(myname);
            // Create 2 connections, one labelled chat and another labelled file.
            var c = peer.connect(requestedPeer, {
                label: 'chat',
                serialization: 'none',
                metadata: { message: 'hi i want to chat with you!' }//, userName: $('#peerName').val() }
            });
            c.on('open', function () {
                connect(c);
                //alert(c.metadata.userName);
            });
            c.on('error', function (err) { alert(err); });
            var f = peer.connect(requestedPeer, { label: 'file', reliable: true });
            f.on('open', function () {
                connect(f);
            });
            f.on('error', function (err) { alert(err); });
        }
        connectedPeers[requestedPeer] = 1;
    });

    // Close a connection.
    $('#close').click(function () {
        eachActiveConnection(function (c) {
            c.close();
        });
    });

    // Send a chat message to all active connections.
    $('#send').submit(function (e) {
        e.preventDefault();
        // For each active connection, send the message.
        var msg = $('#text').val();
        eachActiveConnection
            (
            function (c, $c) {

                if (c.label === 'chat') {

                    c.send(msg);
                    $c.find('.messages').append('<div><span class="you">You: </span>' + msg
                        + '</div>');
                }
            }
            );
        $('#text').val('');
        $('#text').focus();
    });

    // Goes through each active peer and calls FN on its connections.
    function eachActiveConnection(fn) {
        var actives = $('.active');
        var checkedIds = {};

        actives.each(function () {
            var peerId = $(this).attr('id');
            //alert("active " + peerId);
            if (!checkedIds[peerId]) {
               // alert(peerId);
                var conns = peer.connections[peerId];

                for (var i = 0, ii = conns.length; i < ii; i += 1) {

                    var conn = conns[i];

                    fn(conn, $(this));
                }
            }
            checkedIds[peerId] = 1;
        });
    }
});

// Make sure things clean up properly.

window.onunload = window.onbeforeunload = function (e) {
    if (!!peer && !peer.destroyed) {
        peer.destroy();
    }
};

// Display alert box
function displayInfo(msg, flag) {
    $.confirm({
        title: '',
        content: msg,
        animation: 'zoom',
        closeAnimation: 'zoom',
        buttons: {
            Okay: {
                text: 'Okay',
                btnClass: 'btn-warning',
                action: function () {
                    if (flag == 1) {                // if flag is 0 then its alert, no need to start new session
                        window.location.href = '/';
                    }
                }
            }

        }
    });

}