package ntua.thesis.dis.commands.importing;


import java.io.File;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.codec.EncoderException;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import ntua.thesis.dis.commands.Command;
import ntua.thesis.dis.importing.SourcesManager;
import ntua.thesis.dis.importing.source.DBConnectionSource;



public class ImportRelationalQueryCommand extends Command{

        /**
         * 
         */
        //private SourcesManager sm;
        
        private static final long serialVersionUID = 1L;

        public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                // TODO Auto-generated method stub
                
        }

        /*public ImportRelationalQueryCommand(SourcesManager sourcesManager){
                sm = sourcesManager;
        }*/
        /**
         * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
         */
        public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
            // TODO Auto-generated method stub
                SourcesManager sm = getSourcesManager();
                
                String query        = request.getParameter("query");
                String max_records  = request.getParameter("max_records");
                String databaseURL = request.getParameter("URL");
                String schema      = request.getParameter("schema");
                String username    = request.getParameter("username");
                String password    = request.getParameter("password");
                
                try {
                        
                        
                        DBConnectionSource dbc = sm.getConnection(databaseURL+schema);

                        try {
                                dbc.setConnection(databaseURL,schema, username, password);
                        } catch (InstantiationException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        } catch (IllegalAccessException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        } catch (ClassNotFoundException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
 
                        File newFile = sm.getJSONFileForQuery();
                        String fileToString = newFile.toString();
                        int filenamePos = fileToString.lastIndexOf('\\') + 1;
                        String filename = fileToString.substring(filenamePos,fileToString.length());
                        
                        
                        
                        dbc.submitQuery(query,newFile);
                      
                        
                        JSONArray queryResults = dbc.getQueryInfo().getJSONArray("data");
                        
                        JSONObject queryMetadata = dbc.getQueryInfo().getJSONObject("metadata");
                        
                      
                        
                        JSONObject answerToUser = new JSONObject();
                        
                        JSONObject datasetMetadata = new JSONObject();
                        datasetMetadata.put(SourcesManager.SOURCE_TYPE, SourcesManager.RELATIONAL_DATABASE);
                        datasetMetadata.put(SourcesManager.SOURCE_NAME,databaseURL+schema);
                        datasetMetadata.put(SourcesManager.SOURCE_DESCRIPTION,databaseURL+schema);
                        datasetMetadata.put(SourcesManager.TYPE_OF_IMPORT,query);
                        datasetMetadata.put(SourcesManager.TOTAL_ROWS,queryMetadata.getInt("rows"));
                        datasetMetadata.put(SourcesManager.RELATED_FILE_NAME,filename);
                        
                        answerToUser.put("metadata",datasetMetadata);
                  
                        JSONArray userResults = new JSONArray();
                       
                        for(int i = 0; i < Math.min(Integer.parseInt(max_records),100);i++){
                                userResults.put(queryResults.get(i));
                        }
                        answerToUser.put("data", userResults);
               
                   
                        response.setContentType("application/json");
                        response.getWriter().write(answerToUser.toString());
                        
                     
                   

                } catch (SQLException | JSONException | EncoderException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }

                // pm.importDataset);
        }
}
