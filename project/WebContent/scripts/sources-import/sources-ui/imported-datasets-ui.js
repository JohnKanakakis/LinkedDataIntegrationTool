var ui = ui || {};

ui.importedDatasets = {
	div:{},
	tableArea:{}
};


ui.importedDatasets.init = function(){
    this.div = $('#imported-datasets');
};


ui.importedDatasets.displayDataset = function(dataset){
	
		var imported_datasets_table_area_class = "imported-datasets-table-area";
		var source_type = dataset.source_type;
		var source_name = dataset.source_name;
		var source_description = dataset.source_description;
		var type_of_import = dataset.type_of_import;
		var rows = dataset.rows;
		var related_file_name = dataset.related_file_name;
		
		var table = $('.imported-datasets-description-table');
		this.table = table;
		var imported_datasets_div = this.div;
		
		$("#imported-datasets").find("p.initial-message").css({'display':'none'});
		
		if (table.length == 0){ //create the table and the convert button 
			
			var button_area_class = "datasets-import-area";
			
			var button_area = $('<div>').addClass(button_area_class);
			var text = $('<div>').html('<p>Only the selected datasets will be included in the next steps.'+
						'The datasets which are not in RDF format will be converted to RDF.<p>'
									   )
			                     .css({'margin-bottom':'2px'});
			button_area.append(text);
			var importButton = $('<button>').css({'font-size':'small'});
			importButton.attr('type', 'button').attr('id','import-button');
		
			var label = 'Create Datasets';
			importButton.text(label);
			
			importButton.on('click', function(event) {
				event.preventDefault();
				ui.importedDatasets.collectSelectedFiles(imported_datasets_div);
			});
			
			button_area.append(importButton);
			imported_datasets_div.append(button_area);
			
		
			var imported_datasets_area = $('<div>').addClass(imported_datasets_table_area_class);
			this.tableArea = imported_datasets_area;
			imported_datasets_area.load("scripts/sources-import/sources-ui/imported-datasets.html .imported-datasets-description-table",function(){

				var row = imported_datasets_area.find('.imported-dataset-row');
				row.attr('related-file-name',related_file_name);
				
				var source_type_cell = imported_datasets_area.find('#source-type');
				var source_name_cell = imported_datasets_area.find('#source-name');
				var type_of_import_cell = imported_datasets_area.find('#type-of-import');
				var total_rows_cell = imported_datasets_area.find('#total-rows');
				
				
				//var rows_area = imported_source_area.find('#total-rows');
				//var filename_area = imported_source_area.find('#filename');
				
				source_type_cell.text(source_type);
				source_name_cell.text(source_name);
				type_of_import_cell.text(type_of_import);
				total_rows_cell.text(rows);
				//filename_area.text(filename);
				
				imported_datasets_div.append(this);
				
				
				$('.imported-datasets-description-table').on('click','#import-checkbox',function(event){
					ui.importedDatasets.selectRow(event);
				});
				
			});
		}else{//append another row
			
			var row_class = "imported-dataset-row";
			var cell_class = "imported-dataset-cell";
			var row = $('<tr>').addClass(row_class);
			row.attr('related-file-name',related_file_name);
			var cell_source_type = $('<td>').addClass(cell_class).attr("id","source-type");
			var cell_source_name = $('<td>').addClass(cell_class).attr("id","source-name").css({'text-align':'left'});
			var cell_rows = $('<td>').addClass(cell_class).attr("id","total-rows");
			var cell_type_of_import = $('<td>').addClass(cell_class).attr("id","type-of-import");
			//var cell_filename = $('<td>').addClass(cell_class).attr("id","filename");;
			var cell_datasetName = $('<td>').addClass(cell_class);
			var cell_import = $('<td>').addClass(cell_class).attr("id","imported-source-checkbox");
			
			cell_source_type.text(source_type);
			cell_source_name.text(source_name);
			cell_rows.text(rows);
			//cell_filename.text(filename);
			cell_datasetName.html('<input type="text" id="dataset-name" size="27"/>');
			cell_type_of_import.text(type_of_import);
			cell_import.html('<input type="checkbox" id="import-checkbox" class="import">');
			
			row.append(cell_datasetName);
			row.append(cell_source_type);
			row.append(cell_source_name);
			row.append(cell_type_of_import);
			row.append(cell_rows);
			//row.append(cell_filename);
			
			
			row.append(cell_import);
			
			table.append(row);
		}	
};

