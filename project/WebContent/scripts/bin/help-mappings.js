/************************************************ class mapping pair *******************************************************/

panel.mappingsArea.classMapping.addMappingPair = function(){
	
	var box = null;
	
	var initTargetTermHTML = "Type the target class and click OK.<br><input type='text' id='target-term-text' size='50'>"+
	 "<button type='button' class='submit-target-term-button' style='position:relative;margin:0px;left:10px;'"+
	 "title='Click to submit the info'>OK</button>";
	//panel.mappingsArea.propertyMapping.addMappingPair(panel.mappingsArea.classLayoutURI);
	
	box = $('<div>').addClass('mapping-box class-mapping-box').load(panel.mappingsArea.classLayoutURI,
	      function(){
				$('.map-boxes-area').prepend(box);
				box.on("click",".close-icon",function(event){
					panel.mappingsArea.deleteMappingBox(event);
				});
				box.on("click",".add-target-icon",function(event){
					addTargetTermArea(event);
				});
				var droppableArea = box.find(".droppable-area" );
				droppableArea.droppable({
					  accept: ".class-box",
					  drop: function( event, ui ) {
						  	var closest_tr = $(event.target).closest('tr');
						    var sourcePattern = closest_tr.find('.source-pattern');
						    var td =  closest_tr.find('td');
						    td.find('div.source-term-cell-content').remove();
						    if (sourcePattern.length == 0){
						    	panel.mappingsArea.classMapping.addSourcePattern(box,droppableArea,ui.helper.text());
						    }else{
								if (sourcePattern.text() != ui.helper.text()){
									 alert('You are trying to override a current source term.'+
										   'Please add a new source term.');
								}
							}
				      }
				});
				mapping_id = mappingsManager.addClassMappingPair();
				box.attr('mapping-id',mapping_id);
	      });
	
	function addTargetTermArea(event){
		event.preventDefault();
		//var correctMappingPair = mappingsManager.checkCorrectionOfMappings(box.attr('mapping-id'));
		/*if (!correctMappingPair){
			alert('Many to many mapping is forbidden');
			return;
		}*/
		//box.attr('target-terms',numberOfTargetTerms);
		var table = box.find('.target-terms-table');
		var tr = $('<tr>').html("<td class='target-term-cell'><div class='target-pattern'>"+// term-number="+numberOfTargetTerms+">"+
								initTargetTermHTML+"</div></td>");
		table.prepend(tr);
		tr.on('click','.submit-target-term-button',function(event){
    		event.preventDefault();//alert('ok!!');
    		panel.mappingsArea.classMapping.addTargetPattern(box,event);
    	});
	};
};

panel.mappingsArea.classMapping.addSourcePattern = function(box,droppableArea,text){
	
	droppableArea.find('p').remove();
	var mapping_id = box.attr('mapping-id');
	var result = mappingsManager.addSourcePatternToClassPair(mapping_id,text,true,'class');
	var sourcePatternText = result.sourcePatternLabel;
	var pattern_id = result.pattern_id;
	
	var options = {
			box:box,
			includeDeleteIcon:false,
			includeViewIcon:true,
			onFinishEditingPattern: function(event){
				if (event.keyCode == 13){
					var patternText = $(event.target).val();console.log(patternText);
					var closestBox = this.box;
					var mapping_id = closestBox.attr('mapping-id');
					//mappingsManager.updateSourcePatternOfPropertyPair(mapping_id,0,patternText,false);
					mappingsManager.updateSourcePatternOfClassPair(mapping_id,patternText,false);
					console.log('map id = '+mapping_id);
				}	
			},
			onViewClick:function(event){
				panel.mappingsArea.fetchDataForPattern(event);
			},
			/*onInit:function(){
				var mapping_id = mappingsManager.addClassMappingPair();
				console.log("map id on init "+mapping_id);
				
				//mappingsManager.updateSourcePattern(mapping_id,sourcePatternText);
				this.box.attr('mapping-id',mapping_id);
				//panel.mappingsArea.classMapping.displayTargetPatternTemplate(this.box);
			},*/
	};
	var sourcePattern = new panel.mappingsArea.Pattern(sourcePatternText,options);
	var div = sourcePattern.getPatternDiv();
	div.addClass('source-pattern').attr({
		'related-source-pattern':sourcePatternText,
		'pattern-id':pattern_id
	});
	droppableArea.append(div);
	
	/*droppableArea.find('p').remove();
	droppableArea.find('.source-pattern').css({'display':'block'})
				 .html('<p>'+sourcePattern+ '<img class="delete-source-pattern-icon"' +
					   'src="img/cross.png" width="16px" height="16px" style="float:right;cursor:pointer"></p>');
	*/
	
};

