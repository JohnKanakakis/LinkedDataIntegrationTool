var mappingsManager = {};

mappingsManager.taskStatus = {
	COMPLETED:'completed',
	PENDING:'pending',
	APPLIED:'applied'
};

mappingsManager.importedVocabularies = [];
mappingsManager.mappingTaskInfoMap = {};

mappingsManager.currentState = {
		datasetImported:false,
		inputDatasetName:'',
		submitMappings:false,
		deleteMappings:false,
		mappingFileName:'',
		completedTasks:0,
		totalTasks:0,
		sourceVocabulary:[]	
};

mappingsManager.datasetGeneralMetadata = {};


mappingsManager.getNumberOfMappedDatasets = function(){
    var self = this;
    return self.currentState.completedTasks;
};

mappingsManager.getNumberOfDatasets = function(){
    var self = this;
    var count = 0;
    for(var key in self.mappingTaskInfoMap){
	count++;
    }
    return count;
};
//mappingsManager.propertyMappingPairs = [];



/*mappingsManager.allowToOpenNewInputDataset = function(){
	
    	if(!this.hasImportedDataset()) return true;
    	
    	if (this.currentMappingsPending()){
	    	alert('There is a mapping task in process!');
		return false;
	}
	if(this.currentState.completedTasks == this.currentState.totalTasks){
	    alert("You have reached the max number of mapping tasks. Please proceed to next step.");
	    return false;
	}
	return true;
};*/


mappingsManager.hasImportedDataset = function(){
	return this.currentState.datasetImported;
};


mappingsManager.currentMappingsPending = function(){
	return (this.mappingTaskInfoMap[this.currentState.mappingFileName].status == this.taskStatus.PENDING);
};

mappingsManager.datasetImported = function(){
	this.currentState.datasetImported = true;
};

mappingsManager.createMappingTask = function(input_form_parameters){
    	var self = this;
    	var datasetName = input_form_parameters.inputDatasetName;
	var mappingTaskName = input_form_parameters.mappingTaskName;
	
	var mappingTask = {};
	if(typeof self.mappingTaskInfoMap[mappingTaskName] !== 'undefined'){
	    return mappingTask;
	}
	
	self.currentState.datasetImported = true;
	self.currentState.inputDatasetName = datasetName;
	self.currentState.mappingFileName = mappingTaskName;
	mappingTask = {
		name:mappingTaskName,
		datasetName:datasetName,
		sourceVocabulary:[],
		status:mappingsManager.taskStatus.PENDING
	};
	self.mappingTaskInfoMap[mappingTaskName] = mappingTask;
	return mappingTask;
	//panel.mappingTasksSection.addMappingTaskBoxInLeftPanel(mappingTaskName,this.taskStatus.PENDING);
};

mappingsManager.storeMappingTask = function(task){
    
    var self = this;
    console.log("store task > "+task.name);
    /*if(typeof self.currentState.mappingFileName !== 'undefined'){
	 if(task.name != self.currentState.mappingFileName){
		alert(task.name + ' and ' + self.currentState.mappingFileName + ' not synch!!');
		return -1;
	 }
    }*/
    self.mappingTaskInfoMap[task.name] = task;
    return 1;
};

mappingsManager.loadMappingTask = function(taskName){
    
    var self = this;
    return self.mappingTaskInfoMap[taskName];
    /*if(!$.isEmptyObject(self.currentState)){
	console.log('store the current map first because it is not empty!');
	if(self.storeMappingTask(self.currentState.mappingFileName) > 0){
	    console.log("successful storing . . .");
	    return 1;
	}else{
	    return -1;
	}
    }else{
	self.currentState = self.mappingTaskInfoMap[taskName];
	if(typeof self.currentState === 'undefined'){
	    alert('wrong task name!!');
	    return -1;
	}
	return 1;
    }*/
};


