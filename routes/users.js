var express = require('express');
var router = express.Router();
const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');
// gestion mdp et token
const uid2 = require('uid2');
const bcrypt = require('bcrypt');
// gestion photo
const uniqid = require('uniqid');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// USER SCHEMA
// const userSchema = mongoose.Schema({
//   firstname: String, 
//   username: String,
//   password: String,
//   token: String,
//   liked: [{ type: mongoose.Schema.Types.ObjectId, ref: "tweets" }],
//   photoProfileBack : String,
//   photoProfileFront : String,
// });


// Création utlisateur 
router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  User.findOne({ username: req.body.username }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        firstname: req.body.firstname,
        username: req.body.username,
        password: hash,
        token: uid2(32),
        liked: [],
      });

      newUser.save().then(newDoc => {
        res.json({ result: true, user: newDoc });
      });
    } else {
      // User already exists in database
      res.json({ result: false, error: 'User already exists' });
    }
  });
});

// Connection 
router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ username: req.body.username }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, user: data });
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  });
});


// ajout d'une photo de profil
// BACK
router.post('/uploadBackImg/:username', async (req, res) => {
  console.log('file from back ==>',req.files.photoBack);
  const username = req.params.username
  const photoPath = `./tmp/${uniqid()}.jpg`;
  const resultMove = await req.files.photoBack.mv(photoPath);
  
  if (!resultMove) {
      const resultCloudinary = await cloudinary.uploader.upload(photoPath);
      console.log('result from cloudinary ==>', resultCloudinary)
      User.updateOne({ username }, { $set: { photoProfileBack: resultCloudinary.secure_url }}).then(() => {
        // enregistrer l'url dans la db du user ==> en fonction du token après reception depuis cloudinary
        res.json({ result: true, url: resultCloudinary.secure_url });
      })
  } else {
    res.json({ result: false, error: resultMove });
  }
  
  fs.unlinkSync(photoPath);
 });

//  FRONT
router.post('/uploadFrontImg/:username', async (req, res) => {
  console.log('file from back ==>',req.files.photoFront);
  const username = req.params.username
  const photoPath = `./tmp/${uniqid()}.jpg`;
  const resultMove = await req.files.photoFront.mv(photoPath);
  
  if (!resultMove) {
      const resultCloudinary = await cloudinary.uploader.upload(photoPath);
      console.log('result from cloudinary ==>', resultCloudinary)
      User.updateOne({ username }, { $set: { photoProfileFront: resultCloudinary.secure_url }}).then(() => {
        // enregistrer l'url dans la db du user ==> en fonction du token après reception depuis cloudinary
        res.json({ result: true, url: resultCloudinary.secure_url });
      })
  } else {
    res.json({ result: false, error: resultMove });
  }
  
  fs.unlinkSync(photoPath);
 });
// return cloudinary 
// {
//   asset_id: '03bbb9ef2344bf5aea4d38a459ca6890',
//   public_id: 'cibrvvb8qfhp6l2cls9q',
//   version: 1686840842,
//   version_id: 'f21056c8f4a2e16f0ebd83d18d7f58d8',
//   signature: '5000d35de67478b61c30e19d235a0b7d550bfcb3',
//   width: 1920,
//   height: 1200,
//   format: 'png',
//   resource_type: 'image',
//   created_at: '2023-06-15T14:54:02Z',
//   tags: [],
//   bytes: 966100,
//   type: 'upload',
//   etag: '96fa0c6a28aff295d611c3fdc43e55b3',
//   placeholder: false,
//   url: 'http://res.cloudinary.com/dfbru1uu2/image/upload/v1686840842/cibrvvb8qfhp6l2cls9q.png',
//   secure_url: 'https://res.cloudinary.com/dfbru1uu2/image/upload/v1686840842/cibrvvb8qfhp6l2cls9q.png',
//   folder: '',
//   original_filename: '2wytri2clix9hdwm',
//   original_extension: 'jpg',
//   api_key: '639587385164884'
// }


// création route pour récupérer la photo
router.get('/getImage/:username', (req, res) => {
  const username = req.params.username
  User.findOne({ username }).then(data => {
    if(data) {
      res.json({ result: true, photoBack: data.photoProfileBack, photoFront: data.photoProfileFront})
    }
  })
})


//  création route pour modifier les info d'un user en fonction de son token 
router.post('/updateInfos/:username', (req, res) => {
  const username = req.params.username
  const { newFirstname, newBio, newBirth, newLocation } = req.body
  if(newFirstname || newBio || newBirth || newLocation) {
    User.findOne({username}).then(data => {
      User.updateOne({username}, {
        firstname: newFirstname ? newFirstname : data.firstname,
        bio: newBio ? newBio : data.bio,
        birth: newBirth ? newBirth : data.birth,
        location: newLocation ? newLocation : data.location,
        })
        .then(() => {
        User.findOne({username}).then(data => {
          if(data) {
            console.log(data)
            res.json({result: true, userUdapte: data})
          }
        })
      })
    })
  } 
})

// FETCH LES INFOS D UN AUTRE USER
router.get('/otherUserInfos/:username', (req, res) => {
  const username = req.params.username
  User.find({username}).then(data => {
    if(data) {
      res.json({result: true, userInfos: data})
    }
  })
})
module.exports = router;
