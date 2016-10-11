var panel = panel || {};

panel.structureEditor = {
		numOfEp:0,
		div:'',
		elementsDiv:'',
		mainDiv:'',
		cubeVocabularyBox:'',
		propertiesBox:'',
		numberOfElem:0,	
		_defaultOptions : {
				endpoint: "Dot",
				paintStyle:{ 
					strokeStyle:"black",
					fillStyle: 'black',
					radius:2,
					lineWidth:2
				},
				connector:"Bezier",	//{ stub:[40, 60], gap:2, cornerRadius:5, alwaysRespectStubs:true }
				connectorStyle: {
					gradient: {
						stops: [
						        [0, 'black'],
						        [1, 'black']
				        ]
					},
					strokeStyle: 'black',
					lineWidth: 3
				},
				overlays:
					[[ "Label",{ location:[2.5, -2], cssClass:"endpointSourceLabel", label:""} ]],
				
		},
		endpointsCatalog : {
				'qb:DataStructureDefinition':{
					isSource: false,
					isTarget: true,
					anchor: "LeftMiddle",
					dropOptions:{ disabled: false },
					maxConnections:1,	
				},
				'qb:measure':{
					isSource: false,
					isTarget: true,
					anchor: "LeftMiddle",
					dropOptions:{
						//accept: 'canvas[elType="input"], canvas[elType="transformation"]',
						drop:function(event,ui){
							event.preventDefault();
							panel.structureEditor.drop(event,ui);
						}
					},
					maxConnections:1,	
				},
				'qb:component':{
					isSource: true,
					isTarget: false,
					anchor: "Bottom",
					dropOptions:{ disabled: true },
					maxConnections:100,	
					overlays:
						[[ "Label", { location:[-9, 1], cssClass:"endpointSourceLabel", label:"qb:component"} ]],
				},
				'rdf:type':{
					isSource: true,
					isTarget: false,
					anchor: "RightMiddle",
					dropOptions:{ disabled: true },
					maxConnections:100,	
					overlays:
						[[ "Label", { location:[2.5, -2], cssClass:"endpointSourceLabel", label:"rdf:label"} ]],
				},
				'special':{
					isSource: true,
					isTarget: true,
					anchor: "RightMiddle",
					deleteEndpointsOnDetach:false,
					connectionsDetachable:false  ,
					uniqueEndpoint:true,
					dropOptions:{
						//accept: 'canvas[elType="input"], canvas[elType="transformation"]',
						/*drop:function(event,ui){
							event.preventDefault();
							panel.structureEditor.drop(event,ui);
						}*/
					},
					dragOptions:{
						helper:"original"
					},
					maxConnections:1,	
				}
		}
};

