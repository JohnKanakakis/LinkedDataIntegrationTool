var ui = ui || {};

ui.transformationBox = {};

ui.transformationBox.relatedMappingId = 0;
ui.transformationBox.relatedTargetPattern = '';
ui.transformationBox.htmlElement = null;

ui.transformationBox.open = function(event){
	
		event.preventDefault();
		var box = ui.transformationBox.htmlElement;

		var mapping_id = $(event.target).closest('.mapping-box').attr('mapping-id');
		var targetPattern = $(event.target).closest('div.target-pattern').attr('related-target-pattern');
		console.log('transform mapping id ' +mapping_id);
		console.log('transform mapping id ' +targetPattern);
		var transformationText = mappingsManager.getPropertyTransformation(mapping_id,targetPattern);
		box.find('textarea').val(transformationText);
		ui.transformationBox.relatedMappingId = mapping_id;
		ui.transformationBox.relatedTargetPattern = targetPattern;
		if(box.css('display') == 'block'){
			
		} else {
			box.css({'display': 'block', 'top': '20%', 'left': '25%','width': '800px','height':'300px'});
		}
		
		
		
};
		
ui.transformationBox.close = function(event){
		event.preventDefault();
		var box = ui.transformationBox.htmlElement;
		box.fadeOut("fast",function(){
			box.css({'display':'none'});
			box.find('textarea').val('');
		});
		
};


ui.transformationBox.validation = function(event){
	
	var box = ui.transformationBox.htmlElement;
	var mapId = ui.transformationBox.relatedMappingId;
	var targetPattern = ui.transformationBox.relatedTargetPattern;
	var transformationText = box.find('textarea').val();
	

	if (transformationText == ''){
		alert("You must provide a valid input");
	}
	else{
		var insert_ok = mappingsManager.addTransformationToPropertyPair(mapId,targetPattern,transformationText);
		if (insert_ok){
			ui.transformationBox.close(event);
		}
	}
};

ui.transformationBox.init = function(){
	
	var transformation_window = $('.transformation-window');
	
	/*$('.add-new-file-icon-area').on("click",function(event){
		event.preventDefault();
		ui.transformationBox.open(event);
	});*/
	
	
	
	transformation_window.load('scripts/schema-mappings/panel-ui/transformation-box.html',function(){
		ui.transformationBox.htmlElement = $('.transformation-box');
		
		ui.transformationBox.htmlElement.draggable({cursor: "move"});

		$(this).on("click", ".close-icon", function(event){ 
	
			event.preventDefault();
			ui.transformationBox.close(event);
		});
		$(this).on("click", ".transformation-box-cancel-button", function(event){ 

			event.preventDefault();
			ui.transformationBox.close(event);
		});
		
		$(this).on("click", ".transformation-config-button", function(event){ 
		
			event.preventDefault();
			ui.transformationBox.validation(event);
		});
		
	});
};

/*ui.transformBox.closeLoadingMessage = function(){
	var box = $(".add-new-source-box");
	var loading_message = box.find('.loading-message');
	console.log('loading message'+loading_message.length);
	loading_message.css({'display':'none'});
};*/

