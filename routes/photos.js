var express=require('express');
var cookie=require("cookie-parser");
var file=require("fs-extra");
var upload=require("express-fileupload");
var conn=require("../modules/connect");
var enc=require("../modules/Encrypt");
var body=require('body-parser');
var router=express.Router();
router.use(body.urlencoded({extended:true}));
router.use(cookie("This is hardcoded secret that will be to me only"));
router.use(upload());
var method=require("method-override");
var router=express.Router();
router.use(method("_method"));
router.get("/photos/:user",function(req,res)
 {
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {  
    conn.query("select * from photo where username='"+req.params.user+"'",function(err,result,fields)
    {
       if(err)
        console.log(err);
      res.render("showphotos",{user:req.params.user,result:result});
    });
  }
 });
 router.get("/addphoto/:user",function(req,res)
 {
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else  
    res.render("addphoto",{user:req.params.user});
 });
 router.post("/addphoto/:user",function(req,res)
 {
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {  
     var photo=req.files.photo;
     photo.mv("./public/uploads/"+req.params.user+"/"+photo.name,function(err)
     {
         if(err)
           console.log(err);
     });
     conn.query("insert into photo values('"+req.params.user+"',"+"'"+photo.name+"')",function(err,result,fields)
     {
     });
    res.redirect("/photos/"+req.params.user);
  } 
 });
 router.get("/viewphoto/:user/:id",function(req,res)
 {
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {  
   conn.query("select * from comment_photo where username='"+req.params.user+"' and photo_name='"+req.params.id+"'",function(err,result,fields)
   {
    res.render("viewphoto",{user:req.params.user,photo:req.params.id,result:result});
    });
  }
 });
router.delete("/delete/photo/:user/:photo",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {  
   conn.query("delete from photo where username='"+req.params.user+"' and photo_name='"+req.params.photo+"'",function(err,result,fields)
   {
   });
   conn.query("delete from comment_photo where username='"+req.params.user+"' and photo_name='"+req.params.photo+"'",function(err,result,fields)
   {
   });
   res.redirect("/photos/"+req.params.user);
  }
});
module.exports=router;