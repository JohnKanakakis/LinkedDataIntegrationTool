$(document).ready(function(){
	initUI();
});

var util = util || {}; 

function initUI(){
    
    	var callbackFunction = function(){
    	    console.log('next-step-button');
    	    var id = util.dataspaceProject.basicMetadata["id"];
    	    var mappedDatasets = mappingsManager.getNumberOfMappedDatasets();
    	    var datasets = mappingsManager.getNumberOfDatasets();
    	    if(mappedDatasets < datasets){
    		var r=confirm("You have some unmapped datasets. Do you want to continue?");
    		if(r == true){   
    		    window.location.replace("linking.html?dataspaceId="+id);
    		}
    	    }else{
    		 window.location.replace("linking.html?dataspaceId="+id);
    	    }
    	};
    	
    	util.panel.header.init(1,callbackFunction);
    	util.dataspaceProject.getBasicMetadata();
    	//var message = util.panel.addAJAXMessage("Initializing . . .");
	panel.init();
	mappingsManager.getUndefinedNamespaces();
	mappingsManager.getDatasetsInfo();
	mappingsManager.getImportedVocabularies(panel.mappingTasksSection.editor.addImportedVocabularies);
};



	