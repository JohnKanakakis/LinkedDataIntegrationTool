package ntua.thesis.dis.commands.importing;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import ntua.thesis.dis.commands.Command;
import ntua.thesis.dis.importing.SourcesManager;


public class CreateDatasetsCommand extends Command{

        private static final long serialVersionUID = 1L;
        //private SourcesManager sm;

        public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                // TODO Auto-generated method stub
                
        }

       /* public CreateDatasetsCommand(SourcesManager sourcesManager){
                sm = sourcesManager;
        }*/
        /**
         * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
         */
        public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
            
             SourcesManager sm = getSourcesManager();
             try {
                     response.setContentType("application/json");
                     JSONArray files= new JSONArray(request.getParameter("files"));
                
                     for(int i = 0; i < files.length(); i++){
                             System.out.println(files.getJSONObject(i).getString(SourcesManager.RELATED_FILE_NAME));
                     }
                     int numberOfCreatedDatasets = sm.createDatasets(files);
                     String reponseMessage = "";
                     int wasSuccessfullImport = 0;
                     JSONObject answerToUser = new JSONObject();
                     if(numberOfCreatedDatasets < files.length()){
                             wasSuccessfullImport = -1;
                             reponseMessage = "File "+ files.getJSONObject(numberOfCreatedDatasets).getString(SourcesManager.RELATED_FILE_NAME)+
                                             "was not successfully imported";
                     }else{
                             wasSuccessfullImport = 1;
                             reponseMessage = "The files were imported successfully.";
                     }
                     answerToUser.put("wasSuccessfullImport",wasSuccessfullImport);
                     answerToUser.put("responseMessage",reponseMessage);
                     
                     
                     response.getWriter().write(answerToUser.toString());
 
             } catch (JSONException e) {

                     e.printStackTrace();
             } 
             
             
        }    
}
