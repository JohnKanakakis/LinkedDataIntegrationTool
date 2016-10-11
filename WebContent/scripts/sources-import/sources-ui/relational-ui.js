var ui = ui || {};

ui.sources_preview = ui.sources_preview || {};
ui.sources_preview.relational = {};

ui.sources_preview.relational.addConnectionTab = function(data,options) {

	var relational_panel_class = 'relational-panel';
	
	var tablesTabArea = $('<div>').addClass('database-metadata');
	
	var metadata_menu = ui.sources_preview.relational.constructMetadataTreeView(data);
	
	tablesTabArea.append(metadata_menu);

	var relational_panel = $('<div>').addClass(relational_panel_class).attr("related-connection",options.connection.id);
	relational_panel.load('scripts/sources-import/sources-ui/database-connection-panel.html',function(){
		
		var db_conn_info_row = $(this).find('tr.database-connection-info-table-row'); 
		db_conn_info_row.find('#connection-url').text(options.URL);
		db_conn_info_row.find('#schema').text(options.schema);
		db_conn_info_row.find('#username').text(options.username);
		db_conn_info_row.find('#password').text(options.password);
		
		var openQueryEditor = relational_panel.find('#open-query-editor');
		
		openQueryEditor.on('click', function(event) {
			event.preventDefault();
			//var query_editor_box = $('.query-editor-box');
			//var button = $(event.target).closest('#query-editor-button');
			//var ralational_panel = button.closest('div.relational-panel');
			var conn_id = $(event.target).parent().closest('div.relational-panel').attr("related-connection");
			console.log(conn_id);
			ui.query_editor.open(conn_id);
		});
		
		var metadata_info_area = $(this).find('div.metadata-info');
		metadata_info_area.append(tablesTabArea);
		
		if (!(typeof options.connection === "undefined")){ //add existed queries to queries-panel
			var queries_of_connection = options.connection.queries;
			for(var i = 0;i < queries_of_connection.length; i++){
				var query_value = queries_of_connection[i].value;
				console.log(query_value);
				ui.sources_preview.relational.addQueryInfoToQueryInfoArea(query_value);
			}
		}
		
	});
	options.tab_category = "database-connection";
	var id = ui.sources_preview.addTab(relational_panel,options,true);  
	return id;
};




/*ui.sources_preview.file.queryResultsProcessDisplay = function(data,options){
	
	var columns = [];

	for (var key in data[0]) {
		console.log(key);
		var col = {
			id : key,
			name : key,
			field : key
		};
		columns.push(col);
	}

	var container = $('<div>').addClass('grid-container-class').css({'font-size':'small'});

	var grid_options = {
			enableCellNavigation : true,
			enableColumnReorder : false,
			explicitInitialization: true,
			autoHeight:false
	};

	var slickgrid = new Slick.Grid(container, data, columns, grid_options);

	var query_area = $('<div>').css({'font-size':'small'});

	query_area.text("Your query : " + options.query); 

	var results_area = $('<div>').css({'position':'absolute','top':'0px','left':'0px','right':'0px','bottom':'0px'});

	results_area.append(query_area);
	results_area.append(container);
	
	
	var tab_id = ui.sources_preview.addTab(results_area,options,false);
	slickgrid.init();
	$('.grid-container-class').css({'overflow-y':'auto','overflow-x':'hidden'});
	
	return tab_id;
};*/


ui.sources_preview.relational.addQueryInfoToQueryInfoArea = function(query){
	
	var query_info_area = $('.queries-info');
	
	var query_info_container_class = 'query-info-container';
	var query_info_box_class = 'query-info-box';
	
	var query_info_box = $('<div>').addClass(query_info_box_class);
	query_info_box.text(query);
	
	
	var query_info_container =  $('<div>').addClass(query_info_container_class);
	var view_query_data_button_area = $('<div class="view-query-data-button-area">'+
									   '<button type="button" class="view-query-data-button">View data</button>'+
									   /*'<button type="button" class="delete-query-data-button">Delete related results</button>'+*/
									   '</div>');
	
	query_info_container.append(query_info_box);
	query_info_container.append(view_query_data_button_area);
	query_info_area.append(query_info_container);
	
	view_query_data_button_area.on('click','.view-query-data-button',function(event){
		event.preventDefault();
		console.log('event target is ' + event.target.nodeName);
		var query_container = $(event.target).closest('div.query-info-container');
		var query = $(query_container.children()[0]).text();
		console.log(query);
		ui.sources_preview.relational.displayQuery(query);
		
	});
	view_query_data_button_area.on('click','.delete-query-data-button',function(event){
		event.preventDefault();
		console.log('event target is ' + event.target.nodeName);
		var query_container = $(event.target).closest('div.query-info-container');
		var query = $(query_container.children()[0]).text();
		console.log(query);
		ui.sources_preview.relational.deleteQuery(query);
		query_container.remove();
	});
};

