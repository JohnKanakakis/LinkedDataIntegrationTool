var util = {};

util.panel = {};

util.panel.addMenuListener = function(){
	 $("body").on("click",function(event){
		$('.ui-menu').hide();
	 });
};


util.panel.header = {
	file:"scripts/general/header.html",
	div:{},
	steps:['Import your data',
	             'Map your data',
	             'Link your data',
	             'Query your data',
	],
	buttonTitles:['Continue to mapping',
	              'Continue to linking',
	              'Continue to queries',
	              'Save Dataspace'
	],
	tooltips:['Load datasets from varius sources',
	          'Transform different schemas into one global target schema',
	          'Interlink same entities from different imported datasets',
	          'Make queries to the dataspace'
	]
};

util.panel.header.init = function(pos,callbackFunction){
	
	var header = $('div.header');
	var self = this;
	self.div = header;
	
	header.load(self.file,function(){
	    self.align(pos);
	    header.on("click","button#proceed-to-next-step-button",function(event){
		event.preventDefault();
		console.log(event);
		if(event.currentTarget.nodeName == "BUTTON"){
		    callbackFunction();
		}
		
	    });
	    header.on("click","div#logo-area",function(event){
		event.preventDefault();
		window.location.replace("index.html");
	    });
	});
	$(window).resize(function(){
		self.align(pos);
	});
};	




util.panel.header.align = function(pos){
    	
    	var self = this;
    	var steps = self.steps;
    	var buttonTitles = self.buttonTitles;
    	
    	var header = self.div;
    	
    	//console.log('header width = '+header.width());
	var stepsArea = header.find("#steps-area");
	
	var sWidth = header.width()*0.8;
	stepsArea.width(header.width()*0.8);
	//console.log("steps area width = "+ sWidth);
	stepsArea.empty();
	var step;
	var left = 10;
	var stepWidth = Math.floor(sWidth/4) - left;
	var infoAreaWidth = stepWidth*0.7-12;
	var lineWidth = stepWidth*0.3;
	var line;
	var circleColor;
	var numberColor = 'white';
	for (var i = 0; i < steps.length; i++){
		step = $('<div>').addClass('step').width(infoAreaWidth);
		step.attr('title',self.tooltips[i]);
		
		step.tooltip({content:self.tooltips[i]});
		step.css({'left':left});
		left+=stepWidth;
		var number = i+1;
		var label = steps[i];
		if(i != pos){
		    circleColor = 'blue';
		}else{
		    circleColor = 'orange';
		}
		if(i>pos){
		    step.css({'opacity':0.5});
		    circleColor = '#aaaaaa';
		}
	    	var svghtml = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">' +
	    		      '<circle cx="20" cy="20" r="18" stroke="#aaaaaa" stroke-width="0.5" fill="'+ circleColor +'"></circle>'+
	    	              '<text x="12" y="30" fill="'+ numberColor + '" stroke="black" stroke-width="0" style="font-size: 29px;font-family: sans-serif;">'+number+'</text>'+
	    	              '<text x="45" y="25" fill="black" style="font-size: 14px;font-family: sans-serif;">'+label+'</text>'+
	    	              '</svg>';
	    	step.html(svghtml);
	    	step.appendTo(stepsArea);
	    	if(i!=3){
        	    	line = $('<div>').addClass('step-line').width(lineWidth);
        	    	line.css({'left':left-lineWidth});
        	    	var linehtml =  '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">' +
        	    			'<line x1="0" y1="20" x2="'+ lineWidth +'" y2="20" stroke-dasharray="5,5" style="stroke: #aaaaaa"/>' +
        		      		'</svg>';
        	    	line.html(linehtml);
        	    	line.appendTo(stepsArea);
	    	}
	};
	
	var nextStepButtonContainer = header.find('.next-step-button-container');
	if(pos>0 && pos<3){
	    	nextStepButtonContainer.find("#next-button-title").text(buttonTitles[pos]);
	    	var buttonIcons =  nextStepButtonContainer.find("span.next-step-button-icon");
	    	$(buttonIcons[1]).css({
	    	    'left':-12
	    	});  	
	}else if(pos == 3){
	    	var button = nextStepButtonContainer.find("button");
	    	button.find("#next-button-title").text(buttonTitles[pos]);
	    	button.find("span.next-step-button-icon").remove();
	    	var span = button.find('span.ui-icon.ui-icon-disk');
	    	if(span.length == 0){
	    	    $('<span>').addClass('ui-icon ui-icon-disk').css({'float':'right'}).appendTo(button);
	    	}
	    	
	}else{
	    	nextStepButtonContainer.find("button").remove();
	}
	
	console.log("finish header");
};

	

