package ntua.thesis.dis.commands.importing;


import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONException;
import org.json.JSONObject;
import ntua.thesis.dis.commands.Command;
import ntua.thesis.dis.importing.SourcesManager;


public class ImportJSONDataCommand extends Command{

        private static final long serialVersionUID = 1L;
       /* private static SourcesManager sm;
       
        public ImportJSONDataCommand(SourcesManager sourcesManager) {
                sm = sourcesManager;
        }*/


        public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
               
                SourcesManager sm = getSourcesManager();
                String filename = null;
                String url = null;
                int rows = 0;
                try {
                        JSONObject options = new JSONObject(request.getParameter("options"));
            
                        filename = options.getString("filename");
                        url = options.getString("url");
                        rows = options.getInt("rows");
                } catch (JSONException e2) {
                        // TODO Auto-generated catch block
                        e2.printStackTrace();
                }
              
                String internal_filename = sm.createJSONFile(request.getParameter("data"),filename);
                
                //JSONObject jsonFile = new JSONObject();
                try {
                        /*jsonFile.put("name",internal_filename);
                        jsonFile.put("rows",0);
                        JSONObject jsonSource = new JSONObject();
                        jsonSource.put("type","null");
                        jsonSource.put("value","null");
                        jsonFile.put("source", jsonSource);
                        sm.insertFile(jsonFile);*/
                        
                        JSONObject answerToUser = new JSONObject();
                        
                        JSONObject datasetMetadata = new JSONObject();
                        datasetMetadata.put(SourcesManager.SOURCE_TYPE, SourcesManager.FILE);
                        datasetMetadata.put(SourcesManager.SOURCE_NAME,url);
                        datasetMetadata.put(SourcesManager.SOURCE_DESCRIPTION,filename);
                        datasetMetadata.put(SourcesManager.TYPE_OF_IMPORT,"File Download");
                        datasetMetadata.put(SourcesManager.TOTAL_ROWS,rows);
                        datasetMetadata.put(SourcesManager.RELATED_FILE_NAME,internal_filename);
                        
                        answerToUser.put("metadata",datasetMetadata);
                        
                        response.setContentType("application/json");
                        response.getWriter().write(answerToUser.toString());
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
        };
}
