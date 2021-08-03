const express = require('express');
const app = express();
const mongoose = require('mongoose');
const User = require('./models/Users');
var bodyParser= require('body-parser');
var jsonParser=bodyParser.json();
var crypto= require('crypto');
var key="password";
var algo='aes256';
const jwt = require('jsonwebtoken');
jwtKey="jwt"
//const joi = require('@hapi/joi');
const {userValidation} = require('./validation_joi/validation');
const multer = require ('multer');
const { read } = require('fs/promises');
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads/');
    },
    filename: function(req, file, cb){
        cb(null, new Date().getTime() + file.originalname);
    } 
});

const upload = multer({storage: storage});


mongoose.connect('mongodb+srv://Shubham:Shubham@102@cluster0.boihb.mongodb.net/Tasks?retryWrites=true&w=majority',
{
    useNewUrlParser:true,
    useUnifiedTopology:true
} 
);
app.get('/userss',function(req,res){
     User.find().then((data)=>{
         res.send({data})
     });
});

app.post('/adduser',jsonParser,verifyrole,upload.single('image'),function(req,res){
    console.log(req.file);
    var cipher= crypto.createCipher(algo,key);
    var encrypted= cipher.update(req.body.password,'utf8','hex')
    +cipher.final('hex');
            
            //console.warn(encrypted)
            const data=new User({
            _id:new mongoose.Types.ObjectId(),
            name:req.body.name,
            email:req.body.email,
            address:req.body.address,
            password: encrypted,
            image: req.file.path,
            role: req.body.role
        })
        const {error} = userValidation(req.body);
        if(error){
            res.send(error.details[0].message);
        }
        else{
            data.save().then((result)=>{
                jwt.sign({result},jwtKey,{expiresIn:'300s'},(err,token)=>{
                    res.status(201).json({token})
                });
                //res.status(201).json(result)
            })
            .catch((error)=>console.warn(error)) 
        }
          
});

app.delete('/deluser/:id',verifyrole,function(req,res){
    User.deleteOne({_id:req.params.id}).then((result)=>{
        res.status(200).json(result)
    })
    .catch((err)=>{console.warn(err)})
});

app.put("/upduser/:_id",jsonParser,function(req,res){
    User.updateOne(
        {_id: req.params._id},
        {$set: {
            name:req.body.name,
            email: req.body.email,
            address: req.body.address
        }}
    ).then((result)=>{
        res.status(200).json(result)
    }).catch((err)=>{console.warn(err)})
});

app.post('/login', jsonParser,function(req,res){
   User.findOne({email:req.body.email}).then((data)=>{
     var decipher= crypto.createDecipher(algo,key);
     var decrypted= decipher.update(data.password,'hex','utf8')+
     decipher.final('utf8'); 
     if(decrypted==req.body.password)
     {
        jwt.sign({data},jwtKey,{expiresIn:'300s'},(err,token)=>{
            res.status(201).json({token})
        })    
     }
     console.warn("decrypted",decrypted);
    //res.json(data)
   }) 
});

app.get('/users',verifyToken,function(req,res){
    User.find().then((result)=>{
        res.status(200).json(result)
    })
})
function verifyToken(req,res,next){
    const bearerHeader= req.headers['authorization'];
   
    
    if(typeof bearerHeader !=='undefined')
    {
        const bearer=bearerHeader.split(' ')
        console.warn(bearer[1])
        req.token=bearer[1]
        jwt.verify(req.token,jwtKey,(err,data)=>{
            if(err)
            {
                res.json({result:err})
            }
            else
            {
                next();
            }
        })
    }
    else{
        res.send({"result" :"token not provided"});
    }
}
//----------------------------------------ADMIN----GENERAL
function verifyrole(req,res,next){
    const bearerHeader= req.headers['authorization'];
   
    
    if(typeof bearerHeader !=='undefined')
    {
        const bearer=bearerHeader.split(' ')
        //console.warn(bearer[1])
        req.token=bearer[1]
        jwt.verify(req.token,jwtKey,(err,data)=>{
            if(err)
            {
                res.json({result:err})
            }
            else
            {
                if (data.data.role == "ADMIN"){
                    next();
                }else {
                    res.send({"result":"Only admin can do this"})
                }
            }
        })
    }
    else{     
        res.send({"result" :"token not provided"});
    }
}
app.listen(4000)  


// show data list in mongo cloude //
//--------------------------------//
/*user.find({},function(err,Users){
    if(err) console.log(err);
    console.log(Users);
})*/

// we can insert data into cloude using this //
//--------------------------------------------//
/*const data= new User({
    _id:new mongoose.Types.ObjectId(),
    name:"tony",
    email:"tony@gmail.com",
    address: " sawgat status 2"
})
data.save().then((result)=>{
    console.warn(result)
})
.catch(err=>console.warn(err))*/

