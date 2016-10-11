//var ui = ui || {};

var source = {};
source.relational = {};
source.file = {};
source.sparqlEndpoint = {};

source.relational.getRelationalMetaData = function(parameters) {
	
	var connection = controller.findConnection(parameters.URL,parameters.schema);
	
	if (typeof connection === "undefined"){
			$.get('IntegrationServiceServlet/command/import/get-relational-metadata?'+ 
					$.param({
							 URL: parameters.URL,
							 schema: parameters.schema, 
							 username:parameters.username,
							 password:parameters.password 
							}),
					function(metadata) {
					
						var options = {
								label:"schema: "+ parameters.schema,
								tab_class:"connection-tab",
								URL:parameters.URL,
								schema:parameters.schema,
								username:parameters.username,
								password:parameters.password
						};
						
						
						controller.connection = {
								info:{
									URL:parameters.URL,
									schema:parameters.schema,
									username:parameters.username,
									password:parameters.password
								},
								schema_metadata:metadata,
								queries:[]
						};
						var conn_id = controller.addConnection(controller.connection);
						ui.sources_preview.accordion.addRelationalConnection(options.URL,options.schema,conn_id);
						options.connection = controller.connection;
						ui.sources_preview.relational.addConnectionTab(metadata,options);
						newSourceBox.closeLoadingMessage();
			   	}
			   	, 
			   	'json'
			).fail(function() {
			    alert("Error in database connection.Please try again");
			    newSourceBox.closeLoadingMessage();
			});
	}else{ //connection info and data already exist in local memory
		
		var options = {
				label:"schema: "+ connection.info.schema,
				tab_class:"connection-tab",
				URL:connection.info.URL,
				schema:connection.info.schema,
				username:connection.info.username,
				password:connection.info.password,
				connection:connection
		};
		var metadata = connection.schema_metadata;
		ui.sources_preview.relational.addConnectionTab(metadata,options);
	}
	

};



source.relational.processQueryResults = function(queryAnswer,options) {


	var metadata = queryAnswer.metadata;
	var rows = metadata.rows;
	var related_file_name = metadata.related_file_name;
	
	
	
	var data = queryAnswer.data;
	console.log('rows '+rows+"/"+data.length+"/"+related_file_name);
	
	/***************************************************** important ******************************************/
	controller.file = {
			name:related_file_name,
			data:data
	};
	controller.addFile(controller.file);
	console.log(controller.file.name);
	
	controller.query = {
			value:options.query,
			related_file_name:related_file_name
	};
	
	/******************************************* IMPORTANT!!!!!!!!!!!!!!!!!!!!!!!!!!!! *****************************/
	
	var new_dataset = controller.addDataset(queryAnswer.metadata);
	
	
	controller.addQueryToConnection(options.URL,options.schema,controller.query);
	
	
	ui.sources_preview.relational.addQueryInfoToQueryInfoArea(options.query);
	
	
	ui.importedDatasets.displayDataset(new_dataset);
	/**********************************************************************************************************/
	/*var tab_id = ui.source.file.queryResultsProcessDisplay(data,options);
	
	var file = {
			tab_id: tab_id,
			name:filename,
			source:{
					type:"Relational Query",
					value:options.query
			},
			rows:rows
	};
	
	if (filename !== 'undefined'){
		controller.addCurrentFile(file);
		ui.importedSources.displayFile(file);
	}else{
		alert('you have already submitted this query');
	}*/
};



/**
 * ************************ FILES PROCESSING ********************************************
 */

source.file.fileAlreadyExists = function(fileName){
    	
    	var exists = false;
    	var data = controller.findFileByName(fileName);
    	if(!$.isEmptyObject(data)){
    	    exists = true; 
    	}
    	console.log("EXISTS > "+exists);
    	return exists;
};

source.file.checkURLInputType = function(event){
	var url = $(event.target).closest('table.URL-source-table').find('input[name=fileURL]').val();
	var filename = $(event.target).closest('table.URL-source-table').find('input[name=fileURL-name]').val();
	console.log(url);
	console.log(filename);
	var google_docs_subString  = "https://docs.google.com/";
	var datahub_api_subString = "http://datahub.io/";
	var backend = "";
	if ( url.indexOf(google_docs_subString) >= 0){
		console.log('google docs');
		backend = 'gdocs';
	}else if (url.indexOf(datahub_api_subString) >= 0){
		console.log('datahub');
		backend = 'elasticsearch';
	}else{
		console.log('csv,xls url');
		backend = 'dataproxy';
	};
	var options = {
			url:url,
			backend:backend,
			filename:filename
	};
	source.file.processJSONData(options);
};



