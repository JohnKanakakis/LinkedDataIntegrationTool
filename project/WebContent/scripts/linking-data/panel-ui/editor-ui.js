var panel = panel || {};

panel.linkEditorTab = {
		div:{},
		linkageRuleContainer:{},
		ruleElementsCanvas:{},
		visibleLinkageRuleArea:{},
		visibleTaskName:"",
		jsPlumbInstance:{},
		jsPlumbInstances:{},
		inputEndpointOptions :{
			/*endpoint: new jsPlumb.Endpoints.Dot({radius: 5}),*/
			isSource: true,
			paintStyle: {
				fillStyle: '#890685'
			},
			connectorStyle: {
				gradient: {
					stops: [
					        [0, '#890685'],
					        [1, '#359ace']
			        ]
				},
				strokeStyle: '#890685',
				lineWidth: 5
			},
			endpoint: ["Dot",{ radius:5 }],
			connector:"Bezier",
			isTarget: false,
			maxConnections: 1,
			anchor: "RightMiddle",
			dropOptions:{ disabled: true }		
		},
		functionEndpointOptions :{
		    	endpoint:["Dot",{radius:5}],//new jsPlumb.Endpoints.Dot({radius: 5}),
			isSource: true,
			isTarget: false,
			paintStyle: {
				fillStyle: '#f58400'//'#35ceb7'
			},
			connectorStyle: {
				gradient: {
					stops: [
					        [0,'#f58400' ],//'#35ceb7'
					        [1,'#f58400']//'#359ace'
			        ]
				},
				strokeStyle: '#f58400',//'#359ace'
				lineWidth: 5
			},
			maxConnections: 1,
			connector:"Bezier",
			anchor: "RightMiddle",
			dropOptions:{ disabled: true }
		},
		leftOptions1:{
		    	endpoint: ["Dot",{radius:5}],//new jsPlumb.Endpoints.Dot({radius: 5}),
			isSource: false,
			paintStyle: {
				fillStyle: '#359ace'
			},
			connectorStyle: {
				gradient: {
					stops: [
					        [0, '#359ace'],
					        [1, '#35ceb7']
			        ]
				},
				strokeStyle: '#359ace',
				lineWidth: 5
			},
			connector:"Bezier",
			isTarget: true,
			maxConnections: 100,
			anchor: "LeftMiddle",
		},
		numberOfElements:0
};



panel.linkEditorTab.init = function(){
	
    	var self = this;
    	self.div = panel.linkingTasksSection.div.find("#linking-editor-panel");
    	self.ruleElementsCanvas = self.div.find("#linkage-rule-elements-canvas");
    	self.linkageRuleContainer = self.div.find("#linkage-rule-container");
    	self.addListeners();
    	self.div.hide();
};

