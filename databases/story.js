var mongoose = require('mongoose');

// create schema:
var storySchema = mongoose.Schema({
  story: [String]
});

// create model:
var Story = mongoose.model('Story', storySchema);

// get a chunk of the words in the story
function getStory(index, cb){
  var story = '';
  var charCount = 0;

  Story.find().exec(function(err, docs){
    var words = docs[0].story;
    for(var i = 1; i <= words.length; i++){
      if(charCount < 1000*index){
        charCount += words[words.length-i].length+1;
      }
      else if(charCount < 1000*(index+1)){
        story = words[words.length-i]+' '+story;
        charCount += words[words.length-i].length+1;
      }
      else{
        cb(story.trim());
        return;
      }
    }
    cb(story.trim());
  });
}

function getPageCount(cb){
  var pageCount = 1;
  var charCount = 0;

  Story.find().exec(function(err, docs){
    var words = docs[0].story;
    for(var i = 1; i <= words.length; i++){
      charCount += words[words.length-i].length+1;
      if(charCount > 1000*pageCount){
        pageCount++;
      }
    }
    cb(pageCount);
  });
}

function checkArchiveIndex(archiveIndex, cb){
  var pageCount = 1;
  var charCount = 0;

  Story.find().exec(function(err, docs){
    var words = docs[0].story;
    for(var i = 1; i <= words.length; i++){
      charCount += words[words.length-i].length+1;
      if(charCount > 1000*pageCount){
        pageCount++;
      }
    }
    if(pageCount > archiveIndex) getStory(archiveIndex, cb);
  });
}

// add a word to the story
function addWord(word, cb){
  Story.find().exec(function(err, docs){
    story = docs[0];
    story.story.push(word);
    story.save(function(err, story){
      getStory(0, cb);
      return;
    });
    return;
  });
}

// export functions
exports.getStory = function(index, cb, error){
  getStory(index, cb);
}
exports.getPageCount = function(cb, error){
  getPageCount(cb);
}
exports.checkArchiveIndex = function(archiveIndex, cb){
  checkArchiveIndex(archiveIndex, cb);
}
exports.addWord = function(word, cb, error){
  if(word == null) return;
  if(word == 0) return;
  if(word == undefined) return;
  if(word.length < 1) return;

  addWord(word, cb);
}