mappingsManager.getDatasetsInfo = function(){
	var self = this;
	self.datasetGeneralMetadata = {};
	$.ajax({
		type : "GET",
		url : "IntegrationServiceServlet/command/general/get-dataset-metadata?"+
		$.param({
		    datasetName:"",
		    metadataCategory:"generalMetadata"
		}),
		success : function(metadata) {
			var datasetNames = [];
			for(var i = 0; i < metadata.length; i++){
				datasetNames.push(metadata[i]["name"]);
				self.datasetGeneralMetadata[metadata[i]["name"]] = metadata[i];
				
			}
			console.log(JSON.stringify(self.datasetGeneralMetadata));
			
			panel.mappingTasksSection.updateHeaderOfLeftPanel(0,datasetNames.length);
			mappingsManager.currentState.completedTasks = 0;
			mappingsManager.currentState.totalTasks = datasetNames.length;
			console.log(datasetNames.toString());
			var functionsArray = [];
			var tasksNames = [];
			for(var i = 0; i < datasetNames.length;i++){
			    
			    var param = {
					inputDatasetName:datasetNames[i],
					mappingTaskName:datasetNames[i]+"-"+"map"
			    };
			    //self.getDatasetVocabulary();
			    console.log(param.mappingTaskName);
			    var task = self.createMappingTask(param);
			    tasksNames.push(task["name"]);
			    if(!$.isEmptyObject(task)){
				self.storeMappingTask(task);
				functionsArray.push(self.getDatasetVocabulary(task.name));
				panel.mappingTasksSection.addMappingTaskBoxInLeftPanel(datasetNames[i]+"-"+"map",datasetNames[i],self.taskStatus.PENDING);
				//console.log(JSON.stringify(self.mappingTaskInfoMap));
			    };
			}
			
			$.when.apply($, functionsArray).done(function() {
			    
			    for(var i = 0; i < tasksNames.length;i++){
				console.log("tasks names array > "+ tasksNames);
				
				 console.log(tasksNames[i]);
				 task = self.loadMappingTask(tasksNames[i]);
				 console.log("dataset > "+task.datasetName);
				 //console.log(JSON.stringify(arguments[i][0]));
				 //tasks[i].sourceVocabulary = arguments[i][0];
				 
				    
				     console.log(JSON.stringify(task.sourceVocabulary));
				     var hasRDFSource = self.datasetGeneralMetadata[task.datasetName]["hasRDFSource"];
				     var menuFormat = panel.mappingTasksSection.editor.menuFormat.GENERAL_FORMAT;
				     if(!hasRDFSource){
					menuFormat = panel.mappingTasksSection.editor.menuFormat.PREDEFINED_MAPPINGS_FORMAT;
				     }
				     panel.mappingTasksSection.displayEditor(task.sourceVocabulary,task.name,menuFormat);
				 
				 
			    }
			    console.log("finish!!");
			    console.log(JSON.stringify(self.mappingTaskInfoMap));
			    //console.log("loading task > "+tasks[i-1].name);
			   
			});
			
			//ui.mapFileConfigBox.init(datasetNames);
		}, 
	   	dataType:'json'
	});	
};

mappingsManager.getUndefinedNamespaces = function(){
    
    	var self = this;
	$.ajax({
		type : "GET",
		url : "IntegrationServiceServlet/command/schema-mapping/get-undefined-namespaces",		      
		success : function(undefinedPrefixesArray) {
		    	if(undefinedPrefixesArray.length > 0){
		    	    panel.mappingTasksSection.displayUndefinedPrefixesWidget(undefinedPrefixesArray);
		    	    self.hasUndefinedNamespaces = true;
		    	}
		}, 
	   	dataType:'json'
	});
};



mappingsManager.getDatasetVocabulary = function(taskName){
	
    	var self = mappingsManager;
    	var task = self.mappingTaskInfoMap[taskName];
	return $.ajax({
		type : "GET",
		url : "IntegrationServiceServlet/command/schema-mapping/get-dataset-vocabulary?"+
		      $.param({datasetName:task.datasetName,mappingTaskName:task.name}),
		success : function(vocabulary) {
		     	console.log(JSON.stringify(vocabulary));
		     	task.sourceVocabulary = vocabulary;
		     	self.storeMappingTask(task);
		    	//return vocabulary;
		    	/*self.mappingTaskInfoMap[task.name].sourceVocabulary = vocabulary;
		    	console.log("adding vocabulary > "+ JSON.stringify(vocabulary) + " to > " +task.name);
		    	var hasRDFSource = self.datasetGeneralMetadata[self.currentState.inputDatasetName]["hasRDFSource"];
		    	var menuFormat = panel.mappingTasksSection.editor.menuFormat.GENERAL_FORMAT;
		    	if(!hasRDFSource){
		    	    menuFormat = panel.mappingTasksSection.editor.menuFormat.PREDEFINED_MAPPINGS_FORMAT;
		    	}
		    	return vocabulary;*/
			//panel.mappingTasksSection.displayEditor(vocabulary,self.currentState.mappingFileName,menuFormat);
		}, 
	   	dataType:'json'
	});
};

