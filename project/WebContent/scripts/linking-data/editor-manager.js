var editorManager = {};

editorManager.initCounter = 0;
editorManager.taskNameEditorDataMap = {};


editorManager.configParameters = {
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
};
editorManager.currentLinkingTask = {};


editorManager.JSONNodesArray = [];
editorManager.UIInputNodesArray = [];
editorManager.UITransformationNodesArray = [];
editorManager.UIComparisonNodesArray = [];
editorManager.UIAggregationNodesArray = [];

editorManager.functions = {};

editorManager.functionNameMap = {};


editorManager.taskStatus = {
	COMPLETED:'completed',
	PENDING:'pending',
	SAVED:'saved'
};

editorManager.getCurrentTaskName = function(){
    var self = this;
    return self.currentLinkingTask.name;
};

editorManager.getNumberOfUncompletedTasks = function(){
    var self = this;
    var count = 0;
    for(var key in self.taskNameEditorDataMap){
	if(self.taskNameEditorDataMap[key].status != self.taskStatus.COMPLETED){
	    count++;
	}
    }
    return count;
};

editorManager.isCorrectName = function(name){
    var self = this;
    return (self.currentLinkingTask.name == name);
};

editorManager.checkStatus = function(taskName,status){
    var self = this;
    if(!self.isCorrectName(taskName)){
	    return false;
    }
    return (self.taskNameEditorDataMap[taskName].status == status);
};

editorManager.isPendingTask = function(taskName){
	var self = this;
	return (self.checkStatus(taskName,self.taskStatus.PENDING));
};

editorManager.isSavedTask = function(taskName){
	var self = this;
	return (self.checkStatus(taskName,self.taskStatus.SAVED));
};

editorManager.isCompletedTask = function(taskName){
    	var self = this;
    	return (self.checkStatus(taskName,self.taskStatus.COMPLETED));
};

editorManager.taskNameExists = function(taskName){
	var self = this;
	if(typeof self.taskNameEditorDataMap[taskName] !== 'undefined') return true;
	else return false;
};


editorManager.setTaskStatus = function(taskName,status){
    	var self = this;
    	if(!self.isCorrectName(taskName)){
    	    return false;
    	}else{
    	    self.currentLinkingTask.status = status;
    	    self.taskNameEditorDataMap[taskName].status = status;
    	    return true;
    	}
};

editorManager.getTaskConfiguration = function(taskName){
    	var self = this;
    	if(!self.isCorrectName(taskName)){
    	    return {};
    	}else{
    	    return self.currentLinkingTask.configuration;
    	}
	/*console.log("current link task config "+JSON.stringify(self.currentLinkingTask.configuration));
	return this.currentLinkingTask.configuration;*/
};

editorManager.createTask = function(inputParameters){
    
	var self = this;
	var taskName = inputParameters.taskName;
	
	console.log("ABOUT TO CREATE TASK WITH NAME > "+taskName);
	if(typeof self.currentLinkingTask.name === 'undefined'){
	    console.log("CURRENT TASK NAME > "+"INITIAL CASE NAME");
	}else{
	    console.log("CURRENT TASK NAME > "+self.currentLinkingTask.name);
	}
	
	if(typeof self.currentLinkingTask.name === 'undefined'){
		console.log("INITIAL CASE !THIS MESSAGE MUST APPEAR ONLY ONCE!");
		self.currentLinkingTask.name = taskName;
		self.initCounter++;
	}
	
	//save current task first;
	if(self.initCounter == 1 && self.currentLinkingTask.name!="" && taskName!="" && typeof taskName !=='undefined'){
	    if(self.saveTask(self.currentLinkingTask.name)){
		self.clear();
	    }else{
		return false;
	    }
	}

	var task = {};
	
	var configuration = $.extend({}, self.configParameters, inputParameters);
	console.log("CONFIGURATION IS > "+JSON.stringify(configuration));
	task.status = self.taskStatus.PENDING;
	task.linkSpecification = {};
	task.configuration = configuration;
	task.editorData = {};
	task.name = taskName;
	self.taskNameEditorDataMap[taskName] = task;
	
	//CHECK THIS
	self.currentLinkingTask = task;
	
	/*console.log("manager tasks after are "+JSON.stringify(self.linkingTaskInfoMap));
	console.log("current task is "+JSON.stringify(self.currentLinkingTask));*/
	
	return true;
	
};