panel.structureEditor.init = function(){
	
	this.div = $('#structure-editor');
	this.elementsDiv = this.div.find('.structure-editor-elements-section');				
	this.mainDiv = this.div.find('.structure-editor-main-section');
	this.cubeVocabularyBox = this.elementsDiv.find('.data-cube-vocabulary-box');
	this.propertiesBox = this.elementsDiv.find('.target-vocabulary-properties-box');
	console.log(this.elementsDiv.height());
	this.cubeVocabularyBox.css({
		'top':'0px',
		'height':this.div.height()/2,
		'margin':'0px'
	});
	this.propertiesBox.css({
		'top':this.cubeVocabularyBox.height(),
		'margin':'0px',
		'height':this.div.height()/2
	});
	
	var vocabularyElements = [
	                          {
	                        	  label:'data structure uri',
	                        	  elemClass:'data-structure-uri',
	                        	  name:'data-structure-uri'
	                          },
	                          {
	                        	  label:'qb:DataStructureDefinition',
	                        	  elemClass:'vocabulary-box',
	                        	  name:'qb:DataStructureDefinition'
	                          },
	                          {
	                        	  label:'qb:measure',
	                        	  elemClass:'vocabulary-box',
	                        	  name:'qb:measure'
	                          }
	                          ];
	
	var boxRDFElement = null;
	var height = 0;
	var vocabularyArea = this.cubeVocabularyBox.find('.vocabulary-area');
	if(vocabularyArea.length == 0){
		vocabularyArea = $('<div>').addClass('vocabulary-area').appendTo(this.cubeVocabularyBox);
	}
	
	for(var i = 0; i < vocabularyElements.length;i++){

		var elemClass = vocabularyElements[i].elemClass;
		var label = vocabularyElements[i].label;
		var name = vocabularyElements[i].name;
		
		boxRDFElement = $('<div>').addClass(elemClass+' '+'structure-element')
		                          .attr('name',name);
		console.log(boxRDFElement.attr('class'));
		height = boxRDFElement.height();
		
		boxRDFElement.css({'top':height*i+'px'});
		
		boxRDFElement.draggable({
			appendTo: "body", 
			helper: "clone",
			start: function(event, ui) {   	
				   var closestBox = $(event.target).closest('.structure-element');
				   ui.helper.css({
					   'background':'red',
					   'width':closestBox.css('width')
				   })
				   .addClass(closestBox.attr('class'))
				   .attr('id',closestBox.attr('name')+
						   panel.structureEditor.numberOfElem);
				   panel.structureEditor.numberOfElem++;
				   console.log("ui help class "+ui.helper.attr('class'));
				   console.log("ui help name "+ui.helper.attr('name'));
				   console.log("ui help id "+ui.helper.attr('id'));
			}
		});
		boxRDFElement.html("<p>"+label+"</p>");
		vocabularyArea.append(boxRDFElement);
	}
	
	panel.structureEditor.initMainSection();
};

panel.structureEditor.initMainSection = function(){
	
		jsPlumb.Defaults.Container = panel.structureEditor.mainDiv;
		jsPlumb.Defaults.Connector = "Bezier";
		jsPlumb.Defaults.ConnectionOverlays = [
		  					["Custom", {
		  						create:function(component) {
		  							var input = $('<input>').attr('type','text')
		  													.addClass('property-input')
		  													.css({'display':'none'});
		  							return input;
		  						},
		  						location:0.5,
		  						id:"inputOverlay"
		  					}]
		  				];
		jsPlumb.bind("connection", function(connInfo, event) { 
			var connection = connInfo.connection;
			connection.bind("click",function(conn){
				console.log(conn);
			});
			connection.getOverlay("inputOverlay").show();
					  //.setLabel("<input type='text' size=20></input");
			console.log(event.pageX+"/"+event.pageY);
			console.log(event.target.nodeName);
			console.log($(event.target).attr('class'));
			//connection.sourceId.substring(6) + "-" + connection.targetId.substring(6)
			//console.log(JSON.stringify(connInfo.connection));
		});	
		
		/*jsPlumb.Defaults.Overlays = [
		                   					[ "Arrow", { location:1 } ],
		                					[ "Label", { 
		                						location:0.1,
		                						id:"label",
		                						cssClass:"aLabel"
		                					}]
		                				];*/
		
		var structureArea = this.mainDiv;
		//panel.linkEditorTab.addListeners();
		structureArea.on("change","input[type=text]",function(event){
			console.log($(this).val());
		});
		structureArea.droppable({
			  accept: ".structure-element",
			  drop: function(event,ui){
				  var box = panel.structureEditor.getRuleElementBox(ui.helper);
				  var endpoints = panel.structureEditor.getEndpoints(ui.helper,panel.structureEditor.numOfEp);
				  //console.log(JSON.stringify(endpoints));
				  box.css({
					  'position':'absolute',
					  'top':(event.pageY-175)+'px',//175 is the total top of linkage-rule-area div
					  'left':(event.pageX-600)+'px',//320 is the total left of linkage-rule-area div
				  });
				  $(this).append(box);
				  jsPlumb.draggable(box);
				  
				  for(var i = 0; i < endpoints.length; i++){
					  var ep = jsPlumb.addEndpoint(box.attr('id'),
							  			  endpoints[i]
					  );
					  console.log(ep.getUuid());
					  panel.structureEditor.numOfEp++;
				  }
				  
				  
				  /*if(endpoints.leftEndpoint!=null){
					  jsPlumb.addEndpoint(box.attr('id'),endpoints.leftEndpoint);
				  }*/
				  /*if(box.attr('id') == "qb_measure1"){
					  jsPlumb.connect({ source:"qb_measure1", target:"qb_measure0" });
				  }*/
				  var span = $('<span>').text('rdf:type').css({
					  'color':'black',
					  'background':'red'
				  });
				  //box.next("canvas._jsPlumb_endpoint").append(span);
				  /*box.nextAll("._jsPlumb_endpoint").attr({
					  "elType":endpoints.elType,
					  "related-box-id":box.attr('id'),
					  "related-elem-id":box.attr('elem-id'),
				  });*/
				  /*var info = {
						  id:box.attr('id'),
						  elemId:box.attr('elem-id'),
						  elType:endpoints.elType
				  };*/
				  //editorManager.addNode(info);
			  }
		});
		structureArea.on("click","svg._jsPlumb_connector",function(event){
			var connector = $(event.target);
			console.log(connector.attr('width'));alert('here');
		});
};

