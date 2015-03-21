var wordbuttons = '';
var words = new Array(); // array of submitted words
var wordvotes = {}; // object matching submitted words to their vote counts

exports.getWords = function() {
  return words;
};

exports.getVotes = function() {
  return wordvotes;
};

exports.getWordButtons = function(cb, error) {
  cb(wordbuttons);
};

exports.addWordButton = function(word, cb, error) {
  var index = words.length;
  words.push(word.toString()); // put word at the end of the words array
  wordvotes[word.toString()] = 0; // set word's vote count to 0

  var votes = wordvotes[word.toString()];
  // write html:
  wordbuttons += '<button id="wordButton" onclick='
              + '"socket.emit(' + "'vote', " + index
              + ')" class="col-xs-12 btn btn-default" type="button">'
              + word
              + '<span id="vote" color="red"> - \t' + votes + ' </span>'
              + '</button>';
  cb(wordbuttons);
};

exports.vote = function(cb, index, previousword, error) {
  var votee = words[index];
  if(wordvotes[words[index]] === undefined) return;
  if(previousword !== undefined){
    unVote(previousword);
  }
  console.log("Vote cast for: " + words[index]);
  wordvotes[words[index].toString()] = wordvotes[words[index].toString()] + 1; // increment word's vote count
  wordbuttons = '';

  // sort the words array
  for(var i = 0; i < words.length; i++){
    var j = i;
    while(j > 0 && wordvotes[words[j-1].toString()] < wordvotes[words[j].toString()]){
      var temp = words[j].toString();
      words[j] = words[j-1].toString();
      words[j-1] = temp;
      j = j-1;
    }
  }

  for(var i = 0; i < words.length; i++){
    var word = words[i];
    var votes = wordvotes[word.toString()];
    // re-write html:
    wordbuttons += '<button id="wordButton" onclick='
                + '"socket.emit(' + "'vote', " + i
                + ')" class="col-xs-12 btn btn-default" type="button">'
                + word
                + '<span id="vote" color="red"> - \t' + votes + ' </span>'
                + '</button>';
  }

  cb(wordbuttons);

  return votee;
};

unVote = function(word) {
  if(wordvotes[word] === undefined) return;
  console.log("Vote removed from: " + word);
  wordvotes[word] = wordvotes[word] - 1; // decrement word's vote count
};

exports.getMostVoted = function(cb, error) {
  // find our highest voted word or check to see if we have a tie:
  var tie = false;
  var mostVotedWord = '';
  var currentWord = '';
  var currentWordVoteCount = 0;
  var mostVotedWordCount = 0;
  var tiedwords = new Array(); // array for keeping tied words

  for (var i=0; i < words.length; i++){
    currentWord = words[i].toString();
    currentWordVoteCount = wordvotes[currentWord];
    if (mostVotedWordCount < currentWordVoteCount) {
      mostVotedWordCount = currentWordVoteCount;
      mostVotedWord = currentWord;
      tiedwords.length = 0;
      tie = false;
    }
    else if (mostVotedWordCount > 0 && mostVotedWordCount === currentWordVoteCount) {
      tie = true;
      tiedwords.push(mostVotedWord);
      mostVotedWord = currentWord;
    }
  }

  if (tie){
    tiedwords.push(mostVotedWord);
    var rand = Math.floor(Math.random() * tiedwords.length);
    mostVotedWord = tiedwords[rand];
    console.log('We have a tie! Tied words: ' + tiedwords);
  }
  else{
    console.log('No tie!');
  }

  cb(mostVotedWord);
};

exports.reset = function(cb, error) {
  wordbuttons = '';
  words = new Array();
  wordvotes = {};
  cb(wordbuttons);
}