/*editorManager.createLinkSpecification = function(taskName){
    var self = this;
    
    console.log("ABOUT TO CREATE SPEC WITH NAME > "+taskName);
    console.log("CURRENT TASK NAME > "+self.currentTaskName);
    if(self.currentTaskName == ""){
	console.log("INITIAL CASE !THIS MESSAGE MUST APPEAR ONLY ONE!");
	self.currentTaskName = taskName;
	self.initCounter++;
    }
    //save current task first;
    if(self.initCounter == 1 && self.currentTaskName!="" && taskName!="" && typeof taskName !=='undefined'){
	if(self.saveLinkSpecification(self.currentTaskName)){
	    self.clear();
	    self.currentTaskName = taskName;
	    return true;
	}
    }
    return false;

};*/

editorManager.saveCurrentTask = function(){
    	var self = this;
    	var taskName = self.currentLinkingTask.name;
    	return self.saveTask(taskName);
};

editorManager.saveTask = function(taskName){
    	var self = this;
    	var saved = false;
    	
    	console.log("ABOUT TO SAVE TASK > "+taskName);
    	if(taskName != self.currentLinkingTask.name){
    	    console.log('input taskName > '+taskName +" NO MATCH WITH CACHE CURRENT NAME > "+self.currentLinkingTask.name);
    	    return false;
    	}
    	if(typeof taskName !== 'undefined' && taskName!=""){
    	    var editorTaskData = {
    		JSONNodesArray:self.JSONNodesArray,
    		UIInputNodesArray:self.UIInputNodesArray,
    		UITransformationNodesArray:self.UITransformationNodesArray,
    		UIComparisonNodesArray:self.UIComparisonNodesArray,
    		UIAggregationNodesArray:self.UIAggregationNodesArray
    	    };
    	    self.taskNameEditorDataMap[taskName] = self.currentLinkingTask;
    	    self.taskNameEditorDataMap[taskName].editorData = editorTaskData;
    	    console.log("SAVE EDITOR DATA FOR TASK "+ taskName +" > "+JSON.stringify(editorTaskData));
    	    
    	    saved = true;
    	}else{
    	    console.log('error in editor save!');
    	    saved = false;
    	}
    	console.log("EDITOR MAP AFTER SAVE > "+JSON.stringify(self.taskNameEditorDataMap));
    	return saved;
};

editorManager.loadTask = function(taskName){
	
    	var self = this;
    	var editorTaskData;
    	
    	//first save current task!
    	self.saveTask(self.currentLinkingTask.name);
    	
    	
    	if(typeof taskName === 'undefined'){
    	    return false;
    	}
    	
    	editorTaskData = self.taskNameEditorDataMap[taskName].editorData;
	if(typeof editorTaskData === 'undefined') {
	    return false;
	}
	self.currentLinkingTask = self.taskNameEditorDataMap[taskName];
	self.JSONNodesArray = editorTaskData.JSONNodesArray;
	self.UIInputNodesArray = editorTaskData.UIInputNodesArray;
	self.UITransformationNodesArray = editorTaskData.UITransformationNodesArray;
	self.UIComparisonNodesArray = editorTaskData.UIComparisonNodesArray;
	self.UIAggregationNodesArray = editorTaskData.UIAggregationNodesArray;
	console.log("LOAD EDITOR DATA FOR TASK "+ taskName +" > "+JSON.stringify(editorTaskData));
	return true;
};

editorManager.clear = function(){
    
    	var self = this;
    	self.JSONNodesArray = [];
    	self.UIInputNodesArray = [];
    	self.UITransformationNodesArray = [];
    	self.UIComparisonNodesArray = [];
    	self.UIAggregationNodesArray = [];
    	self.currentLinkingTask = {};
    	
    	console.log("CACHE CLEARED!");
};