panel.mappingsArea.classMapping.addTargetPattern = function(box,event){
	
	
	var mapping_id = box.attr('mapping-id');
	var targetTerm = $(event.target).siblings('#target-term-text').val();
	var td = $(event.target).closest('td');
	
	var div = $(event.target).closest('div.target-pattern');
	
	var result = mappingsManager.addTargetPatternToClassPair(mapping_id,targetTerm,true,'class');
	
	var targetPatternText = result.targetPatternLabel;
	var pattern_id = result.pattern_id;
	console.log('before acivate target pattern '+targetPatternText);
	div.remove();
	var options = {
			box:box,
			includeDeleteIcon:true,
			includeTransformIcon:true,
			onFinishEditingPattern: function(event){
				if(event.keyCode == 13){
					var mapping_id = this.box.attr('mapping-id');
					var targetPatternDiv = $(event.target).parent().closest('div.target-pattern');
					var pattern_id = targetPatternDiv.attr('pattern-id');
					mappingsManager.updateTargetPatternOfClassPair(mapping_id,pattern_id,
																	$(event.target).val(),false);
					
					targetPatternDiv.attr({
						'related-target-pattern':$(event.target).val(),
						//'pattern-id':result.pattern_id
					});
					
				}
			},
			onTransformClick:function(event){
				ui.transformationBox.open(event);
			},
			onDelete:function(event){
				var targetPatternDiv = $(event.target).parent().closest('div.target-pattern');
				var targetPatternText = targetPatternDiv.attr('related-target-pattern');
				var pattern_id = targetPatternDiv.attr('pattern-id');
				console.log(' going to delete target pattern with text '+targetPatternText);
				var result = mappingsManager.deleteTargetPatternFromClassPair(box.attr('mapping-id'),
																				 pattern_id);
				$(event.target).closest('tr').remove();
				
				//panel.mappingsArea.propertyMapping.addMappingPair.numberOfSourceTerms--;
			}
	};
	
	var targetPattern = new panel.mappingsArea.Pattern(targetPatternText,options);
	var targetDiv = targetPattern.getPatternDiv();
	targetDiv.addClass('target-pattern')
			 .attr({
				 'related-target-pattern':targetPatternText,
				 'pattern-id':pattern_id
			 })
			 .css({'display':'block'});
	targetPattern.getPatternDiv().appendTo(td);
	
	
	/*var initTargetTermHTML = "Type the target class and click OK.<br><input type='text' id='target-term-text' size='50'>"+
	 "<button type='button' class='submit-target-term-button' style='position:relative;margin:0px;left:10px;'"+
	 "title='Click to submit the info'>OK</button>";
	
	var table = box.find('.target-terms-table');
	var tr = $('<tr>').html("<td class='target-term-cell'><div class='target-term-cell-content'>"+
							initTargetTermHTML+"</div></td>");
	table.prepend(tr);
	tr.on('click','.submit-target-term-button',function(event){
		event.preventDefault();
		submitTargetTerm(box,event);
	});
	function submitTargetTerm(box,event){
		
		var mapping_id = box.attr('mapping-id');
		var targetTerm = $(event.target).siblings('#target-term-text').val();
		var div = $(event.target).closest('div');
		
		var targetPattern = '?SUBJ'+ ' ' + 'rdf:type' + ' '+ targetTerm;
		mappingsManager.addTargetPatternToClassPair(mapping_id,targetPattern);
		
		*//**************************** ADD PREFIX NOT FOUND DIALOG **************************************//*
		if(!prefix_found){
			panel.mappingsArea.displayPrefixDialog();
			return;
		}
		div.attr('related-target-pattern',targetPattern);
		
		div.fadeOut(500,function(){
			div.html("<p>"+ targetPattern +
					"<img class='back-icon' src='img/back-icon.png' width='20px' height='20px'></p>");
		});
		div.fadeIn(500);
		div.on('click','.back-icon',function(event){
			event.preventDefault();
			
			div.fadeOut(500,function(){
				div.html(initTargetTermHTML);
			});
			div.fadeIn(500);
			div.off('click','.back-icon');
		});
	}*/
};


