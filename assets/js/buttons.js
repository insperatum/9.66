function makeState() {
	var d = new Date()
	return JSON.stringify({
			code: $('.CodeMirror').map(function() {return this.CodeMirror.getValue()}).toArray(),
			text: $(".textAnswer").map(function() {return this.value}).toArray(),
			savedAt: d.toLocaleDateString() + " " + d.toLocaleTimeString()
	    })
}

function loadState(state) {
	console.log("Loading state:")
	console.log(state)
	var foo = JSON.parse(state)
	
	$(".textAnswer").each(function(i,o) {o.value = foo.text[i]})
    $(".CodeMirror").each(function(i,o) {o.CodeMirror.setValue(foo.code[i])})

}

function refreshAutosave() {
	if(localStorage.ps2) {
		document.getElementById("autosaveTxt").innerHTML="Autosaved at: " + JSON.parse(localStorage.ps2).savedAt
		// $("#loadBtn").css('visibility', 'visible');
	} else {
		// $("#loadBtn").css('visibility', 'hidden');
	}
}

saveTimeout=null
function delayedSave() {
	if(saveTimeout) window.clearTimeout(saveTimeout);
	saveTimeout = window.setTimeout(function() {
		console.log("Saving")
		localStorage.ps2 = makeState()
		refreshAutosave()
	}, 1000);
}


function init() {
	if($('.CodeMirror').length > 0) {
		if(localStorage.ps2) loadState(localStorage.ps2)
		$(".textAnswer").on("input", delayedSave)
		$('.CodeMirror').each(function() {
			this.CodeMirror.on("change", delayedSave)
		})
	} else {
		setTimeout(init, 100)
	}
}

$(document).ready(function() {
	document.getElementById("exportBtn").onclick = function (){
		var foo = makeState
	    var data = 'data:application/txt;charset=utf-8,' 
	                   + encodeURIComponent(foo);
	    this.href = data;
	    this.target = '_blank';
	    this.download = 'export.txt';
	}

	// document.getElementById("loadBtn").onclick = function() {
	// 	if(localStorage.ps2) loadState(localStorage.ps2)
	// }

	function handleFileSelect(evt) {
	  var f = evt.target.files[0]; // FileList object
      var reader = new FileReader();
      reader.onload = (function(theFile) {
        return function(e) {
      		loadState(reader.result)
        };
      })(f);

      reader.readAsText(f);
	 }

	if (window.File && window.FileReader && window.FileList && window.Blob) {
	  document.getElementById('files').addEventListener('change', handleFileSelect, false);
	} else {
	  alert('The File APIs are not fully supported in this browser.');
	}

	refreshAutosave()
	init()
})