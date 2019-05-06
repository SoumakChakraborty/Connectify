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
router.get("/comment/:user/:id",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
   else 
    res.render("comment",{user:req.params.user,post_ID:req.params.id});
});
router.post("/comment/:user/:id",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {  
    var comment=req.body.comment;
    conn.query("insert into comment_post values(\""+req.params.id+"\","+"\""+req.params.user+"\","+"\""+comment+"\")",function(err,result,fields)
    {
       if(err)
        console.log(err);
    });
    res.redirect("/viewpost/"+req.params.user+"/"+req.params.id);
  } 
});
router.get("/edit/comment/:user/:id",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {  
   conn.query("select * from comment_post where username='"+req.params.user+"'"+"and post_ID='"+req.params.id+"'",function(err,result,fields)
   { 
      if(err)
       console.log(err);
    res.render("editcomment",{result:result,user:req.params.user,post_ID:req.params.id});
  });
  }
});
router.put("/edit/comment/:user/:id",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {  
   var comment=req.body.comment;
  conn.query("update comment_post set comment=\""+comment+"\" where username='"+req.params.user+"'"+" and post_ID='"+req.params.id+"'",function(err,result,fields)
  {
     if(err)
      console.log(err);
  });
  }
});
 router.delete("/delete/comment/:user/:id",function(req,res)
 {
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {  
      conn.query("delete from comment_post where username='"+req.params.user+"'"+" and post_ID='"+req.params.id+"'",function(err,result,fields)
      {
      });
      res.redirect("/viewpost/"+req.params.user+"/"+req.params.id);
   }  
 }); 
 router.get("/comment/photo/:user/:photo",function(req,res)
 {
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else  
    res.render("commentphoto",{user:req.params.user,photo:req.params.photo});
 });
 router.post("/comment/photo/:user/:photo",function(req,res)
 {
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {  
     var comment=req.body.comment;
     conn.query("insert into comment_photo values('"+req.params.user+"',"+"'"+req.params.photo+"',"+"\""+comment+"\""+")",function(err,result,fields)
     {
     });
   res.redirect("/viewphoto/"+req.params.user+"/"+req.params.photo);
    }  
 });
router.get("/edit/comment/photo/:user/:photo",function(req,res)
 {   
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
   else
   { 
      conn.query("select * from comment_photo where username='"+req.params.user+"' and photo_name='"+req.params.photo+"'",function(err,result,fields)
      {
        res.render("editcommentphoto",{result:result,user:req.params.user,photo:req.params.photo});
      });
    }
});
router.put("/edit/comment/photo/:user/:photo",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {  
    var comment=req.body.comment;
    conn.query("update comment_photo set comment=\""+comment+"\""+" where username='"+req.params.user+"' and photo_name='"+req.params.photo+"'",function(err,result,fields)
    {
    });
    res.redirect("/viewphoto/"+req.params.user+"/"+req.params.photo);
  }
});
router.delete("/comment/:user/:photo/delete/",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {  
   conn.query("delete from comment_photo where username='"+req.params.user+"' and photo_name='"+req.params.photo+"'",function(err,result,fields)
   {
   });
   res.redirect("/viewphoto/"+req.params.user+"/"+req.params.photo);
  }
});
module.exports=router;