source.file.checkFileExtension = function(file) {

    	var self = this;
	var filename = file.name;
	console.log(file.type);
	
	var type = util.file.getFileExtension(filename);//filename.substring(filename.lastIndexOf(".")+1,filename.length);
	console.log(type);
	
	var options = {
			filetype:type,
			filename:file.name,
	};
	
	if(self.fileAlreadyExists(file.name)){
	    alert('file source already exists!');
	    newSourceBox.closeLoadingMessage();
	    return;
	}
	
	if(type == 'csv'){
	   // csv local file
		options.URL = "IntegrationServiceServlet/command/import/tabular-file";
		source.file.CSVprocess(file,options);
		return;
	}
	if(type == 'xls'){ // excel local file 
		options.URL = "IntegrationServiceServlet/command/import/tabular-file";
		source.file.uploadFile(file,options);
		return;
	}
	if(util.file.isRDFFile(type)){// file extension  for .ttl, .n3, .nq , .nt
	    	console.log('here');
		options.URL = "IntegrationServiceServlet/command/import/triples-file";
		source.file.uploadFile(file,options);
		return;
	}
	alert('Not supported file type!');
	newSourceBox.closeLoadingMessage();
	return;
	
	
	
};

source.file.uploadFile = function(file,options){
	
	var formData = false;
	
	if (window.FormData) {

		formData = new FormData();
		formData.append('file', file);
		var xhr = new XMLHttpRequest();

		
		xhr.open('POST', options.URL+'?'+$.param({options:JSON.stringify(options)}), true);
		xhr.send(formData);
		xhr.onreadystatechange = function(){
			if (xhr.readyState == 4 && xhr.status == 200){
				var answerData = jQuery.parseJSON(xhr.responseText);
				
				if (!(typeof answerData.data === "undefined")){
					controller.file = {
							name:options.filename,
							data:answerData.data
					};
					controller.addFile(controller.file);
				}
				
				
				/******************************************* IMPORTANT!!!!!!!!!!!!!!!!!!!!!!!!!!!! *****************************/
				var new_dataset = controller.addDataset(answerData.metadata);
				ui.sources_preview.accordion.addFile(options.filename);
				ui.importedDatasets.displayDataset(new_dataset);
				newSourceBox.closeLoadingMessage();
			}
			if(xhr.readyState == 4 && xhr.status == 500){
			    alert('File '+options.filename +' has not been imported!');
			    newSourceBox.closeLoadingMessage();
			}
			return;
		};
		
	}

};

source.deleteRelatedFiles = function(filenames){
		console.log('send message for delete to server. . .');
		
		var datasets_metadata = [];
		var metadata;
		for (var i = 0;i < filenames.length;i++){
			metadata = controller.getDatasetMetadata(filenames[i]);
			datasets_metadata[i] = metadata;
		}
		$.ajax({
			type : "POST",
			url : "IntegrationServiceServlet/command/import/delete-source?"+$.param({filesToDelete:JSON.stringify(datasets_metadata)}),
			success : function() {
				alert('The related dataset has been deleted');
			}
		});

};

source.file.processJSONData = function(options){
	var	dataset = new recline.Model.Dataset({
						url : options.url,
						backend : options.backend
				});
	
	dataset.fetch().done(function() {
		dataset.query({size: dataset.recordCount}).done(function(){
			var fileOptions = {
					filename:options.filename,
					url:options.url,
					rows:dataset.recordCount
			};
			var dataToJSON = dataset.records.toJSON();
			var stringifyJSONData = JSON.stringify(dataToJSON);
			source.file.uploadJSONData(stringifyJSONData,fileOptions);
		});

		var data = [];
		for(var i = 0;i < dataset.records.length;i++){
			data[i] = dataset.records.at(i).toJSON();
		}
		
		controller.file = {
				name:options.filename,
				data:data
		};
		controller.addFile(controller.file);
		
		
	});
};

source.file.uploadJSONData = function(stringifyJSONData,options){
	

	
	$.ajax({
		type : "POST",
		url : "IntegrationServiceServlet/command/import/json-data?"+$.param({options:JSON.stringify(options)}),
		data : {data:stringifyJSONData},
		success : function(answerData) {
			
			/******************************************* IMPORTANT!!!!!!!!!!!!!!!!!!!!!!!!!!!! *****************************/
			var metadata = answerData.metadata;
			var new_dataset = controller.addDataset(metadata);
			ui.sources_preview.accordion.addFile(options.filename);
			ui.importedDatasets.displayDataset(new_dataset);
			newSourceBox.closeLoadingMessage();
		}
	});
};
				
