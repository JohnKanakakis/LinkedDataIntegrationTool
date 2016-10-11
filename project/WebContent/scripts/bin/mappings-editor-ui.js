/*var panel = panel || {};

panel.mappingsArea = {
		grid:'',
		gridContainer:''
};

panel.mappingsArea.baseLayoutsURI = 'scripts/schema-mappings/panel-ui/mapping-file-area-ui/mapping-boxes-layout/';
panel.mappingsArea.classLayoutURI = panel.mappingsArea.baseLayoutsURI+'class-pair-box.html';
panel.mappingsArea.propertyLayoutURI = panel.mappingsArea.baseLayoutsURI+'property-pair-box.html';


panel.mappingsArea.classMapping = {};

panel.mappingsArea.propertyMapping = {};

panel.mappingsArea.removeAllMappings = function(){
	
	$('.map-boxes-area').find('.mapping-box').fadeOut('fast');
};

panel.mappingTasksSection.editorTab.fetchDataForPattern = function(event){
	
	var sourcePatternDiv = $(event.target).parent().closest('.source-pattern');
	var mapping_id = $(event.target).parent().closest('.mapping-box').attr('mapping-id');
	var pattern_id = sourcePatternDiv.attr('pattern-id');
	
	var bheight = 400;
	var bwidth = 800;
	console.log(screen.height+"/"+screen.width);
	var box = $('<div>').addClass('pattern-data-box loading')
							.css({
								'top': (screen.height - bheight)/2,
								'left':(screen.width - bwidth)/2,
								'height':bheight,
								'width':bwidth,
								'display':'block',
							});
	var cheight = 350;
	var cwidth = 750;
	var container = $('<div>').addClass('data-container')
						 	  .css({
								 'position':'absolute',
								 'top': (bheight - cheight)/2,
								 'left':(bwidth - cwidth)/2,
								 'height':cheight,
								 'width':cwidth,
							  });
	container.appendTo(box);
	var boxHeader = $('<div>').addClass('box-header box-handler')
	  						  .css({
	  							 'position':'absolute',
	  							 'top': 0,
	  							 'left':0,
	  							 'width':'100%',
	  							 'height':(bheight - cheight)/2,
	  							 'background':'yellow',
	  						 });
	boxHeader.appendTo(box);
	var deleteIcon = $('<img>').addClass('delete-pattern-icon').attr('id',"pattern-data-box-icon")
	   .attr('src','img/cross.png')
	   .css({
		   'width':'16px',
		   'height':'16px'
	   });
	deleteIcon.appendTo(boxHeader);
	
	box.on("click","#pattern-data-box-icon",function(event){
		$(event.target).closest('.pattern-data-box').remove();
	});
	
	var handlerLeft = $('<div>').addClass('box-handler')
	  							.css({
	  								'position':'absolute',
	  								'top': (bheight - cheight)/2,
	  								'left':0,
	  								'width':(bwidth-cwidth)/2,
	  								'height':cheight
	  							});
	handlerLeft.appendTo(box);
	var handlerRight = $('<div>').addClass('box-handler')
								 .css({
									 'position':'absolute',
									 'top': (bheight - cheight)/2,
									 'right':0,
									 'width':(bwidth-cwidth)/2,
									 'height':cheight
								 });
	handlerRight.appendTo(box);
	var handlerBottom = $('<div>').addClass('box-handler')
	 							  .css({
	 								 'position':'absolute',
	 								 'bottom': 0,
	 								 'left':0,
	 								 'width':'100%',
	 								 'height':(bheight - cheight)/2
	 							 });
	handlerBottom.appendTo(box);
	box.appendTo('body');//fetching data message
	this.gridContainer = container;
	mappingsManager.queryForPattern(mapping_id,pattern_id);
	box.draggable({
		cursor:'move',
		handle: ".box-handler",
		stack: ".data-container" 
	});
	
};

panel.mappingTasksSection.editorTab.addDataToGrid = function(data){
	
	var grid;
	var options = {
	    editable: false,
	    enableCellNavigation: true,
	    autoEdit: false,
		enableColumnReorder : false,
		explicitInitialization: true,
		autoHeight:false
	};
	
	var columns = [];
    var col = {};
    var width = 0;
    for (var key in data[0]) {
		console.log(key);
		if(key == "Confidence"){
			width = 80;
		}else{
			width = 380;
		}
		console.log(width);
		col = {
					id : key,
					name : key,
					field : key,
					width:width
				  };
		columns.push(col);
	}
    
    grid = new Slick.Grid(this.gridContainer, data, columns, options);
    this.gridContainer.parent().removeClass('loading');
    grid.init();
};
*/


