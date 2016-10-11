var linkingManager = {
		configParameters:{
			sourceDatasetName:'',
			targetDatasetName:'',
			sourceRestrictTo:'',
			targetRestrictTo:'',
			sourceVar:'',
			targetVar:'',
			linkTaskName:'',
			acceptMinConf:0,
			acceptMaxConf:0,
			verifyMinConf:0,
			verifyMaxConf:0,
			limit:1
		}
};

/*linkingManager.taskStatus = {
	COMPLETED:'completed',
	PENDING:'pending',
	SAVED:'saved'
};*/

/*linkingManager.linkingTaskInfoMap = {};
linkingManager.currentLinkingTask = {};*/
/*linkingManager.functions = {};*/
linkingManager.datasetsMetadata = [];
linkingManager.datasetNames = [];
/*linkingManager.vocabulary = {};*/
linkingManager.suggestedLinkingTasks = [];
linkingManager.resultLinks = {};
linkingManager.executedTasksMap = {};

//->>>>>>check this function
linkingManager.allowToOpenLinkingTask = function(){
	
    /*	var self = this;
    	var currentTask = self.currentLinkingTask;
    	if($.isEmptyObject(currentTask)) return true;
    	
    	if(self.isPendingTask(currentTask.configuration.linkTaskName)){
    	    //alert('There is a linking task in process.Please save the task first.');
	    //return false;
    	    self.saveTask(currentTask.configuration.linkTaskName);
    	    return true;
    	}*/
    	
    	return true;
};

linkingManager.taskNameExists = function(taskName){
    	var self = this;
    	if(typeof self.executedTasksMap[taskName] === 'undefined') return false;
    	return true;
};

linkingManager.taskHasBeenExecuted = function(taskName){
    	
    	var self = this;
    	
    	console.log("EXECUTED TASK MAP > "+JSON.stringify(self.executedTasksMap));
    	var taskExecuted = self.executedTasksMap[taskName];
    	if(typeof taskExecuted !== 'undefined'){
    	    return taskExecuted;
    	}else{
    	    return false;
    	}
};

linkingManager.createTask = function(inputParameters){
    
	var self = this;
	
	if(!editorManager.createTask(inputParameters)){
	    alert("Can't create task!");
	    return false;
	}
	
	self.executedTasksMap[inputParameters.taskName] = false;
	var configuration = editorManager.getTaskConfiguration(inputParameters.taskName);
	self.getPathsInfo(configuration);
	panel.linkingTasksSection.addLinkingTaskBoxInLeftPanel(inputParameters.taskName,editorManager.taskStatus.PENDING);
	panel.linkingTasksSection.enableTaskPanel(inputParameters.taskName);
	panel.linkEditorTab.showTask(inputParameters.taskName);
	panel.resultTab.clearAll();
	return true;
};



/*linkingManager.addCustomConfigurationParameters = function(inputParameters){
	
    	var self = this;
    	
    	console.log("input parameters = "+JSON.stringify(inputParameters));
	
	if(!editorManager.createTask(inputParameters)){
	    alert('Could not create task!!');
    	    return;
	};
	
	
	//panel.linkEditorTab.startLinkageRule(inputParameters.linkTaskName);
};*/