editorManager.updateConfigurationParameters = function(parameters){
	
	var self = this;
	var currentTask = self.currentLinkingTask;
	var previousSourceRestrictTo = currentTask.configuration.sourceRestrictTo;
	var previousTargetRestrictTo = currentTask.configuration.targetRestrictTo;
	
	if(!self.isCorrectName(parameters.taskName)){
	    alert('Not correct taskName!');
	    return ;
	}
	
	console.log("configuration parameters before update = "+ JSON.stringify(currentTask.configuration));
	for(var key in parameters){
	    if(typeof parameters[key] !== 'undefined'){
		currentTask.configuration[key] = parameters[key];
	    }
	}
	if(previousSourceRestrictTo != currentTask.configuration.sourceRestrictTo || 
	   previousTargetRestrictTo != currentTask.configuration.targetRestrictTo){
	    	linkingManager.getPathsInfo(currentTask.configuration);
	}
	self.taskNameEditorDataMap[parameters.taskName].configuration = currentTask.configuration;
	console.log("current task configuration after update = "+ JSON.stringify(currentTask.configuration));
};

editorManager.setAcceptOutput = function(taskName,confidence,value){
    	var self = this;
    	if(!self.isCorrectName(taskName)){
    	    alert('error in taskName');
    	    return false;
    	}
    	
    	var task = self.currentLinkingTask;
	if(confidence == "min"){
		task.configuration.acceptMinConf = value;
	}else if(confidence == "max"){
	    	task.configuration.acceptMaxConf = value;
	}else{
		alert('wrong parameters!');
		return false;
	}
	return true;
};

editorManager.setVerifyOutput = function(taskName,confidence,value){
    	
    	var self = this;
	if(!self.isCorrectName(taskName)){
	    alert('error in taskName');
	    return false;
	}
	
	var task = self.currentLinkingTask;
	if(confidence == "min"){
		task.configuration.verifyMinConf = value;
	}else if(confidence == "max"){
	    	task.configuration.verifyMaxConf = value;
	}else{
		alert('wrong parameters!');
		return false;
	}
	return true;
};








editorManager.setFunctions = function(functions){
    var self = this;
    self.functions = functions;
    
    var transformationFunctions = functions['transformation'];
    var comparisonFunctions = functions['comparison'];
    var aggregationFunction = functions['aggregation'];
    
    self.submitToFunctionNameMap(transformationFunctions);
    self.submitToFunctionNameMap(comparisonFunctions);
    self.submitToFunctionNameMap(aggregationFunction);
    
    console.log("editor manager set functions > "+JSON.stringify(functions));
};

editorManager.submitToFunctionNameMap = function(functionsArray){
    
    var self = this;
    var function_o;
    for(var i = 0; i < functionsArray.length;i++){
	function_o = functionsArray[i];
	function_o["index"] = i;
	self.functionNameMap[function_o["elName"]] = function_o;
    }
    //console.log(JSON.stringify(self.functionNameMap));
};

editorManager.getFunction = function(functionName){
    var self = this;
    console.log(JSON.stringify(self.functionNameMap[functionName]));
    return self.functionNameMap[functionName];
};


editorManager.getInputTerm = function(id){
	var pos = 'voc-'.length;
	var index = id.substring(pos,id.length);
	return this.vocabulary[index];
};

editorManager.getInput = function(){
	return {
		params:[{
			name:"path"
		}],
		elName:"input"
	};
};

editorManager.getTransformationFunction = function(id,name){
	
    var self = this;
    
    if(id != "") return oldMethod(id);
    
    if(name != "") return newMethod(name);
    
    
    
    function newMethod(functionName){
	console.log('TRANSFORMATION NEW METHOD > '+JSON.stringify(self.functionNameMap[functionName]));
	return self.functionNameMap[functionName];
    }
    
    function oldMethod(id){
	var pos = 'fun-'.length;
	var index = id.substring(pos,id.length);
	return self.functions["transformation"][index];
    }
    	
	
};

editorManager.getComparisonFunctions = function(){

    var compFunctions = [];
    for(var i = 0; i < this.functions["comparison"].length;i++){
	console.log(this.getComparisonFunction('fun-'+i));
	compFunctions.push(this.getComparisonFunction('fun-'+i));
    }
    return compFunctions;
};


editorManager.getComparisonFunction = function(id,name){

    var self = this;
    if(id != "") return oldMethod(id);
    
    if(name != "") return newMethod(name);
    
    
    
    function newMethod(functionName){
	console.log('COMPARISON NEW METHOD > '+JSON.stringify(self.functionNameMap[functionName]));
	return self.functionNameMap[functionName];
    }
    
    function oldMethod(id){
	var pos = 'fun-'.length;
	var index = id.substring(pos,id.length);
	return self.functions["comparison"][index];
    }
    
    
	/*var pos;
	var index;
	pos = 'fun-'.length;
	index = id.substring(pos,id.length);
	return this.functions["comparison"][index];*/
};