panel.linkEditorTab.showTask = function(taskName){
    	var self = this;
    	
    	var needRepaint = false;
    	
    	// find or create task area
    	var linkageRuleArea = self.linkageRuleContainer.find("div.linkage-rule-area[task-name="+taskName+"]");
    	
    	
    	if(linkageRuleArea.length == 0){console.log('NEW LINKAGE AREA FOR TASK >'+taskName);
    	    linkageRuleArea = $("<div>").attr('task-name',taskName).addClass("linkage-rule-area");
    	    linkageRuleArea.appendTo(self.linkageRuleContainer);
    	    self.jsPlumbInstance = jsPlumb.getInstance();
    	    self.jsPlumbInstances[taskName] = self.jsPlumbInstance;
    	    self.jsPlumbInstance.Defaults.Container = linkageRuleArea;
    	    self.jsPlumbInstance.Defaults.ConnectionsDetachable = false;    
    	}else{console.log('EXISTING LINKAGE AREA FOR TASK >'+taskName);
    	    self.jsPlumbInstance = self.jsPlumbInstances[taskName];
    	    needRepaint = true;
    	    
    	    //load-spec
    	    editorManager.loadTask(taskName);
    	}
    	
    	
    	//hide visible area
    	console.log('link task '+taskName +' to show length ' + linkageRuleArea.length);
    	self.hideVisibleTask();
    	
    	//set current(visible) task
    	self.visibleLinkageRuleArea = linkageRuleArea;
    	self.visibleTaskName = taskName;
    	linkageRuleArea.show();
    	if(needRepaint){
    	    repaint();
    	}
    	
    	/*self.jsPlumbInstance = self.jsPlumbInstances[taskName];*/
    	self.div.find('button').css({opacity:1});
    	self.ruleElementsCanvas.css({opacity:1});
	self.visibleLinkageRuleArea.css({opacity:1});
    	if(editorManager.isCompletedTask()){
    	    self.disableEditor();
    	}else{
    	    self.startRule();
    	}
    	return;
    	
    	
    	function repaint(){
    	    /*var boxes = self.visibleLinkageRuleArea.find("div.rule-box");
	    //var endpoints;
	    $.each(boxes,function(index,box){
		endpoints = self.jsPlumbInstance.getEndpoints($(box));//get endpoints array for this box;
		for(var i = 0 ; i < endpoints.length;i++){
		    self.jsPlumbInstance
		}
		console.log("RECALCULATE ");
		self.jsPlumbInstance.recalculateOffsets($(box));
	    });*/
	    self.jsPlumbInstance.repaintEverything();
    	}
    	
    	
};

panel.linkEditorTab.hideVisibleTask = function(){
    var self = this;	
    if(!$.isEmptyObject(self.visibleLinkageRuleArea)){
	    console.log('TASK  '+self.visibleLinkageRuleArea.attr('task-name') +'HIDE');
	    self.visibleLinkageRuleArea.hide();
    }
};



panel.linkEditorTab.disableEditor = function(){
    	var self = this;
    	panel.linkingTasksSection.linkingTaskPanel.tabs("disable",0);
    	self.visibleLinkageRuleArea.droppable("disable");
	self.jsPlumbInstance.draggable("disable");
	self.div.find('button').css({opacity:0.6});
	self.ruleElementsCanvas.css({opacity:0.6});
	self.visibleLinkageRuleArea.css({opacity:0.6});
	self.visibleLinkageRuleArea.find('input[type=text]').attr('readonly','true');
};


panel.linkEditorTab.getElementsCounter = function(){
    	var self = this;
    	return self.numberOfElements;
};

