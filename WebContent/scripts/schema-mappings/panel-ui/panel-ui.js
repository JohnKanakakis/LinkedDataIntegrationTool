var panel = {};

panel.menuSection = {};
panel.mappingTasksSection = {};
panel.informationSection = {};

panel.div = {};

panel.init = function(){
    	ui.importVocabularyBox.init();
    	this.div = $('#main-tabs');
	this.mappingTasksSection.init();
};