/************************************************ property mapping pair ******************************************************/


panel.mappingsArea.propertyMapping.addMappingPair = function(htmlPage){
	
	if(!htmlPage){
		htmlPage = panel.mappingsArea.propertyLayoutURI;
	}
	var initTargetTermHTML = "Type the target term and click OK.<br><input type='text' id='target-term-text' size='50'>"+
    						 "<button type='button' class='submit-target-term-button' style='position:relative;margin:0px;left:10px;'"+
    						 "title='Click to submit the info'>OK</button>";
	
	var box = null;
	var mapping_id = null;
	
	box = $('<div>').addClass('mapping-box property-mapping-box').load(htmlPage,function(){
		$('.map-boxes-area').prepend(box);

		box.on("click",".close-icon",function(event){
				panel.mappingsArea.deleteMappingBox(event);
		});
		
		box.on("click",".add-source-icon",function(event){
				addSourceTermArea();
		});

		box.on("click",".add-target-icon",function(event){
				addTargetTermArea(event);
		});
		
		mapping_id = mappingsManager.addPropertyMappingPair();
		box.attr('mapping-id',mapping_id);
	});
	
	/*function correctMappingPattern(){
		
		if (numberOfSourceTerms > 1 && numberOfTargetTerms > 1){
			return false;
		}
		return true;
	}*/
	
	function addTargetTermArea(event){
		event.preventDefault();
		var correctMappingPair = mappingsManager.checkCorrectionOfMappings(box.attr('mapping-id'));
		if (!correctMappingPair){
			alert('Many to many property mapping is forbidden');
			return;
		}
		//box.attr('target-terms',numberOfTargetTerms);
		var table = box.find('.target-terms-table');
		var tr = $('<tr>').html("<td class='target-term-cell'><div class='target-pattern'>"+// term-number="+numberOfTargetTerms+">"+
								initTargetTermHTML+"</div></td>");
		table.prepend(tr);
		tr.on('click','.submit-target-term-button',function(event){
    		event.preventDefault();
    		panel.mappingsArea.propertyMapping.addTargetPattern(box,event);
    	});
	};
	
	function addSourceTermArea(){	
		var correctMappingPair = mappingsManager.checkCorrectionOfMappings(box.attr('mapping-id'));
		if (!correctMappingPair){
			alert('Many to many property mapping is forbidden');
			return;
		}
		var table = box.find('.source-terms-table');
		var tr = $('<tr>').html("<td class='source-term-cell'><div class='source-term-cell-content'>" +
				 				"Drag here the vocabulary term you want from the Properties Section.<br></div></td>")
				 		  ;//.attr('term-number',numberOfSourceTerms);
				 			
		table.prepend(tr);
		tr.droppable({
			  accept: ".property-box",
			  drop: function(event, ui) {
				    var closest_tr = $(event.target).closest('tr');
				    var sourcePattern = closest_tr.find('.source-pattern');
				    var td =  closest_tr.find('td');
				    var mappingType = '';
				    console.log('classes of ui helper '+ui.helper.attr('class'));
				    if(ui.helper.hasClass('property-box')){
				    	mappingType = 'property';
				    }else if(ui.helper.hasClass('class-box')){
				    	mappingType = 'class';
				    }
				    td.find('div.source-term-cell-content').remove();
				    
				    if (sourcePattern.length == 0){
				    	//box.attr('source-terms',numberOfSourceTerms);
				    	panel.mappingsArea.propertyMapping.addSourcePattern(box,tr,ui.helper.text(),mappingType);
				    }else{
						if (sourcePattern.text() != ui.helper.text()){
							 alert('You are trying to override a current source term.'+
								   'Please add a new source term.');
						}
					}
		      }
		});
	};
};


