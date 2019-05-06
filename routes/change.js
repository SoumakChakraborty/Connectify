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
router.get("/changepass/:user",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else  
     res.render("changepass",{user:req.params.user});
});
router.put("/changepass/:user",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {  
   var pass=req.body.password;
   conn.query("update user set password='"+pass+"'"+" where username='"+req.params.user+"'",function(err,result,fields)
   {
     if(err)
       console.log(err);
   });
   req.flash("mood","Password changed successfully");
   res.redirect("/showprofile/"+req.params.user);
  } 
});
router.get("/changeprofilepic/:user",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else  
    res.render("changeprofpic",{user:req.params.user});
});
router.put("/changeprofilepic/:user",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {  
     var profile=req.files.photo;
     conn.query("select * from user where username='"+req.params.user+"'",function(err,result,fields)
     {
          if(result[0].photo_name=="empty")
          {
            profile.mv("./public/uploads/"+req.params.user+"/profile_pic.jpg",function(err)
            {
               if(err)
                console.log(err);
            });
            conn.query("update user set profile_pic='profile_pic.jpg' where username='"+req.params.user+"'",function(e,r,f)
            {
            });       
          }
         else
         {
          file.unlinkSync("./public/uploads/"+req.params.user+"/profile_pic.jpg");
          profile.mv("./public/uploads/"+req.params.user+"/profile_pic.jpg",function(err)
          {
             if(err)
              console.log(err);
          });
         }  
     });
     req.flash("mood","Profile picture changed successfully");
     res.redirect("/showprofile/"+req.params.user);
    }
});
module.exports=router;