panel.linkEditorTab.showExistingLinkageRule = function(linkSpec){
    
    	var self = this;
    	
	console.log("ROOT > "+JSON.stringify(linkSpec));
    	bfsSpec(linkSpec);
    	return;
    	
    	
    	function bfsSpec(root){
    	    
    	    var elementsQueue = [];
    	    var V = {};
    	    var node;
 	    var child;
 	    var treeLevels = 3;
 	    var treeLevelWidth = 280;
 	    var boxHeight = 100;
    	    var initialLeft = 10;
    	    var initialTop = 150;
    	    var maxId = 0;
    	    var adjacencyListMap = {};
    	    var uiBox;
    	    var endpoints,parentLeftEndpoint_o,leftEndpoint_o,rightEndpoint_o;
    	
    	    root["left"] = treeLevelWidth*(treeLevels-1)+initialLeft;
    	    root["top"] = initialTop;
    	    
    	    //root['id'] = normalizeId(root['id']);
    	    
    	    V[root['id']] = {
    		    node:root,
    		    uiBox:{},
    		    boxEndpoints:{},
    		    endpoints:[]
    	    };
    	    
    	    uiBox = drawNode(root,root["params"]);
    	    /*V[root['id']].uiBox = uiBox;*/
    	    
    	    endpoints = self.getEndpoints(uiBox.attr("elType"));
    	    console.log("JSON OBJECT FOR LEFT ENDPOINT > "+JSON.stringify(endpoints.leftEndpoint));
    	    leftEndpoint_o = self.addEndpoint(uiBox,endpoints.leftEndpoint);//{anchor:"LeftMiddle"}
    	    rightEndpoint_o = self.addEndpoint(uiBox,endpoints.rightEndpoint);//{anchor:"RightMiddle"}
    	    V[root['id']].boxEndpoints["left"] = leftEndpoint_o;
    	    V[root['id']].boxEndpoints["right"] = rightEndpoint_o;
    	    
    	    console.log("ROOT UI BOX LENGTH > "+uiBox.length);
    	   
    	    elementsQueue.push(root);
    	    
    	    maxId = root["id"];//parseInt(root["id"]);
    	    var nodeInfo_o;
    	    while(elementsQueue.length>0){
    		node = elementsQueue.shift();
    		nodeInfo_o = V[node["id"]];
    		
    		for(var i = 0; i < node["input"].length;i++){
    		    child = node["input"][i];
    		    //child['id'] = normalizeId(child['id']);
    		    console.log("CHILD ID > "+child['id']);
    		    if(!inVisitedNodes(V,child)){
    			
    			if(child["id"]> maxId){ maxId = child["id"];}
    			
        		child["left"] = node["left"] - treeLevelWidth;
        		if(i > 0){
        		    child["top"] = node["input"][i-1]["top"]+boxHeight+50;
        		}else{
        		    child["top"] = node["top"]-5;
        		}
        		
    			V[child["id"]] = {
    	    		    node:child,
    	    		    uiBox:{},
    	    		    boxEndpoints:{},
    	    		    endpoints:[]
    	    	    	};
    			uiBox = drawNode(child,child["params"]);
    			endpoints = self.getEndpoints(uiBox.attr("elType"));
    			
    	    	    	leftEndpoint_o = self.addEndpoint(uiBox,endpoints.leftEndpoint);
    	    	    	rightEndpoint_o = self.addEndpoint(uiBox,endpoints.rightEndpoint);
    	    	    	V[child['id']].boxEndpoints["left"] = leftEndpoint_o;
    	    	    	V[child['id']].boxEndpoints["right"] = rightEndpoint_o;
    	    	    	/*V[child['id']].uiBox = uiBox;*/
    	    	    	nodeInfo_o.endpoints.push(V[child['id']].boxEndpoints);
    			elementsQueue.push(child);
    		    }
        	}
    	    }
    	    console.log("NUMBER OF ELEMENTS ON BEFORE MAX> "+self.numberOfElements);
    	    console.log("MAX ID > "+ maxId);
    	    
    	    self.numberOfElements = self.numberOfElements + maxId + 1;
    	    //self.numberOfElements++;
    	    //connect here 
    	    console.log("NUMBER OF ELEMENTS ON finish spec> "+self.numberOfElements);
    	    connectNodes(V);
    	    return;
    	}
    	
    	/*function normalizeId(id){
    	    var clonedId = id;
    	    console.log('ID BEFORE > '+id);
    	    var  newId = self.numberOfElements + clonedId;
    	    console.log('ID AFTER > '+newId);
    	    
    	    return newId;
    	}*/
    	
    	function inVisitedNodes(V,node){
    	    var id = node['id'];//normalizeId(node['id']);
    	    if(typeof V[id] === 'undefined'){
    		return false;
    	    }else{
    		return true;
    	    }
    	}
    	
    	function drawNode(node,params){
    	    console.log("DRAWING NODE > "+JSON.stringify(node)); 
    	    
    	    var options = {
  		'elType':node['elType'],//input,transformation,comparison,aggregation
  		'elName':node['elName'],//function name or "input" for input nodes
  		'id':node["id"]
    	    };
	    var boxPosition = {
  		top:node["top"]+'px',
  		left:node["left"]+'px'
	    };
	    var box = self.displayRuleElement(options, boxPosition,false);
	    
	    fillBoxWithParamsValues(box,params);
	    
	    return box;
	    
    	};
    	
    	function connectNodes(V){
    	    
    	    var node_o;
    	    var endpoints;
    	
    	    for(var key in V){
    		console.log("KEY > "+key);
    		node_o = V[key];
    		console.log("PARENT ADD NODE");
    		endpoints = node_o["endpoints"];
    		
    		for(var i = 0; i < endpoints.length;i++){
    		    endpoint_o = endpoints[i];
    		    console.log("CONNECT ENDPOINTS > ");
    		    self.jsPlumbInstance.connect({
			sourceEndpoint:endpoint_o["right"],
			targetEndpoint:node_o["boxEndpoints"]["left"]
    		    });
    		}
    	    }
    	}
    	
    	function fillBoxWithParamsValues(box,params){
    	    var td;
    	    var paramEl;
    	    for(var i = 0; i < params.length;i++){
    		td = box.find("td[param="+params[i]["name"]+"]");
    		paramEl = td.children('.param-value');
    		if(paramEl.is("input")){
    		    paramEl.val(params[i]["value"]);
    		}else if(paramEl.is("span")){
    		    paramEl.text(params[i]["value"]);
    		}
    	    }
    	}
    	
};


