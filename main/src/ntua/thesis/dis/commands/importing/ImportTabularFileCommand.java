package ntua.thesis.dis.commands.importing;

import java.io.File;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import ntua.thesis.dis.commands.Command;
import ntua.thesis.dis.importing.SourcesManager;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class ImportTabularFileCommand extends Command{

        private static final long serialVersionUID = 1L;
       /* private static SourcesManager sm;
       
        public ImportTabularFileCommand(SourcesManager sourcesManager) {
                sm = sourcesManager;
        }*/


        public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                
                SourcesManager sm = getSourcesManager();
                
                File newFile = sm.uploadFile(request);
                
                
                String pathToString = newFile.toString();
                int filenamePos = pathToString.lastIndexOf('\\') + 1;
                String filename = pathToString.substring(filenamePos,pathToString.length());
                JSONObject results = null;
                
                
                
                String file = null;
                int rows = 0;
                
                JSONObject options;
                try {
                        options = new JSONObject(request.getParameter("options"));
                        file = options.getString("filename");
 
                        if (options.has("rows")){
                                rows = options.getInt("rows");
                        }else{
                                rows = 0;
                        }
                        System.out.print(file+"/"+rows);
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }

                results = sm.convertToJSON(newFile);
                
                if (results == null){ //not convertion
                        JSONObject answerToUser = new JSONObject();
                        JSONObject datasetMetadata = new JSONObject();
                        try {
                                datasetMetadata.put(SourcesManager.SOURCE_TYPE, SourcesManager.FILE);
                                datasetMetadata.put(SourcesManager.SOURCE_NAME,filename);
                                datasetMetadata.put(SourcesManager.SOURCE_DESCRIPTION,filename);
                                datasetMetadata.put(SourcesManager.TYPE_OF_IMPORT,"File Upload");
                                datasetMetadata.put(SourcesManager.TOTAL_ROWS,rows);
                                datasetMetadata.put(SourcesManager.RELATED_FILE_NAME,filename);
                                answerToUser.put("metadata",datasetMetadata);
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                        response.setContentType("application/json");
                        response.getWriter().write(answerToUser.toString());

                        return;  
                }

                JSONObject sheet_0;
                try {
                        JSONObject answerToUser = new JSONObject();
                        
                        JSONObject datasetMetadata = new JSONObject();
                        datasetMetadata.put(SourcesManager.SOURCE_TYPE, SourcesManager.FILE);
                        datasetMetadata.put(SourcesManager.SOURCE_NAME,filename);
                        datasetMetadata.put(SourcesManager.SOURCE_DESCRIPTION,filename);
                        datasetMetadata.put(SourcesManager.TYPE_OF_IMPORT,"File Upload");
                        datasetMetadata.put(SourcesManager.TOTAL_ROWS,results.getJSONObject("metadata").getInt("rows"));
                        datasetMetadata.put(SourcesManager.RELATED_FILE_NAME,filename);
                        
                        answerToUser.put("metadata",datasetMetadata);

                        
                        sheet_0 = results.getJSONArray("data").getJSONObject(0);
                
                        JSONArray dataToDisplay = new JSONArray();
                        JSONArray sheet_0_data = sheet_0.getJSONArray("sheetData");
                       
                        for (int i = 0; i < Math.min(50,sheet_0_data.length());i++){
                                try {
                                        dataToDisplay.put(i, sheet_0_data.getJSONObject(i));
                                } catch (JSONException e) {
                                        
                                        e.printStackTrace();
                                        break;
                                } 
                        }
                        
                        JSONObject smallDataSheet0 = new JSONObject();
                        smallDataSheet0.put("sheetName",sheet_0.getString("sheetName"));
                        smallDataSheet0.put("data",dataToDisplay);
                        JSONArray smallDataSheets = new JSONArray();
                        smallDataSheets.put(smallDataSheet0);
                       
                        answerToUser.put("data",smallDataSheets);
                        
                    
                        response.setContentType("application/json");
                        response.getWriter().write(answerToUser.toString());
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                
        }
}
