var ui = ui || {};

ui.importVocabularyBox = {
		div:{},
		file:'scripts/schema-mappings/panel-ui/mapping-tasks/target-vocabulary-config-box.html',
		inputFilesArray:[]
};


ui.importVocabularyBox.open = function(){
		this.div.show();
};
		
ui.importVocabularyBox.close = function(event){
		event.preventDefault();
		var box = this.div;
		box.fadeOut("fast");
};


ui.importVocabularyBox.validation = function(event){
	
    	var self = this;
    	self.showLoadingMessage();
    	
    	var file;
    	var action;
    	var form = $('#vocabulary-config-form');
    	var name = form.find('#vocabulary-name').val();
    	var prefix = form.find("#vocabulary-prefix").val();
    	var vobabularyNs = form.find("#vocabulary-ns").val();
    	
    	if(self.inputFilesArray.length > 0){
    	    file = self.inputFilesArray[0];
    	    action = "upload";
    	    self.inputFilesArray = [];
    	    
    	    form_parameters = {
		vocabularyName: name,
		file:file,
		vocabularyPrefix: prefix,
		vocabularyNs:vobabularyNs,
		action:action
    	    };
    	    mappingsManager.addVocabulary(form_parameters);
    	}else{
    	    alert('No file input!');
    	}
    	
	//var form = $('#vocabulary-config-form');
	var url = form.find('#vocabulary-url').val();
	//var name = form.find('#vocabulary-name').val();
	//var prefix = form.find('#vocabulary-prefix').val();

	/*if (url == '' || name == ''){
		alert("You must provide a valid input");
	}
	else{
		form_parameters = {
			vocabularyName: name,
			vocabularyPrefix: "",
			vocabularyURL:url,
			action:action
		};
		mappingsManager.addVocabulary(form_parameters);
	};*/
};

ui.importVocabularyBox.init = function(){
	
	var config_box_window = $('#new-target-vocabulary-config-window');	
	var self = this;
	config_box_window.load(this.file,function(){
		
		self.div = config_box_window.find('#target-vocabulary-config-box');
		var bheight = 250;
	    	var bwidth = 550;
	    	var mainTabs = $('#main-tabs');
	    	self.div.css({
		    'display' : 'block',
		    'top' : (mainTabs.height() - bheight) / 2,
		    'left' : (mainTabs.width() - bwidth) / 2,
		    'height' : bheight,
		    'width' : bwidth,
		});
		
	    	self.div.on("click", ".close-icon", function(event){ 
	
			event.preventDefault();
			self.close(event);
		});
	    	self.div.on("click", ".config-box-close-button", function(event){ 

			event.preventDefault();
			self.close(event);
		});
		
	    	self.div.on("click", "#import-vocabulary", function(event){ 
		
			event.preventDefault();
			self.validation(event);
		});
	    	
	    	self.div.on('change','input[type=file]#file-name',function(event){
			var file = event.target.files[0];
			self.inputFilesArray[0] = file;
			console.log("filename is "+file.name);
		});
	    	
	    	self.div.draggable({
		    cursor:'move',
		    handle: ".window-box-header",
		});
	    	self.div.hide();
	});
};

ui.importVocabularyBox.closeLoadingMessage = function(){
	var box = this.div;
	var loading_message = box.find('.vocabulary-loading');
	loading_message.hide();
};

ui.importVocabularyBox.showLoadingMessage = function(){
	var box = this.div;
	var loading_message = box.find('.vocabulary-loading');
	loading_message.show();
};
