package ntua.thesis.dis.importers;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;


import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;



public class ExcelParser{

        private int numberOfRows = 0;
        
        public JSONObject convertToJSON(File file) {
                
                JSONArray dataToJSON = null;
                JSONObject fileMetadata = null;
                JSONObject results = null;
                
                Workbook wb = null;
                try {
                        InputStream in = new FileInputStream(file);
                        wb = WorkbookFactory.create(in);
                        org.apache.poi.ss.usermodel.Sheet sheet = null;
                        
                        dataToJSON = new JSONArray();
                        fileMetadata = new JSONObject();
                        results = new JSONObject();
                        
                        
                        String cellValue = null;
                        System.out.println(wb.getNumberOfSheets());
                        
                        
                        numberOfRows = 0;
                        for (int sh = 0;sh < wb.getNumberOfSheets();sh++){
                                sheet = wb.getSheetAt(sh);
                                
                                String[] columns = getColumns(sheet);
                                
                                
                                JSONObject jsonSheet = new JSONObject().put("sheetName",sheet.getSheetName());
                                
                                int firstRow = sheet.getFirstRowNum();
                                int lastRow = sheet.getLastRowNum();
                                JSONArray data = new JSONArray();
                                Row row = sheet.getRow(0);
                                int firstCellNum = row.getFirstCellNum();
                                int lastCellNum = row.getLastCellNum();
                                for (int i = firstRow+1;i<=lastRow;i++) {
                                        numberOfRows++;
                                        row = sheet.getRow(i);
                                        JSONObject jsonRow = new JSONObject();
                                        if (row!=null){
                                                Cell cell = null;
                                                
                                                for (int j = firstCellNum; j< lastCellNum ;j++) {
                                                        cell = row.getCell(j);
                                                        if (cell!=null){
                                                           
                                                                switch (cell.getCellType()) {
                                                                        case Cell.CELL_TYPE_STRING:
                                                                                cellValue = cell.getRichStringCellValue().getString();
                                                                            //System.out.println(cell.getRichStringCellValue().getString());
                                                                            break;
                                                                        case Cell.CELL_TYPE_NUMERIC:
                                                                            if (DateUtil.isCellDateFormatted(cell)) {
                                                                                    cellValue = cell.getDateCellValue().toString();
                                                                               // System.out.println(cell.getDateCellValue());
                                                                            } else {
                                                                                    cellValue = cell.getNumericCellValue()+"";
                                                                               // System.out.println(cell.getNumericCellValue());
                                                                            }
                                                                            break;
                                                                        case Cell.CELL_TYPE_BOOLEAN:
                                                                                cellValue = cell.getBooleanCellValue()+"";
                                                                            //System.out.println(cell.getBooleanCellValue());
                                                                            break;
                                                                        case Cell.CELL_TYPE_FORMULA:
                                                                                cellValue = cell.getNumericCellValue()+"";
                                                                           // System.out.println(cell.getNumericCellValue());
                                                                            break;
                                                                }
                                                        }else{
                                                                cellValue = "";
                                                        }
                                                        jsonRow.put(columns[j],cellValue);       
                                                
                                                  }
                                                  data.put(jsonRow);     
                                            }   
                                        }
                                        jsonSheet.put("sheetData",data);
                                        dataToJSON.put(jsonSheet);
                        }
                        in.close();
                        fileMetadata.put("rows",numberOfRows);
                        results.put("data", dataToJSON);
                        results.put("metadata",fileMetadata );
                        
                        return results;
                       
                } catch (InvalidFormatException | IOException | JSONException e) {
                        
                        e.printStackTrace();
                }
                return results;
                
        }

        private String[] getColumns(org.apache.poi.ss.usermodel.Sheet sheet) {
               
               int firstRow = sheet.getFirstRowNum();
               Row row = sheet.getRow(firstRow);
               String[] columns = new String[row.getLastCellNum()];
               
               for(int i = 0; i < columns.length; i++){
                       columns[i] = row.getCell(i).toString();
                       System.out.println("Column > "+columns[i]);
               }
               return columns;
        }

     
}