panel.mappingTasksSection.editorTab.endpoints = {
	
		defaultOptions : {
				endpoint: "Dot",
				paintStyle:{ 
					strokeStyle:"red",
					fillStyle: 'red',
					radius:2,
					lineWidth:2
				},
				connector:"Bezier",	//{ stub:[40, 60], gap:2, cornerRadius:5, alwaysRespectStubs:true }
				connectorStyle: {
					gradient: {
						stops: [
						        [0, 'red'],
						        [1, 'red']
				        ]
					},
					strokeStyle: 'red',
					lineWidth: 3
				},
				/*overlays:
					[[ "Label",{ location:[2.5, -2], cssClass:"endpointSourceLabel", label:""} ]],*/
				
		},
		catalog : {
				'toTargetTermEndpoint':{
					isSource: true,
					isTarget: false,
					anchor: "RightMiddle",
					/*dropOptions:{ disabled: false },*/
					maxConnections:100,	
				},
				'toSourceTermEndpoint':{
					isSource: true,
					isTarget: false,
					anchor: "Bottom",
					/*dropOptions:{
						accept: 'canvas[elType="input"], canvas[elType="transformation"]',
						drop:function(event,ui){
							event.preventDefault();
							//panel.structureEditor.drop(event,ui);
						}
					},*/
					maxConnections:100,	
				},
				'fromSourceTermEndpoint':{
					isSource: false,
					isTarget: true,
					anchor: "LeftMiddle",
					dropOptions:{
						accept: 'div.source-property-ep,div.source-class-ep',
						/*drop:function(event,ui){
							event.preventDefault();
							//panel.structureEditor.drop(event,ui);
						}*/
					},
					maxConnections:1,	
				},
				'fromSourceTermEndpoint1':{
					isSource: false,
					isTarget: true,
					anchor: "Top",
					dropOptions:{
						accept: 'div.source-property-ep',
						/*drop:function(event,ui){
							event.preventDefault();
							//panel.structureEditor.drop(event,ui);
						}*/
					},
					maxConnections:1,	
				}
		}
};

panel.mappingTasksSection.editorTab.numOfPatternBoxes = 0;
panel.mappingTasksSection.editorTab.baseLayoutsURI = 'scripts/schema-mappings/panel-ui/mapping-tasks/mapping-task-ui/mapping-boxes-layout/';
panel.mappingTasksSection.editorTab.classLayoutURI = panel.mappingTasksSection.editorTab.baseLayoutsURI+'class-pair-box.html';
panel.mappingTasksSection.editorTab.propertyLayoutURI = panel.mappingTasksSection.editorTab.baseLayoutsURI+'property-pair-box.html';
panel.mappingTasksSection.editorTab.mappingsArea = '';



panel.mappingTasksSection.editorTab.initMappingEditor = function(){
    
    this.mappingsArea = this.div.find("#main-mappings-area");
    var editorTab = this;
    
    jsPlumb.bind("connection", function(connInfo,event) { 
	editorTab.handleNewConnection(connInfo,event);
    });
    
    this.mappingsArea.on("click", ".close-icon", function(event) {
	var mappingBox = $(event.target).closest('.mapping-box');
	if(mappingBox.hasClass('class-mapping-box')){
	    mappingsManager.deleteClassMappingPair(mappingBox.attr('mapping-id'));
	}else{
	    mappingsManager.deletePropertyMappingPair(mappingBox.attr('mapping-id'));
	}
	mappingBox.remove();
    });
    
    this.mappingsArea.on("click",".pattern-box-delete-icon",function(event){
	var patternBox = $(event.target).parent();
	editorTab.handleDetachedConnection(patternBox);
    });
    
};

