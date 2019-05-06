var body=require('body-parser');
var emailjs=require('emailjs');
var express=require('express');
var method=require("method-override");
var router=express.Router();
router.use(body.urlencoded({extended:true}));
router.use(method("_method"));
router.get("/forgotpass",function(req,res)
{
     res.render("forgotpass");
});
router.post("/forgotpass",function(req,res)
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
router.get("/resetpass/:user",function(req,res)
{
   res.render("resetpass",{user:req.params.user});
});
router.put("/resetpass/:user",function(req,res)
{
     var pass=req.body.password;
     conn.query("update user set password='"+pass+"'"+" where username='"+req.params.user+"'",function(err,result,fields)
     {
     });
     req.flash("signerror","Password reset successfully");
     res.redirect("/"); 
});
module.exports=router;