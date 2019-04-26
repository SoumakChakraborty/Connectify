var express=require("express");
var app=express();
var http=require("http").Server(app);
var io=require("socket.io")(http);
var conn=require("./modules/connect");
var enc=require("./modules/Encrypt");
var body=require("body-parser");
var session=require("express-session");
var flash=require("connect-flash");
var cookie=require("cookie-parser");
var file=require("fs-extra");
var upload=require("express-fileupload");
var checker=require("./modules/checker");
var method=require("method-override");
var emailjs=require("emailjs");
app.use(method("_method"));
app.use(upload());
app.use(cookie("This is hardcoded secret that will be to me only"));
app.use(session({
   secret:"This is secret to the user only",
   resave:false,
   saveUninitialized:false,
  }));
app.use(flash());
app.use(body.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));
app.get("/",function(req,res)
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
app.get("/signin",function(req,res)
{
   res.render("signin",{signerr:req.flash("signerror")});
});
app.post("/signin",function(req,res)
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
app.get("/signup",function(req,res)
{
    res.render("signup",{msg:req.flash("msg")});
});
app.post("/signup",function(req,res)
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
app.get("/signout",function(req,res)
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
app.get("/showprofile/:user",function(req,res)
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
app.post("/search",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {  
    var query=req.body.query;
    conn.query("select * from user",function(err,result,fields)
    {
        var actual=[];
        for(var i=0;i<result.length;i++)
        {
          var flag=checker(result[i].fname+" "+result[i].lname,query);
          if(flag==true)
            actual.push(result[i]);
        }
             res.render("queryresult",{query:query,result:actual});  
   });
  }
});
app.get("/viewprofile/:user",function(req,res)
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
app.get("/sendmessage/:user/:recipent",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else  
    res.render("sendmessage",{user:req.params.user,recipent:req.params.recipent});
});
app.post("/sendmessage/:user/:recipent",function(req,res)
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
app.get("/addfriend/:user/:recipent",function(req,res)
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
app.get("/showmessages/:user",function(req,res)
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
app.delete("/deletemessage/:recipent/:user",function(req,res)
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
app.get("/showrequests/:user",function(req,res)
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
app.get("/acceptrequest/:user/:sender",function(req,res)
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
app.delete("/deleterequest/:user/:sender",function(req,res)
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
app.get("/newpost/:user",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else  
   res.render("newpost",{error:req.flash("error"),user:req.params.user});
});
app.post("/newpost/:user",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {  
    var title=req.body.postname;
    var post=req.body.postcontent;
    var photo=req.files;
    var d=new Date();
    var created=d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
    if(post==""&&photo==null)
    {
      req.flash("error","Cannot create post as both fields are empty");
      res.redirect("/newpost/"+req.params.user);
    }
    else if(post==""&&photo!=null)
    {
       conn.query("insert into post(username,content,photo_name,created,title) values('"+req.params.user+"',"+"'"+"empty"+"',"+"'"+title+".jpg"+"',"+"'"+created+"',"+"'"+title+"')",function(err,result,fields)
       {
            if(err)
              console.log(err);
       });
       photo.postphoto.mv("./public/uploads/"+req.params.user+"/"+title+".jpg",function(e)
       {
             if(e)
                console.log(e);
       });
      res.redirect("/showprofile/"+req.params.user); 
    }
    else if(post!=""&&photo==null)
    {
      conn.query("insert into post(username,content,photo_name,created,title) values('"+req.params.user+"',"+"'"+post+"',"+"'"+"empty"+"',"+"'"+created+"',"+"'"+title+"')",function(err,result,fields)
      {
           if(err)
             console.log(err);
      });
     res.redirect("/showprofile/"+req.params.user);
    }
    else
    {
      conn.query("insert into post(username,content,photo_name,created,title) values('"+req.params.user+"',"+"'"+post+"',"+"'"+title+".jpg"+"',"+"'"+created+"',"+"'"+title+"')",function(err,result,fields)
       {
            if(err)
              console.log(err);
       });
       photo.postphoto.mv("./public/uploads/"+req.params.user+"/"+title+".jpg",function(e)
       {
             if(e)
                console.log(e);
       });
       res.redirect("/showprofile/"+req.params.user); 
    }
  }
});
app.get("/editpost/:user/:id",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {   
  conn.query("select * from post where post_ID='"+req.params.id+"' and "+"username='"+req.params.user+"'",function(err,result,fields)
  {
    res.render("editpost",{result:result,user:req.params.user,post_id:req.params.id,error:req.flash("error")});
  });
  }
});
app.put("/editpost/:user/:id",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {  
  var title=req.body.postname;
  var post=req.body.postcontent;
  // console.log(post);
  var photo=req.files;
  var d=new Date();
  var created=d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
  if(post==""&&photo==null)
  {
    req.flash("error","Cannot create post as both fields are empty");
    res.redirect("/editpost/"+req.params.user+"/"+req.params.id);
  }
  else if(post==""&&photo!=null)
  {
     conn.query("update post set content='empty' where post_ID='"+req.params.id+"' and username='"+req.params.user+"'",function(err,result,fields)
     {
          if(err)
            console.log(err);
     });
     conn.query("update post set photo_name='"+title+".jpg'"+"where post_ID='"+req.params.id+"' and username='"+req.params.user+"'",function(err,result,fields)
     {
          if(err)
            console.log(err);
     });
     photo.postphoto.mv("./public/uploads/"+req.params.user+"/"+title+".jpg",function(e)
     {
           if(e)
              console.log(e);
     });
    res.redirect("/showprofile/"+req.params.user); 
  }
  else if(post!=""&&photo==null)
  {
    conn.query("select * from post where post_ID='"+req.params.id+"' and username='"+req.params.user+"'",function(err,result,fields)
    {
              if(result[0].photo_name!="empty")
                file.unlinkSync("./public/uploads/"+req.params.user+"/"+title+".jpg");

    });
    conn.query("update post set content='"+post+"'"+"where post_ID='"+req.params.id+"' and username='"+req.params.user+"'",function(err,result,fields)
     {
          if(err)
            console.log(err);
     });
     conn.query("update post set photo_name='empty'"+"where post_ID='"+req.params.id+"' and username='"+req.params.user+"'",function(err,result,fields)
     {
          if(err)
            console.log(err);
     });
     res.redirect("/showprofile/"+req.params.user);  
  }
  else
  {
    conn.query("update post set photo_name='"+title+".jpg'"+"where post_ID='"+req.params.id+"' and username='"+req.params.user+"'",function(err,result,fields)
     {
          if(err)
            console.log(err);
     });
     photo.postphoto.mv("./public/uploads/"+req.params.user+"/"+title+".jpg",function(e)
     {
           if(e)
              console.log(e);
     });
     conn.query("update post set content='"+post+"'"+"where post_ID='"+req.params.id+"' and username='"+req.params.user+"'",function(err,result,fields)
     {
          if(err)
            console.log(err);
     });
     res.redirect("/showprofile/"+req.params.user); 
   } 
  }
});
app.delete("/deletepost/:user/:id",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {  
   conn.query("select * from post where post_ID='"+req.params.id+"' and username='"+req.params.user+"'",function(err,result,fields)
  {
            if(result[0].photo_name!="empty")
              file.unlinkSync("./public/uploads/"+req.params.user+"/"+title+".jpg");

  });
  conn.query("delete from post where username='"+req.params.user+"' and post_ID='"+req.params.id+"'",function(err,result,fields)
  {
  });
  res.redirect("/showprofile/"+req.params.user);
  }
});
app.get("/comment/:user/:id",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
   else 
    res.render("comment",{user:req.params.user,post_ID:req.params.id});
});
app.post("/comment/:user/:id",function(req,res)
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
app.get("/viewpost/:user/:id",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {  
    conn.query("select * from post where username='"+req.params.user+"' and post_ID='"+req.params.id+"'",function(error,result,fields)
    {
         conn.query("select * from comment_post C"+" natural join (select * from post where username='"+req.params.user+"'"+" and post_ID='"+req.params.id+"'"+")C",function(err,results,fields)
         {
           conn.query("select * from mood M where post_ID='"+req.params.id+"'",function(e,r,f)
           {
                res.render("viewpost",{actual:req.params.user,posts:result,comment:results,mood:r});
           });
         });
    });
  }
});
app.get("/edit/comment/:user/:id",function(req,res)
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
app.put("/edit/comment/:user/:id",function(req,res)
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
 app.delete("/delete/comment/:user/:id",function(req,res)
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
 app.get("/mood/:user/:id/:type",function(req,res)
 {
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {  
     conn.query("update mood set type='"+req.params.type+"'"+"where username='"+req.params.user+"' and post_ID='"+req.params.id+"'",function(err,result,fields)
     {
     });
     req.flash("mood","You "+req.params.type+" the post");
     res.redirect("/showprofile/"+req.params.user);
    }
 });
 app.get("/friends/:user",function(req,res)
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
 app.get("/unfriend/:user/:friend",function(req,res)
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
 app.get("/photos/:user",function(req,res)
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
 app.get("/addphoto/:user",function(req,res)
 {
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else  
    res.render("addphoto",{user:req.params.user});
 });
 app.post("/addphoto/:user",function(req,res)
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
 app.get("/viewphoto/:user/:id",function(req,res)
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
 app.get("/comment/photo/:user/:photo",function(req,res)
 {
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else  
    res.render("commentphoto",{user:req.params.user,photo:req.params.photo});
 });
 app.post("/comment/photo/:user/:photo",function(req,res)
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
 app.get("/edit/comment/photo/:user/:photo",function(req,res)
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
app.put("/edit/comment/photo/:user/:photo",function(req,res)
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
app.delete("/comment/:user/:photo/delete/",function(req,res)
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
app.delete("/delete/photo/:user/:photo",function(req,res)
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
app.get("/chat/:user",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else  
    res.render("chat",{user:req.params.user}); 
});
io.on("connection",function(socket)
{
    socket.join("Chat room");
    socket.on("chat message",function(msg,user)
    {
        socket.to("Chat room").broadcast.emit("chat message",msg);
    }); 
});
app.get("/changepass/:user",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else  
     res.render("changepass",{user:req.params.user});
});
app.put("/changepass/:user",function(req,res)
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
app.get("/changeprofilepic/:user",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else  
    res.render("changeprofpic",{user:req.params.user});
});
app.put("/changeprofilepic/:user",function(req,res)
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
app.get("/forgotpass",function(req,res)
{
     res.render("forgotpass");
});
app.post("/forgotpass",function(req,res)
{
     var usermail=req.body.email;
     var server=emailjs.server.connect({
      user:"yelpcamp500@gmail.com",
      password:"Windows90#",
      host:"smtp.gmail.com",
      ssl:true
     });
     server.send({
       from:"yelpcamp500@gmail.com",
       to:usermail,
       text:"Please click on the link below to reset password \n http://localhost:3000/resetpass"+"/"+usermail+"\n Yours faithfully,\n"+"Connectify Team"
     },function(err,msg)
     {
       console.log(err||msg);
     });
    res.redirect("/"); 
});
app.get("/resetpass/:user",function(req,res)
{
   res.render("resetpass",{user:req.params.user});
});
app.put("/resetpass/:user",function(req,res)
{
     var pass=req.body.password;
     conn.query("update user set password='"+pass+"'"+" where username='"+req.params.user+"'",function(err,result,fields)
     {
     });
     req.flash("signerror","Password reset successfully");
     res.redirect("/"); 
});
http.listen(3000,"192.168.0.101",function()
{
   console.log("Server started");
});