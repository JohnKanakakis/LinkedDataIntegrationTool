panel.queriesSection.resultTab = {
	div:{},
	grid:{},
	gridContainer:{},
	defaultGridOptions:{
		editable : true,
		enableCellNavigation : true,
		enableColumnReorder : false,
		explicitInitialization : false,
		autoHeight : false,
		defaultColumnWidth:700
	}
};

panel.queriesSection.resultTab.init = function(loadPage){
	
	this.div = panel.queriesSection.div.find('#results');
	this.createGrid();
	$('<div>').addClass('no-result-text').attr('style','padding-left:10px')
		  .text('No results!').prependTo(this.div).hide();
	this.addListeners();
};

panel.queriesSection.resultTab.createGrid = function(){

    	var self = this;
    	self.gridContainer = $('<div>').css({
    	    				   'position':'absolute',
    	    				   'top':'0px',
    	    				   'left':'5px',
    	    				   'width':self.div.innerWidth() - 20,
    	    				   'height':self.div.innerHeight() - 20,
    					   'font-size' : 'small',
    					   'border':'solid 1px #aaaaaa'
    				       });
    	self.gridContainer.addClass('results-container-grid');
    	self.gridContainer.appendTo(self.div);
    	self.gridContainer.hide();
};

panel.queriesSection.resultTab.addListeners = function(){

	this.div.on("click","#save-query",function(event){
	    alert("save!");
	    queriesManager.saveQuery(); 
	});
	
};

panel.queriesSection.resultTab.tabActivateEventHandler = function(event,ui){
    	
    if(!$.isEmptyObject(this.grid)){
	this.grid.setColumns(this.grid.getColumns());
    }
    	
};


panel.queriesSection.resultTab.displayQueryResults = function(query,results){
    
    var noResultTextDiv = this.div.find("div.no-result-text");
    if(results.length == 0){
	this.div.removeClass('loading');
	this.gridContainer.hide();
	noResultTextDiv.show();
	return;
    }else{
	noResultTextDiv.hide();
    }
    var data = results;
    var columns = [];
    var col = {};
    
    for ( var key in data[0]) {
	col = {
	    id : key,
	    name : key,
	    field : key,
	};
	columns.push(col);
    }
    this.removeLoading();
    this.gridContainer.show();
    grid = new Slick.Grid(this.gridContainer, data, columns, this.defaultGridOptions);
    this.grid = grid;
    grid.init();
};

panel.queriesSection.resultTab.clear = function(){
    this.gridContainer.hide();
};

panel.queriesSection.resultTab.loading = function(){
    this.div.addClass('loading');
};

panel.queriesSection.resultTab.removeLoading = function(){
    this.div.removeClass('loading');
};