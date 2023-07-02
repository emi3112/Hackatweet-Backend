var express = require("express");
var router = express.Router();
const Tweet = require("../models/tweets");
const User = require("../models/users");

// post new tweet
router.post("/newTweet", (req, res) => {
  if (req.body.text === "") {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  } else {
    // mettre date reçu en format relatif avec moment
    const newTweet = new Tweet({
      firstname: req.body.firstname,
      username: req.body.username,
      date: new Date(),
      text: req.body.text,
      likes: req.body.likes,
      gif: req.body.gif
    });

    newTweet.save().then((newDoc) => {
      res.json({ result: true, tweet: newDoc });
    });
  }
});

router.get("/allTweets/:username", (req, res) => {
  const username = req.params.username;
  Tweet.find().populate('whoLiked').then((data) => {
    if (data) {
      console.log("data", data);
      const allTweets = data.filter((e) => e.username !== username);
      const myTweets = data.filter((e) => e.username === username);
      res.json({
        result: true,
        allTweets: data,
        otherTweets: allTweets,
        myTweets: myTweets,
      });
    } else {
      res.json({ result: false, tweets: "Tweet not found problem with route" });
    }
  });
});

//  !!!!!!!!!!!!!!!!! si le tweet a des likes les deletes des doc des users aussi 
// faire avec la méthode pull
router.delete("/delete", (req, res) => {
  const text = req.body.text;
  // const username = req.params.username
  Tweet.deleteOne({ text }).then((deletedDoc) => {
    if (deletedDoc.deletedCount > 0) {
      // User.find({username}).then(data => {
        
      // })
      Tweet.find().then((data) => {
        res.json({ result: true, tweets: data });
      });
    } else {
      res.json({ result: false, error: "Tweet not found" });
    }
  });
});

// add like
router.post("/newLike/:username", (req, res) => {
  const username = req.params.username;
  const date = req.body.date;
  const text = req.body.text;
  // augmente le nombre de like +1
  Tweet.updateOne({ date, text }, { $inc: { likes: +1 } }).then(() => {
    // trouve le tweet liké 
    Tweet.find({ date, text }).then((data) => {
      if (data) {
        // prend l'id correspondant
        const id = data[0]._id;
        // push en foreign key dans la db du user qui a liké
        User.updateOne({ username }, { $push: { liked: id } }).then((data) => {
          if (data) {
            // trouve le user qui like 
            User.find({ username }).then( data => {
              // récupère l'id
              const id = data[0]._id
              // push l'id en foreign key dans le tweet liké
              Tweet.updateOne({ date, text }, { $push: { whoLiked: id }}).then( data => {
                res.json({ result: true, likes: data });
              })
            })
          } else {
            res.json({ result: false, error: "push did not work" });
          }
        });
      }
    });
  });
});

// delete like
router.post("/dislike/:username", (req, res) => {
  const username = req.params.username;
  const date = req.body.date;
  const text = req.body.text;
  // même processus mais à l'inverse
  Tweet.updateOne({ date, text }, { $inc: { likes: -1 } }).then(() => {
    Tweet.find({ date, text }).then((data) => {
      if (data) {
        const id = data[0]._id;
        User.updateOne({ username }, { $pull: { liked: id } }).then((data) => {
          if (data) {
            // trouve le user qui like 
            User.find({ username }).then( data => {
              // récupère l'id
              const id = data[0]._id
              // pull l'id en foreign key dans le tweet liké
              Tweet.updateOne({ date, text }, { $pull: { whoLiked: id }}).then( data => {
                res.json({ result: true, likes: data });
              })
            })
          } else {
            res.json({ result: false, error: "pull did not work" });
          }
        });
      }
    });
  });
});

// get des likes d'un utilisateur avec populates
router.get("/myLikes/:username", (req, res) => {
  const username = req.params.username;
  User.find({ username })
    .populate("liked")
    .then((data) => {
      if (data) {
        console.log("my tweets liked", data);
        res.json({ result: true, myLikes: data[0].liked });
      } else {
        res.json({ result: false, error: "tweets liked not found" });
      }
    });
});

// get les personnes qui ont liké un tweet avec populate
router.get("/myLikes/:username", (req, res) => {
  const username = req.params.username;
  Tweet.find({ username })
    .populate("liked")
    .then((data) => {
      if (data) {
        console.log("my tweets liked", data);
        res.json({ result: true, myLikes: data[0].liked });
      } else {
        res.json({ result: false, error: "tweets liked not found" });
      }
    });
});

module.exports = router;
