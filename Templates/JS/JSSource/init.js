var user; var peerID; var connectedPeers = {}; var peer, person;

var serverIP = 'localhost', serverPort = '9000';
//var serverIP = 'myownpeerjs.herokuapp.com', serverPort = '443';
var serverHost = 'http://' + serverIP + ':' + serverPort + '/';   // Change server IP here
var peerAliveConnection;//= setInterval(function() {
                //console.log(peer.connect());
                //alert('1');
           // }, 5000);

function startPeerSession() {
    if (person != null) {
        // Local Host

        peer = new Peer(person, {
            host: serverIP, port: serverPort, 
            //secure: true, 
            debug: 3,
            // logFunction: function() {
            //    var copy = Array.prototype.slice.call(arguments).join(' ');
            //    $('.log').append(copy + '<br>');
            //  }
        });

        // End

        // Show this peer's ID.
        peer.on('open', function (id) {
            user = id; //$('#peerName').val();
            peerID = id;
            $('#pid').text(id);
            updateData();
            executeQuery();
        });


        // Await connections from others
        peer.on('connection', connect);

        peer.on('error', function (err) {
            console.log(err);
            displayInfo(err + "</br><br/> Please start a new session ", 1);
            //clearTimeout(peerAliveConnection);
            return;
        });

       // makeConnectionAlive();
      
       
        
    }
}

// function makeConnectionAlive(){
//     peerAliveConnection= setInterval(function() {
//                 console.log(peer.connect());
//                 //alert('1');
//             }, 5000);

// }

// peer.on('call', function(call){
//         alert('1');
//     });