panel.structureEditor.getRuleElementBox = function(uiHelper){
	
	var box = $('<div>').addClass('structure-element-box');
	var id = panel.encode(uiHelper.attr('id'));console.log(id);
	var radius = '0px';
	if(uiHelper.hasClass('vocabulary-box')){
		radius = '5px';
	}
	box.css({
		'width':'230',
		'height':'50',
		'border-radius':radius,
		'background':'#f58400',
		'opacity':1,
	}).text(uiHelper.text())
	.attr('id',id);
	
	
	var deleteIcon = $('<img>')
	   .attr('src','img/cross.png')
	   .addClass('structure-element-delete-icon')
	   .css({
		   'width':'16px',
		   'height':'16px',
		   'position':'relative',
		   'float':'right',
		   'cursor':'pointer'
	   });
			
	deleteIcon.appendTo(box);
	//uiHelper.removeAttr('id');
	
	/************ move the listeners to structure editor area ***********/
	
	box.on("click",".structure-element-delete-icon",function(event){
		var parentBox = $(event.target).parent();
		var endpoint1 = box.next();
		var endpoint2 = endpoint1.next();
		endpoint2.remove(); // perhaps it is a label!
		//labelDiv.remove();
		console.log('endpo1 = '+endpoint1.length+"/"+endpoint1.attr('related-box-id'));
		endpoint1.remove();
		if(endpoint2.hasClass('_jsPlumb_endpoint')){
			console.log('endpo2 = '+endpoint2.length);
			endpoint2.remove();
		}
		parentBox.remove();
	});
	
	return box;
};