panel.mappingTasksSection.editorTab.addOneToManyPropertyMapping = function(){
    	
    	var editorTab = this;
	
	var mappingBox = $('<div>')
	    .addClass('mapping-box property-mapping-box')
	    .load(editorTab.propertyLayoutURI,function(){
		//addListeners($(this));//common
		configureDroppable($(this).find('.mapping-box-body'));
		var mapping_id = mappingsManager.addPropertyMappingPair();
		$(this).attr('mapping-id', mapping_id);
		$(this).find('.mapping-box-body').attr('id','mapping-box-body-'+mapping_id);
	    })
	    .css({'width':editorTab.mappingsArea.width()*0.9})
	    .prependTo(editorTab.mappingsArea);
	
	
	function configureDroppable(box){
    	    
    	    box.droppable({
		    accept : ".source-property-term,.target-property-term,.literal-term",
		    drop : function(event, ui) {
			console.log(ui.helper.text());
			
			
			/* rule 1 for class mappings
			var existedPatternBoxes = $(event.target).find('.source-property-box');
			if(ui.helper.hasClass('source-property-term') && existedPatternBoxes.length > 0){
			    alert('multiple source properties/classes are not permitted');
			    return;
			}*/
			/* rule 2 for class mappings
			
			existedPatternBoxes = $(event.target).find('.target-properties-box');
			if(ui.helper.hasClass('target-class-term') && existedPatternBoxes.length > 0){
			    alert('multiple source properties/classes are not permitted');
			    return;
			}*/
			
			
			editorTab.addBoxToEditor(box,event,ui);
			/*var patternBox = editorTab.getPatternBox(ui.helper);
			var endpoints = editorTab.getEndpoints(ui.helper);
			
			var offset = box.offset();
			patternBox.css({
			    'position':'absolute',
			    'top':(event.pageY-offset.top)+'px',
		    	    'left':(event.pageX-offset.left)+'px',
			})
			.attr('id','pattern-box-'+editorTab.numOfPatternBoxes);
			editorTab.numOfPatternBoxes++;
			$(this).append(patternBox);
			jsPlumb.draggable(patternBox,{
			    containment:$(event.target).closest('.mapping-box-body'),
			    scroll:true
			});
			for(var i = 0; i < endpoints.length; i++){
			    jsPlumb.addEndpoint(patternBox.attr('id'),endpoints[i],{container:box.attr('id')});
			}*/
		    }
    	    });
    	}
};




panel.mappingTasksSection.editorTab.addClassMapping = function(){
    
	
	var editorTab = this;
	editorTab.mappingsArea = editorTab.div.find("#main-mappings-area");
    	var mappingBox = $('<div>')
	    .addClass('mapping-box class-mapping-box')
	    .load(editorTab.classLayoutURI,function(){
		//addListeners($(this));
		configureDroppable($(this).find('.mapping-box-body'));
		var mapping_id = mappingsManager.addClassMappingPair();
		$(this).attr('mapping-id', mapping_id);
		$(this).find('.mapping-box-body').attr('id','mapping-box-body-'+mapping_id);
	    })
	    .css({'width':editorTab.mappingsArea.width()*0.9})
	    .prependTo(editorTab.mappingsArea);
    	
    	
    	
			
    	function configureDroppable(box){
    	    
    	    box.droppable({
		    accept : ".source-class-term,.target-class-term,.literal-term",
		    drop : function(event, ui) {
			console.log(ui.helper.text());
			
			
			/* rule 1 for class mappings*/
			var existedPatternBoxes = $(event.target).find('.source-class-box');
			if(ui.helper.hasClass('source-class-term') && existedPatternBoxes.length > 0){
			    alert('multiple source properties/classes are not permitted');
			    return;
			}
			/* rule 2 for class mappings*/
			
			existedPatternBoxes = $(event.target).find('.target-class-box');
			if(ui.helper.hasClass('target-class-term') && existedPatternBoxes.length > 0){
			    alert('multiple source properties/classes are not permitted');
			    return;
			}
			
			
			editorTab.addBoxToEditor(box,event,ui);
			/*var patternBox = editorTab.getPatternBox(ui.helper);
			var endpoints = editorTab.getEndpoints(ui.helper);
			
			var offset = box.offset();
			patternBox.css({
			    'position':'absolute',
			    'top':(event.pageY-offset.top)+'px',
		    	    'left':(event.pageX-offset.left)+'px',
			})
			.attr('id','pattern-box-'+editorTab.numOfPatternBoxes);
			editorTab.numOfPatternBoxes++;
			$(this).append(patternBox);
			jsPlumb.draggable(patternBox,{
			    containment:$(event.target).closest('.mapping-box-body'),
			    scroll:true
			});
			for(var i = 0; i < endpoints.length; i++){
			    jsPlumb.addEndpoint(patternBox.attr('id'),endpoints[i],{container:box.attr('id')});
			}*/
		    }
    	    });
    	}
};