panel.linkEditorTab.startRule = function(){
    	
    	var self = this;
    	self.visibleLinkageRuleArea.droppable({
		  accept: ".rule-element",
		  drop: function(event,ui){		      	
		      	console.log("NUMBER OF ELEMENTS ON DROP> "+self.numberOfElements);
		      	var options = {
		      		'elType':ui.helper.attr('elType'),
		      		'elName':ui.helper.attr('elName'),
		      		'id':self.numberOfElements
		      	}; 	
		      	var boxPosition = {
		      		top:(event.pageY-175)+'px',
		      		left:(event.pageX-320)+'px'
		      	};
		      	var box = self.displayRuleElement(options, boxPosition,true);
		      	var info = {
		      		id:box.attr('id'),
		      		elType:options["elType"],
		      		elName:options['elName']
		      	};
		      	editorManager.addNode(info);
		      	self.numberOfElements = self.numberOfElements+1;
		  }
	});
};



panel.linkEditorTab.clearEditor = function(){
    	editorManager.clear();
};




panel.linkEditorTab.displayRuleElement = function(elementInfo,boxPosition,includeEndpoints){
    
    var self = this;
    var box = self.getRuleElementBox(elementInfo);
    
    
    box.css({
	'position':'absolute',
	'z-index':10,
	'top':boxPosition.top,
	'left':boxPosition.left
    });
    box.attr('id',elementInfo['id']).addClass('rule-box');
    
    self.visibleLinkageRuleArea.append(box);
    self.jsPlumbInstance.draggable(box);
    
    if(includeEndpoints){
	var endpoints = self.getEndpoints(/*elementInfo["rule-element"]*/elementInfo['elType']);
	self.addEndpoint(box, endpoints.rightEndpoint);
	self.addEndpoint(box, endpoints.leftEndpoint);
    }

    return box;
};

panel.linkEditorTab.addEndpoint = function(box,endpoint_o){
    var self = this;
    var endpointUi;
    if(endpoint_o!=null){
	endpointUi = self.jsPlumbInstance.addEndpoint(box.attr('id'),endpoint_o);
	console.log("ADDED ENDPOINT EL TYPE > "+box.attr('elType'));
	$(endpointUi.canvas).attr({
	    "elType":box.attr('elType'),
	    "related-box-id":box.attr('id')
	});
	return endpointUi;
    }
    return null;
	
};


