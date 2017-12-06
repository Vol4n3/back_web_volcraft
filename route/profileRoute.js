let express = require('express');
let router = express.Router();
let Session = require('../controller/sessionController');
let Profile = require('../controller/profileController');

router.put('/', (req, res) => {
    if (req.query.token) {
        Session.connect(req.query.token).then((sessionData) => {
            if (sessionData) {
                Profile.update(sessionData.profileId, req.body).then((doc) => {
                    if (doc) {
                        res.sendStatus(204);
                    } else {
                        res.sendStatus(400);
                    }
                }).catch(() => {
                    res.sendStatus(400);
                })
            } else {
                res.sendStatus(404);
            }
        }).catch(() => {
            res.sendStatus(404);
        })
    } else {
        res.sendStatus(400);
    }
});
router.get('/', (req, res) => {
    if (req.query.token) {
        Session.connect(req.query.token).then((sessionData) => {
            if (sessionData) {
                Profile.getOne(sessionData.profileId).then((profileData) => {
                    res.status(200).json(profileData);
                }).catch(() => {
                    res.sendStatus(404);
                })
            } else {
                res.sendStatus(404);
            }
        }).catch(() => {
            res.sendStatus(404);
        })
    } else {
        res.sendStatus(400);
    }
});
router.get('/:id', (req, res) => {
    if (req.params.id) {
        Profile.getOne(req.params.id).then((profileData) => {
            res.status(200).json(profileData);
        }).catch(() => {
            res.sendStatus(404);
        })
    } else {
        res.sendStatus(400);
    }
});
module.exports = router;