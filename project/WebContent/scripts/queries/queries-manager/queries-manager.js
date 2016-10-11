var queriesManager = {
	links:[],
	vocabulary:[],
	prefixes:[],
	queryNameToQueryMap:{}
};

queriesManager.updateQuery = function(queryId,queryText){
    var query_o = this.queryNameToQueryMap[queryId];
    query_o["body"] = queryText;
    this.queryNameToQueryMap[queryId] = query_o;
};

queriesManager.updateQueryName = function(query_id,newName,callbackFunction){
    
    var self = this;
    var query_o = self.queryNameToQueryMap[query_id];
    $.ajax({
	type : "POST",
	url : "IntegrationServiceServlet/command/queries/rename-query?"+
	$.param({
	    oldName:query_o["name"],
	    newName:newName,
	    queryId:query_id
	}),
	success : function(answer) {
	    console.log(JSON.stringify(answer));
	    if(typeof answer["renamed"] !== 'undefined'){
		if(answer["renamed"]){
		    var query_o = self.queryNameToQueryMap[query_id];
		    query_o["name"] = newName;
		    self.queryNameToQueryMap[query_id] = query_o;
		    callbackFunction(query_o);
		}else{
		    alert('An error occured in renaming!');
		}
	    }
	}, 
   	dataType:'json'
    });	
};

queriesManager.addQuery = function(queryName,callbackFunction){
      	
    var self = this;
    $.ajax({
    	type : "PUT",
    	url : "IntegrationServiceServlet/command/queries/?"+
    	$.param({
    	    queryName:queryName,
    	}),
    	success : function(query_o) {
    	    if(typeof query_o["id"] !== 'undefined'){
    		if(query_o["id"]>0){
    		    console.log(JSON.stringify(query_o));
    		    self.queryNameToQueryMap[query_o["id"]] = query_o;
    		    callbackFunction(query_o);
    		}else{
    		    alert('An error occured while creating the query!');
    		}
    	    }
    	}, 
    	error:function(){
    	    alert('An error occured while creating the query!');
    	},
       	dataType:'json'
   });	
};


queriesManager.getQuery = function(queryId,callbackFunction){
    	//console.log(JSON.stringify(this.queryNameToQueryMap));
    	var query_o = this.queryNameToQueryMap[queryId];
    	callbackFunction(query_o); 
};


queriesManager.executeQuery = function(queryId,queryText,callbackFunction){
    
    console.log(queryId+"/"+queryText);
    
    $.ajax({
	type : "POST",
	url : "IntegrationServiceServlet/command/queries/execute-query?"+ $.param({queryId:queryId,query:queryText}),
	success : function(queryResults) {
	    callbackFunction(queryResults);
	    //panel.queriesSection.resultTab.displayQueryResults(queryText,queryResults);
	}, 
   	dataType:'json',
   	error:function(){
   	    alert('an error occured.Try again.');
   	    //panel.queriesSection.resultTab.displayQueryResults(queryText,[]);
   	}
    });
};


queriesManager.stopQueryExecution = function(query_id,callbackFunction){
    var self = this;
    $.ajax({
	type : "POST",
	url : "IntegrationServiceServlet/command/queries/stop-query-execution?"+ $.param({queryId:query_id}),
	success : function() {
	    callbackFunction();
	    //panel.queriesSection.resultTab.displayQueryResults(queryText,queryResults);
	}, 
   	dataType:'json',
   	error:function(){
   	    alert('an error occured.Try again.');
   	    //panel.queriesSection.resultTab.displayQueryResults(queryText,[]);
   	}
    });
};

queriesManager.saveQuery = function(queryText){
    
    $.ajax({
	type : "POST",
	url : "IntegrationServiceServlet/command/queries/save-query?" + $.param({query:queryText}),
	success : function(savedOK) {
	    panel.queriesSection.addQueryToQuerySection(queryText,queryResults);
	}, 
   	dataType:'json',
   	error:function(){
   	    alert('an error occured.Try again.');
   	}
    });
};




