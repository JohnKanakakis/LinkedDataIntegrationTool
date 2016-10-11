var panel = panel || {};

panel.taskConfigurationBox = {
		div:{},
		formContainer:{},
		sourceVariables:[],
		targetVariables:[],
		datasetNames:[],
		processButtonEnabled:false,
		customMenuFile:'scripts/linking-data/menus/custom-linking-task-form.html',
		suggestedLinkingTaskLayoutFile:'scripts/linking-data/menus/suggested-linking-task-layout.html'
};

panel.taskConfigurationBox.clear = function(){
	this.sourceVariables = [];
	this.targetVariables = [];
	this.formContainer.find("input[type=text]").val("");
	this.formContainer.find("td#source-var").hide();
	this.formContainer.find("td#target-var").hide();
};

panel.taskConfigurationBox.open = function(currentLinkingTaskConfiguration){
	
    this.clear();
    this.fill(currentLinkingTaskConfiguration);
    this.div.show();
};
		
panel.taskConfigurationBox.close = function(){
		
    this.div.fadeOut("fast");
};


panel.taskConfigurationBox.fill = function(currentLinkingTaskConfiguration){
   
    var self = this;
    var form = self.div.find("form#task-config-form");
    var config = currentLinkingTaskConfiguration;
    
    form.find('input[type=text]#link-task-name').val(config['taskName']);
    form.find('input[type=text]#source-dataset-name').val(config['sourceDatasetName']);
    form.find('input[type=text]#target-dataset-name').val(config['targetDatasetName']);
    form.find('input[type=text]#config-source-restrict-to').val(config['sourceRestrictTo']);
    form.find('input[type=text]#config-target-restrict-to').val(config['targetRestrictTo']);
    form.find('input[type=text]#accept-min-confidence').val(config['acceptMinConf']);
    form.find('input[type=text]#accept-max-confidence').val(config['acceptMaxConf']);
    form.find('input[type=text]#verify-min-confidence').val(config['verifyMinConf']);
    form.find('input[type=text]#verify-max-confidence').val(config['verifyMaxConf']);
    form.find('input[type=text]#filter-limit').val(config['limit']);
};

/*panel.taskConfigurationBox.showCustomLinkingTaskForm = function(){
    	
    	var self = this;
  
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
		$(selectFiles[index]).selectbox();
	    }
	});
};*/



panel.taskConfigurationBox.configureLinkingParameters = function(form){
	
    	var taskName = form.find('input[type=text]#link-task-name').val();
    	var sourceRestrictTo = form.find('input[type=text]#config-source-restrict-to').val();
    	var targetRestrictTo = form.find('input[type=text]#config-target-restrict-to').val();
    	var acceptMinConf = form.find('input[type=text]#accept-min-confidence').val();
    	var acceptMaxConf = form.find('input[type=text]#accept-max-confidence').val();
    	var verifyMinConf = form.find('input[type=text]#verify-min-confidence').val();
    	var verifyMaxConf = form.find('input[type=text]#verify-max-confidence').val();
    	var limit = form.find('input[type=text]#filter-limit').val();
    	var sourceVarValue = form.find('#source-vars-select option:selected').text();
	var targetVarValue = form.find('#target-vars-select option:selected').text();
	
    	if(sourceVarValue == ""){
		sourceVarValue = this.sourceVariables[0];
		console.log(sourceVarValue);
	}
	
	console.log(targetVarValue);
	if(targetVarValue == ""){
		targetVarValue = this.targetVariables[0];
		console.log(targetVarValue);
	}

	input_form_parameters = {
		taskName: taskName,
		sourceRestrictTo:sourceRestrictTo,
		targetRestrictTo:targetRestrictTo,
		sourceVar:sourceVarValue,
		targetVar:targetVarValue,
		limit:limit,
		acceptMinConf:acceptMinConf,
		acceptMaxConf:acceptMaxConf,
		verifyMinConf:verifyMinConf,
		verifyMaxConf:verifyMaxConf
	};
	editorManager.updateConfigurationParameters(input_form_parameters);
	
	this.close();
	this.processButtonEnabled = false;
	
};