editorManager.getAggregationFunction = function(id,name){
    
    var self = this;
    
    if(id != "") return oldMethod(id);
    
    if(name !="") return newMethod(name);
    
    function newMethod(functionName){
	console.log('AGGREGATION NEW METHOD > '+JSON.stringify(self.functionNameMap[functionName]));
	return self.functionNameMap[functionName];
    }
    
    function oldMethod(id){
	var pos = 'fun-'.length;
	var index = id.substring(pos,id.length);
	return self.functions["aggregation"][index];
    }
	
};



editorManager.addNode = function(info){
	
	var jsonNode = {
			id:info.id,
			//elemId:"",//info.elemId,
			elType:info.elType,
			elName:info.elName,
			input:[]
	};
	this.JSONNodesArray.push(jsonNode);
	editorManager.addUINode(info);
	console.log(JSON.stringify(this.JSONNodesArray));
};

editorManager.merge = function(parentId,childId){
	
	var child = this.findNode(childId);//we should always find a child in root nodes
	var parent = this.findNode(parentId);//we should always find the parent
	
	if (!(parent.found) || !(child.found)){
		alert('error in merge!!!');
		return;
	}
	parent.node.input.push(child.node);
	if(child.needSplice){
		this.JSONNodesArray.splice(child.pos, 1);
	}
	console.log(JSON.stringify(this.JSONNodesArray));
};

editorManager.findNode = function(id){
	
	var internalSearchResult = {
			node:{},
			found:false
	};
	var result = {};
	for(var i = 0; i < this.JSONNodesArray.length;i++){
		var root = this.JSONNodesArray[i];
		console.log('root id = '+root.id);
		internalSearchResult = this.find(root,id);
		if (internalSearchResult.found){
			result.node = internalSearchResult.node;
			result.found = true;
			if(internalSearchResult.node.id == root.id){//new element in array,need splice
				result.needSplice = true;
				result.pos = i;
				console.log('found in root');
			}else{//inner parent
				result.needSplice = false;
			}
			return result;
		}
	}
	return internalSearchResult;
};



editorManager.find = function(node,id){
	
	var result = {
			node:{},
			found:false
	};
	if(node.id == id){
		result.node = node;
		result.found = true;
		return result;
	}else{
		for(var i = 0;i < node.input.length;i++){
			result = this.find(node.input[i],id);
			if (result.found){
				break;
			}
		}
		return result;
	}
};

editorManager.deleteNode = function(id,elType){
	
	var internalSearchResult = {
		array:[],
		found:false
	};
	for(var i = 0;i < this.JSONNodesArray.length;i++){
		var root = this.JSONNodesArray[i];
		internalSearchResult = this.findToDelete(root,id);
		if(internalSearchResult.found){
			break;
		}
	}
	if(internalSearchResult.found){
		if(internalSearchResult.needRemove){
			this.JSONNodesArray.splice(i,1);
		}
		for(var i = 0; i < internalSearchResult.array.length;i++){
			this.JSONNodesArray.push(internalSearchResult.array[i]);
		}
	}else{
		alert('error in delete');
		return false;
	}
	editorManager.deleteUINode(id,elType);
	console.log(JSON.stringify(this.JSONNodesArray));
	return true;
};

editorManager.findToDelete = function(node,id){
	
	var result = {
			array:[],
			found:false,
			needRemove:false
	};
	if(node.id == id){
		result.array = node.input;
		result.found = true;
		result.needRemove = true;
		return result;
	}else{
		for(var i = 0;i < node.input.length;i++){
			result = this.findToDelete(node.input[i],id);
			if (result.found){
				break;
			}
		}
		if(result.found && result.needRemove){
			node.input.splice(i,1);
			result.needRemove = false;
		}
		return result;
	}
};



editorManager.treeHasMultipleRoots = function(){
	
	if(this.JSONNodesArray.length > 1){
		return true;
	}
	return false;
};