panel.mappingTasksSection.editorTab.addBoxToEditor = function(box,event,ui){
    	
    	var editorTab = this;
    	var patternBox = editorTab.getPatternBox(ui.helper);
	var endpoints = editorTab.getEndpoints(ui.helper);
	
	var offset = box.offset();
	patternBox.css({
	    'position':'absolute',
	    'top':(event.pageY-offset.top)+'px',
	    'left':(event.pageX-offset.left)+'px',
	})
	.attr('id','pattern-box-'+editorTab.numOfPatternBoxes);
	editorTab.numOfPatternBoxes++;
	box.append(patternBox);
	jsPlumb.draggable(patternBox,{
	    containment:$(event.target).closest('.mapping-box-body'),
	    scroll:true
	});
	for(var i = 0; i < endpoints.length; i++){
	    var endp = jsPlumb.addEndpoint(patternBox.attr('id'),endpoints[i].ep,{container:box.attr('id')});
	    endp.addClass(endpoints[i].epClass);
	}
};


panel.mappingTasksSection.editorTab.getPatternBox = function(uiHelper){
    
    var termClass = '';
    if(uiHelper.hasClass('source-class-term')){
	termClass = 'source-class-box';
    }else if(uiHelper.hasClass('source-property-term')){
	termClass = 'source-property-box';
    }else if(uiHelper.hasClass('target-class-term')){
	termClass = 'target-class-box';
    }else if(uiHelper.hasClass('target-property-term')){
	termClass = 'target-property-box';
    }
    
    	var patternBox = $('<div>').css({ 
  	    'background':'gray',
    	    'width':250,
    	    'height':40,
    	    'font-size':'small',
    	    'cursor':'pointer'
    	})
    	.addClass('pattern-box')
    	.addClass(termClass)
    	.attr('submitted','false');
    	
    	var deleteIcon = $('<img>')
	   .attr('src','img/cross.png')
	   .addClass('pattern-box-delete-icon')
	   .css({
		   'width':'16px',
		   'height':'16px',
		   'position':'absolute',
		   'right':0,
		   'top':0,
		   'cursor':'pointer'
	   })
	   .appendTo(patternBox);
	var span = $('<span>').css({
	    'position':'absolute',
	    'top':16,
	    'left':0,
	    'right':'0px',
	    'height':'15px',
	    'padding-left':'5px'
	})
	.text(uiHelper.text())
	.appendTo(patternBox);
	
    	return patternBox;
};

