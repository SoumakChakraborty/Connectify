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
router.get("/newpost/:user",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else  
   res.render("newpost",{error:req.flash("error"),user:req.params.user});
});
router.post("/newpost/:user",function(req,res)
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
router.get("/editpost/:user/:id",function(req,res)
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
router.put("/editpost/:user/:id",function(req,res)
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

router.delete("/deletepost/:user/:id",function(req,res)
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
router.get("/viewpost/:user/:id",function(req,res)
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
router.get("/mood/:user/:id/:type",function(req,res)
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

module.exports=router;