panel.linkEditorTab.getRuleElementBox = function(options){
	
	var elType = options['elType'];//options['rule-element'];
	var rule_id = options['related-rule-element-id'];
	rule_id = "";
	
	var elName = options['elName'];
	
	//var box_id = options['id'];
	var box = null;
	if(elType == 'input'){
		box = getInputBox(rule_id,elName);
		//box.attr('id',box_id);
		return box;
	}else if(elType == 'transformation'){
		box = getTransformationBox(rule_id,elName);
		//box.attr('id',box_id);
		return box;
	}else if(elType == 'comparison'){
		box = getComparisonBox(rule_id,elName);
		//box.attr('id',box_id);
		return box;
	}else if(elType == 'aggregation'){
		box = getAggregationBox(rule_id,elName);
		//box.attr('id',box_id);
		return box;
	}
	function getInputBox(id,elName){
		var info = editorManager.getInput();
		console.log("INPUT EL NAME > "+elName);
		var box = $('<div>').addClass('input-path-box')
				    .attr({
					'elName':elName,
					'elType':'input'
				    });
		var html = 	'<div class="function-box-header">'+
					'Input path '+
				   	'<img src="img/cross.png" class="delete-box-icon" width="16px" height="16px"'+
				   	'style="float:right;cursor:pointer">'+
				   	'</div>'+
				   	'<div class="function-box-body">'+
				   	'<table class="function-param-table">'+
				   	'<tr>'+
				   	'<td>'+info.params[0].name +'</td>'+
				   	'<td param="'+info.params[0].name+'">'+ 
				   	'<span class="param-value">'+ elName + '</span>' +
				   	'</td>'+
				   	'</tr>'+
				   	'</table>'+
				   	'</div>';
		box.html(html);
		return box;
	};
	
	function getTransformationBox(id,functionName){
		//var info = editorManager.getTransformationFunction(id);
	    	var info = editorManager.getTransformationFunction(id,functionName);
		var box = $('<div>').addClass('transformation-function-box')
				    .attr({
					'elName':functionName,
					'elType':'transformation'
				    });
		var html = 	'<div class="function-box-header">'+
				   	'(Transformation) '+info.elName+
				   	'<img src="img/cross.png" class="delete-box-icon" width="16px" height="16px"'+
				   	'style="float:right;cursor:pointer">'+
				   	'</div>'+
				   	'<div class="function-box-body">'+
				   	'<table class="function-param-table">';
		for(var i = 0; i < info.params.length;i++){
			html+= 	'<tr>'+
					'<td>'+ info.params[i].name +'</td>'+
					'<td param="'+info.params[i].name+'">'+
					'<input type="text" class="param-value">'+info.params[i].value+
		   			'</td>'+
		   			'</tr>';
		}
		html+=	'</table>'+
				'</div>';
		box.html(html);
		return box;
	};
	function getComparisonBox(id,functionName){
		//var info = editorManager.getComparisonFunction(id,functionName);
	    	console.log("GET COMPARISON BOX UI > ");
	    	var info = editorManager.getComparisonFunction(id,functionName);
		var box = $('<div>').addClass('comparison-function-box')
							.attr({
							    'elName':functionName,
							    'elType':'comparison'
							});
		var html = 	'<div class="function-box-header">'+
				   	'(Comparison) '+info.elName+
				   	'<img src="img/cross.png" class="delete-box-icon" width="16px" height="16px"'+
				   	'style="float:right;cursor:pointer">'+
				   	'</div>'+
				   	'<div class="function-box-body">'+
				   	'<table class="function-param-table">';
		for(var i = 0; i < info.params.length;i++){
			html+= 	'<tr>'+
					'<td>'+ info.params[i].name +'</td>'+
					'<td param="'+info.params[i].name+'">'+
					'<input type="text" class="param-value">'+info.params[i].value+
		   			'</td>'+
		   			'</tr>';
		}
		html+=	'</table>'+
				'</div>';
		box.html(html);
		return box;
	};
	function getAggregationBox(id,functionName){
		//var info = editorManager.getAggregationFunction(id,functionName);
	    	var info = editorManager.getAggregationFunction(id,functionName);
		var box = $('<div>').addClass('aggregation-function-box')
							.attr({
							    'elName':functionName,
							    'elType':'aggregation'
							});
							
		var html = 	'<div class="function-box-header">'+
				   	'(Aggregation) '+info.elName+
				   	'<img src="img/cross.png" class="delete-box-icon" width="16px" height="16px"'+
				   	'style="float:right;cursor:pointer">'+
				   	'</div>'+
				   	'<div class="function-box-body">'+
				   	'<table class="function-param-table">';
		for(var i = 0; i < info.params.length;i++){
			html+= 	'<tr>'+
					'<td>'+ info.params[i].name +'</td>'+
					'<td param="'+info.params[i].name+'">'+
					'<input type="text" class="param-value">'+info.params[i].value+
		   			'</td>'+
		   			'</tr>';
		}
		html+=	'</table>'+
				'</div>';
		box.html(html);
		return box;
	};
};


