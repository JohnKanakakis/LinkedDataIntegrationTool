$(document).ready(function(){
	initUI();
});

var util = util || {}; 
function initUI(){
    	
    	util.panel.header.init(3,function(){
    	    
    	    var progressBarDiv = $("<div>").attr('id','progressbar');
    	    progressBarDiv.appendTo($("div.next-step-button-container"));
    	    progressBarDiv.progressbar({
    		value: false
    	    });
    	    queriesManager.saveDataspace(function(){
    		setTimeout(function(){
    		    progressBarDiv.remove();
		},1000);
    	    });
    	});
    	util.dataspaceProject.getBasicMetadata();
    	panel.init();
    	var coverDiv = util.panel.addCoverDiv($("div.mainContent"));
    	var message = util.panel.addAJAXMessage("Building Dataspace . . .");
    	/*var mainContent = $('div.mainContent');
    	var messageBox = $('<div>').addClass('building-dataspace').appendTo("#main-tabs");
    	console.log(mainContent.width()+"/"+mainContent.height());
    	messageBox.css({
    	   'left':(mainContent.width()-messageBox.width())/2,
    	   'top':(mainContent.height()-messageBox.height())/2,
    	});
    	var coverDiv = $('<div>').addClass('cover-div');
    	coverDiv.height(window.innerHeight);
    	coverDiv.width(window.innerWidth);
    	coverDiv.css({
    	    'opacity':0.5,
    	    'filter':'alpha(opacity=50)',
    	    'background-color':'white'
    	})
    	.appendTo(mainContent);
    	var messageSpan = $('<span>').text("Building Dataspace . . .").css({
    	    'padding-left': '70px',
    	    'top': '45px',
    	    'position': 'relative'
    	}).appendTo(messageBox);
    	$('<div>').addClass('box-body loading').css('opacity',1).appendTo(messageBox);*/
    	
    	$.ajax({
    	    type : "POST",
    	    url : "IntegrationServiceServlet/command/queries/build-dataspace",
    	    success : function(answer) {
    		console.log(JSON.stringify(answer));
    		if(answer["build"] > 0){
    		    queriesManager.getPrefixes();
    		    queriesManager.getLinks();
    		    queriesManager.getVocabulary();
    		    queriesManager.getGraphs(panel.queriesSection.editorTab.addNamedGraphs); 
    		    message.text.text("Loading queries . . .");
    		    queriesManager.getDataspaceQueries(panel.queriesSection.addQueries);
    		    setTimeout( function(){
    			message.box.remove();
    			coverDiv.remove();
    		    },1500 );
    		}else{
    		    alert('An error occured!!');
    		    message.box.remove();
    		    coverDiv.remove();
    		}
    	    }, 
    	    error:function(){
    		 alert('An error occured!!');
    		 message.box.remove();
    		 coverDiv.remove();
    	    },
    	    dataType:'json'
        });	
    	
};



	