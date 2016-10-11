var newSourceBox = {
	div:{},
	position:{},
	file:'scripts/sources-import/menus/new-source-box.html',
	databaseFormFile:'scripts/sources-import/menus/databaseForm.html',
	fileFormFile:'scripts/sources-import/menus/fileForm.html',
	endpointFormFile:'scripts/sources-import/menus/endpointForm.html',
	inputFilesArray:[]
};


newSourceBox.open = function(event){
	
	event.preventDefault();
	var self = this;
	var b = self.div;
	if(b.css('display') != 'block'){
	    b.show();
	    //b.css(self.position);
	    var id = $(event.target).attr('id');
	    console.log(id);
	    var formContainer = b.find("div.form-container");
	    var headerTitle = b.find("#header-title");
	    if(id == "add-database"){
		//load database form
		headerTitle.text("New database connection");
		formContainer.load(newSourceBox.databaseFormFile,function(){
		    formContainer.on('change','.database-url-type',function(event){	
			var table = formContainer.find("table");
			var dbUrlRow = table.find('#database-url-row');
			dbUrlType =  $(this).val();
			console.log(dbUrlType);
			if (dbUrlType == 'local'){
			    dbUrlRow.hide();
			    table.show();
			}else{
			    dbUrlRow.show();
			    table.show();
			}
		    });
		});
	    }else if(id == "add-file"){
		//load file form
		headerTitle.text("New file");
		formContainer.load(newSourceBox.fileFormFile,function(){
		    formContainer.on('change','.file-source-type',function(event){	
			var tables = formContainer.find('table');
			fileSourceType =  $(this).val();
			console.log(fileSourceType);
			if (fileSourceType == 'URL'){
				 $(tables[0]).show();
				 $(tables[1]).hide();
			}
			else{
				 $(tables[1]).show();
				 $(tables[0]).hide();
			}
		    });
		});
	    }else if(id == "add-endpoint"){
		//load endpoint form
		headerTitle.text("New Endpoint");
		formContainer.load(newSourceBox.endpointFormFile,function(){
		    
		});
	    }
	}
};
		
newSourceBox.close = function(event){
		event.preventDefault();
		newSourceBox.div.find("div.form-container").empty();
		newSourceBox.div.hide();
};




newSourceBox.validation = function(event){
	
    	var form = newSourceBox.div.find('form');
	var formId = form.attr('id');
	console.log("form id = "+formId);
	if(formId == "database-form"){
	    newSourceBox.databaseValidation(form);
	}else if(formId == "file-form"){
	    newSourceBox.fileValidation(form);
	}else if(formId == "endpoint-form"){
	    newSourceBox.endpointValidation(form);
	}
};



newSourceBox.databaseValidation = function(form){
    	console.log("database validation");
    	var db_URL = form.find('input[id=databaseURL]').val();
	var db_schema = form.find('input[id=databaseSchema]').val();
	var db_username = form.find('input[id=databaseUsername]').val();
	var db_password = form.find('input[id=databasePassword]').val();
	
	var selectedUrlType = form.find('input[type=radio]:checked').val();
	console.log(selectedUrlType);
	if(selectedUrlType == "local"){
	    db_URL = "jdbc:mysql://localhost/";
	}
	
	if (db_URL == '' || db_schema == '' || db_username == ''){
		alert("You must provide a valid input");
	}
	else{
		input_form_parameters = {
				URL: db_URL,
				schema: db_schema,
				username: db_username,
				password: db_password
		};
		source.relational.getRelationalMetaData(input_form_parameters);
	}
};

newSourceBox.fileValidation = function(form){
    	var selectedFiles = this.inputFilesArray;
    	if(selectedFiles.length > 0){
    	   /* this.div.addClass('loading-message').css({
    		'opacity':1
    	    });*/
    	    source.file.checkFileExtension(selectedFiles[0]);
    	}
    	
    	this.inputFilesArray = [];
    	/*for(var i = 0; i < selectedFiles.length;i++){
    	    source.file.checkFileExtension(selectedFiles[i]);
    	}*/
    	
};

newSourceBox.endpointValidation = function(form){
    	var selectedEndpoints = form.find("input[type=checkbox]:checked");
    	var newUrl = form.find("#new-url").val();
    	var url;
    	for(var i = 0; i < selectedEndpoints.length;i++){
    	    url = $(selectedEndpoints[i]).attr('id');
    	    source.sparqlEndpoint.processSparqlEndpoint(url);
    	}
    	if(newUrl!=''){
    	    source.sparqlEndpoint.processSparqlEndpoint(newUrl);
    	}
    	
};


newSourceBox.init = function(){
	
	var self = this;
	var addSourceWindow = $("#add-new-source-window");
	addSourceWindow.load(self.file,function(){
	    
	    self.div = addSourceWindow.find("#add-new-source-box");
	    self.div.on('click','#close-source-box-icon',function(event){
		self.close(event);
		self.inputFilesArray = [];
	    });
	   
	    self.div.on('click','#import-new-source-button',function(event){
		event.preventDefault();
		self.addLoadingMessage();
		self.validation(event);	
		//newSourceBox.close(event);
	    });
	    self.div.on('change','#file-upload',function(event){
		var file = event.target.files[0];
		self.inputFilesArray[0] = file;
		console.log("filename is "+file.name);
	    });
	    self.div.draggable({
		cursor: "move",
		handle:"#new-source-box-header"
	    });
	    var mainTabs = $("#main-tabs");
	    var height = 300;
	    var width = 500;
	    
	    self.position = {
		    'top': (mainTabs.height() - height) / 2,
		    'left': (mainTabs.width() - width) / 2,
		    'width': width,
		    'height':height   
	    };
	    self.div.css(self.position);
	    self.div.hide();
	});
};


newSourceBox.addLoadingMessage = function(){
    	this.div.find('div.loading-message').show(); 
};

newSourceBox.closeLoadingMessage = function(){
	/*var box = this.div;
	box.removeClass('loading-message');*/
    	this.div.find('div.loading-message').hide(); 
	this.inputFilesArray = [];
	/*console.log('loading message'+loading_message.length);
	loading_message.css({'display':'none'});*/
};