panel.linkEditorTab.getEndpoints = function(elType){
	
	var endpoints = {};
	var self = this;
	
	
	if(elType == 'input'){
		endpoints.rightEndpoint = self.inputEndpointOptions;
		endpoints.leftEndpoint = null;
		endpoints.elType = 'input';
		return endpoints;
	}else if(elType == 'transformation'){
		endpoints.rightEndpoint = self.functionEndpointOptions;
		endpoints.leftEndpoint =  $.extend({
			dropOptions:{
				accept: 'div[elType="input"], div[elType="transformation"]',
				drop:function(event,ui){
				    dropFunction(event,ui);
					//event.preventDefault();
					//self.drop(event,ui);
				}
				/*over: function(event, ui){
					$("body").css('cursor','pointer'); 
				}, 
				out: function(event, ui){ 
					$("body").css('cursor','default'); 
				}*/
			}
		}, self.leftOptions1);
		console.log("TRANSFORMATION ENDPOINT IS >"+JSON.stringify(endpoints.leftEndpoint));
		endpoints.elType = 'transformation';
		return endpoints;
	}else if(elType == 'comparison'){
		endpoints.rightEndpoint = self.functionEndpointOptions;
		endpoints.leftEndpoint =  self.jsPlumbInstance.extend({
			dropOptions:{
				accept: 'div[elType="transformation"], div[elType="input"]',
				drop:function(event,ui){
				    dropFunction(event,ui);
					//event.preventDefault();
					//self.drop(event,ui);
				}
				/*over: function(event, ui){
					$("body").css('cursor','pointer'); 
				}, 
				out: function(event, ui){ 
					$("body").css('cursor','default'); 
				}*/
			}
		}, self.leftOptions1);
		endpoints.elType = 'comparison';
		return endpoints;
		
	}else if(elType == 'aggregation'){
		endpoints.rightEndpoint = self.functionEndpointOptions;
		endpoints.leftEndpoint =  self.jsPlumbInstance.extend({
			dropOptions:{
				accept: 'div[elType="comparison"], div[elType="aggregation"]',
				drop:function(event,ui){
				    dropFunction(event,ui);
					/*event.preventDefault();
					var child = ui.draggable;
					var parent = $(event.target);
					self.connect(parent,child);*/
				}
				/*over: function(event, ui){
					$("body").css('cursor','pointer'); 
				}, 
				out: function(event, ui){ 
					$("body").css('cursor','default'); 
				}*/
			}
		}, self.leftOptions1);
		
		endpoints.elType = 'aggregation';
		return endpoints;
	}
	
	function dropFunction(event,ui){
	    	event.preventDefault();
		var child = ui.draggable;
		var parent = $(event.target);
		self.connect(parent,child);
	}
	
};