mappingsManager.getImportedVocabularies = function(successCallbackFunction){

	$.ajax({
		type : "GET",
		url : "IntegrationServiceServlet/command/schema-mapping/get-external-vocabularies",
		success : function(importedVocabularies) {
		    successCallbackFunction(importedVocabularies);
		}, 
	   	dataType:'json'
	});
};


mappingsManager.getPrefixes = function(successCallBackFunction){
    	
    	
    	$.ajax({
    	    type : "GET",
    	    url : "IntegrationServiceServlet/command/general/get-prefixes",
    	    success : function(prefixes) {
    		successCallBackFunction(prefixes);
    	    }, 
    	    dataType:'json'
    	});
};

mappingsManager.addPrefixes = function(prefixesArray){
	
	
	$.ajax({
	    type : "POST",
	    url : "IntegrationServiceServlet/command/general/add-prefixes?"+
	    $.param({
		prefixes:JSON.stringify(prefixesArray)
	    }),
	    success : function(response) {
		console.log(JSON.stringify(response));
		//alert("Successfull!!");
	    }, 
	    error:function(response){
		console.log(JSON.stringify(response));
		//alert('error!');
	    },
	    dataType:'json'
	});
};


mappingsManager.addVocabulary = function(inputParameters){
	
    if(inputParameters.action == 'upload'){
	uploadVocabulary(inputParameters);
    }else{
	downloadVocabulary(inputParameters);
    }
    console.log(JSON.stringify(inputParameters));
    return;
    
    function uploadVocabulary(inputParameters){
	if (window.FormData) {

		var formData = new FormData();
		formData.append('file', inputParameters.file);
		var xhr = new XMLHttpRequest();

		xhr.open('POST', "IntegrationServiceServlet/command/schema-mapping/add-external-vocabulary?" + 
			$.param({
			    vocabularyName:inputParameters.vocabularyName,
			    action:inputParameters.action,
			    prefix:inputParameters.vocabularyPrefix,
			    vocabularyNs:inputParameters.vocabularyNs
			}), true);
		xhr.send(formData);
		xhr.onreadystatechange = function(){
			if (xhr.readyState == 4 && xhr.status == 200){
				var vocabulary = jQuery.parseJSON(xhr.responseText);
				panel.mappingTasksSection.editor.addImportedVocabulary(vocabulary);
				ui.importVocabularyBox.closeLoadingMessage();
			}
			if(xhr.readyState == 4 && xhr.status == 500){
			    alert('Vocabulary has not been imported!');
			    ui.importVocabularyBox.closeLoadingMessage();
			}
			return;
		};
	}
    }


    
    function downloadVocabulary(inputParameters){
	$.ajax({
		type : "POST",
		url : "IntegrationServiceServlet/command/schema-mapping/add-vocabulary?"+
		      $.param({
			  vocabularyName:inputParameters.vocabularyName, 
			  vocabularyURL:inputParameters.vocabularyURL,
			  action:inputParameters.action,
			  prefix:inputParameters.vocabularyPrefix,
			  vocabularyNs:inputParameters.vocabularyNs
		      }),
		success : function(vocabulary) {
		    	console.log("target voc = "+JSON.stringify(vocabulary));
		    	if(typeof vocabulary['terms'] === 'undefined'){
		    	    alert('the vocabulary has not been imported!');
		    	    ui.importVocabularyBox.closeLoadingMessage();
		    	    return;
		    	}
		    	panel.mappingTasksSection.editor.addImportedVocabulary(vocabulary);
		    	ui.importVocabularyBox.closeLoadingMessage();
		}, 
	   	dataType:'json',
	   	error:function(){
	   	    alert('the vocabulary has not been imported!');
	   	    ui.importVocabularyBox.closeLoadingMessage();
	   	}
	});
    }

};



