var Wordbuttons = require('./databases/wordbutton');

// regular expressions
var regexUrl = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
var regexEmail = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
var regexHtml = /[<>]/;
var regexPunc = /^.*[?!.].+/;
var regexEllipsis = /^.*\.{3}.*/;

exports.filter = function(word, cb, error){
  var wordvotes = Wordbuttons.getVotes();

  // ignore empty string submissions
  if(word === '') return;

  // trim whitespace from beginning and end
  word = word.trim();

  // if word still contains white space, it is too many words
  if(word.search(" ") > -1){
    console.log('Multiple words! Word: ' + word);
    error('multiple words', word);
  }

  // if word is more than 50 characters, it's too long
  else if(word.length > 50){
    console.log('Word too long! Word: ' + word);
    error('word length', word);
  }

  // if word contains website address, it is spam
  else if(word.match(regexUrl) !== null && word.match(regexEllipsis) === null){
    console.log('Spam! Word: ' + word);
    error('spam', 'No websites!');
  }

  // if word contains email address, it is spam
  else if(word.match(regexEmail) !== null){
    console.log('Spam! Word: ' + word);
    error('spam', 'No emails!');
  }

  // if word contains html, it will break our site
  else if(word.match(regexHtml) !== null){
    console.log('Spam! Word: ' + word);
    error('spam', 'No html tag symbols!');
  }

  // if word contains punctuation that isn't at the end of the word, it is not a word
  else if(word.match(regexPunc) !== null && word.match(regexEllipsis) === null){
    console.log('Misplaced punctation! Word: ' + word);
    error('misplaced punctuation', word);
  }

  // if the word is already in Wordbuttons, it's a duplicate
  else if(wordvotes[word]>=0 ){
    console.log("Duplicate Word: " + word);
    error('word already exists', word);
  }
  else cb(word);
};
