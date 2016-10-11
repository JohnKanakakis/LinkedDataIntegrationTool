var controller = {
		
/*		currentSources:[],
		selectedSources:[],
		currentFilesFromQueries:[],*/
		//metadata:[],
	/*	sourcesCounter:0,*/
		/**********************************************************************************************/
		connections:[],
		sparqlEndpoints:[],
		files:[],
		datasets:[],
		
		numberOfConnections: 0,
		
};

controller.connection = {
		id:"conn-"+controller.numberOfConnections,
		name:"",
		info:{
			URL:"",
			schema:"",
			username:"",
			password:""
		},
		schema_metadata:[],
		queries:[]
};

controller.query = {
	value:"",
	related_file_name:""
};

controller.sparqlEndpoint = {
		URL:"",
		queries:[]
};

controller.file = {
		name:"",
		data:""
};


controller.dataset = {
		related_file_name:"",
		source_type:"",
		source_name:"",
		source_description:"",
		type_of_import:"",
		rows:0
};

/**************** relational connections handling ********************************************************************************/

controller.addConnection = function(connection){
	connection.id = "conn-"+controller.numberOfConnections;
	connection.name = connection.info.URL+connection.info.schema;
	controller.connections.push(connection);
	controller.numberOfConnections++;
	return connection.id;
};

controller.addQueryToConnection = function(URL,schema_name,query){
	
	console.log("add query to connection "+URL + " "+ schema_name + " "+query.value);
	var connection = controller.findConnection(URL,schema_name);
	console.log("connection found with id "+connection.id);
	connection.queries.push(query);
};

controller.findConnection = function(URL,schema_name){
	
	var connection;
	console.log('into controller '+URL+'-'+schema_name);
	for(var i = 0; i < controller.connections.length;i++){
		var info = controller.connections[i].info;
		if (info.URL == URL && info.schema == schema_name){
			return controller.connections[i];
		}
	};
	return connection;
};

controller.findConnectionById = function(conn_id){
	
	var connection;
	console.log('into controller conn id '+conn_id);
	for(var i = 0; i < controller.connections.length;i++){
		var id = controller.connections[i].id;
		if (id == conn_id){
			return controller.connections[i];
		}
	};
	return connection;
};

controller.findQuery = function(array,query){
	var query_o;
	
	for(var i = 0; i < array.queries.length;i++){
		if (array.queries[i].value == query){
			return array.queries[i];
		}
	};
	return query_o;
};

controller.deleteQuery = function(array,query){
	
		console.log('before delete');
		
		var pos = -1;
		var query_string;
		var related_file_name = "";
		for(var i = 0; i < array.queries.length;i++){
			query_string = array.queries[i].value;
			if (query_string == query){
				pos = i;
				related_file_name = array.queries[i].related_file_name;
				break;
			}
		};
		var result;
		if (pos>=0 && related_file_name!=""){
			array.queries.splice(pos, 1);
			result = controller.deleteFile(related_file_name);
			return result;
		}
		
};
/*************************************************************************************************************************/


/****************************************** files handling ***************************************************************/
controller.findFileByName = function(file_name){
	var data = {};
	var name;
	console.log('into controller file name '+ file_name);
	for(var i = 0; i < controller.files.length;i++){
		name = controller.files[i].name;
		if (name == file_name){
			data = controller.files[i].data;
			return data;
		}
	}
	return data;
};



controller.addFile = function(file){
	controller.files.push(file);
};

controller.deleteFile = function(file_name){
	var pos = -1;
	var file;
	for(var i = 0; i < controller.files.length;i++){
		file = controller.files[i];
		if (file_name == file.name){
			pos = i;
			break;
		}
	};
	var result = {};
	if (pos>=0){
		controller.files.splice(pos, 1);
		result.deleteSucceeded = true;
		result.filename = file_name;
	}else{
		result.deleteSucceeded = false;
		result.filename = "";
		console.log('error in delete file');
	}
	return result;
};

/****************************************************************************************************************************/

/********************************************* datasets handling ***********************************************************/

controller.addDataset = function(metadata){
	
	controller.dataset = {
			related_file_name:metadata.related_file_name,
			source_type:metadata.source_type,
			source_name:metadata.source_name,
			source_description:metadata.source_description,
			type_of_import:metadata.type_of_import,
			rows:metadata.rows
	};
	controller.datasets.push(controller.dataset);
	
	return controller.dataset;
};


controller.deleteDataset = function(file_name){
	var pos = -1;
	var dataset;
	for(var i = 0; i < controller.datasets.length;i++){
		dataset = connection.datasets[i];
		if (dataset.related_file_name == file_name){
			pos = i;
			break;
		}
	};
	if (pos>=0){
		controller.datasets.splice(pos, 1);
	}else{
		console.log('error in delete dataset');
	}
};


controller.getDatasetMetadata = function(file_name){
	
	var dataset;
	
	console.log('into controller file name '+ file_name);
	for(var i = 0; i < controller.datasets.length;i++){
		if (controller.datasets[i].related_file_name == file_name){
			return controller.datasets[i];
		}
	}
	return dataset;
	
};
/****************************************************************************************************************************/

/***************************************** SPARQL endpoints handling *****************************************************/

controller.addSparqlEndpoint = function(endpoint){
	controller.sparqlEndpoints.push(endpoint);
};

controller.addQueryToEndpoint = function(endpointURL,query_o){
	
	
	var endpoint = controller.findEndpoint(endpointURL);
	console.log("endpoint found with id "+endpoint.URL);
	endpoint.queries.push(query_o);
};

controller.findEndpoint = function(URL){
	
	var endpoint;
	
	for(var i = 0; i < controller.sparqlEndpoints.length;i++){
		if (controller.sparqlEndpoints[i].URL == URL){
			return controller.sparqlEndpoints[i];
		}
	};
	return endpoint;
};


controller.sendSelectedFiles = function(filesToImport){

	var metadata;
	for(var i = 0; i < filesToImport.length;i++){
		metadata = controller.getDatasetMetadata(filesToImport[i].filename);
	    metadata.graph_name = filesToImport[i].graph_name;
	    filesToImport[i] = metadata;
	} 
	
	$.ajax({
		type : "POST",
		url : "IntegrationServiceServlet/command/import/create-datasets",
		data: {files:JSON.stringify(filesToImport)},
		success : function(answer) {
		    	if(answer["wasSuccessfullImport"] > 0){
		    	    ui.importedDatasets.prepareForNextStep(answer["responseMessage"]);
		    	}else{
		    	    alert(answer["responseMessage"]);
		   	    ui.importedDatasets.removeImportingState();
		    	}
		},
		dataType:'json',
		error:function(response){
		    console.log(JSON.stringify(response));
		    if(response.status == 500){
			alert('An error occured!');
			ui.importedDatasets.removeImportingState();
		    }
	   	}
	});
};

controller.proceedToSchemaMappingPhase = function(){
    var id = util.dataspaceProject.basicMetadata["id"];
    window.location.replace("mapping.html?dataspaceId="+id);
};

