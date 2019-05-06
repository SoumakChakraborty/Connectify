var flash=require("connect-flash");
var express=require('express');
var cookie=require("cookie-parser");
var upload=require("express-fileupload");
var conn=require("../modules/connect");
var body=require('body-parser');
var router=express.Router();
router.use(body.urlencoded({extended:true}));
router.use(cookie("This is hardcoded secret that will be to me only"));
router.use(upload());
var method=require("method-override");
router.use(method("_method"));
router.use(flash());
router.get("/addfriend/:user/:recipent",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
 else
 {   
  conn.query("select * from request where username='"+req.params.user+"' and recipent='"+req.params.recipent+"'",function(e,r,f)
  {
    if(r.length!=0)
    {
      req.flash("success","Request already sent");
      res.redirect("/viewprofile/"+req.params.recipent);
    }
    else
    {
     conn.query("insert into request values('"+req.params.user+"'"+",'"+req.params.recipent+"')",function(err,results,fields)
     {
      if(err)
       console.log(err);
     });
     req.flash("success","Request sent successfully");
     res.redirect("/viewprofile/"+req.params.recipent);
    }
  });
 }   
});
router.get("/friends/:user",function(req,res)
 {
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {  
      conn.query("select * from user U join (select friends from friends where username='"+req.params.user+"')F where U.username=F.friends",function(err,result,fields)
      {
          res.render("showfriends",{user:req.params.user,result:result});
      });
    }
 });
 router.get("/unfriend/:user/:friend",function(req,res)
 {
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {  
      conn.query("delete from friends where username='"+req.params.user+"' and friends='"+req.params.friend+"'",function(err,result,fields)
      {   
      });
     res.render("/friends/"+req.params.user);
    } 
 });
module.exports=router;