panel.mappingsArea.propertyMapping.addSourcePattern = function(box,droppableArea,text,mappingType){

	droppableArea.find('p').remove();
	var mapping_id = box.attr('mapping-id');
	var result = mappingsManager.addSourcePatternToPropertyPair(mapping_id,text,true,mappingType);
	var sourcePatternText = result.sourcePatternLabel;
	var pattern_id = result.pattern_id;
	console.log("pat id = "+pattern_id);
	var options = {
			box:box,
			includeDeleteIcon:true,
			includeViewIcon:true,
			onFinishEditingPattern: function(event){
				if(event.keyCode == 13){
					var mapping_id = this.box.attr('mapping-id');
					var sourcePatternDiv = $(event.target).parent().closest('.source-pattern');
					var pattern_id = sourcePatternDiv.attr('pattern-id');
					mappingsManager.updateSourcePatternOfPropertyPair(mapping_id,pattern_id,
																	   $(event.target).val(),false);
					
					sourcePatternDiv.attr({
						'related-source-pattern':$(event.target).val(),
					});
				}
			},
			onViewClick:function(event){
				panel.mappingsArea.fetchDataForPattern(event);
			},
			onDelete:function(event){
				var sourcePatternDiv = $(event.target).parent().closest('.source-pattern');
				var sourcePatternText = sourcePatternDiv.attr('related-source-pattern');
				var pattern_id = sourcePatternDiv.attr('pattern-id');
				console.log(' delete pattern id ' +pattern_id);
				console.log(' going to delete source pattern with text '+sourcePatternText);
				var result = mappingsManager.deleteSourcePatternFromPropertyPair(box.attr('mapping-id'),
																				 pattern_id);
				$(event.target).closest('tr').remove();
			}
	};
	
	var sourcePattern = new panel.mappingsArea.Pattern(sourcePatternText,options);
	var div = sourcePattern.getPatternDiv();
	div.addClass('source-pattern').attr({
		'related-source-pattern':sourcePatternText,
		'pattern-id':pattern_id
	});
	droppableArea.find('td').append(div);
	
	
	
	
	
	/*var mapping_id = box.attr('mapping-id');
	var result = mappingsManager.addSourcePatternToPropertyPair(mapping_id,text);
	var sourcePattern = result.sourcePatternLabel;
	
	droppableArea.find('div.source-pattern').css({'display':'block'})
	 			 .html('<p>'+sourcePattern+ '<img class="delete-source-pattern-icon"' +
		               'src="img/cross.png" width="16px" height="16px" '+
		               'style="float:right;cursor:pointer"></p>')
		         .attr('related-source-pattern',sourcePattern);
	
	if(result.targetPatternLabel!=''){
		box.find('div.target-pattern').html("<p>"+ result.targetPatternLabel +
				"<img class='delete-target-pattern-icon' src='img/cross.png' width='16px' height='16px'"+
				"style='float:right;cursor:pointer'>"+
				"<img class='transform-icon' src='img/transform-icon.png' width='20px' height='20px'"+ 
				"title='Click to add a transformation'></p>")
				.attr('related-target-pattern',result.targetPatternLabel);
	}
	console.log('new map id = '+mapping_id);
	console.log('added '+sourcePattern);*/
};

