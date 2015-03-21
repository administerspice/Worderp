var socket = io.connect(window.location.hostname);
var archiveIndex = 0;

// scroll down:
socket.on('scroll', function(){
  $('#storySoFarContainer').animate({ scrollTop: $('#storySoFarContainer')[0].scrollHeight}, 1000);
});

// html editers:
socket.on('update buttons', function(wordbuttons){
  $('#wordButtonsList').html(wordbuttons);
});
socket.on('update story', function(story){
  $('#storySoFarText').html(story);
});
socket.on('time', function (data){
  $('#countdown').html(data.time);
});
socket.on('update users', function(data){
  $('#playerCount').html(data);
});
socket.on('update page', function(pageCount){
  if(pageCount-archiveIndex < 1) archiveIndex = pageCount-1;
  $('#pageNumber').html(pageCount-archiveIndex);
})

// alertify messages:
socket.on('multiple words', function(data){
  alertify.error('Only submit one word at a time.');
});
socket.on('spam', function(data){
  alertify.error('Word considered spam.\n' + data);
});
socket.on('word length', function(data){
  alertify.error('Word is too long.');
});
socket.on('misplaced punctuation', function(data){
  alertify.error('If your word contains punctuation, it must be at the end of the word.');
});
socket.on('word already exists', function(data){
  alertify.error('Word already exists!');
});
socket.on('word successful', function(data){
  alertify.success('Word submitted!');
  $('#word').val('');
});
socket.on('too many submissions', function(data){
  alertify.error('You may not submit than five words per turn.');
});

// button emissions
$('#back').on('click', function(){
  archiveIndex = archiveIndex+1;
  socket.emit('archive', archiveIndex);
});
$('#forward').on('click', function(){
  if(archiveIndex > 0)
    archiveIndex = archiveIndex-1;
    socket.emit('archive', archiveIndex);
});
$('#submit').on('click', function(){
  socket.emit('send word', $('#word').val());
});
$(document).keypress(function(e){
  if(e.which == 13){
    socket.emit('send word', $('#word').val());
  }
});