panel.linkEditorTab.addListeners = function(){
	var self = this;
	
	self.linkageRuleContainer.on("click",".delete-box-icon",function(event){
		event.preventDefault();
		
		if(editorManager.isCompletedTask()) return;
		
		var box = $(event.target).closest('div.ui-draggable');
		
		var endpoints = self.jsPlumbInstance.getEndpoints(box);
		var endpoint1 = endpoints[0];
		var endpoint2 = {};
		
		var endpoint1Canvas = $(endpoint1.canvas);
		var endpoint2Canvas = {};
		if(endpoints.length == 2){
		    endpoint2 = endpoints[1];
		    endpoint2Canvas = $(endpoint2.canvas);
		}
		/*var endpoint1 = box.next();
		var endpoint2 = endpoint1.next();*/
		console.log('endpo1 = '+endpoint1Canvas.length+"/"+endpoint1Canvas.attr('related-box-id')+
			"/"+endpoint1Canvas.attr('elType'));
		
		if(editorManager.deleteNode(endpoint1Canvas.attr('related-box-id'),endpoint1Canvas.attr('elType'))){
		    endpoint1.canvas.remove();
		    self.jsPlumbInstance.deleteEndpoint(endpoint1);
		    if(endpoint2Canvas.length > 0){//if(endpoint2.hasClass('_jsPlumb_endpoint')){
			console.log('endpo2 = '+endpoint2Canvas.length);
			self.jsPlumbInstance.deleteEndpoint(endpoint2);
			endpoint2Canvas.remove();
		    }
		    self.jsPlumbInstance.detachAllConnections(box);
		    box.remove();
		} 
		
		if(!editorManager.setTaskStatus(self.visibleTaskName,editorManager.taskStatus.PENDING)){
		    alert('error in set status!');
		};
	});
	
	
	self.div.on("click","button#task-start-button",function(event){
	    	event.preventDefault();
	    	if(editorManager.isCompletedTask(self.visibleTaskName)) return;
	    	
	    	var linkSpec = editorManager.constructLinkSpecificationTree(self.visibleTaskName);
	    	editorManager.saveTask(self.visibleTaskName);
	    	if(!$.isEmptyObject(linkSpec)){
	    	    panel.resultTab.addLoadingState();
	    	    linkingManager.submitLinkSpecification(linkSpec);
	    	}
	    	
	});
	
	self.div.on("click",".ui-icon-refresh",function(event){
	    	event.preventDefault();
	    	if(editorManager.isCompletedTask(self.visibleTaskName)) return;
	    	var configuration = editorManager.getTaskConfiguration(self.visibleTaskName); 
	    	linkingManager.getPathsInfo(configuration);
	});
	    
	self.div.on("click","button#task-config-button",function(event){
		event.preventDefault();
		if(editorManager.isCompletedTask(self.visibleTaskName)) return;
		
		var taskConfiguration = editorManager.getTaskConfiguration(self.visibleTaskName);
		panel.taskConfigurationBox.open(taskConfiguration);
	});
	
	//not used!!
	/*self.div.on("click","button#task-save-button",function(event){
		event.preventDefault();
		//var currentTaskName = self.visibleLinkageRuleArea.attr('task-name');
		linkingManager.saveTask(self.visibleTaskName);
		if(linkingManager.isCompletedTask()) return;
		
		var currentTaskName = self.visibleLinkageRuleArea.attr('task-name');
		editorManager.saveLinkSpecification(currentTaskName);
		linkingManager.saveCurrentLinkingTask();
	});*/
	
	self.linkageRuleContainer.on("change","input[type='text']",function(event){
		event.preventDefault();
		if(editorManager.isCompletedTask(self.visibleTaskName)) return;
		
		var box = $(event.target).closest('div.ui-draggable');
		var td = $(event.target).closest('td');
		var info = {
				id:box.attr('id'),
				elType:box.attr('elType'),
				paramName:td.attr('param'),
				value:$(this).val()
		};
		console.log(JSON.stringify(info));
		editorManager.updateUINode(info);
		if(!editorManager.setTaskStatus(self.visibleTaskName,editorManager.taskStatus.PENDING)){
		    alert('error in set status!');
		};
	});
};
panel.linkEditorTab.connect = function(parent,child){//(event,ui){
	
    	var self = this;
	//var child = ui.draggable;
	//var parent = $(event.target);
	
	if(child.attr('related-box-id') == parent.attr('related-box-id')){//parent same with parent
		alert('Invalid action!');		
		self.jsPlumbInstance.detachAllConnections(parent.attr('related-box-id'));
		return;
	}
	console.log("from child elem: "	+child.attr('related-box-id')+"/"
				+child.attr('related-elem-id')+"/"
				+child.attr('elType'));
	console.log("to parent elem: "+parent.attr('related-box-id')+"/"
							   +parent.attr('related-elem-id')+"/"
							   +parent.attr('elType'));
	
	editorManager.merge(parent.attr('related-box-id'),child.attr('related-box-id'));
	
	if(!editorManager.setTaskStatus(self.visibleTaskName,editorManager.taskStatus.PENDING)){
	    alert('error in set status!');
	};
};



