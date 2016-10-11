var ui = {};

ui.header = {
	file:"scripts/general/header.html",
	div:{},
	steps:['Import your data',
	             'Map your data',
	             'Link your data',
	             'Query your data',
	],
	buttonTitles:['Continue to mapping',
	              'Continue to linking',
	              'Continue to queries'
	],
	tooltips:['Load datasets from varius sources',
	          'Transform different schemas into one global target schema',
	          'Interlink same entities from different imported datasets',
	          'Make query to the dataspace'
	]
	              
};

ui.header.init = function(pos,callbackFunction){
	
	var header = $('div.header');
	var self = this;
	self.div = header;
	
	header.load(self.file,function(){
	    self.align(pos);
	    header.on("click","button#proceed-to-next-step-button",function(event){
		event.preventDefault();
		callbackFunction();
	    });
	    $(window).resize(function(){
		self.align(pos);
	    });
	    $("body").on("click",function(event){
		$('.ui-menu').hide();
	    });
	    
	});
};	

ui.header.align = function(pos){
    	
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
		step = $('<div>').addClass('step');
		step.width(infoAreaWidth);
		step.attr('title','mitsos');
		
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
	if(pos>=0 && pos<3){
	    	nextStepButtonContainer.find("#next-button-title").text(buttonTitles[pos]);
	    	/*nextStepButtonContainer.css({
	    	    'top':header.outerHeight()
	    	});*/
	    	
	    	var buttonIcons =  nextStepButtonContainer.find("span.next-step-button-icon");
	    	$(buttonIcons[1]).css({
	    	    'left':-12
	    	});  	
	}else{
	    	nextStepButtonContainer.remove();
	}
};
		