linkingManager.createPredefinedTask = function(inputParameters){
    	
    	var self = this;
    	suggestedLink_o = self.suggestedLinkingTasks[inputParameters.suggestedLinkingTaskNumber];
    	var parameters = {};
    	parameters.sourceDatasetName = suggestedLink_o['sourceDatasetName'];
    	parameters.targetDatasetName = suggestedLink_o['targetDatasetName'];
    	parameters.sourceRestrictTo = /*"?o rdf:type " + suggestedLink_o['sourceDatasetClass'] +'.'+*/'?o '+ pathProperties(suggestedLink_o['sourcePropertyPath']).first + ' ?a';
    	parameters.targetRestrictTo = /*"?o rdf:type " + suggestedLink_o['targetDatasetClass'] +'.'+*/'?o '+ pathProperties(suggestedLink_o['targetPropertyPath']).first + ' ?b';
    	parameters.taskName = inputParameters.taskName;
    	parameters.sourceVar = "a";
    	parameters.targetVar = "b";
	
    	if(!self.createTask(parameters)){
    	    alert('Could not create task!!');
    	    return;
    	};
	
	console.log("CREATE PREDEFINED LINK SPEC FOR TASK > "+inputParameters.taskName);
		
	var sourceInputPathNode = {
		id:normalizeId(1),
		elName:'?a/'+pathProperties(suggestedLink_o['sourcePropertyPath']).second,
		elType:'input'
	};
	
	var targetInputPathNode = {
		id:normalizeId(2),
		elName:'?b/'+pathProperties(suggestedLink_o['targetPropertyPath']).second,
		elType:'input'
	};
	
	console.log("EL NAME IN LINKING MANAGER > "+targetInputPathNode.elName);
	var sourceTransformationNode = {
		id:normalizeId(3),
		elName:"upperCase",
		elType:'transformation'
	};
	
	var targetTransformationNode = {
		id:normalizeId(4),
		elName:"upperCase",
		elType:'transformation'
	};
	
	
	var comparisonNode = {
		id:normalizeId(5),
		elName:inputParameters.compareFunction,
		elType:'comparison'
	};

	editorManager.addNode(sourceInputPathNode);
	editorManager.addNode(targetInputPathNode);
	editorManager.addNode(sourceTransformationNode);
	editorManager.addNode(targetTransformationNode);
	editorManager.addNode(comparisonNode);
	
	editorManager.merge(normalizeId(3),normalizeId(1));
	editorManager.merge(normalizeId(4),normalizeId(2));
	editorManager.merge(normalizeId(5),normalizeId(4));
	editorManager.merge(normalizeId(5),normalizeId(3));
	
	var comparisonWeight = {
		id:normalizeId(5),
		elType:'comparison',
		paramName:'weight',
		value:1
	};
	var comparisonRequired = {
		id:normalizeId(5),
		elType:'comparison',
		paramName:'required',
		value:'true'
	};
	var comparisonThreshold = {
		id:normalizeId(5),
		elType:'comparison',
		paramName:'threshold',
		value:0.0
	};
	
	editorManager.updateUINode(comparisonWeight);
	editorManager.updateUINode(comparisonRequired);
	editorManager.updateUINode(comparisonThreshold);
	
	editorManager.setAcceptOutput(parameters.taskName,'min',0.5);
	editorManager.setAcceptOutput(parameters.taskName,'max',1);
	editorManager.setVerifyOutput(parameters.taskName,'min',0.2);
	editorManager.setVerifyOutput(parameters.taskName,'max',0.5);
		
	var linkSpec = editorManager.constructLinkSpecificationTree(inputParameters.taskName);
	
	panel.linkEditorTab.showTask(inputParameters.taskName);
	panel.linkEditorTab.showExistingLinkageRule(linkSpec);
	
	return;
	
	
	function pathProperties(path){
	    var slashPos = path.indexOf('/');
	    var first = path.substring(0,slashPos);
	    var second = path.substring(slashPos+1);
	    return {
		first:first,
		second:second
	    };
	}
	
	function normalizeId(id){
    	    var clonedId = id;
    	    console.log('ID BEFORE > '+id);
    	    var  newId = panel.linkEditorTab.getElementsCounter() + clonedId;
    	    console.log('ID AFTER > '+newId);
    	    
    	    return newId;
    	}
};


linkingManager.getInitialInfo = function(){
    
    var self = this;
    $.when(self.getDatasetNames(),self.getLinkageRuleFunctions(),self.loadRecommendedLinkingTasks())
    .done(function(datasetNamesResponse,linkageRuleFunctionResponse,recommendedTasksResponse){
	console.log('display menu !!');
	console.log("dataset names " + self.datasetNames);
	console.log("functions " + JSON.stringify(linkageRuleFunctionResponse[0]));
	console.log("reccomended > " + JSON.stringify(recommendedTasksResponse[0]));
	panel.linkFileConfigBox.init(self.datasetNames);
    });
};


linkingManager.submitLinkSpecification = function(jsonLinkSpec){
	
    	var self = this;
    	panel.resultTab.setBusy();
    	var currentConfiguration = editorManager.currentLinkingTask.configuration;
    	
	if(currentConfiguration.taskName == ''){
		alert('The linking task is not properly configured!');
		panel.resultTab.unSetBusy();
		return;
	}
	if(currentConfiguration.acceptMaxConf == 0 || currentConfiguration.verifyMaxConf == 0){
		alert('Not valid max confidence for output links!');
		panel.resultTab.unSetBusy();
		return;
	}
	
	if(!editorManager.isSavedTask(currentConfiguration.taskName)){
	    editorManager.saveTask(currentConfiguration.taskName);
	    //return;
	}
	self.executedTasksMap[currentConfiguration.taskName] = true;   	
    	console.log("EXEC MAP > "+JSON.stringify(self.executedTasksMap));
	$.ajax({
		type :"POST",
		url : "IntegrationServiceServlet/command/linking-data/start-linking-task",
		data:{
			sourceDatasetName:currentConfiguration.sourceDatasetName,
			targetDatasetName:currentConfiguration.targetDatasetName,
			
			ruleSpec:JSON.stringify({
				linkTaskName:currentConfiguration.taskName,
				sourceRestrictTo:currentConfiguration.sourceRestrictTo,//"?a rdf:type qb:Observation",
				targetRestrictTo:currentConfiguration.targetRestrictTo,//"?b rdf:type qb:Observation",
				sourceVar:currentConfiguration.sourceVar,
				targetVar:currentConfiguration.targetVar,
				linkSpec:JSON.stringify(jsonLinkSpec),
				acceptMinConf:currentConfiguration.acceptMinConf,
				acceptMaxConf:currentConfiguration.acceptMaxConf,
				verifyMinConf:currentConfiguration.verifyMinConf,
				verifyMaxConf:currentConfiguration.verifyMaxConf,
				limit:currentConfiguration.limit
			})
		},
		success : function(links) {
			panel.resultTab.displayResults(links);
		}, 
		error: function(){
		    alert('an error occured.Please try again!');
		    panel.resultTab.removeLoadingState();
		    return;
		},
	   	dataType:'json'
	});	
};

