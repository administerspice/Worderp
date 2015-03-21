// connection:
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port      = process.env.OPENSHIFT_NODEJS_PORT || 3000;
var http      = require('http');
var app       = require('./app');
var server    = http.createServer(app);
var io        = require('socket.io').listen(server);

// mongolab database:
var mongoose = require('mongoose');
var dbuser = 'testuser';
var dbpass = 'testpassword';
mongoose.connect('mongodb://'+dbuser+':'+dbpass+'@ds031711.mongolab.com:31711/test-worderp');
var db = mongoose.connection;

// libraries:
var Stopwatch = require('./public/js/stopwatch');
var Wordbuttons = require('./databases/wordbutton');
var Story = require('./databases/story');
var Filter = require('./filter');

// global variables:
var stopwatch = new Stopwatch(); // timer
var clientVoteWords = new Array();
var clientSubmitWords = new Array();
var clientSockets = new Array();
var connectCounter = 0;

// global call-back functions:
var publishStory = function(html){
  io.sockets.emit('update story', html);
  io.sockets.emit('scroll');
};
var publishButtons = function(html){
  io.sockets.emit('update buttons', html);
};
var addWord = function(word){
  Story.addWord(word, publishStory);
};
var publishPageCount = function(pageCount){
  io.sockets.emit('update page', pageCount);
};

/**
 *
 * stopwatch handlers
 *
**/
stopwatch.start();

stopwatch.on('tick:stopwatch', function(time){
  io.sockets.emit('time', { time: time });
});

stopwatch.on('restart:stopwatch', function(time){
  // clear global variables:
  for(client in clientVoteWords){
    clientVoteWords[client] = undefined;
  }
  for(client in clientSubmitWords){
    clientSubmitWords[client] = 0;
  }

  // get the favorite word:
  Wordbuttons.getMostVoted(addWord);

  // update the page number:
  Story.getPageCount(publishPageCount);

  // reset word buttons:
  Wordbuttons.reset(publishButtons);

  // display restarted time:
  io.sockets.emit('time', { time: time });
});

/**
 *
 * client handlers
 *
**/
io.sockets.on('connection', function(socket){
  var clientID = socket.request.headers['user-agent']+socket.request.connection.remoteAddress;

  if(clientSubmitWords[clientID] === undefined){
    console.log("new user: "+socket.request.headers['user-agent']+" connecting from: "+socket.request.connection.remoteAddress);
    console.log("user id: "+socket.request.headers['user-agent']+socket.request.connection.remoteAddress+" assigned");

    // add them to our global variables:
    clientVoteWords[clientID] = undefined;
    clientSubmitWords[clientID] = 0;
    clientSockets[clientID] = 1;

    // increment the player count:
    connectCounter++;
    io.sockets.emit('update users', connectCounter);
    console.log(connectCounter+" players");
  }
  else{
    clientSockets[clientID]++;
    io.sockets.emit('update users', connectCounter);
  }

  // call-back functions:
  var publishStoryForClient = function(html){
    socket.emit('update story', html);
    socket.emit('scroll');
  };
  var publishButtonsForClient = function(html){
    socket.emit('update buttons', html);
  };
  var publishPageCountForClient = function(pageCount){
    socket.emit('update page', pageCount);
  };

  // show them the story and prospective words:
  Story.getStory(0, publishStoryForClient);
  Wordbuttons.getWordButtons(publishButtonsForClient);
  Story.getPageCount(publishPageCountForClient);

  // client submits word:
  socket.on('send word', function(word){
    // if they have not already submitted too many times
    if(clientSubmitWords[clientID] < 5){
      // callback error:
      var error = function(msg, word) {
        socket.emit(msg, word);
      };
      // callback function:
      var addButton = function(word) {
        socket.emit('word successful');
        Wordbuttons.addWordButton(word, publishButtons);
        // increment submission count
        clientSubmitWords[clientID]++;
      };
      // filter for spam, html, and special cases:
      Filter.filter(word, addButton, error);
    }
    else socket.emit('too many submissions');
  });

  // client votes on word: 
  socket.on('vote', function(index){
    clientVoteWords[clientID] = Wordbuttons.vote(publishButtons, index, clientVoteWords[clientID]);
  });

  // client requests archive:
  socket.on('archive', function(archiveIndex){
    Story.checkArchiveIndex(archiveIndex, publishStoryForClient);
    Story.getPageCount(publishPageCountForClient);
  });

  // client exits Worderp:
  socket.on('disconnect', function (){
    // decrement number of sockets for client:
    clientSockets[clientID]--;
    // if client no longer has any sockets open:
    if(clientSockets[clientID] < 1){
      // decrement the player count:
      connectCounter--;
      io.sockets.emit('update users', connectCounter);
      // remove client from global variables:
      delete clientVoteWords[clientID];
      delete clientSubmitWords[clientID];
    }
  });
});

/**
 *
 * start server
 *
**/
server.listen(port, ipaddress, function(){
    console.log((new Date()) + ' Server is listening on port 3000');
});
console.log("Listening to " + ipaddress + ":" + port + "...");