panel.mappingsArea.propertyMapping.addTargetPattern = function(box,event){
	
	var mapping_id = box.attr('mapping-id');
	var targetTerm = $(event.target).siblings('#target-term-text').val();
	var td = $(event.target).closest('td');
	
	var div = $(event.target).closest('div.target-pattern');
	
	var result = mappingsManager.addTargetPatternToPropertyPair(mapping_id,targetTerm,true,'property');
	
	var targetPatternText = result.targetPatternLabel;
	var pattern_id = result.pattern_id;
	console.log('before acivate target pattern '+targetPatternText);
	
	
	div.remove();
	
	
	var options = {
			box:box,
			includeDeleteIcon:true,
			includeTransformIcon:true,
			onFinishEditingPattern: function(event){
				if(event.keyCode == 13){
					var mapping_id = this.box.attr('mapping-id');
					var targetPatternDiv = $(event.target).parent().closest('div.target-pattern');
					var pattern_id = targetPatternDiv.attr('pattern-id');
					mappingsManager.updateTargetPatternOfPropertyPair(mapping_id,pattern_id,
																				$(event.target).val(),false);
					
					targetPatternDiv.attr({
						'related-target-pattern':$(event.target).val(),
						//'pattern-id':result.pattern_id
					});
					
				}
			},
			onTransformClick:function(event){
				ui.transformationBox.open(event);
			},
			onDelete:function(event){
				var targetPatternDiv = $(event.target).parent().closest('div.target-pattern');
				var targetPatternText = targetPatternDiv.attr('related-target-pattern');
				var pattern_id = targetPatternDiv.attr('pattern-id');
				console.log(' going to delete target pattern with text '+targetPatternText);
				var result = mappingsManager.deleteTargetPatternFromPropertyPair(box.attr('mapping-id'),
																				 pattern_id);
				$(event.target).closest('tr').remove();
				
				//panel.mappingsArea.propertyMapping.addMappingPair.numberOfSourceTerms--;
			}
	};
	
	var targetPattern = new panel.mappingsArea.Pattern(targetPatternText,options);
	var targetDiv = targetPattern.getPatternDiv();
	targetDiv.addClass('target-pattern')
			 .attr({
				 'related-target-pattern':targetPatternText,
				 'pattern-id':pattern_id
			 })
			 .css({'display':'block'});
	targetPattern.getPatternDiv().appendTo(td);
	/*if(result.sourcePatternLabel!=''){
		box.find('div.source-pattern')
		   .html('<p>'+result.sourcePatternLabel+ '<img class="delete-source-pattern-icon"' +
	             'src="img/cross.png" width="16px" height="16px" '+
        	     'style="float:right;cursor:pointer"></p>')
           .attr('related-source-pattern',result.sourcePatternLabel);
	}*/
	
	
	
	/*div.fadeOut(500,function(){
		div.html("<p>"+ targetPattern +
				"<img class='delete-target-pattern-icon' src='img/cross.png' width='16px' height='16px'"+
				"style='float:right;cursor:pointer'>"+
				"<img class='transform-icon' src='img/transform-icon.png' width='20px' height='20px'"+ 
				"title='Click to add a transformation'></p>");
	});
	div.fadeIn(500);*/
};


panel.mappingsArea.deleteMappingBox = function(event){
	
	event.preventDefault();
	var mappingBox = $(event.target).closest('.mapping-box');
	var id = mappingBox.attr('mapping-id');
	console.log('send id  = '+id+' to manager');
	var delete_ok = false;
	if (mappingBox.hasClass('property-mapping-box')){
		console.log('property to delete');
		delete_ok = mappingsManager.deletePropertyMappingPair(id);
	}else{
		delete_ok = mappingsManager.deleteClassMappingPair(id);
	}
	console.log(delete_ok);
	if (delete_ok){
		mappingBox.remove();
	}else{	
		var sourcePattern = mappingBox.find('.source-pattern');
		if (sourcePattern.length == 0){
			mappingBox.remove();
		}else{
			alert('An error occured');
		}
	}
};


