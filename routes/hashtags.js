var express = require('express');
var router = express.Router();
const Hashtag = require('../models/hashtags');


router.post('/newHashtag', (req, res) => {
    const name = req.body.name
    Hashtag.find({name}).then(data => {
        console.log(data.length)
        // si le hashtag est déjà existant
        if(data.length) {
            Hashtag.updateOne(
                { name: name },
                { $inc: { number: 1 } }
                ).then(() => {
                    Hashtag.find({name}).then(data => {
                        res.json({result: true, hashtag: data} )
                    })
                })
        } else {
            // si le hashtag n'existe pas
            const newHashtag = new Hashtag({
                name: req.body.name,
                number: 1
            });

            newHashtag.save().then(newDoc => {
                res.json({ result: true, hashtag: newDoc });
            });
        }
    })
});


router.get('/allHashtags', (req, res) => {
    Hashtag.find().then(data => {
      if(data) {
        res.json({result: true, hashtags: data})
      } else {
        res.json({result: false, tweets: 'Hashtag not found problem with route'})
      }
    })
  })


router.delete('/delete', (req, res) => {
const name = req.body.name
Hashtag.find({ name }).then(data => {
    // delete complètement le doc si number = 1 
    // data[0] car data est une array
    if(data[0].number === 1) {
        Hashtag.deleteOne({name}).then(deletedDoc => {
            if (deletedDoc.deletedCount > 0) {
                Hashtag.find().then(data => {
                  res.json({result: true, hashtag: data})
                })
            }
        })
    } else {
        // fait -1 sinon
        Hashtag.updateOne({name},
            { $inc: { number: -1 } }
            ).then(() => {
                Hashtag.find({name}).then(data => {
                    res.json({result: true, hashtag: data} )
                })
            })
    }
})
});


module.exports = router;