queriesManager.getDataspaceQueries = function(callbackFunction){
    
    var self = this;
    $.ajax({
	type : "POST",
	url : "IntegrationServiceServlet/command/queries/get-dataspace-queries",
	success : function(queries) {
	    console.log("get "+queries.length + " queires!!");
	    
	    for(var i = 0; i < queries.length;i++){
		console.log(queries[i]["Created"]);
		console.log(queries[i]["body"].length);
		self.queryNameToQueryMap[queries[i]["id"]] = queries[i];
	    }
	    console.log(JSON.stringify(queries));
	    callbackFunction(queries);
	}, 
   	dataType:'json'
    });	
};


queriesManager.getLinks = function(){
    
    if(this.links.length != 0){
	 panel.queriesSection.editorTab.addLinks(this.links);
	 return;
    }
    var self = this;
    $.ajax({
	type : "GET",
	url : "IntegrationServiceServlet/command/general/get-linking-tasks-metadata",
	success : function(links) {
	    self.links = links;
	    console.log(JSON.stringify(links));
	    panel.queriesSection.editorTab.addLinks(links);
	}, 
   	dataType:'json'
    });	
};

queriesManager.getVocabulary = function(){
    
    if(this.vocabulary.length != 0){
	 panel.queriesSection.editorTab.addVocabulary(this.vocabulary);
	 return;
    }
    var self = this;
    $.ajax({
	type : "GET",
	url : "IntegrationServiceServlet/command/dataspace/get-vocabulary",
	success : function(vocabulary) {
	    self.vocabulary = vocabulary;
	    panel.queriesSection.editorTab.addVocabulary(vocabulary);
	}, 
   	dataType:'json'
    });	
    
};

queriesManager.getPrefixes = function(){
   
 /*  
   if(this.prefixes.length != 0){
	 panel.queriesSection.editorTab.addPrefixes(this.prefixes);
	 return;
   }*/
   var self = this;
   $.ajax({
	type : "GET",
	url : "IntegrationServiceServlet/command/general/get-prefixes",
	success : function(prefixes) {
	    self.prefixes = processPrefixes(prefixes);
	    console.log('formatting prefixes...');
	    console.log(JSON.stringify(self.prefixes));
	    panel.queriesSection.editorTab.addPrefixes(self.prefixes);
	}, 
  	dataType:'json'
   });	
   
   return;
   
   function processPrefixes(prefixesArray){
       
       var prefixesInSparqlFormat = [];
       var prefix_o;
       var prefixString;
       for(var i = 0; i < prefixesArray.length;i++){
	   prefix_o = prefixesArray[i];
	   prefixString = "PREFIX" + " " + prefix_o["prefix"] + ":" + "<" + prefix_o["uri"] + ">\n";
	   prefixesInSparqlFormat.push(prefixString);
       }
       return prefixesInSparqlFormat;
   }
};



queriesManager.saveDataspace = function(callbackFunction){
    var self = queriesManager;
    var queries = [];
    console.log("saving dataspace!!" + JSON.stringify(self.queryNameToQueryMap));
    for(var key in self.queryNameToQueryMap){
	queries.push(self.queryNameToQueryMap[key]);
	console.log(self.queryNameToQueryMap[key]["body"].length);
    }
    //alert(queries.length);
    $.ajax({
	type : "POST",
	url : "IntegrationServiceServlet/command/queries/save-dataspace-queries",
	data:{queries:JSON.stringify(queries)},
	success : function(answer) {
	    console.log(JSON.stringify(answer));
	    if(!$.isEmptyObject(answer) && answer["saved"]){
		 $.ajax({
			type : "POST",
			url : "IntegrationServiceServlet/command/dataspace/",
			success : function(savedOK) {
			    console.log(JSON.stringify(savedOK));
			    callbackFunction();
			}, 
		   	dataType:'json',
		   	error:function(){
		   	    alert('an error occured.Try again.');
		   	}
		    });
	    }else{
		alert("Error in saving!!");
	    }
	}, 
   	dataType:'json',
   	error:function(){
   	    alert('an error occured.Try again.');
   	}
    });
    
    
    
   
};

queriesManager.getGraphs = function(callbackFunction){
    console.log("get named graphs");
    $.ajax({
	type : "GET",
	url : "IntegrationServiceServlet/command/dataspace/get-named-graphs",
	success : function(graphs) {
	    console.log(JSON.stringify(graphs));
	    callbackFunction(graphs);
	}, 
   	dataType:'json',
   	error:function(){
   	    alert('an error occured.Try again.');
   	}
    });
};