panel.mappingsArea.Pattern = function(text,options){
	
	var _defaults = {
			includeDeleteIcon:false,
			includeEditIcon:false,
			includeTransformationIcon:false,
			onInit:function(){},
			onEditClick:function(event){},
			onFinishEditingPattern:function(event){},
			onDelete:function(event){},
			onTransformClick:function(event){},
			onViewClick:function(event){}
	};
	
	var _options = $.extend(true, {}, _defaults, options);

	
	var patternDiv = $('<div>').addClass('pattern').addClass(options.mainDivClass);
	var textDiv = $('<div>').addClass('pattern-text-area');
	var iconsDiv = $('<div>').addClass('pattern-icons-area');
	
	_options.onInit();
	initPatternState(text);
	
	if(_options.includeDeleteIcon){
		var deleteIcon = $('<img>').addClass('pattern-icon delete-pattern-icon')
								   .attr('src','img/cross.png')
								   .css({
									   'width':'16px',
									   'height':'16px'
								   });
										
		deleteIcon.appendTo(iconsDiv);
	}
	$('<span>').addClass('edit-span')
			   .text('edit')	
		  	   .appendTo(iconsDiv);
	
	if (_options.includeTransformIcon){
		var transformIcon = $('<img>').addClass('pattern-icon transform-pattern-icon')
		   .attr('src','img/transform-icon.png')
		   .css({
			   'width':'16px',
			   'height':'16px'
		   });
				
		transformIcon.appendTo(iconsDiv);
	}
	
	if(_options.includeViewIcon){
		var viewIcon = $('<img>').addClass('pattern-icon view-data-pattern-icon')
		   .attr('src','img/view-icon.gif')
		   .css({
			   'width':'16px',
			   'height':'16px'
		   });
				
		viewIcon.appendTo(iconsDiv);
	}
	
	patternDiv.on("click",".view-data-pattern-icon",function(event){
		_options.onViewClick(event);
	});
	
	patternDiv.on("click",".transform-pattern-icon",function(event){
		_options.onTransformClick(event);
	});
	patternDiv.on("click",".delete-pattern-icon",function(event){
		_options.onDelete(event);
		$(event.target).closest('.pattern').remove();
	});
	patternDiv.on("click",".edit-span",function(event){
		
		var targetTextDiv = $(event.target).parent().siblings('.pattern-text-area');
		var inputText = targetTextDiv.find('input[type=text]');
		if(inputText.length == 0){
			_options.onEditClick(event);
			var oldText = targetTextDiv.text();
			targetTextDiv.empty();
			inputText = $('<input>').attr({
										'type':'text',
										'size':'50'
									})
									.addClass('pattern-input-text')
									.val(oldText)
									.appendTo(targetTextDiv);
			
		}
	});
	patternDiv.on("keypress",".pattern-input-text",function(event){
		
		_options.onFinishEditingPattern(event);
		if(event.keyCode == 13){
			initPatternState($(this).val());
		}
	});
	
	patternDiv.append(textDiv).append(iconsDiv);
	
	function initPatternState(newText){
		textDiv.text(newText);
	};
	
	this.getPattern = function(){
		return textDiv.text();
	};
	
	this.getPatternDiv = function(){
		patternDiv.css({'display':'block'});
		return patternDiv;
	};
};

/*
 * <!-- <table class='mapping-box-table'>
	<tr>
		<td class='source-term-area'>
				<table class='mapping-table'>
					<tr>
						<td class='mapping-table-header'> Source Pattern 
						</td>
					</tr>
					<tr>
						<td style="height:100px;overflow:auto">
							<div class='main-cell-content'>
								<table class="source-terms-table">
									<tr>
										<td class='source-term-cell droppable-area'>
											<div class='source-term-cell-content'>
												Drag here the class you want from the Classes Section
											</div>
										</td>
									</tr>	
								</table>
							</div>
						</td>
					</tr>
     			</table>
		</td>
		<td class='target-term-area'>
				<table class='mapping-table'>
					<tr>
						<td class='mapping-table-header'> Target Pattern/Patterns
						<img class='add-target-icon'src='img/plus.png' width="20" height="20" 
							     style="float:right;cursor:pointer;"title="Click to add a new term">  
						</td>
					</tr>
					<tr>
						<td style="height:100px;overflow:auto">
							<div class='main-cell-content'>
								<table class="target-terms-table">	
								</table>
							</div>
						</td>
					</tr>
       			</table>
		</td>
	</tr>
</table> -->
<!-- <td class='source-pattern-area'>
				<table class='mapping-table'>
					<tr>
						<td class='mapping-table-header'> Source Pattern 
						</td>
					</tr>
					<tr>
						<td style="height:100px;overflow:auto">
							<div class='main-cell-content'>
								<table class="source-terms-table">
									<tr>
										<td class='source-term-cell droppable-area'>
											<div class='source-term-cell-content'>
												Drag here the class you want from the Classes Section
											</div>
										</td>
									</tr>
								</table>
								
							</div>
							
						</td>
					</tr>
       			</table>
		</td> -->
 * */
