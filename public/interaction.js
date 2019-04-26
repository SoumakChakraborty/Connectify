var a=document.querySelectorAll(".contracted");
var b=document.querySelectorAll(".expanded");
var c=document.querySelectorAll(".view-more");
var d=document.querySelectorAll(".view-less");
c[0].addEventListener("click",function()
{
    d[0].classList.toggle("view-less-click");
    c[0].classList.toggle("view-more-click");
    a[0].classList.toggle("contracted-click");
    b[0].classList.toggle("expanded-click");
});
d[0].addEventListener("click",function()
{
    d[0].classList.toggle("view-less-click");
    c[0].classList.toggle("view-more-click");
    a[0].classList.toggle("contracted-click");
    b[0].classList.toggle("expanded-click");
});