linkingManager.getPathsInfo = function(configuration){
	
	var self = this;
    	var currentConfiguration = configuration;
    	
    	panel.leftSection.showLoadingMessageForInput();
    	
	$.ajax({
		type : "GET",
		url : "IntegrationServiceServlet/command/linking-data/get-path-info",
		data:{
			action:"get-properties",
			sourceDatasetName:currentConfiguration.sourceDatasetName,
			targetDatasetName:currentConfiguration.targetDatasetName,
			sourceRestrictTo:currentConfiguration.sourceRestrictTo,//"?a rdf:type qb:Observation",
			targetRestrictTo:currentConfiguration.targetRestrictTo,//"?b rdf:type qb:Observation",
			sourceVar:currentConfiguration.sourceVar,
			targetVar:currentConfiguration.targetVar
		},
		success : function(answerData) {
			console.log(JSON.stringify(answerData));
			panel.leftSection.fillPathBox($('.source-path-subpanel'),answerData.source);
			panel.leftSection.fillPathBox($('.target-path-subpanel'),answerData.target);
			panel.leftSection.hideLoadingMessageForInput();
			panel.linkFileConfigBox.enable();
		},
	   	dataType:'json'
	});	
};


linkingManager.getLinkageRuleFunctions = function(){
	
	return $.ajax({
		type : "GET",
		url : "IntegrationServiceServlet/command/linking-data/get-functions",
		success : function(linkageRuleFunctions) {
		    	
			editorManager.setFunctions(linkageRuleFunctions);
			panel.leftSection.fillRuleElementBoxes(linkageRuleFunctions);
		}, 
	   	dataType:'json'
	});	
};

linkingManager.getLinks = function(taskName){
	var self = this;
	panel.resultTab.setBusy();
	$.ajax({
		type : "GET",
		url : "IntegrationServiceServlet/command/linking-data/get-links?"+$.param({taskName:taskName}),
		success : function(links) {
			panel.resultTab.displayResults(links);
		}, 
		error: function(links){
		    if($.isEmptyObject(links)){
			alert('An error occured fetching the links.Please try again!');
			panel.resultTab.removeLoadingState();
			return;
		    }
		    
		},
	   	dataType:'json'
	});	
};


linkingManager.getDatasetNames = function(){
	
	return $.ajax({
		type : "GET",
		url : "IntegrationServiceServlet/command/general/get-dataset-metadata?"+
		$.param({
		    datasetName:"",
		    metadataCategory:"generalMetadata"
		}),
		success : function(generalMetadata) {
		    	console.log(JSON.stringify(generalMetadata));
		    	var datasetNamesArray = [];
		    	for(var i = 0; i < generalMetadata.length;i++){
		    	    datasetNamesArray.push(generalMetadata[i]["name"]);
		    	}
		    	linkingManager.datasetNames = datasetNamesArray;
			//panel.linkFileConfigBox.init(datasetNames);
		}, 
	   	dataType:'json'
	});	
};

linkingManager.getRecommendedLinkingTasks = function(){
    var self = this;
    if(typeof self.suggestedLinkingTasks !== 'undefined'){
	return self.suggestedLinkingTasks;
    }else{
	return [];
    }
};


linkingManager.loadRecommendedLinkingTasks = function(){
	
    	return  $.ajax({
		type : "GET",
		url : "IntegrationServiceServlet/command/linking-data/get-recommended-linking-tasks",
		success : function(suggestedLinkingTasks) {
		    console.log("success recommend!");
		    linkingManager.suggestedLinkingTasks = suggestedLinkingTasks;
		}, 
	   	dataType:'json'
    	    });	
};




linkingManager.checkNumberOfVariables = function(restrictTo,callbackFunction){
	
	$.ajax({
		type : "GET",
		url : "IntegrationServiceServlet/command/linking-data/get-path-info",
		data:{
			action:"check-variables",
			restrictTo:restrictTo,
		},
		success : function(answerData) {
			console.log(JSON.stringify(answerData));
			callbackFunction(answerData.variables);
		}, 
	   	dataType:'json'
	});	
};


linkingManager.confirmLinkTask = function(taskName,finalAcceptedLinks){
	var self = this;
	
	console.log("confirm");
	console.log(JSON.stringify(finalAcceptedLinks));
	$.ajax({
		type : "POST",
		url : "IntegrationServiceServlet/command/linking-data/confirm-task",
		data:{
			acceptedLinks:JSON.stringify(finalAcceptedLinks),
			linkTaskName:taskName
		},
		success : function(answerData) {
			console.log(JSON.stringify(answerData));
			
			editorManager.setTaskStatus(taskName,editorManager.taskStatus.COMPLETED);
			panel.linkingTasksSection.updateStatusOfLinkingTaskBoxInLeftPanel(taskName,editorManager.taskStatus.COMPLETED);
			panel.resultTab.disableActions();
			//panel.linkEditorTab.disableEditor();
		}, 
	   	dataType:'json'
	});	
};