editorManager.constructLinkSpecificationTree = function(taskName){
	var self = this;
	
    	//if(self.loadLinkSpecification(taskName)){
    	    if(self.JSONNodesArray.length == 0){
		alert('No link specification exists!');
		return {};
    	    }
    	    if(self.treeHasMultipleRoots()){
		alert('Specification has multiple roots!');
		return {};
    	    }else{
    		var root = self.JSONNodesArray[0];
    		var linkSpec= editorManager.traverseTree(root);
    		console.log(JSON.stringify(linkSpec));
    		return linkSpec;
    	    }
    	/*}else{
    	    alert('error in load!!!Link spesification was not created!');
    	    return {};
    	}*/
    
	
};



editorManager.traverseTree = function(node){
	
	var newNode = {};
	var array = editorManager.getArray(node.elType);
	var pos = editorManager.findUINode(array, node.id);
	console.log(JSON.stringify(array[pos]["elemInfo"]));
	newNode = {
		elType:node.elType,
		id:node.id,
		elName:array[pos]["elemInfo"].elName,
		params:array[pos]["elemInfo"].params,
		input:[]
	};
	for(var i = 0;i < node.input.length;i++){
		newNode.input.push(this.traverseTree(node.input[i]));
	}
	return newNode;
};

editorManager.addUINode = function(uiInfo){
	console.log("ADD UI NODE > "+JSON.stringify(uiInfo));
    	var self = this;
	var specification = {};
	var uiNode = {};
	var array = [];
	var initialValue = '';
	if(uiInfo.elType == "input"){
	    	console.log("GET INPUT BOX EDITOR MANAGER > ");
		specification = self.getInput();
		array = this.UIInputNodesArray;
		initialValue = uiInfo["elName"];
	}else if(uiInfo.elType == "transformation"){
	    	console.log("GET TRANSFORMATION BOX EDITOR MANAGER > ");
		specification = self.getTransformationFunction("",uiInfo["elName"]);
		array = this.UITransformationNodesArray;
	}else if(uiInfo.elType == "comparison"){
	    	console.log("GET COMPARISON BOX EDITOR MANAGER > ");
		specification = self.getComparisonFunction("",uiInfo["elName"]);
		array = this.UIComparisonNodesArray;
	}else if(uiInfo.elType == "aggregation"){
	   	console.log("GET AGGR BOX EDITOR MANAGER > ");
		specification = self.getAggregationFunction("",uiInfo["elName"]);
		array = this.UIAggregationNodesArray;
	}
	/*uiNode.elemId = uiInfo.elemId;*/
	uiNode.uiId = uiInfo.id;
	uiNode.elType = uiInfo.elType;
	uiNode.elemInfo = {
			elName:specification.elName,
			params:[]
	};
	var param = {};
	for(var i = 0;i < specification.params.length;i++){
		param = {
				name:specification.params[i]["name"],
				value:initialValue
		};
		uiNode.elemInfo.params.push(param);
	}
	array.push(uiNode);
	console.log('specification:'+JSON.stringify(specification));
	console.log("ui array"+JSON.stringify(array));
};

editorManager.updateUINode = function(uiInfo){
	var self = this;
	var pos = -1;
	var param = [];
	var array = [];
	var uiId = uiInfo.id;
	var paramName = uiInfo.paramName;
	array = self.getArray(uiInfo.elType);
	pos = self.findUINode(array,uiId);
	param = self.findParam(array[pos].elemInfo.params,paramName);
	param.value = uiInfo.value;
	console.log(uiInfo.elType+" array"+JSON.stringify(array));
};

editorManager.deleteUINode = function(id,elType){
	var self = this;
	var array = self.getArray(elType);
	var pos = this.findUINode(array,id);
	array.splice(pos,1);
	console.log(elType+" array"+JSON.stringify(array));
};




editorManager.findUINode = function(array,id){
	for(var i = 0; i < array.length;i++){
		if(array[i].uiId == id){
			return i;
		}
	}
	return -1;
};



editorManager.findParam = function(array,name){
	for(var i = 0; i < array.length;i++){
		if(array[i].name == name){
			return array[i];
		}
	}
	return {};
};

editorManager.getArray = function(elType){
	
    	var self = this;
    	var array = [];
	
	if(elType == "input"){
		array = self.UIInputNodesArray;
	}else if(elType == "transformation"){
		array = self.UITransformationNodesArray;
	}else if(elType == "comparison"){
		array = self.UIComparisonNodesArray;
	}else if(elType == "aggregation"){
		array = self.UIAggregationNodesArray;
	}
	return array;
};

