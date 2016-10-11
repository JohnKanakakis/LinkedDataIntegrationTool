var panel = panel || {};

panel.linkFileConfigBox = {
		div:{},
		position:{},
		formContainer:{},
		sourceVariables:[],
		targetVariables:[],
		datasetNames:[],
		processButtonEnabled:false,
		customMenuFile:'scripts/linking-data/menus/custom-linking-task-form.html',
		suggestedLinkingTaskLayoutFile:'scripts/linking-data/menus/suggested-linking-task-layout.html',
		displayMenu:false
};

panel.linkFileConfigBox.clearCustomMenu = function(){
    	this.sourceVariables = [];
    	this.targetVariables = [];
    	this.formContainer.find("input[type=text]").val("");
};

panel.linkFileConfigBox.open = function(event){
	
    	var self = this;
    
	event.preventDefault();
	self.div.show();
	self.div.css(self.position);
};
		
panel.linkFileConfigBox.close = function(){
		
	this.div.fadeOut("fast");
};


panel.linkFileConfigBox.showSuggestedLinkingTasksForm = function(){
    
    	var self = this;
    	var form = $('<form>').attr('id','suggested-link-task-config-form');
    	var linkingTasksContainer = $('<div>').attr('id','suggested-linking-tasks-container');
    	var linkingTasksTable = $('<table>').attr('id','linking-tasks-table');
    	
    	self.formContainer.empty();
    	linkingTasksTable.appendTo(linkingTasksContainer);
    	linkingTasksContainer.appendTo(form);
    	form.appendTo(self.formContainer);
    	
    	var functions;
    	var suggestedLinks;
    	
    	if(self.displayMenu){
    	    functions = editorManager.getComparisonFunctions();
    	    suggestedLinks = linkingManager.getRecommendedLinkingTasks();
    	    var htmlLayoutDiv;
    	    htmlLayoutDiv = $('<div>');

    	    if(suggestedLinks.length > 0){
    		self.formContainer.removeClass('loading');
    		htmlLayoutDiv.load(self.suggestedLinkingTaskLayoutFile,function(){
    		    htmlLayout = htmlLayoutDiv.html();
    		    fillLinkingTasksTable(htmlLayout);
    		});
    		
    	    }else{
    		linkingTasksTable.hide();
    		linkingTasksContainer.html('<p>No suggested tasks.</p>');
    		self.formContainer.removeClass('loading');
    	    }   
    	}
    	return;
    	
	
	function fillLinkingTasksTable(layout){
	    
	    var tr;
	    var td1,td2;
	    var inputRadio;
	    var divContainer;
	    for ( var i = 0; i < suggestedLinks.length; i++) {
		tr = $('<tr>').appendTo(linkingTasksTable);
		td1 = $('<td>').appendTo(tr);
		inputRadio = $('<input>').attr({
		    'type' : 'radio',
		    'name' : 'suggested-linking-task',
		    'value' : 'linking-task-' + i
		}).addClass('suggested-linking-task').appendTo(td1);
		td2 = $('<td>').appendTo(tr);
		divContainer = $('<div>').addClass('linking-task-info-div-container');
		divContainer.attr('id', 'link-task-container-' + i);
		divContainer.appendTo(td2);
		divContainer.html(layout);
		var select = divContainer.find('select.compare-functions-select');
		console.log(select.length);
		var option;
		for ( var j = 0; j < functions.length; j++) {
		    option = $('<option>').text(functions[j]['elName'])
		    			  .attr('value', functions[j]['elName']);
		    option.appendTo(select);
		}
		
		var taskName = suggestedLinks[i]['sourceDatasetName']+"-to-"+suggestedLinks[i]['targetDatasetName'];//"task-" + i;
		var input = divContainer.find('input[type=text].link-task-name');
		
		input.val(taskName);
		fillLinkingTask(divContainer,suggestedLinks[i]);
	    }
	}
	
	function fillLinkingTask(divContainer,suggestedLinkInfo){
	    
	    console.log(JSON.stringify(suggestedLinkInfo));
	    divContainer.find('.source-dataset.text-container').text(suggestedLinkInfo['sourceDatasetName']);
	    //divContainer.find('.source-class.text-container').text(suggestedLinkInfo['sourceDatasetClass']);
	    divContainer.find('.source-property-path.text-container').text(suggestedLinkInfo['sourcePropertyPath']).attr('title',suggestedLinkInfo['sourcePropertyPath']);
	    divContainer.find('.target-dataset.text-container').text(suggestedLinkInfo['targetDatasetName']);
	    //divContainer.find('.target-class.text-container').text(suggestedLinkInfo['targetDatasetClass']);
	    divContainer.find('.target-property-path.text-container').text(suggestedLinkInfo['targetPropertyPath']).attr('title',suggestedLinkInfo['targetPropertyPath']);
	}

};

