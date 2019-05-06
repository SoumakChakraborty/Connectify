var express=require('express');
var app=express();
var http=require('http').Server(app);
var io=require("socket.io")(http);
var router=express.Router();
router.get("/chat/:user",function(req,res)
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
module.exports=router;