source.file.processFileDisplay = function(filename){
	
    	var self = this;
    	var options = {
			filename:filename
	};
	var data = controller.findFileByName(filename);
	var type = util.file.getFileExtension(filename);//filename.substring(filename.lastIndexOf(".")+1,filename.length);
	if(type == 'csv'){
		ui.sources_preview.tabularProcessDisplay(data,filename);
		return;
	}
	if(type == 'xls'){
		source.file.excelProcess(data,options);
		return;
	}
	if(util.file.isRDFFile(type)){
		source.file.rdfProcess(data,options);
		return;
	}

	console.log("default!!");
	ui.sources_preview.tabularProcessDisplay(data,filename);
	return;
	
};



											/* CSV and EXCEL display */

source.file.CSVprocess = function(file,options) {

	console.log('here ' + file.name + ' ' + file.size);

	var dataset = new recline.Model.Dataset({
		file : file,
		backend : 'csv'
	});
	
	dataset.fetch().done(function() {
	
		options.rows = dataset.recordCount;
		source.file.uploadFile(file,options);


		var data = [];
		for(var i = 0;i < dataset.records.length;i++){
			data[i] = dataset.records.at(i).toJSON();
		}
		
		controller.file = {
				name:options.filename,
				data:data
		};
		controller.addFile(controller.file);
	});
};
		

source.file.excelProcess = function(sheets,options){


	ui.sources_preview.tabularProcessDisplay(sheets[0].data,options.filename);
};



/**
 * ************************ TRIPLES FILES PROCESSING ********************************************
 */


source.file.rdfProcess = function(data,options) {

		ui.sources_preview.processDisplayRDFVoc(data,options.filename);
		
		
		/*var file = {
				tab_id: tab_id,
				name:options.filename,
				source:{
						type:options.source_type,
						value:options.source_value
				},
				rows:1000
		};
		controller.addCurrentFile(file);
		ui.importedSources.displayFile(file);*/
		
};
/**********************************************************************************************************************************/

/******************************************* SPARQL ENDPOINT PROCESSING ******************************************************/

source.sparqlEndpoint.processSparqlEndpoint = function(url){
	

	var endpoint = controller.findEndpoint(url);
	
	if (typeof endpoint === "undefined"){
		controller.endpoint = {
				URL:url,
				queries:[]
		};
		controller.addSparqlEndpoint(controller.endpoint);
		ui.sources_preview.accordion.addSparqlEndpoint(url);
		//ui.sources_preview.sparqlEndpoint.addSparqlEndpointTab(controller.endpoint);
	}else{
		ui.sources_preview.sparqlEndpoint.addSparqlEndpointTab(endpoint);
	}
	newSourceBox.closeLoadingMessage();
};
source.sparqlEndpoint.submitSPARQLQuery = function(endpointURL,queryString) {
	
	//var queryString = prefixes + " CONSTRUCT " + query_body;
	
	var query_info = {
			serviceURL:endpointURL,
			query:queryString
	};

	$.ajax({
		type : "POST",
		url : "IntegrationServiceServlet/command/import/sparql-endpoint",
		data:{query:JSON.stringify(query_info)},
		success : function(answerData) {
			
		    	if(typeof answerData["error"] !== 'undefined'){
		    	    alert(answerData["message"]);
		   	    ui.sparqlEndpointEditor.closeLoadingMessage();
		   	    return;
		    	}
		    	
			var metadata = answerData.metadata;
			var related_file_name = metadata.related_file_name;
			
			controller.file = {
					name:related_file_name,
					data:answerData.data
			};
			controller.addFile(controller.file);
			console.log(controller.file.name);
			
			controller.query = {
					value:queryString,
					related_file_name:related_file_name
			};
			
			var new_dataset = controller.addDataset(answerData.metadata);
			ui.importedDatasets.displayDataset(new_dataset);
			controller.addQueryToEndpoint(endpointURL,controller.query);
			ui.sources_preview.sparqlEndpoint.addQueryToQueryInfoArea(queryString);
			ui.sparqlEndpointEditor.closeLoadingMessage();
			ui.sparqlEndpointEditor.close();
		}, 
	   	dataType:'json',
	   	error:function(){
	   	    alert('an error occured! please try again!');
	   	    ui.sparqlEndpointEditor.closeLoadingMessage();
	   	}
	});

	
};