mappingsManager.submitMappings = function(taskName,mappingpairs){	
	
    var self = this;
    var mappingsInfo = {
	propertyMappings:mappingpairs,
    };
    console.log(mappingsInfo.datasetName);
    console.log(mappingsInfo.mappingFileName);

    var task = self.loadMappingTask(taskName);//self.currentState.mappingFileName;
    var taskName = task.name;
    var dataset = task.datasetName;
    $.ajax({
    	    type : "POST",
    	    url : "IntegrationServiceServlet/command/schema-mapping/start-mapping-task?"
		  +$.param({
		      mappingTaskName:taskName,
		      datasetName:dataset,
		      /*mappings:JSON.stringify(mappingsInfo)*/
		      }),
	data : {mappings:JSON.stringify(mappingsInfo)},
	success : function(response) {
		
	    	if(typeof response.message !== 'undefined'){
	    	    var message = response.message;
	    	    var pair = response.pair;
	    	    var wrong_pattern = response["wrong_pattern"];
	    	    panel.mappingTasksSection.editor.displayMappingPairError(message,pair,wrong_pattern);
	    	}else{
	    	    var mappingTaskInfo = {
			    results:response,
	    	    };
	    	    $.extend(self.mappingTaskInfoMap[taskName],mappingTaskInfo);
	    	    panel.mappingTasksSection.editor.displayResults(response.mappings);
	    	    self.mappingTaskInfoMap[taskName].status = self.taskStatus.APPLIED;
	    	}
	}, 
   	dataType:'json',
   	error:function(response){
   	    console.log(JSON.stringify(response));
   	    if(typeof response.message!=='undefined'){
   		 var message = response.message;
	    	 var pair = response.pair;
	    	 panel.mappingTasksSection.editor.displayMappingPairError(message,pair);
	    	 return;
   	    }
   	    if(response.status == 500 && response["statusText"] == "Internal Server Error"){
   		alert('an error occured!!');
   		panel.mappingTasksSection.editor.displayGeneralError();
   		return;
   	    }
   	}
    });
		
};




mappingsManager.saveMappingTask = function(taskName){
    var self = this;	
    //var taskName =  self.currentState.mappingFileName;
    if(self.mappingTaskInfoMap[taskName].status != self.taskStatus.APPLIED){
	alert('You have not applied mappings for this task yet!');
	return;
    }
    $.ajax({
	type : "POST",
	url : "IntegrationServiceServlet/command/schema-mapping/save-mapping-task?"
		  +$.param({mappingTaskName:taskName}),
	success : function(answerData) {
	    	answerData.datasetName = self.currentState.inputDatasetName;
		var mappingTaskInfo = {
			    status:self.taskStatus.COMPLETED
		};
		$.extend(self.mappingTaskInfoMap[taskName],mappingTaskInfo);
		self.currentState.completedTasks++;
		//self.propertyMappingPairs = [];
		
		panel.mappingTasksSection.updateStatusOfMappingTaskBoxInLeftPanel(taskName,self.taskStatus.COMPLETED);
		//panel.mappingTasksSection.updateHeaderOfLeftPanel(self.currentState.completedTasks,self.currentState.totalTasks);
		panel.mappingTasksSection.editor.disableSave();
		panel.mappingTasksSection.editor.disableEditing();
	}, 
   	dataType:'json'
    });

}; 

mappingsManager.getResultsForMappingTask = function(taskName){
    if(typeof this.mappingTaskInfoMap[taskName].results === 'undefined'){
	return {};
    }
    return this.mappingTaskInfoMap[taskName].results;
};

mappingsManager.isCompletedTask = function(taskName){
    if(this.mappingTaskInfoMap[taskName].status == this.taskStatus.COMPLETED) return true;
    else return false;
};






/*mappingsManager.queryForPattern = function(mapping_id,pattern_id){
	
	var pair = this.findPair(mapping_id, this.propertyMappingPairs);
	var sourcePattern = pair.getSourcePattern(pattern_id);
	if (sourcePattern == ""){
		alert('pattern not found!');
		return;
	}
	$.ajax({
		type : "GET",
		url : "IntegrationServiceServlet/command/schema-mapping/query-dataset?"
			  +$.param({pattern:sourcePattern,limit:20}),
		success : function(answerData) {
			//console.log(JSON.stringify(answerData));
			console.log(answerData.length);
			panel.mappingsArea.addDataToGrid(answerData);
		}, 
	   	dataType:'json'
	});
	
};*/






