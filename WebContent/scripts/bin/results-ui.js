panel.mappingTasksSection.resultTab.treeViewRoot = '';
panel.mappingTasksSection.resultTab.mainBody = '';

panel.mappingTasksSection.resultTab.displayResults = function(results,includeSave){
    
    console.log("save is "+includeSave);
    if (typeof(includeSave) === 'undefined') includeSave = true;
    
    var self = this;
    
    self.align();
    self.mainBody = self.div.find("#overview-body");
    self.mainBody.addClass('loading');
    
    var resultsMenu = self.mainBody.find("#results-menu");
    if(resultsMenu.length == 1){
	self.mainBody.empty();
	var targetVocBody = self.div.find("#results-target-vocabulary-body");
	targetVocBody.empty();
	console.log("body length "+self.mainBody.length);
	console.log(self.mainBody.css('width'));
    };
    console.log("again body length "+self.mainBody.length);
    console.log("again "+self.mainBody.width());
    self.treeViewRoot = $('<ul>').attr({
	'id' : 'results-menu',
	'class' : 'results-tree'
    }).css({
	'position' : 'absolute',
	'left' : '5px',
	'width' : (self.div.width() - 235) + 'px',
	'top' : '5px',
	'border' : 'solid 1px #707070',
    });
    
    var controlPanel = self.div.find("#mapping-results-control-panel");
    var confirmTaskButton = controlPanel.find("#confirm-task");
    if(includeSave){
	 if(confirmTaskButton.length == 0){
		confirmTaskButton = $('<button>').css({
			'position' : 'absolute',
			'right' : '5px',
			'width' :  '100px',
			'top' : '3px',
			'margin':0,
			'border' : 'solid 1px #707070',
			'border-radius' : 0,
			'height':'20px',
			'background':'orange',
			'text-align':'center',
			'cursor':'pointer',
			'font-size':'medium',
			'line-height':1
		})
		.text('Save')
		.attr('id','confirm-task');
		confirmTaskButton.appendTo(controlPanel);
	 }
    }else{
	confirmTaskButton.hide();
    }
   
    if(jQuery.isEmptyObject(results)){
	self.mainBody.removeClass('loading');
	return;
    }
    
    
    var mappings = results.mappings;
    var mapping_li;
    var mapping_ul;
    var mappingInfo_li;
    for ( var i = 0; i < mappings.length; i++) {

	mapping_li = $('<li>').html(
		'<span>' + mappings[i].name + '</span>').addClass(
		'mapping-li');
	mapping_ul = $('<ul>');

	mappingInfo_li = createMappingSection(mappings[i].couples);
	mappingInfo_li.appendTo(mapping_ul);

	mapping_ul.appendTo(mapping_li);
	mapping_li.appendTo(self.treeViewRoot);
    }
    self.treeViewRoot.treeview({
	collapsed : true
    });
    self.treeViewRoot.appendTo(self.mainBody);
    self.mainBody.removeClass('loading');
    
    
    var targetVocabulary = results.targetVocabulary;
    var body = self.div.find("#results-target-vocabulary-body");
    var height = 0;
    var vocTermBox = null;
    var bodyWidth = body.width();
    console.log(bodyWidth);
    body.empty();
    for ( var i = 0; i < targetVocabulary.length; i++) {
	vocTermBox = $('<div>').addClass('vocabulary-term-box').attr({
	    'title' : targetVocabulary[i]["uri"] + targetVocabulary[i]["name"],
	});
	height = vocTermBox.height();
	vocTermBox.css({
	    'top' : height * i + 'px',
	    'width':'192px'
	});
	vocTermBox.html("<span>" + targetVocabulary[i]["prefix"] + ":"
		+ targetVocabulary[i]["name"] + "</span>");
	vocTermBox.appendTo(body);
    }
    

    function createMappingSection(couples){
	
	var li  = $('<li>').css({
	    'padding':'0px'
	});
	var div;
	var height = 30;
	var sourceTermDiv,
	    targetTermDiv,
	    arrowDiv,
	    numOfStatDiv,
	    mappingSucceedDiv,
	    queryDiv;
	
	var sourceTerm;
	var couple;
	var targetTerms;
	for(var i = 0; i < couples.length; i++){
	    
	    couple = couples[i];
	    sourceTerm = couple["sourceTerm"];
	    targetTerms = couple["targetTerms"];
	    for(var j = 0; j < targetTerms.length;j++){
		
		div = $('<div>').css({
		    'height':height+'px',
		}).addClass('mapping-terms-block');
		
		sourceTermDiv = $('<div>').addClass('results-term').text(sourceTerm).appendTo(div);
		arrowDiv = $('<div>').addClass('results-mapping-arrow').css({'border':0}).appendTo(div);
		targetTermDiv = $('<div>').addClass('results-term').text(targetTerms[j]["term"]).appendTo(div);
		
		numOfStatSpan = $('<div>').text(targetTerms[j]["num"]).appendTo(div);
		mappingSucceedSpan = $('<div>').appendTo(div);
		if(targetTerms[j]["num"] == 0){
		    mappingSucceedSpan.addClass('failed-mapping');
		}else{
		    mappingSucceedSpan.addClass('successfull-mapping');
		}
		
		queryDiv = $('<div>').addClass('query-icon').appendTo(div);
		div.appendTo(li);
	    }
	}
	return li;
    };
};

/*panel.mappingTasksSection.resultTab.getMappingsOverviewHTML = function(){
    return this.div.find("#results-menu");
};


panel.mappingTasksSection.resultTab.displayViewOnly = function(resultsMenu){
    console.log('only view display');
    var overviewBody =  this.div.find("#overview-body");
    overviewBody.find("#results-menu").remove();
   
};*/

panel.mappingTasksSection.resultTab.disableSave = function(){
    this.div.find("#confirm-task").hide();
};

panel.mappingTasksSection.resultTab.enableSave = function(){
    this.div.find("#confirm-task").show();
};