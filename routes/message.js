var flash=require("connect-flash");
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
router.use(flash());
router.get("/sendmessage/:user/:recipent",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else  
    res.render("sendmessage",{user:req.params.user,recipent:req.params.recipent});
});
router.post("/sendmessage/:user/:recipent",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {  
    var message=req.body.message;
    conn.query("insert into message values('"+req.params.user+"'"+",'"+req.params.recipent+"'"+",'"+message+"')",function(err,results,fields)
    {
      if(err)
       console.log(err);
    });
   req.flash("success","Message sent successfully");
   res.redirect("/viewprofile/"+req.params.recipent);
  } 
});
router.get("/showmessages/:user",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {  
    conn.query("select * from message where recipent='"+req.params.user+"'",function(err,result,fields)
    {
         res.render("showmessages",{result:result});
    });
  }
});
router.delete("/deletemessage/:recipent/:user",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {  
   conn.query("delete from message where username='"+req.params.user+"'"+"and recipent='"+req.params.recipent+"'",function(err,result,fields)
   {
     if(err)
      console.log(err);
   });
   res.redirect("/showmessages/"+req.params.recipent);
  } 
});
module.exports=router;