/*panel.taskConfigurationBox.suggestedLinkingTaskValidation = function(form){
    
    	var selectedRadio = form.find('input[type=radio].suggested-linking-task:checked');
    	var value = selectedRadio.attr('value');
    	console.log(value);
    	var div = selectedRadio.parent().siblings('td').find('div.linking-task-info-div-container');
    	var compareFunction = div.find('select.compare-functions-select option:selected').attr('value');
    	console.log(compareFunction);
    	var linkTaskNumber = value.substring('linking-task-'.length);
    	var taskName = div.find('input[type=text].link-task-name').val();
    	console.log('task name = '+taskName);
    	if(editorManager.taskNameExists(taskName)){
	    	alert("Task name already exists.Choose a different one.");
	    	return;
	}
    	var inputParameters = {
    		suggestedLinkingTaskNumber:linkTaskNumber,
    		taskName:taskName,
    		compareFunction:compareFunction
    	};
    	editorManager.addPredefinedConfigurationParameters(inputParameters);
};*/


panel.taskConfigurationBox.init = function(){
	
	var config_box_window = $('#linking-task-config-window');
	var self = this;
	config_box_window.load('scripts/linking-data/menus/task-configuration-menu.html',function(){
		
	    	self.div = config_box_window.find("#linking-task-confing-box");
		self.formContainer = self.div.find('.form-container');
		
		self.div.on("click", ".close-icon", function(event){ 
	
			event.preventDefault();
			panel.taskConfigurationBox.close(event);
		});
		self.div.on("click", ".config-box-close-button", function(event){ 

			event.preventDefault();
			panel.taskConfigurationBox.close(event);
		});
		
		self.div.on("click", "button#config-box-ok-button", function(event){ 
			event.preventDefault();
			var form = self.formContainer.find('form');
			self.configureLinkingParameters(form);
		});
		
		self.div.on("change", "#config-source-restrict-to,#config-target-restrict-to", function(event){ 
			event.preventDefault();
			panel.taskConfigurationBox.displayLoadingMessage(event);
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
		    handle: ".window-box-header",
		});
		
		var bheight = 400;
	    	var bwidth = 800;
	    	var mainTabs = $('#main-tabs');
	    	self.div.css({
		    'top' : (mainTabs.height() - bheight) / 2,
		    'left' : (mainTabs.width() - bwidth) / 2,
		    'height' : bheight,
		    'width' : bwidth,
		});
	    	
	    	var sliderOptions = {
	    		max: 1,
	    		min:0,
	    		range:true,
	    		step:0.01,
	    		values: [0,1],
	    		/*change: function( event, ui ) {
	    		    console.log(ui.value);
	    		},*/
	    		start:function(event,ui){
	    		    self.updateConfidenceValues(event,ui.values);
	    		},
	    		stop: function( event, ui ) {
	    		    self.updateConfidenceValues(event,ui.values);
	    		}
	    	};
	    	sliderOptions.values = [0.1,0.4];
	    	self.div.find('#verify-slider.confidence-slider')
	    		.slider(sliderOptions);
	    	sliderOptions.values = [0.5,0.9];
	    	self.div.find('#accept-slider.confidence-slider')
    			.slider(sliderOptions);
	    	self.div.hide();	
	});
};


panel.taskConfigurationBox.updateConfidenceValues = function(event,values){
    
    	var min = values[0];
    	var max = values[1];
    	console.log("slide min " + min);
	    console.log("slide max " +max);
    	var table = $(event.target).siblings('table.confidence-table');
    	console.log(table.length);
    	table.find('input[type=text].min-conf').val(min);
    	table.find('input[type=text].max-conf').val(max);
};


panel.taskConfigurationBox.displayVariableInfoToUser = function(variablesArray){
	
    	var self = panel.taskConfigurationBox;
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
		
		var sbHolderDiv = select.siblings('.sbHolder')
					.css({
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


panel.taskConfigurationBox.displayLoadingMessage = function(event){
	
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

panel.taskConfigurationBox.enable = function(){
	this.processButtonEnabled = true;
	
};