/*panel.linkEditorTab.initActionsArea = function(){

var actions_area = $(".actions-area");
this.actionsArea = actions_area;
var control_file_area = actions_area.find('.control-file-area');
if(control_file_area.length == 0){
	actions_area.load('scripts/linking-data/panel-ui/control-file-area.html',function(){
		
		actions_area.on("click", ".submit-linking-task-button", function(event){ 
			event.preventDefault();
			editorManager.createLinkSpecification();
			//panel.resultTab.collectSelectedRowsFromGrid();
			console.log($('#links-to-verify > .grid-container-class').length);
		});
		
		actions_area.on("click", ".delete-linking-task-button", function(event){ 
			event.preventDefault();
			//editorManager.deleteLinkSpecification();
			//panel.resultTab.displayLinks();
		});
		actions_area.on("change",".confidence-input",function(event){
			event.preventDefault();
			if($(this).val() < 0 || $(this).val() > 1){
				alert('Confidence is in [0,1] !');
				return;
			}
			
			var id = $(event.target).attr('id');
			
			if(id == "accept-min-conf"){
				linkingManager.setAcceptOutput("min",$(this).val());
			}else if(id == "accept-max-conf"){
				linkingManager.setAcceptOutput("max",$(this).val());
			}else if(id == "verify-min-conf"){
				linkingManager.setVerifyOutput("min",$(this).val());
			}else if(id == "verify-max-conf"){
				linkingManager.setVerifyOutput("max",$(this).val());
			}
			console.log($(this).val());
		});
	});
}
};

panel.linkEditorTab.updateActionsArea = function(parameters){
var table = this.actionsArea.find('.info-table');

table.find('#source-dataset-name').text(parameters.sourceDatasetName);
table.find('#target-dataset-name').text(parameters.targetDatasetName);
table.find('#source-restrict-to-area').text(parameters.sourceRestrictTo);
table.find('#target-restrict-to-area').text(parameters.targetRestrictTo);
};
*/


/*var box = self.getRuleElementBox(uiHelperInfo);
var endpoints = self.getEndpoints(ui.helper.attr('rule-element'));
  
  box.css({
	  'position':'absolute',
	  'top':(event.pageY-175)+'px',//175 is the total top of linkage-rule-area div
	  'left':(event.pageX-320)+'px',//320 is the total left of linkage-rule-area div
  });
  $(this).append(box);
  self.jsPlumbInstance.draggable(box);
  self.jsPlumbInstance.addEndpoint(box.attr('id'),endpoints.rightEndpoint);
  
  if(endpoints.leftEndpoint!=null){
      self.jsPlumbInstance.addEndpoint(box.attr('id'),endpoints.leftEndpoint);
  }
  box.nextAll("._jsPlumb_endpoint").attr({
	  "elType":endpoints.elType,
	  "related-box-id":box.attr('id'),
	  "related-elem-id":box.attr('elem-id'),
  });
  var info = {
		  id:box.attr('id'),
		  elemId:box.attr('elem-id'),
		  elType:endpoints.elType
  };
  editorManager.addNode(info);*/