panel.mappingTasksSection.editorTab.getEndpoints = function(uiHelper){
    	
    	var endpointsOptions = this.endpoints;
	var endpoints = [];
	console.log(uiHelper.attr('class'));
	if(uiHelper.hasClass('source-class-term')){
		endpoints.push({epClass:'source-class-ep',ep:$.extend(true, {}, endpointsOptions.defaultOptions, endpointsOptions.catalog['toTargetTermEndpoint'])});
	}else if(uiHelper.hasClass('source-property-term')){
	    	endpoints.push({epClass:'source-property-ep',ep:$.extend(true, {}, endpointsOptions.defaultOptions, endpointsOptions.catalog['toTargetTermEndpoint'])});
		endpoints.push({epClass:'source-property-ep',ep:$.extend(true, {}, endpointsOptions.defaultOptions, endpointsOptions.catalog['toSourceTermEndpoint'])});
	    	endpoints.push({epClass:'source-property-ep',ep:$.extend(true, {}, endpointsOptions.defaultOptions, endpointsOptions.catalog['fromSourceTermEndpoint1'])});
	}else if(uiHelper.hasClass('target-class-term')){
	    	endpoints.push({epClass:'target-class-ep',ep:$.extend(true, {}, endpointsOptions.defaultOptions, endpointsOptions.catalog['fromSourceTermEndpoint'])});
	}else if(uiHelper.hasClass('target-property-term')){
	    	endpoints.push({epClass:'target-property-ep',ep:$.extend(true, {}, endpointsOptions.defaultOptions, endpointsOptions.catalog['fromSourceTermEndpoint'])});
	}
	console.log(JSON.stringify(endpoints));
	return endpoints;
};



panel.mappingTasksSection.editorTab.handleNewConnection = function(connInfo,event){
    
    var connection = connInfo.connection;
    var mapping_id = $(event.target).closest('.mapping-box').attr('mapping-id');
    console.log('mapping-id ='+mapping_id);
    console.log(connection.sourceId);
    console.log(connection.targetId);
    var source = $(connection.source);
    var target = $(connection.target);
    console.log(source.attr('class'));
    console.log(target.attr('class'));
    var sourcePatternId = source.attr('pattern-id');
    var targetPatternId = target.attr('patern-id');
    
    var sourceText = source.find('span').text();
    var targetText = target.find('span').text();
    console.log(sourceText+"/"+targetText);
   
    var resultObject = {};
    var pattern_id;
    var label;
   
    
    if(source.hasClass('source-class-box')){//class mapping case
	if(target.hasClass('target-class-box')){//source class -> target class connection
	    
	    if(source.attr('submitted')!='true'){
		resultObject = mappingsManager.addSourcePatternToClassPair(mapping_id,sourceText,true,'class');
		sourcePatternId = resultObject.pattern_id;
		label = resultObject.label;
		source.attr('pattern-id',sourcePatternId);
		source.find('span').text(label);
		source.attr('submitted','true');
	    }
	    
	    if(target.attr('submitted')!='true'){
		resultObject = mappingsManager.addTargetPatternToClassPair(mapping_id,targetText,sourcePatternId,'class');
		targetPatternId = resultObject.pattern_id;
		label = resultObject.label;
		target.attr('pattern-id',targetPatternId);
		target.find('span').text(label);
		target.attr('submitted','true');
	    }
	}
    }
    if(source.hasClass('source-property-box')){//property mapping case
	
	if(target.hasClass('source-property-box')){//extend path case
	    
	    if(source.attr('submitted')!='true'){ //also check with pattern id, if undefined ->not submitted!
		resultObject = mappingsManager.addSourcePatternToPropertyPair(mapping_id,sourceText,true,'property');
		sourcePatternId = resultObject.pattern_id;
		label = resultObject.label;
		source.attr('pattern-id',sourcePatternId);
		source.find('span').text(label);
		source.attr('submitted','true');
	    }
	    
	    if(target.attr('submitted')!='true'){
		resultObject = mappingsManager.addSourcePatternToPropertyPair(mapping_id,targetText,true,'property');
		sourcePatternId = resultObject.pattern_id;
		label = resultObject.label;
		target.attr('pattern-id',sourcePatternId);
		target.find('span').text(label);
		target.attr('submitted','true');
	    }
	}else if(target.hasClass('target-property-box')){//source property -> target property connection
	    
	    if(source.attr('submitted')!='true'){
		resultObject = mappingsManager.addSourcePatternToPropertyPair(mapping_id,sourceText,true,'property');
		sourcePatternId = resultObject.pattern_id;
		label = resultObject.label;
		source.attr('pattern-id',sourcePatternId);
		source.find('span').text(label);
		source.attr('submitted','true');
	    }
	    
	    if(target.attr('submitted')!='true'){
		resultObject = mappingsManager.addTargetPatternToPropertyPair(mapping_id,targetText,sourcePatternId,'property');
		targetPatternId = resultObject.pattern_id;
		label = resultObject.label;
		target.attr('pattern-id',targetPatternId);
		target.find('span').text(label);
		target.attr('submitted','true');
	    }
	}
    }
    
};

