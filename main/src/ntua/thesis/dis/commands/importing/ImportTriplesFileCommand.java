package ntua.thesis.dis.commands.importing;


import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import ntua.thesis.dis.commands.Command;
import ntua.thesis.dis.dataspace.DatasetVocabulary;
import ntua.thesis.dis.importers.VocabularyExtractor;
import ntua.thesis.dis.importing.SourcesManager;


public class ImportTriplesFileCommand extends Command{
      
        private static final long serialVersionUID = 1L;
        
        /*private static SourcesManager sm;
        
        public ImportTriplesFileCommand(SourcesManager sourcesManager) {
                sm = sourcesManager;
        }*/

        public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                
                SourcesManager sm = getSourcesManager();
                File newFile = sm.uploadFile(request);
                
                String pathToString = newFile.toString();
                int filenamePos = pathToString.lastIndexOf('\\') + 1;
                String filename = pathToString.substring(filenamePos,pathToString.length());

                VocabularyExtractor vocEx = new VocabularyExtractor();
                
                vocEx.readData(newFile);
                
                JSONObject answerToUser = new JSONObject();
                JSONArray rdfVoc = new JSONArray();   
                JSONObject datasetMetadata = new JSONObject();
                
                
              
                JSONArray rdfProperties;
                JSONArray rdfClasses;
                
                
                try {
                        rdfProperties = vocEx.getRDFProperties();
                        rdfClasses = vocEx.getRDFClasses();
                        Map<String,String> prefixes = vocEx.getPrefixesMap();
                        
                        DatasetVocabulary datasetVoc = new DatasetVocabulary();
                        /*if(prefixes == null){
                                datasetVoc.addToUnknownTerms();
                        }*/
                        datasetVoc.setClasses(vocEx.getClassesToString());
                        datasetVoc.setProperties(vocEx.getPropertiesToString());
                        datasetVoc.setPrefixes((HashMap<String, String>) prefixes);
                        sm.addDatasetVocabulary(filename,datasetVoc);
                        
                        rdfVoc.put(new JSONObject().put("classes",rdfClasses));
                        rdfVoc.put(new JSONObject().put("properties",rdfProperties));
                        answerToUser.put("data",rdfVoc);
                        
                        datasetMetadata.put(SourcesManager.SOURCE_TYPE, SourcesManager.FILE);
                        datasetMetadata.put(SourcesManager.SOURCE_NAME,filename);
                        datasetMetadata.put(SourcesManager.SOURCE_DESCRIPTION,filename);
                        datasetMetadata.put(SourcesManager.TYPE_OF_IMPORT,"File Upload");
                        datasetMetadata.put(SourcesManager.TOTAL_ROWS,vocEx.getNumberOfStatements());
                        datasetMetadata.put(SourcesManager.RELATED_FILE_NAME,filename);
                        answerToUser.put("metadata",datasetMetadata);
 
                        
                        response.setContentType("application/json");
                        response.getWriter().write(answerToUser.toString());
                      
                } catch (JSONException e1) {
                        // TODO Auto-generated catch block
                        e1.printStackTrace();
                }  
                
                
                
                /*JSONObject jsonFile = new JSONObject();
                try {
                        jsonFile.put("name",filename);
                        jsonFile.put("rows",statements_num);
                        JSONObject jsonSource = new JSONObject();
                        jsonSource.put("type","null");
                        jsonSource.put("value","null");
                        jsonFile.put("source", jsonSource);
                        
                        sm.insertFile(jsonFile);
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                */
                
        }

        static protected void redirect(HttpServletResponse response, String url) throws IOException {
                response.sendRedirect(url);
        }

}