util.file = {};

util.file.isRDFFile = function(fileExtension){
   
    var rdfFileExtensionsArray = ['n3','rdf','ttl','nq','nt'];
    for(var i = 0; i < rdfFileExtensionsArray.length;i++){
	if(fileExtension == rdfFileExtensionsArray[i]){
	    return true;
	}
    }
    return false;
    
};

util.file.getFileExtension = function(filename){
    return filename.substring(filename.lastIndexOf(".")+1,filename.length);
};


util.dataspaceProject = {
	basicMetadata:{}
};

util.dataspaceProject.getBasicMetadata = function(){
    var self = this;
    console.log("getting project metadata . . . ");
    $.ajax({
	type : "GET",
	url : "IntegrationServiceServlet/command/dataspace/get-basic-metadata",
	success : function(metadata) {
	    	self.basicMetadata = metadata;
	    	console.log(metadata);
	    	var dataspaceProjectName = metadata["name"];
	    	var span = $("<span>").text("Dataspace: "+dataspaceProjectName).css({
	    	    "height":'100%',
	    	    "width":'auto',
	    	    "font-weight":700
	    	});
	    	var nextStepButtonContainer = $('div.next-step-button-container');
	    	nextStepButtonContainer.append(span);
	    	util.centerAlignment(span,nextStepButtonContainer);
	}, 
   	dataType:'json'
    });
};

util.centerAlignment = function(elementToAlign,containerElement){
    
    var height = elementToAlign.outerHeight();
    var width = elementToAlign.outerWidth();
    var position = {
	        'position':'absolute',
		'top': (containerElement.height() - height) / 2,
		'left': (containerElement.width() - width) / 2,
		'width': width,
		'height':height
    };
    elementToAlign.css(position);
};

util.panel.addCoverDiv = function(elementToCover){
    var coverDiv = $('<div>').addClass('cover-div');
    coverDiv.height(window.innerHeight);
    coverDiv.width(window.innerWidth);
    coverDiv.css({
	    'opacity':0.5,
	    'filter':'alpha(opacity=50)',
	    'background-color':'white'
    })
    .appendTo(elementToCover);
    return coverDiv;
};


util.panel.addAJAXMessage = function(messageText){
    
    var mainContent = $('div.mainContent');
    var messageBox = $('<div>').addClass('ajax-message').appendTo("#main-tabs");
    console.log(mainContent.width()+"/"+mainContent.height());
    util.centerAlignment(messageBox,mainContent);
    /*messageBox.css({
	   'left':(mainContent.width()-messageBox.width())/2,
	   'top':(mainContent.height()-messageBox.height())/2,
    });*/
   /* var coverDiv = $('<div>').addClass('cover-div');
    coverDiv.height(window.innerHeight);
    coverDiv.width(window.innerWidth);
    coverDiv.css({
	    'opacity':0.5,
	    'filter':'alpha(opacity=50)',
	    'background-color':'white'
    })
    .appendTo(mainContent);*/
    var messageSpan = $('<span>').text(messageText).css({
	    'padding-left': '70px',
	    'top': '45px',
	    'position': 'relative'
    }).appendTo(messageBox);
    var loading = $('<div>').addClass('loading').css({
	'opacity':1,
	'height':100,
	'width':100,
    }).appendTo(messageBox);
    util.centerAlignment(loading,messageBox);
    loading.css({
	'top':"",
	'bottom':0
    });
    var return_o = {
	    box:messageBox,
	    text:messageSpan
    };
    return return_o;
};
