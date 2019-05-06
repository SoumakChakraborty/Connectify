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
router.get("/showrequests/:user",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {   
    var query="select * from user U natural join (select * from request where recipent='"+req.params.user+"')R";
    conn.query(query,function(err,result,fields)
    {
        res.render("showrequests",{result:result});
    });
  }
});
router.get("/acceptrequest/:user/:sender",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {   
    conn.query("insert into friends values('"+req.params.user+"',"+"'"+req.params.sender+"')",function(err,results,fields)
    {
        if(err)
          console.log(err);
    });
    conn.query("insert into friends values('"+req.params.sender+"',"+"'"+req.params.user+"')",function(err,results,fields)
    {
        if(err)
          console.log(err);
    });
    conn.query("delete from request where username='"+req.params.sender+"' and recipent='"+req.params.user+"'",function(err,result,fields)
    {
        if(err)
           console.log(err);
    });
   res.redirect("/showrequests/"+req.params.user);
  } 
});
router.delete("/deleterequest/:user/:sender",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {  
   conn.query("delete from request where username='"+req.params.sender+"' and recipent='"+req.params.user+"'",function(err,result,fields)
   {
      if(err)
         console.log(err);
  });
 res.redirect("/showrequests/"+req.params.user);
  }
});
module.exports=router;