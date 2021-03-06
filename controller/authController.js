const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');
const User = require('../model/userSchema');

router.use(bodyParser.urlencoded({extended:true}));
router.use(bodyParser.json());
//get all users 
router.get('/users',(req,res) => {
    User.find({},(err,data) => {
        if(err) throw err;
        res.send(data)
    })
})

//register
router.post('/register',(req,res) =>{
    let hashPassword = bcrypt.hashSync(req.body.password,8)
    User.create({
        name:req.body.name,
        email:req.body.email,
        password:hashPassword,
        phone:req.body.phone,
        role:req.body.role?req.body.role:'User',
    }, (err,data) => {
        if (err) return res.status(500).send('Error while register')
        res.status(200).send("Registration Successful")
    })
})

//login user
router.post('/login',(req,res) => {
    User.findOne({email:req.body.email}, (err,user) => {
        if (err) return res.status(500).send({auth:false,token:'Error while Login'})
        if(!user) return res.status(200).send({auth:false,token:'No user Found!! Register First'})
        else{
            const passIsValid = bcrypt.compareSync(req.body.password,user.password)
            if(!passIsValid) return res.status(200).send({auth:false,token:'Invalid Password'})
            let token = jwt.sign({id:user._id},config.secret,{expiresIn:86400})
            res.status(200).send({auth:true,token:token})
        }  
    })  
})

//userInfo
router.get('/userInfo',(req,res) => {
    let token = req.headers['x-access-token'];
    if (!token) res.send({auth:false, token:'No Token Provided'})
    jwt.verify(token, config.secret, (err,user) => {
        if (err) res.status(200).send({auth:false,token:'Invalid Token'})
        User.findById(user.id, (err,result) => {
            res.send(result)
        })
    })
})

//delete user
// router.delete('/delete',(req,res) =>{
//     User.remove({},(err,data) => {
//         if(err) throw err;
//         res.send("User Deleted")
//     })
// })


module.exports = router

