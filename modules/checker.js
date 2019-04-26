function check(T,P)
{
    var m=T.length;
    var n=P.length;
    var pref=compute(P);
    var k=-1;
    for(var i=0;i<m;i++)
    {
        while(k>-1&&P.charAt(k+1)!=T.charAt(i))
          k=pref[k];
        if(P.charAt(k+1)==T.charAt(i))
         k++;
        if(k==n-1)
          return true;
    }
  return false;  
}
function compute(P)
{
    var pref=[];
    var k=-1;
    pref[0]=-1;
    for(var i=1;i<P.length;i++)
    {
        while(k>-1&&P.charAt(k+1)!=P.charAt(i))
          k=pref[k];
        if(P.charAt(k+1)==P.charAt(i))
          k++;
        pref[i]=k;    
    }
  return pref;  
}
module.exports=check;