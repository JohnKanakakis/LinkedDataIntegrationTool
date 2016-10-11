var historyPanel = {
	div:{},
	treeViewRoot:{},
	metadata:[]   
};


historyPanel.getMetadata = function(){
	
	var self = this;
	
	$.ajax({
		type : "GET",
		url : "IntegrationServiceServlet/command/general/get-dataset-metadata?"+
		$.param({
		    datasetName:"",
		    metadataCategory:""
		}),
		success : function(metadata) {
			self.metadata = metadata;
			console.log("metadata = "+JSON.stringify(metadata));
			self.createTree();
		}, 
	   	dataType:'json'
	});
	
	
	
	
	function processMetadata(metadataArray){
	    
	    var datasetMetadata;
	    var datasetName;
	    for(var i = 0; i < metadata.length;i++){
		datasetMetadata = metadata[i];
		datasetName = datasetMetadata["generalMetadata"]["name"];
		
	    }
	}
};




historyPanel.getDiv= function(){
    	return this.div;
};


historyPanel.init = function(){
    
    	this.div = $('<div>').addClass('history-info-ui')
    			     .css({
    				 'position':'absolute',
    				 'top':0,
    				 'left':0,
    				 'right':0,
    				 'left':0,
    				 'bottom':0,
    				 'overflow':'auto'
    			     });
    	this.addLoadingMessage();
    	this.getMetadata();
};

historyPanel.addLoadingMessage = function(){
    	this.div.addClass('loading');
};

historyPanel.removeLoadingMessage = function(){
    	this.div.removeClass('loading');
};

historyPanel.createTree = function(){
	
    	var header = $('<div>').addClass('box-header').html('<span>'+ 'Imported Datasets Information' + '</span>');
    	header.css({
    	    'position':'absolute',
    	    'top':'19px',
    	    'left':'5px',
    	    'right':'5px',
    	    'height':'30px',
    	    'border':'1px solid #aaaaaa',
    	    'font-size':'medium'
    	});
    	header.appendTo(this.div);
    	
    	this.treeViewRoot = $('<ul>').attr({
    	    'id' : 'history-menu',
    	    'class' : 'filetree'
    	}).css({
    	    'position' : 'absolute',
    	    'top' : '50px',
    	    'left' : '5px',
    	    'right' : '5px',
    	    'border':'1px solid #aaaaaa'
    	});
	/*var root_li = $('<li>').html('<span> Imported Datasets </span>').addClass('open');
	var root_ul = $('<ul>');
	root_li.append(root_ul);
	this.treeViewRoot.append(root_li);*/
	
	var datasetsMetadata = this.metadata;
	var dataset_li;
	var dataset_ul;
	var section_li;
	for(var i = 0; i < datasetsMetadata.length; i++){
		dataset_li = $('<li>').html('<span>'+datasetsMetadata[i]["generalMetadata"]["name"]+'</span>')		  
					.attr('datasetName',datasetsMetadata[i]["generalMetadata"]["name"]);
							 
		dataset_ul = $('<ul>').appendTo(dataset_li);
		
		section_li = this.createDatasetImportSection(datasetsMetadata[i]["importingMetadata"]);
		section_li.appendTo(dataset_ul);
		
		section_li = this.createDatasetMappingSection(datasetsMetadata[i]["mappingMetadata"]);
		section_li.appendTo(dataset_ul);
		
		section_li = this.createDatasetLinkingSection(datasetsMetadata[i]["linkingMetadata"]);
		section_li.appendTo(dataset_ul);
		
		dataset_li.appendTo(this.treeViewRoot);
	}
	this.treeViewRoot.treeview({collapsed: true});
	this.div.append(this.treeViewRoot);
	
	this.removeLoadingMessage();
};

/*historyPanel.update = function(section,data){
	if(section == "linking"){
		this.addToLinkSection(data["source"]);
		this.addToLinkSection(data["target"]);
	}else if(section == "mapping"){
		this.addToMapSection(data);
	}
};*/


historyPanel.createDatasetImportSection = function(importingMetadata){
	
	var section_li = $('<li>').html('<span>Importing Info</span>').attr('section','import-section');
																  
	var ul = $('<ul>');
	ul.appendTo(section_li);
	var info = importingMetadata;
	var dataset_prop_li;
	for(var key in info){
		dataset_prop_li = $('<li>').addClass('property-li').html('<span>'+key+':'+info[key]+'</span>')
								   .css({
									   'border-bottom':'solid 1px #aaaaaa',  
								   });
		dataset_prop_li.appendTo(ul);
	}
	return section_li;
};

historyPanel.createDatasetMappingSection = function(mappingInfo){
	var section_li = $('<li>').html('<span>Mapping Task</span>').attr('section','map-section');
	var ul = $('<ul>');
	ul.appendTo(section_li);
	var info = mappingInfo;
	var dataset_prop_li;
	for(var key in info){
		dataset_prop_li = $('<li>').addClass('property-li').html('<span>'+key+':'+info[key]+'</span>');
		dataset_prop_li.appendTo(ul);
	}
	return section_li;
};

historyPanel.createDatasetLinkingSection = function(linkingInfo){
	
	var section_li = $('<li>').html('<span>Linking Tasks</span>').attr('section','link-section');
	var ul = $('<ul>');
	ul.appendTo(section_li);
	
	var linkingTaskName_li;

	for(var i = 0; i < linkingInfo.length; i++){
		linkingTaskName_li = this.createTaskSubSection(linkingInfo[i]);
		linkingTaskName_li.appendTo(ul);
	}
	return section_li;
};

historyPanel.addToLinkSection = function(linkingTaskInfo){
	var datasetName = linkingTaskInfo["datasetName"];
	var dataset_li = this.findDataset(datasetName);
	var section_li = this.findSection(dataset_li,"link-section");
	console.log(dataset_li.attr('datasetName'));
	console.log(section_li.attr('section'));
	var li = this.createTaskSubSection(linkingTaskInfo);
	console.log(section_li.children('ul').length);
	section_li.children('ul').append(li);
	this.treeViewRoot.treeview({add:li});
};

historyPanel.addToMapSection = function(mappingTaskInfo){
	var datasetName = mappingTaskInfo["datasetName"];
	var dataset_li = this.findDataset(datasetName);
	var section_li = this.findSection(dataset_li,"map-section");
	console.log(dataset_li.attr('datasetName'));
	console.log(section_li.attr('section'));
	var li = this.createTaskSubSection(mappingTaskInfo);
	console.log(section_li.children('ul').length);
	section_li.children('ul').append(li);
	this.treeViewRoot.treeview({add:li});
};


historyPanel.findDataset = function(datasetName){
	
	var li = this.div.find('li[datasetName='+datasetName+']');
	return li;
};

historyPanel.findSection = function(dataset_li,section){
	
	var li = dataset_li.find('li[section='+section+']');
	return li;
};

historyPanel.createTaskSubSection = function(taskData){
	
    	taskName_li = $('<li>').html('<span>'+"Task Name"+':'+taskData["name"]+'</span>');
	taskName_ul = $('<ul>');
	taskName_ul.appendTo(taskName_li);
	var task_prop_li;
	for(var prop_key in taskData){
	    if(prop_key !="name"){
		task_prop_li = $('<li>').addClass('property-li').html('<span>'+ prop_key+':'+ taskData[prop_key]+'</span>');
		task_prop_li.appendTo(taskName_ul);
	    }
		
	}
	return taskName_li;
};