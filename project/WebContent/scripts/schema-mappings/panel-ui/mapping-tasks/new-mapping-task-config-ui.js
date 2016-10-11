var ui = ui || {};

ui.mapFileConfigBox = {
		div:'',
		file:'scripts/schema-mappings/panel-ui/mapping-tasks/new-mapping-task-config-box.html'
};


ui.mapFileConfigBox.open = function(event){
    		
    		var selectFiles = this.div.find('#files-select');
    		//selectFiles.selectbox();
		event.preventDefault();
		if (!mappingsManager.allowToOpenNewInputDataset()){
			return;
		}
		this.div.show();
};
		
ui.mapFileConfigBox.close = function(event){
		event.preventDefault();
		var box = this.div;
		box.hide();
};


ui.mapFileConfigBox.validation = function(event){
	
	
	var form = $('#map-task-config-form');
	var selectedOption = form.find('select option:selected');
	var datasetName = selectedOption.text();
	//form.find('option').removeAttr('selected');
	var input = form.find('#map-task-name');
	var taskName = input.val();

	if (taskName == '' || datasetName == ''){
		alert("You must provide a valid input");
	}
	else{
		input_form_parameters = {
				inputDatasetName: datasetName,
				mapTaskName: taskName
		};
		
		if(mappingsManager.submitParameters(input_form_parameters)>0){
		    mappingsManager.datasetImported();
		    input.val('');
		    this.close(event);
		    selectedOption.remove();
		}else{
		    var taskNameError = this.div.find("#task-name-exists-error");
	            taskNameError.show();
		    return;
		}
		if($('#tabs-vertical-panel').css('display') == 'block'){
		    $('.hide-span').triggerHandler("click");
		}
		
	}
};

ui.mapFileConfigBox.init = function(datasetNames){
	
	var config_box_window = $('#new-mapping-task-config-window');
	
	
	
	
	var self = this;
	config_box_window.load(this.file,function(){
		
		self.div = $('.new-file-config-box');
		var selectFiles = $(this).find('#files-select');
		var taskNameError = $(this).find("#task-name-exists-error");
		taskNameError.hide();
		var option = null;
		for(var i = 0; i < datasetNames.length; i++){
			option = $('<option>').attr({'value':datasetNames[i]}).text(datasetNames[i]);
			selectFiles.append(option);
		}
		
		
		self.div.on("click", ".close-icon", function(event){ 
	
			event.preventDefault();
			ui.mapFileConfigBox.close(event);
		});
		self.div.on("click", ".config-box-close-button", function(event){ 

			event.preventDefault();
			ui.mapFileConfigBox.close(event);
		});
		
		self.div.on("click", ".init-new-task-button", function(event){ 
		
			event.preventDefault();
			ui.mapFileConfigBox.validation(event);
		});
		self.div.draggable({
		    cursor:'move',
		    handle: ".new-file-config-box-header",
		});
		
		var bheight = 180;
	    	var bwidth = 800;
	    	var mainTabs = $('#main-tabs');
	    	self.div.css({
		    'top' : (mainTabs.height() - bheight) / 2,
		    'left' : (mainTabs.width() - bwidth) / 2,
		    'height' : bheight,
		    'width' : bwidth,
		});
	    	self.div.hide();
	});
	
	
};

ui.mapFileConfigBox.closeLoadingMessage = function(){
	var box = this.div;
	var loading_message = box.find('.loading-message');
	console.log('loading message'+loading_message.length);
	loading_message.css({'display':'none'});
};