panel.mappingTasksSection.editorTab.handleDetachedConnection = function(patternBox){
    
    console.log('destroy!!');
    var mappingBox = patternBox.closest('.mapping-box');
    var mapping_id = mappingBox.attr('mapping-id');
    var pattern_id = patternBox.attr('pattern-id');
    console.log('mapping-id ='+mapping_id);
    
    if(patternBox.hasClass('source-class-box')){
	console.log('source class deleted!');
	mappingsManager.deleteSourcePatternFromClassPair(mapping_id,pattern_id,false);
	jsPlumb.select({source:patternBox.attr('id')}).detach();
	jsPlumb.selectEndpoints({source:patternBox}).remove();
	patternBox.remove();
	return;
    }
    if(patternBox.hasClass('target-class-box')){
	console.log('target class deleted!');
	mappingsManager.deleteTargetPatternFromClassPair(mapping_id,pattern_id,false);
	jsPlumb.select({target:patternBox.attr('id')}).detach();
	jsPlumb.selectEndpoints({target:patternBox}).remove();
	patternBox.remove();
	return;
    }
    
    if(patternBox.hasClass('source-property-box')){
	console.log('source property deleted!');
	
	
	deleteSourcePropertyFromPropertyMapping(mapping_id,patternBox);
	mappingBox.find('.pattern-box[remove=true]').each(function(){
	    
	    jsPlumb.selectEndpoints({source:$(this).attr('id')}).remove();
	    jsPlumb.selectEndpoints({target:$(this).attr('id')}).remove();
	    this.remove();
	});
	return;

    }else{
	console.log('target property deleted!');
	
	jsPlumb.select({target:patternBox.attr('id')}).detach();
	jsPlumb.selectEndpoints({target:patternBox}).remove();
	patternBox.remove();
    }
    
    
    
    function deleteSourcePropertyFromPropertyMapping(mapping_id,patternBox){
	
	var target;
	var targetPatternId;
	console.log('parent text '+patternBox.find('span').text() );
	jsPlumb.select({source:patternBox.attr('id')}).each(function(connection) {    
	    console.log('here');
	    target = $(connection.target);
	    console.log("chlid text  " + target.find('span').text() );
	    targetPatternId = target.attr('pattern-id');
	    deleteSourcePropertyFromPropertyMapping(mapping_id,target);
	    if(target.hasClass('source-property-box')){
		mappingsManager.deleteSourcePatternFromPropertyPair(mapping_id,targetPatternId,false);
	    }else{
		mappingsManager.deleteTargetPatternFromPropertyPair(mapping_id,targetPatternId,false);
	    }
	    jsPlumb.detach(connection);
	});
	if(patternBox.hasClass('source-property-box')){
		mappingsManager.deleteSourcePatternFromPropertyPair(mapping_id,patternBox.attr('pattern-id'),false);
	}else{
		mappingsManager.deleteTargetPatternFromPropertyPair(mapping_id,patternBox.attr('pattern-id'),false);
	}
	patternBox.attr('remove','true');
    }
};


panel.mappingTasksSection.editorTab.getMappingPairs = function(){
    
    return this.mappingsArea.children();
};

/********************************************************************************************/