ui.sources_preview.relational.displayQuery = function(query){
	var connection_id = $('.relational-panel').attr("related-connection");
	
	var connection = controller.findConnectionById(connection_id);
	
	var query_object = controller.findQuery(connection,query);
	
	var dataset = controller.findFileByName(query_object.related_file_name);
	
	var options = {
			query:query,
			label:"query data",
			tab_class:"query-data-tab"
	};
	ui.sources_preview.queryResultsProcessDisplay(dataset,options);
};

ui.sources_preview.relational.deleteQuery = function(query){
	
	var connection_id = $('.relational-panel').attr("related-connection");
	var connection = controller.findConnectionById(connection_id);
	var deleteResult = controller.deleteQuery(connection,query);
	if (deleteResult.deleteSucceeded){
		ui.importedDatasets.deleteDatasetRow(deleteResult.filename);
		var filenames = [];
		filenames.push(deleteResult.filename);
		source.deleteRelatedFiles(filenames);
	}
};



ui.sources_preview.relational.constructMetadataTreeView = function(data){
	
	var metadata_menu = $('<ul>').attr({'id':'metadata-menu','class':'filetree'}).css({'position':'relative','top':'5px'});

	var tables_span_template = $('<span>')
								   .html(
										'<table>'+
											'<tr>'+
												'<td>'+
													'<img src="externals/jquery.treeview/images/db-table-icon.jpg" style="height:25px;width:25px">'+
												'</td>'+
												'<td>'+
													'Tables'+
												'</td>'+
											'</tr>'+
										'</table>'
								   );
	var views_span_template = $('<span>')
	   .html(
			'<table>'+
				'<tr>'+
					'<td>'+
						'<img src="externals/jquery.treeview/images/db-table-icon.jpg" style="height:25px;width:25px">'+
					'</td>'+
					'<td>'+
						'Views'+
					'</td>'+
				'</tr>'+
			'</table>'
	   );
	
	var tables_section = $('<li>').html(tables_span_template).append('<ul></ul>');

	var views_section = $('<li>').html(views_span_template).append('<ul></ul>');


	
	
	var tables_section_ul = tables_section.find('ul');
	var views_section_ul = views_section.find('ul');
		

	
	for ( var i = 0; i < data.length; i++) {

		var table_li = $('<li>').html('<span>'+
										'<table>'+
										'<tr>'+
											'<td>'+
												'<img src="externals/jquery.treeview/images/db-table-icon.jpg" style="height:25px;width:25px">'+
											'</td>'+
											'<td>'+
												data[i].name +
											'</td>'+
										'</tr>'+
									'</table>'+
								  '</span>'
							 	)
							 	.append('<ul></ul>');
	
		

		var table_ul = table_li.find('ul');
		
		if (data[i].primaryKeys.length > 0){
			table_li.appendTo(tables_section_ul);
			
			var primary_keys = $('<li>').html('<span>'+
												'<table>'+
													'<tr>'+
														'<td>'+
															'<img src="externals/jquery.treeview/images/db-key-icon.jpg" style="height:25px;width:25px;background:black">'+
														'</td>'+
														'<td>'+
															'Primary keys'+
														'</td>'+
													'</tr>'+
												'</table>'+
											  '</span>'
										 ).append('<ul></ul>');
			
			var primary_keys_ul = primary_keys.find('ul');
			var primary_key_li = null;
			
			for(var j = 0; j < data[i].primaryKeys.length; j++) {
				primary_key_li = $('<li>').html('<span>'+ 
													'<table>'+
														'<tr>'+
															'<td>'+ data[i].primaryKeys[j].pk +
															'</td>'+
														'</tr>'+
													'</table>' +
												'</span>'
										   );
				primary_key_li.appendTo(primary_keys_ul);
			}
			primary_keys.appendTo(table_ul);
			
			
			var foreign_keys = $('<li>').html('<span>'+
													'<table>'+
													'<tr>'+
														'<td>'+
															'<img src="externals/jquery.treeview/images/db-for-key-icon.jpg" style="height:25px;width:25px">'+
														'</td>'+
														'<td>'+
															'Foreign keys'+
														'</td>'+
													'</tr>'+
												'</table>'+
											  '</span>'
										 ).append('<ul></ul>');
			
			var foreign_keys_ul = foreign_keys.find('ul');
			var foreign_key_li = null;
			
			for(var j = 0; j < data[i].foreignKeys.length; j++) {
				foreign_key_li = $('<li>').html('<span>'+ 
													'<table>'+
														'<tr>'+
															'<td>'+ data[i].foreignKeys[j].fk_name +
															'</td>'+
														'</tr>'+
													'</table>' +
												'</span>'
										   )
										   .append('<ul></ul>');
				for_key_ul = foreign_key_li.find('ul');
				
				var for_key_col_li = $('<li>').html('<span>'+ 
															'<table>'+
															'<tr>'+
																'<td style="min-width:50px;max-height:30px">'+  'Column name:' +
																'</td>' +
																'<td>'+ data[i].foreignKeys[j].fk_column +
																'</td>'+
															'</tr>'+
														'</table>' +
													'</span>'
												);
				var ref_table_li = $('<li>').html('<span>'+ 
														'<table>'+
														'<tr>'+
															'<td style="min-width:50px;max-height:30px">'+ 'Reference table: '+
															'</td>' +
															'<td>'+ data[i].foreignKeys[j].fk_ref_table +
															'</td>'+
														'</tr>'+
													'</table>' +
												'</span>'
											);
				for_key_col_li.appendTo(for_key_ul);
				ref_table_li.appendTo(for_key_ul);
				
				foreign_key_li.appendTo(foreign_keys_ul);
			}
			foreign_keys.appendTo(table_ul);
			
			
			
		}
		else{
			table_li.appendTo(views_section_ul);
		}
		
		var columns = $('<li>').html('<span>'+
											'<table>'+
											'<tr>'+
												'<td>'+
													'<img src="externals/jquery.treeview/images/db-col-icon.jpg" style="height:25px;width:25px">'+
												'</td>'+
												'<td>'+
													'Columns'+
												'</td>'+
											'</tr>'+
										'</table>'+
									  '</span>'
								).append('<ul></ul>');
		var columns_ul = columns.find('ul');
		
		columns.appendTo(table_ul);
		
		var column_li = null;
		for(var j = 0; j < data[i].columns.length; j++){
			column_li = $('<li>').html('<span>'+
											'<table>'+
												'<tr>'+
													'<td>' +data[i].columns[j].name + '/' + data[i].columns[j].dataType +	
													'</td>'+
												'</tr>'+
											'</table>' + 
										'</span>');
			column_li.appendTo(columns_ul);
		}
		columns.append('</ul>');
		
	};
	tables_section.append('</ul>');
	views_section.append('</ul>');
	metadata_menu.append(tables_section).append(views_section);
	metadata_menu.treeview({collapsed: true});
	
	return metadata_menu;
};



