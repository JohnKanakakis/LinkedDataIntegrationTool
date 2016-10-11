var panel = {};

panel.leftSection = {
		numberOfDraggedCompare:0,
		numberOfDraggedTransform:0,
		numberOfDraggedAggregate:0,
		numberOfDraggedInput:0
};

panel.linkingTasksSection = {};


panel.init = function(){
    	
    	this.linkingTasksSection.init();
	this.leftSection.initBoxes();
	this.taskConfigurationBox.init(); 
};







panel.leftSection.initBoxes = function(){

    	var canvas = $('#linkage-rule-elements-canvas');
	var boxes = $('.info-subpanel');
	var generalHeight = boxes.height();
	var height = 0;
	var top = 0;
	for(var i = 0;i < boxes.length;i++){
		//$(boxes[i]).css({'top':top+'px'});
		if($(boxes[i]).hasClass('input-path-subpanel')){
			height = $(boxes[i]).height();
		}else{
			height = generalHeight;
		};
		top = top + height + 1;
	}
};


panel.leftSection.fillRuleElementBoxes = function(functions){
	var boxes = $('.rule-subpanel');
	
	for(var i = 0;i < boxes.length;i++){
		if ($(boxes[i]).hasClass('transform-subpanel')){
			panel.leftSection.fillFunctionBox($(boxes[i]),functions["transformation"],'transformation');
		}else if($(boxes[i]).hasClass('compare-subpanel')){
			panel.leftSection.fillFunctionBox($(boxes[i]),functions["comparison"],'comparison');
		}else if($(boxes[i]).hasClass('aggregation-subpanel')){
			panel.leftSection.fillFunctionBox($(boxes[i]),functions["aggregation"],'aggregation');
		}
	}
};

panel.leftSection.fillFunctionBox = function(box,functions,div_class){

	var box_body = box.find('.info-subpanel-body');
	if (box_body.length == 1){
		box_body.remove();
	}
	box_body = $('<div>').addClass('info-subpanel-body');
	
	var boxElement = null;
	
	var height = 5;
	for(var i = 0; i < functions.length;i++){
		boxElement = $('<div>').addClass('rule-element'+' '+ div_class)
		                          .attr({
		                        	  'name':functions[i].elName,
		                        	  'title':functions[i].elName,
		                        	  'id':'fun-'+i
		                          });
		height = boxElement.height();
		
		boxElement.css({'top':height*i+'px'});
		
		boxElement.draggable({
			appendTo: "body", 
			helper: "clone",
			opacity:1,
			start: function(event,ui){
				var current_id = 0;
				var ruleElem = '';
			   	if($(this).hasClass('comparison')){
					   current_id = panel.leftSection.numberOfDraggedCompare++;
					   ruleElem = 'comparison';
			   	}else if($(this).hasClass('transformation')){
					   current_id = panel.leftSection.numberOfDraggedTransform++;
					   ruleElem = 'transformation';
			   	}else if($(this).hasClass('aggregation')){
					   current_id = panel.leftSection.numberOfDraggedAggregate++;
					   ruleElem = 'aggregation';
			   	}
			   	var name = $(this).attr('name');
			   	ui.helper.attr({
			   		/*'id':name+'-'+current_id,*/
			   		/*'related-rule-element-id':$(this).attr('id'),*/
			   		/*'rule-element':ruleElem,*/
			   		'elType':ruleElem,
			   		'elName':$(this).attr('name')
			   	})
			   	.css({'width':boxElement.css('width')});
		   }
		});
		boxElement.html("<p>"+functions[i].elName+"</p>");
		box_body.append(boxElement);
	}
	box.append(box_body);
};

panel.leftSection.fillPathBox = function(box,variablesData){
	
	var box_body = box.find('.info-subpanel-body');

	box_body.empty();
	
	//box_body = $('<div>').addClass('info-subpanel-body');
	
	var variableInfo;
	var variableName;
	var variableProperties;
	
	//boxElement = panel.leftSection.addCustomInputPath(box);
	//box_body.append(boxElement);
	
	for(var i = 0; i < variablesData.length; i++){
		variableInfo = variablesData[i];
		variableName = "?"+variableInfo["name"];
		variableProperties = variableInfo["properties"];
		for(var j = 0; j < variableProperties.length;j++){
			boxElement = $('<div>').addClass('rule-element'+' '+'input')
					       .attr({//panel.encode
						   	/*'name':panel.encode(variableName)+"-"+variableProperties[j]["name"],*/
						   	'title':variableProperties[j]["uri"]+variableProperties[j]["name"],
						   	'name':(variableName+"/"+variableProperties[j]["prefix"]+":"+variableProperties[j]["name"])
					       });
			height = boxElement.height();
			
			boxElement.css({'top':height*(j+i*variablesData.length)+'px'});
			
			boxElement.draggable({
				appendTo: "body", 
				helper: "clone",
				opacity:1,
				start: function(event, ui){
					var name = $(this).attr('name');	  
					console.log(name);
					panel.leftSection.numberOfDraggedInput++;
					ui.helper.attr({
						/*'id':name+'-'+panel.leftSection.numberOfDraggedInput,*/
						/*'related-rule-element-id':$(this).attr('id'),*/
						/*'rule-element':'input'*/
						'elType':'input',
						'elName':name    
					})
					.css({
						
						'width':boxElement.css('width')
					});
				}
			});
			boxElement.html("<p>"+variableName+"/"+variableProperties[j]["prefix"]+":"+variableProperties[j]["name"]+"</p>");
			box_body.append(boxElement);
		}
		
	}
	box_body.appendTo(box);
};

panel.leftSection.addCustomInputPath = function(){
	
	boxElement = $('<div>').addClass('rule-element'+' '+'input')
    .attr({
  	  'name':'custom-input-path',
  	  'title':'Custom input path',
  	  'id':'custom-input-'
    });
	height = boxElement.height();
	
	boxElement.css({'top':height+'px'});
	
	boxElement.draggable({
		appendTo: "body", 
		helper: "clone",
		opacity:1,
		start: function(event, ui){
			var name = $(this).attr('name');	  
			console.log(name);
			panel.leftSection.numberOfDraggedInput++;
			ui.helper.attr({
				'id':name+'-'+panel.leftSection.numberOfDraggedInput,
				'related-rule-element-id':$(this).attr('id'),
				'rule-element':'input'
			})
			.css({
				
				'width':boxElement.css('width')
			});
		}
	});
	boxElement.html("<p>"+"Custom path"+"</p>");
};




panel.encode = function(text){
	 return text.replace('?','_')
	 			.replace('/','-');
};

panel.decode = function(text){
	return text.replace('_','?')
			   .replace('-','/');
};


panel.leftSection.showLoadingMessageForInput = function(){
	var subpanelBody = $('div.source-path-subpanel').find('.info-subpanel-body');
	subpanelBody.addClass('loading');
	subpanelBody = $('div.target-path-subpanel').find('.info-subpanel-body');
	subpanelBody.addClass('loading');
};

panel.leftSection.hideLoadingMessageForInput = function(){
	var subpanelBody = $('div.source-path-subpanel').find('.info-subpanel-body');
	subpanelBody.removeClass('loading');
	subpanelBody = $('div.target-path-subpanel').find('.info-subpanel-body');
	subpanelBody.removeClass('loading');
};