/*panel.structureEditor.initMainSection = function(){
	
	jsPlumb.Defaults.Container = panel.structureEditor.mainDiv;
	jsPlumb.Defaults.Connector = "Bezier";
	jsPlumb.Defaults.ConnectionOverlays = [ [
	    "Custom",
	    {
		create : function(component) {
		    var input = $('<input>').attr('type', 'text').addClass(
			    'property-input').css({
			'display' : 'none'
		    });
		    return input;
		},
		location : 0.5,
		id : "inputOverlay"
	    } ] ];
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
	
	jsPlumb.Defaults.Overlays = [
	                   					[ "Arrow", { location:1 } ],
	                					[ "Label", { 
	                						location:0.1,
	                						id:"label",
	                						cssClass:"aLabel"
	                					}]
	                				];
	
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
			  
			  
			  if(endpoints.leftEndpoint!=null){
				  jsPlumb.addEndpoint(box.attr('id'),endpoints.leftEndpoint);
			  }
			  if(box.attr('id') == "qb_measure1"){
				  jsPlumb.connect({ source:"qb_measure1", target:"qb_measure0" });
			  }
			  var span = $('<span>').text('rdf:type').css({
				  'color':'black',
				  'background':'red'
			  });
			  //box.next("canvas._jsPlumb_endpoint").append(span);
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
			  //editorManager.addNode(info);
		  }
	});
	structureArea.on("click","svg._jsPlumb_connector",function(event){
		var connector = $(event.target);
		console.log(connector.attr('width'));alert('here');
	});
};


panel.structureEditor.getRuleElementBox = function(uiHelper){
	
	
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
		var div1 = $('<div>').css({
			
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
		});
		//
		
	}
	//console.log(JSON.stringify(endpoints));
	return endpoints;
	
	function getEndpoint(name){
		
		var returnEndpoint = $.extend(true, {}, panel.structureEditor._defaultOptions, panel.structureEditor.endpointsCatalog[name]);
		return returnEndpoint;
	}
};*/

/*function deleteSourcePattern(event){
event.preventDefault();alert('delete');
var sourcePatternDiv = $(event.target).closest('.source-pattern');
var sourcePatternText = sourcePatternDiv.attr('related-source-pattern');

var result = mappingsManager.deleteSourcePatternFromPropertyPair(box.attr('mapping-id'),
																 sourcePatternText);
if (result.delete_ok){
	$(event.target).closest('tr').remove();
	numberOfSourceTerms--;
	if(result.sourcePatternLabel!='' && result.targetPatternLabel!=''){
		box.find('div.source-pattern')
		   .html('<p>'+result.sourcePatternLabel+ '<img class="delete-source-pattern-icon"' +
	             'src="img/cross.png" width="16px" height="16px" '+
        	     'style="float:right;cursor:pointer"></p>')
           .attr('related-source-pattern',result.sourcePatternLabel);
		
		box.find('div.target-pattern')
		   .html("<p>"+ result.targetPatternLabel +
				"<img class='delete-target-pattern-icon' src='img/cross.png' width='16px' height='16px'"+
				"style='float:right;cursor:pointer'>"+
				"<img class='transform-icon' src='img/transform-icon.png' width='20px' height='20px'"+ 
				"title='Click to add a transformation'></p>")
		   .attr('related-target-pattern',result.targetPatternLabel);
	}
}
};

function deleteTargetPattern(event){
event.preventDefault();
var div = $(event.target).closest('div.target-pattern');
var result = mappingsManager.deleteTargetPatternFromPropertyPair(box.attr('mapping-id'),
													div.attr('related-target-pattern'));
if (result.delete_ok){
	$(event.target).closest('tr').remove();
}

if (result.delete_ok){
	
	numberOfTargetTerms--;
	if(result.sourcePatternLabel!='' && result.targetPatternLabel!=''){
		box.find('div.source-pattern')
		   .html('<p>'+result.sourcePatternLabel+ '<img class="delete-source-pattern-icon"' +
	             'src="img/cross.png" width="16px" height="16px" '+
        	     'style="float:right;cursor:pointer"></p>')
           .attr('related-source-pattern',result.sourcePatternLabel);
		
		box.find('div.target-pattern')
		   .html("<p>"+ result.targetPatternLabel +
				"<img class='delete-target-pattern-icon' src='img/cross.png' width='16px' height='16px'"+
				"style='float:right;cursor:pointer'>"+
				"<img class='transform-icon' src='img/transform-icon.png' width='20px' height='20px'"+ 
				"title='Click to add a transformation'></p>")
		   .attr('related-target-pattern',result.targetPatternLabel);
	}
}
}*/