panel.structureEditor.getEndpoints = function(uiHelper,number){
	
	console.log(' in endpoints id='+uiHelper.attr('id'));
	
	var idWithNoNumber = uiHelper.attr('id').substring(0,uiHelper.attr('id').length-1);
	console.log('in endpoints id='+idWithNoNumber);
	var endpoints = [];
	var id = idWithNoNumber;
	console.log(number);
	if(id == 'data-structure-uri'){
		
		endpoints.push($.extend(true, {}, getEndpoint("rdf:type"), {uuid:number}));
		number++;
		endpoints.push($.extend(true, {}, getEndpoint("qb:component"), {uuid:number}));
	}
	else if(id == 'qb:DataStructureDefinition'){
		endpoints.push($.extend(true, {}, getEndpoint("qb:DataStructureDefinition"), {uuid:number}));
	}
	else if(id == 'qb:measure'){
		endpoints.push($.extend(true, {}, getEndpoint("qb:measure"), {uuid:number}));
		return endpoints;
		/*var div1 = $('<div>').css({
			
			'position':'absolute',
			'top':400,
			'left':400,
			'width':50,
			'height':50
		}).attr('id','ep1');
		div1.appendTo(this.mainDiv);
		
		var ep1 = jsPlumb.addEndpoint('ep1',getEndpoint("special"));
		
		var div2 = $('<div>').css({
			
			'position':'absolute',
			'top':400,
			'left':500,
			'width':50,
			'height':50
		}).attr('id','ep2');
		div2.appendTo(this.mainDiv);	
		
		var ep2 = jsPlumb.addEndpoint('ep2',getEndpoint("special"));
		jsPlumb.connect({source:ep1, target:ep2});
		$(ep2.getElement()).draggable({
			helper:"original",
		});*/
		//
		
	}
	//console.log(JSON.stringify(endpoints));
	return endpoints;
	
	function getEndpoint(name){
		
		var returnEndpoint = $.extend(true, {}, panel.structureEditor._defaultOptions, panel.structureEditor.endpointsCatalog[name]);
		return returnEndpoint;
	}
	
	
		/*endpoints.rightEndpoint = jsPlumb.extend({
			dropOptions:{
				accept: 'canvas[elType="input"], canvas[elType="transformation"]',
				drop:function(event,ui){
					event.preventDefault();
					panel.linkEditorTab.drop(event,ui);
				},
				over: function(event, ui){
					$("body").css('cursor','pointer'); 
				}, 
				out: function(event, ui){ 
					$("body").css('cursor','default'); 
				}
			}
		},panel.structureEditor.rightOptions1);
		
		endpoints.leftEndpoint = jsPlumb.extend({
			dropOptions:{
				accept: 'canvas[elType="input"], canvas[elType="transformation"]',
				drop:function(event,ui){
					event.preventDefault();
					panel.linkEditorTab.drop(event,ui);
				}
			}
		}, panel.linkEditorTab.leftOptions1);
		
		return endpoints;*/
};

panel.structureEditor.drop = function(event,ui){
	var subject = ui.draggable;
	var object = $(event.target);
	//console.log(subject.attr('class'));
	//console.log(object.attr('class'));
	
	/*var connection = jsPlumb.connect({source:subject, target:object});
	connection.bind("click", function(conn) {
	    console.log("you clicked on ", conn);
	});*/
};


panel.encode = function(id){
	return id.replace(':','_');
};

panel.decode = function(id){
	return id.replace('_',':');
};

/*}else if(ruleElemAttr == 'transformation'){
endpoints.rightEndpoint = panel.linkEditorTab.rightOptions2;
endpoints.leftEndpoint = jsPlumb.extend({
	dropOptions:{
		accept: 'canvas[elType="input"], canvas[elType="transformation"]',
		drop:function(event,ui){
			event.preventDefault();
			panel.linkEditorTab.drop(event,ui);
		},
		over: function(event, ui){
			$("body").css('cursor','pointer'); 
		}, 
		out: function(event, ui){ 
			$("body").css('cursor','default'); 
		}
	}
}, panel.linkEditorTab.leftOptions1);
endpoints.elType = 'transformation';
return endpoints;
}else if(ruleElemAttr == 'comparison'){
endpoints.rightEndpoint = panel.linkEditorTab.rightOptions2;
endpoints.leftEndpoint = jsPlumb.extend({
	dropOptions:{
		accept: 'canvas[elType="transformation"], canvas[elType="input"]',
		drop:function(event,ui){
			event.preventDefault();
			panel.linkEditorTab.drop(event,ui);
		}
		over: function(event, ui){
			$("body").css('cursor','pointer'); 
		}, 
		out: function(event, ui){ 
			$("body").css('cursor','default'); 
		}
	}
}, panel.linkEditorTab.leftOptions1);
endpoints.elType = 'comparison';
return endpoints;

}else if(ruleElemAttr == 'aggregation'){
endpoints.rightEndpoint = panel.linkEditorTab.rightOptions2;
endpoints.leftEndpoint = jsPlumb.extend({
	dropOptions:{
		accept: 'canvas[elType="comparison"], canvas[elType="aggregation"]',
		drop:function(event,ui){
			event.preventDefault();
			panel.linkEditorTab.drop(event,ui);
		}
		over: function(event, ui){
			$("body").css('cursor','pointer'); 
		}, 
		out: function(event, ui){ 
			$("body").css('cursor','default'); 
		}
	}
}, panel.linkEditorTab.leftOptions1);

endpoints.elType = 'aggregation';
return endpoints;
}*/
