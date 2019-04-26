var pass=document.querySelector("#pass");
var toggle=document.querySelector("#toggle");
var img=document.querySelector("#toggle-img");
var flag=false;
toggle.addEventListener("click",function()
{
    if(!flag)
    {
      if(pass.value!="")
      {  
       img.setAttribute("src","../show.png");
       var x=pass.value;
       pass.setAttribute("type","text");
       pass.value=x;
       flag=true;
      }
    }
    else
    {
        img.setAttribute("src","../hide.png");
       var x=pass.value;
       pass.setAttribute("type","password");
       pass.value=x;
       flag=false;
    }
});