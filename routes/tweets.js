var express = require('express');
var router = express.Router();
const Tweet = require('../models/tweets');

// post new tweet
router.post('/newTweet', (req, res) => {
    if (req.body.text === '') {
      res.json({ result: false, error: 'Missing or empty fields' });
      return;
    } else {
      // mettre date reçu en format relatif avec moment
        const newTweet = new Tweet({
        firstname: req.body.firstname,
        username: req.body.username,
        date: new Date(),
        text: req.body.text,
        likes: req.body.likes
        });
    
        newTweet.save().then(newDoc => {
          res.json({ result: true, tweet: newDoc });
        });
    }
  });


router.get('/allTweets/:username', (req, res) => {
  const username = req.params.username
  Tweet.find().then(data => {
    if(data) {
      const allTweets = data.filter((e) => e.username !== username)
      const myTweets = data.filter((e) => e.username === username)
      res.json({result: true, allTweets: data, otherTweets: allTweets, myTweets: myTweets})
    } else {
      res.json({result: false, tweets: 'Tweet not found problem with route'})
    }
  })
})


router.delete('/delete', (req, res) => {
  // chercher avec un regex et en global pour gerer les espaces 
  const text = req.body.text
  console.log('delete test with hashtags ==> ',text)
  Tweet.deleteOne({ text }).then(deletedDoc => {
    if (deletedDoc.deletedCount > 0) {
      Tweet.find().then(data => {
        res.json({result: true, tweets: data})
      })
    } else {
      res.json({result: false, error: 'Tweet not found'})
    }
  })
});
// router.delete('/delete/:name', (req, res) => {
//   const name = req.params.name
//   Hashtag.find({ name }).then(data => {
//       console.log(data)
//       if(data[0].number === 1) {
//           Hashtag.deleteOne({name}).then(deletedDoc => {
//               if (deletedDoc.deletedCount > 0) {
//                   Hashtag.find().then(data => {
//                     res.json({result: true, hashtag: data})
//                   })
//               }
//           })
//       } else {
//           Hashtag.updateOne({name},
//               { $inc: { number: -1 } }
//               ).then(() => {
//                   Hashtag.find({name}).then(data => {
//                       res.json({result: true, hashtag: data} )
//                   })
//               })
//       }
//   })
//   });

module.exports = router;


