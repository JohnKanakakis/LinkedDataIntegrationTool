$(document).ready(function(){
	initUI();
});



var util = util || {}; 

function initUI(){
	
    	$("#main-tabs").tabs();
    	util.panel.header.init(0,function(){});
    	util.dataspaceProject.getBasicMetadata();
    	ui.sources_preview.init();
    	ui.importedDatasets.init();
	ui.query_editor.init();
	ui.sparqlEndpointEditor.init();
	newSourceBox.init();
};