panel.linkFileConfigBox.showCustomLinkingTaskForm = function(){
    	
    	var self = this;
    	self.clearCustomMenu();
	self.formContainer.load(self.customMenuFile,function(){
	    customForm = self.formContainer.find('form#custom-link-task-config-form');
	    var selectFiles = customForm.find('.files-select');
	    for(var index = 0; index < selectFiles.length; index++){
		var option = null;
		var datasetNames = self.datasetNames;
		for(var i = 0; i < datasetNames.length; i++){
			option = $('<option>').attr({'value':datasetNames[i]}).text(datasetNames[i]);
			$(selectFiles[index]).append(option);
		}
		//$(selectFiles[index]).selectbox();
		$(selectFiles[index]).css({'width':'100%'});
	    }
	});
};



panel.linkFileConfigBox.customLinkingTaskValidation = function(form){
	
	var source_filename = form.find('#source-select option:selected').text();
	var target_filename = form.find('#target-select option:selected').text();
	var link_task = form.find('#link-task-name').val();
	var sourceRestrictTo = form.find('#source-restrict-to').val();
	var targetRestrictTo = form.find('#target-restrict-to').val();
	var sourceVarValue = form.find('#source-vars-select option:selected').text();
	var targetVarValue = form.find('#target-vars-select option:selected').text();
	
	console.log(sourceVarValue);
	if(sourceVarValue == ""){
		sourceVarValue = this.sourceVariables[0];
		console.log(sourceVarValue);
	}
	
	console.log(targetVarValue);
	if(targetVarValue == ""){
		targetVarValue = this.targetVariables[0];
		console.log(targetVarValue);
	}
	if (link_task == '' || source_filename == '' || target_filename == '' || targetVarValue == '' 
		|| sourceVarValue == ''){
		alert("You must provide a valid input");
	}else if(linkingManager.taskNameExists(link_task)){
	    	alert("Task name already exists.Choose a different one.");
	}
	else{
		input_form_parameters = {
				sourceDatasetName: source_filename,
				targetDatasetName: target_filename,
				taskName: link_task,
				sourceRestrictTo:sourceRestrictTo,
				targetRestrictTo:targetRestrictTo,
				sourceVar:sourceVarValue,
				targetVar:targetVarValue
		};
		console.log("source dataset name = "+source_filename);
		console.log("target dataset name = "+target_filename);
		linkingManager.createTask(input_form_parameters);
		this.processButtonEnabled = false;
	}
};


panel.linkFileConfigBox.suggestedLinkingTaskValidation = function(form){
    
    	var selectedRadio = form.find('input[type=radio].suggested-linking-task:checked');
    	var value = selectedRadio.attr('value');
    	console.log(value);
    	var div = selectedRadio.parent().siblings('td').find('div.linking-task-info-div-container');
    	var compareFunction = div.find('select.compare-functions-select option:selected').attr('value');
    	console.log(compareFunction);
    	var linkTaskNumber = value.substring('linking-task-'.length);
    	var taskName = div.find('input[type=text].link-task-name').val();
    	console.log('task name = '+taskName);
    	if(linkingManager.taskNameExists(taskName)){
	    	alert("Task name already exists.Choose a different one.");
	    	return;
	}
    	var inputParameters = {
    		suggestedLinkingTaskNumber:linkTaskNumber,
    		taskName:taskName,
    		compareFunction:compareFunction
    	};
    	linkingManager.createPredefinedTask(inputParameters);
};

panel.linkFileConfigBox.displayMenu = function(){
    var self = this;
    self.displayMenu = true;
    self.showSuggestedLinkingTasksForm();
};


