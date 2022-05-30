const router = require('express').Router();

const { User, Post, Comment } = require('../../models');

//login
router.post('/login', (req, res) =>{
    User.findOne({
        where:{
            email: req.body.email
        }
    }).then(dbUserData =>{
        if(!dbUserData){
            res.status(400).json({ message: 'No user with that email address!'});
            return;
        }

        //verify user
        const validPassword = dbUserData.checkPassword(req.body.password);
        if(!validPassword){
            res.status(400).json({ message: 'Incorrect password!'});
            return;
        }

        req.session.save(() =>{
            req.session.userId = dbUserData.id;
            req.session.username = dbUserData.username;
            req.session.loggedIn = true;
            res.json({ user: dbUserData, message: 'You are now logged in!'});
        })
    })
});

//logout
router.post('/logout', (req, res) =>{
    if(req.session.loggedIn){
        req.session.destroy(() =>{
            // ? 204 Code means success (No Content)
            // ? Save and Continue editing functionality
            // ! states logout was a success
            res.status(204).end();
        });
    }
    else{
        res.status(404).end();
    }
});

// * PUT /api/users/1
router.put('/:id', (req, res) => {
    // * expects {username, email, password}

    // * if req.body has exact key/value pairs to match the model, 
    // * you can just use `req.body` instead
    User.update(req.body, {
        individualHooks: true,
        where: {
            id: req.params.id
        }
    })
        .then(dbUserData => {
            if (!dbUserData[0]) {
                res.status(400).json({ message: 'No user found with this id.' });
                return;
            }
            res.json(dbUserData);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});


module.exports = router;