/*var tables_area = "tables-area";
var table_name_area = "table-name-area";
var metadata_table_area = "metadata-table-area";
var metadata_table = "metadata-table";
var metadata_table_header_row_class = "metadata-table-header-row";
var metadata_row_class = "metadata-row";
var metadata_cell_class = "metadata-cell";*/

/*		var tableArea = $("<div>").addClass(tables_area);

		var tableNameArea = $("<div>").addClass(table_name_area);*/

/*tableArea.append(tableNameArea);

var tablePrimKeyArea = $("<div>").addClass(metadata_table_area);
var tablePrimKey = $("<table>").addClass(metadata_table);
var headerRow = $("<tr>").addClass(metadata_table_header_row_class);
var headerCell = $("<td>").addClass(metadata_cell_class);
headerCell.text("Primary Key");
headerRow.append(headerCell);
tablePrimKey.append(headerRow);
for (var j = 0; j < data[i].primaryKeys.length; j++) {
	var row = $("<tr>").addClass(metadata_row_class);
	var cell = $("<td>").addClass(metadata_cell_class);
	cell.text(data[i].primaryKeys[j].pk);
	row.append(cell);
	tablePrimKey.append(row);
	// source.database.metadata.primaryKey.push(data[i].primaryKeys[j]);

	// console.log(txt);
	// txt = txt + data[i].primaryKeys[j].pk + ' ';
}
// primKey.text(txt).append('<hr/>');
tableArea.append(tablePrimKeyArea.append(tablePrimKey));

var colsArea = $("<div>").addClass(metadata_table_area);
var tableColumns = $("<table>").addClass(metadata_table);
var headerRow = $("<tr>").addClass(metadata_table_header_row_class);
var headerCell = $("<td>").addClass(metadata_cell_class);
headerCell.text("Columns");
headerRow.append(headerCell);
tableColumns.append(headerRow);
for ( var j = 0; j < data[i].columns.length; j++) {
	var row = $("<tr>").addClass(metadata_row_class);
	var cell = $("<td>").addClass(metadata_cell_class);
	cell.text(data[i].columns[j].name);
	row.append(cell);
	tableColumns.append(row);

	// source.database.metadata.columns.push(data[i].columns[j]);

}
// colsArea.text(txt).append('<hr/>');
tableArea.append(colsArea.append(tableColumns));

 * var columns = $("<div>"); columns.text(data[i].columns).append('<hr/>');
 * table.append(columns);
 
tablesTabArea.append(tableArea);// .append('<hr/><hr/><hr/>');
*/		



// source.database.tablesMetadata.push(tables);
