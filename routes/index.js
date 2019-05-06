var express=require('express');
var session=require("express-session");
var flash=require("connect-flash");
var cookie=require("cookie-parser");
var file=require("fs-extra");
var upload=require("express-fileupload");
var conn=require("../modules/connect");
var enc=require("../modules/Encrypt");
var body=require('body-parser');
var router=express.Router();
router.use(body.urlencoded({extended:true}));
router.use(session({
    secret:"This is secret to the user only",
    resave:false,
    saveUninitialized:false,
   }));
router.use(flash());
router.use(cookie("This is hardcoded secret that will be to me only"));
router.use(upload());
router.get("/",function(req,res)
{
    var sessid=req.signedCookies["uname"];
      if(sessid==undefined)
        res.redirect("/signin");
      else
      {
        conn.query("select * from state where sessid='"+sessid+"'",function(err,result,fields)
        {
         res.redirect("/showprofile/"+result[0].username);
        }); 
      } 
});
router.get("/signin",function(req,res)
{
   res.render("signin",{signerr:req.flash("signerror")});
});
router.post("/signin",function(req,res)
{
   var uname=req.body.username;
   var pass=req.body.password;
   var firstenc=enc(pass);
   var secondenc=enc("P"+firstenc+"D");
   conn.query("select * from user where username='"+uname+"'",function(error,result,fields)
   {
          if(result.length==0)
          {
               req.flash("signerror","Username does not exist");
               res.redirect("/signin");
          }
          else if(result[0].password!=secondenc)
          {
            req.flash("signerror","Wrong password");
            res.redirect("/signin");
          }
          else
          {
           conn.query("insert into state values('"+uname+"',"+"'"+req.sessionID+"')",function(e,r,f)
            {
            }); 
           res.cookie("uname",req.sessionID,{maxAge:94608000000,signed:true}); 
           res.redirect("/showprofile/"+uname);
         }
   });
});
router.get("/signup",function(req,res)
{
    res.render("signup",{msg:req.flash("msg")});
});
router.post("/signup",function(req,res)
{
     var fname=req.body.fname;
     var lname=req.body.lname;
     var uname=req.body.username;
     var pass=req.body.password;
     var DOB=req.body.DOB;
     var profile=req.files.profile;
     var gen=req.body.gender;
     var firstenc=enc(pass);
     var secondenc=enc("P"+firstenc+"D");
     var query="";
     if(profile!=null)
      query="insert into user values('"+uname+"',"+"'"+fname+"',"+"'"+lname+"',"+"'"+secondenc+"',"+"'"+DOB+"',"+"'"+gen+"',"+"'"+"profile_pic.jpg"+"')";
     else
       query="insert into user values('"+uname+"',"+"'"+fname+"',"+"'"+lname+"',"+"'"+secondenc+"',"+"'"+DOB+"',"+"'"+gen+"',"+"'"+"empty"+"')"; 
     conn.query("select * from user where username='"+uname+"'",function(e,r,f)
     {
              if(r.length!=0)
              {
                 req.flash("msg","Username exists");
                 res.redirect("/signup");
              }
              else
              {
                conn.query(query,function(err,result,fields)
                {
                  if(err)
                    console.log(err);
                   else
                   {
                    file.mkdir("./public/uploads/"+uname,function(err)
                    {
                    if(err)
                     console.log(err);
                    });
                     if(profile!=null)
                     {  
                       profile.mv("./public/uploads/"+uname+"/"+"profile_pic.jpg",function(err){
                         if(err)
                          console.log(err);
                       });
                     conn.query("insert into photo values('"+uname+"'"+"and photo_name='"+"profile_pic.jpg"+"')",function(e,r,f)
                     {
                         if(e)
                           console.log(e);
                     });
                    }
                     res.redirect("/signin");
                   } 
                 });
          }
     });
});
router.get("/signout",function(req,res)
{
   var sessid=req.signedCookies["uname"];
    conn.query("delete from state where sessid='"+sessid+"'",function(err,result,fields)
    {
        if(err)
          console.log(err);
    });
    res.clearCookie("uname");
   res.redirect("/signin"); 
});
router.get("/showprofile/:user",function(req,res)
{
   var sessid=req.signedCookies["uname"];
   if(sessid==undefined)
     res.redirect("/signin");
   else
   {  
    conn.query("select * from user where username='"+req.params.user+"'",function(err,result,fields)
    {
        conn.query("select count(*) as count from photo where username='"+req.params.user+"'",function(error,results,fields)
        {
          conn.query("select count(*) as count from friends where username='"+req.params.user+"'",function(e,r,f)
          {
            conn.query("select count(*) as count from message where recipent='"+req.params.user+"'",function(e1,r1,f1)
            {
            conn.query("select count(*) as count from request where recipent='"+req.params.user+"'",function(e2,r2,f2)
            { 
              conn.query("select * from post where username='"+req.params.user+"' or username in("+"select friends from friends where username='"+req.params.user+"'"+")",function(e3,r3,f3)
              {
                conn.query("select * from friends F join (select * from state S natural join(select * from user)U)O where F.username='"+req.params.user+"'"+" and F.friends=O.username",function(e4,r4,f4)
                {
                  res.render("showprofile",{username:req.params.user,result:result,photo:results[0].count,friends:r[0].count,message:r1[0].count,request:r2[0].count,posts:r3,mood:req.flash("mood"),online:r4});
                 });
               });        
             });
            });         
          });
        });
    });
  }
});
router.get("/viewprofile/:user",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {  
    conn.query("select * from user where username='"+req.params.user+"'",function(err,result,fields)
    {
         conn.query("select * from state where sessid='"+req.signedCookies["uname"]+"'",function(e,r,f)
         {
             conn.query("select * from friends where username='"+r[0].username+"'"+"and friends='"+req.params.user+"'",function(error,results,field)
             {
              res.render("viewprofile",{result:result,actual_user:r[0].username,friends:results,success:req.flash("success")});
             });
         });
    });
   }
 });
module.exports=router;