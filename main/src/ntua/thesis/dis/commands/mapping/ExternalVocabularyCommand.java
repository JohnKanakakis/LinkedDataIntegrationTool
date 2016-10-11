package ntua.thesis.dis.commands.mapping;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import ntua.thesis.dis.commands.Command;
import ntua.thesis.dis.mapping.SchemaMappingManager;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;


public class ExternalVocabularyCommand extends Command{

        /**
         * 
         */
        private static final long serialVersionUID = 1L;
        
        /*private SchemaMappingManager shMapManager;
        
        
        public ExternalVocabularyCommand(SchemaMappingManager schemaMappingManager) {
                shMapManager = schemaMappingManager;
        }*/

        public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException{
        
                SchemaMappingManager sm = getMappingsManager();
                
                String action = request.getParameter("action");
                /*String vocabularyNs = request.getParameter("vocabularyNs");
                String prefix = request.getParameter("prefix");*/
                
                JSONObject vocabularyJSON = new JSONObject();
               
                if(action.equals("upload")){
                        try {
                                vocabularyJSON = sm.addExternalVocabulary(request);
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                }else if(action.equals("download")){
                        try {
                                String vocabularyName = request.getParameter("vocabularyName");
                                String vocabularyPrefix = request.getParameter("prefix");
                                String vocabularyURL = request.getParameter("vocabularyURL");
                                String vocabularyNs = request.getParameter("vocabularyNs");
                                vocabularyJSON = sm.addExternalVocabulary(vocabularyName, vocabularyPrefix,vocabularyNs,vocabularyURL);
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                }
                
                respondJSON(response,vocabularyJSON);
               /* try {
                        vocabularyJSON = shMapManager.addTargetVocabulary(vocabularyName, vocabularyPrefix,vocabularyURL);
                        
                        if(vocabularyJSON != null){
                                System.out.println(vocabularyJSON.toString());
                                response.getWriter().write(vocabularyJSON.toString());
                        }else{
                                System.out.println("null");
                                response.getWriter().write(new JSONObject().toString());
                        }
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                */
                //JSONObject vocabularyJSON = shMapManager.addTargetVocabulary("SDMX-DIMENSION","sdmx-dimension", "http://publishing-statistical-data.googlecode.com/svn/trunk/specs/src/main/vocab/sdmx-dimension.ttl");
                
                
        }
        
       
       


        public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

                SchemaMappingManager sm = getMappingsManager();
                JSONArray importedVocabularies = new JSONArray();
                try {
                        importedVocabularies = sm.getExternalVocabularies();
                } catch (JSONException e1) {
                        // TODO Auto-generated catch block
                        e1.printStackTrace();
                } 
                respondJSON(response,importedVocabularies);  
        }

}