panel.linkFileConfigBox.init = function(datasetNames){/*datasetNames*/
	
	var config_box_window = $('#new-linking-task-config-window');
	var self = this;
	self.datasetNames = datasetNames;
	console.log("INIT DATASET NAMES > "+self.datasetNames);
	config_box_window.load('scripts/linking-data/panel-ui/new-linking-task-config-box.html',function(){
		
	    	self.div = config_box_window.find("#new-linking-task-confing-box");
		self.formContainer = self.div.find('.form-container');
		
		self.div.on("click", ".close-icon", function(event){ 
	
			event.preventDefault();
			panel.linkFileConfigBox.close(event);
		});
		self.div.on("click", ".config-box-close-button", function(event){ 

			event.preventDefault();
			panel.linkFileConfigBox.close(event);
		});
		
		self.div.on("click", ".config-box-init-new-task-button", function(event){ 
			event.preventDefault();
			if(!this.processButtonEnabled){
			    	var form = self.formContainer.find('form');
			    	var formId = form.attr('id');
			    	if(formId == 'custom-link-task-config-form'){
			    	    self.customLinkingTaskValidation(form);
			    	}else{
			    	    self.suggestedLinkingTaskValidation(form);
			    	}	
			    	panel.linkFileConfigBox.close();
			}
		});
		
		self.div.on("change", "#source-restrict-to,#target-restrict-to", function(event){ 
			event.preventDefault();
			panel.linkFileConfigBox.displayLoadingMessage(event);
			linkingManager.checkNumberOfVariables($(this).val(),self.displayVariableInfoToUser);
		});
		
		self.div.on("change","input[type=radio].linking-task-type",function(event){
		    	event.preventDefault();
		    	console.log($(event.target).attr('value'));
		    	var activeForm = self.formContainer.find('form');
		    	activeForm.hide();
		    	var radionInputValue = $(event.target).attr('value');
		    	if(radionInputValue == "suggested-linking-task"){
		    	    
		    	    self.showSuggestedLinkingTasksForm();
		    	}else{
		    	    self.showCustomLinkingTaskForm();
		    	}	
		});
		self.div.draggable({
		    cursor:'move',
		    handle: ".new-file-config-box-header",
		});
		
		var bheight = 400;
	    	var bwidth = 800;
	    	var mainTabs = $('#main-tabs');
	    	self.position = {
	    		'top' : (mainTabs.height() - bheight) / 2,
	    		'left' : (mainTabs.width() - bwidth) / 2,
	    		'height' : bheight,
			'width' : bwidth,
	    	};
	    	self.div.css(self.position);
	    	//self.formContainer.addClass('loading');
	    	self.displayMenu();
	    	
	    	self.div.hide();	
	});
};

panel.linkFileConfigBox.displayVariableInfoToUser = function(variablesArray){
	
	var self = panel.linkFileConfigBox;
	var numberOfVariables = variablesArray.length;
	var loading_td = self.div.find(".loading-icon-td.display");
	loading_td.css({'display':'none'}).removeClass('display');
	console.log('loading td = ' + loading_td.length);
	
	var varTd = loading_td.siblings('.var-td');
	if(varTd.attr('id') == 'source-var'){
	    self.sourceVariables = variablesArray;
	}else if(varTd.attr('id') == 'target-var'){
	    self.targetVariables = variablesArray;
	}
	if (numberOfVariables != 1){	
		var select = varTd.find('.vars-select');console.log("select "+select.length);
		var option = null;
		select.empty();
		for(var i = 0; i < numberOfVariables; i++){
			option = $('<option>').attr({'value':variablesArray[i]}).text(variablesArray[i]);
			select.append(option);
		}
		
		var sbHolderDiv = select.siblings('.sbHolder').css({
														'width':'100px',
														'float': 'right',
														'margin-left':'3px'
														});
		sbHolderDiv.find('.sbSelector').css({'width':'100px'});
		varTd.fadeIn("slow");
	}else{
		//display ok icon!
	}
};


panel.linkFileConfigBox.displayLoadingMessage = function(event){
	
	var varTd = $(event.target).parent().siblings('.var-td');
	
	if(varTd.length == 1){
		varTd.css({'display':'none'});
		$(event.target).parent().siblings('.loading-icon-td')
								.css({'display':'block'})
								.addClass('display');
		
	}else{
		$(event.target).parent().siblings('.loading-icon-td')
								.css({'display':'block'})
								.addClass('display');
	}
};

panel.linkFileConfigBox.enable = function(){
	this.processButtonEnabled = true;
};