ui.importedDatasets.selectRow = function(event){
	var row = $(event.target).closest('tr.imported-dataset-row');
	if (!row.hasClass('selected')){
		row.addClass('selected');
	}else{
		row.removeClass('selected');
	}
};

ui.importedDatasets.deleteDatasetRow = function(name){
	
	var table = $('.imported-datasets-description-table');
	var rows = table.find('tr.imported-dataset-row');
	
	console.log("i want to delete "+name+ " and the rows are " +rows.length);
	for(var i = 0;i < rows.length; i++){
		var $row = $(rows[i]);
		var row_file_name = $row.attr("related-file-name");
		console.log(row_file_name);
		console.log(name);
		if (name == row_file_name){
			$row.remove();
			break;
		}
	}
	rows = table.find('tr.imported-dataset-row');
	console.log("i  deleted "+name+ " and the rows are " + rows.length);
	if (rows.length == 0){
		console.log('refresh');
		ui.importedDatasets.refresh();
	}
	
};

ui.importedDatasets.refresh = function(){
	
	var imported_datasets_div = $('#imported-datasets');
	var table_area = imported_datasets_div.find('.imported-datasets-table-area');
	var import_area = imported_datasets_div.find('.datasets-import-area'); 
	table_area.remove();
	import_area.remove();
	imported_datasets_div.find("p.initial-message").css({'display':'block'});
};

ui.importedDatasets.collectSelectedFiles = function(imported_datasets_div){
	
	var table = imported_datasets_div.find('.imported-datasets-description-table');
	var selected_rows = table.find('tr.selected');
	console.log(selected_rows.length);
	
	var proceedToFilesSending = true,
	    row,
		dataset_name,
		related_filename,
		filesToImport = [];
	if (selected_rows.length == 0){
		alert('You must select at least one dataset.');
		proceedToFilesSending = false;
	}else{
		for (var i = 0; i < selected_rows.length; i++){
			row = $(selected_rows[i]);
			related_filename = row.attr("related-file-name");
			dataset_name = row.find('input[type=text]#dataset-name').val();
			if (dataset_name == ''){
				alert('You must specify a valid dataset name for every selected file.');
				proceedToFilesSending = false;
				break;
			}
			console.log('filename= '+ related_filename);
			console.log('dataset name = '+ dataset_name);
			filesToImport[i] = {
					filename:related_filename,
					graph_name:dataset_name
			};
		};
	}
	
	
	if (proceedToFilesSending){
		
	    	//this.tableArea.addClass('importing');
	    	this.addImportingState();
	    	this.div.find('button#import-button').css({'opacity':0.5}).off('click');
		controller.sendSelectedFiles(filesToImport);
		
	}
};

ui.importedDatasets.prepareForNextStep = function(data){
    	
    	this.tableArea.removeClass('loading');
    	controller.proceedToSchemaMappingPhase();
};

ui.importedDatasets.addImportingState = function(){
    	var self = this;
    	var importingStateDiv = $('<div>').attr('id','importing-state');
    	self.tableArea.css('opacity',0.5);
    	importingStateDiv.appendTo(self.div);
};

ui.importedDatasets.removeImportingState = function(){
    
    	var self = this;
    	//self.tableArea.removeClass('importing');
    	self.div.find("#importing-state").remove();
    	self.tableArea.css('opacity',1);
	self.div.find('button#import-button').css({'opacity':1}).on('click',function(){
	    event.preventDefault();
	    ui.importedDatasets.collectSelectedFiles(self.div);
	});
};
/*ui.importedDatasets.closeLoadingMessage = function(){
    $("#imported-datasets").find(".importing-message").remove();
};*/