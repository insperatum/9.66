---
layout: chapter
title: localStorage 
description: 
hidden: true
type: pset
---
<div id="debugTxt"></div>
<script type="text/javascript">
txt=""
var _lsTotal=0,_xLen,_x;
for(var i=0; i<localStorage.length; i++){
	_x=localStorage.key(i); 
	_xLen= ((localStorage[_x].length + _x.length)* 2);
	_lsTotal+=_xLen;
	txt += _x.substr(0,50)+" = "+ (_xLen/1024).toFixed(2)+" KB" + "<br/>"
};
txt += "Total = " + (_lsTotal / 1024).toFixed(2) + " KB";
$("#debugTxt").html(txt)
</script>
