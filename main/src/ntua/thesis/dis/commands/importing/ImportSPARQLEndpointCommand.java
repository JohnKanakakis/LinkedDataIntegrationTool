package ntua.thesis.dis.commands.importing;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;

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
import ntua.thesis.dis.importing.source.SPARQLEndpointSource;


public class ImportSPARQLEndpointCommand extends Command{

        private static final long serialVersionUID = 1L;

       /* private static SourcesManager sm;

        public ImportSPARQLEndpointCommand(SourcesManager sourcesManager) {
                sm = sourcesManager;
        }*/


        public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                SourcesManager sm = getSourcesManager();
                try {
                        JSONObject answerToUser = new JSONObject();
                        
                        JSONObject sparqlQuery = new JSONObject(request.getParameter("query"));
                        String endpointURL = sparqlQuery.getString("serviceURL");
                        String queryString = sparqlQuery.getString("query");
                        
                        System.out.println(queryString);
                        SPARQLEndpointSource sparqlSource = new SPARQLEndpointSource(endpointURL);
                        
                        File file = sm.getFileForSPARQLQuery();
                        long result = sparqlSource.executeSPARQLQuery(queryString,file);
                        if(result == -2){
                                answerToUser.put("error", true);
                                answerToUser.put("message", "SPARQL query is not a CONSTRUCT query!");
                                respondJSON(response, answerToUser);
                                return;
                        }
                        if (result < 0){
                                System.out.println("something wrong");
                        }
                        String fileToString = file.toString();
                        int filenamePos = fileToString.lastIndexOf('\\') + 1;
                        String filename = fileToString.substring(filenamePos,fileToString.length());
                        
                        
                        VocabularyExtractor vocEx = new VocabularyExtractor();
                        
                        vocEx.setModel(sparqlSource.getQueryResultsModel());
                        
                        DatasetVocabulary datasetVoc = new DatasetVocabulary();
                        datasetVoc.setClasses(vocEx.getClassesToString());
                        datasetVoc.setProperties(vocEx.getPropertiesToString());
                        datasetVoc.setPrefixes((HashMap<String, String>) vocEx.getPrefixesMap());
                        //datasetVoc.printVoc();
                        
                        sm.addDatasetVocabulary(filename,datasetVoc);
                        
                        
                        
                        JSONArray dataToDisplay = sparqlSource.getStatements(100);
                        
                        
                        
                        JSONObject datasetMetadata = new JSONObject();
                        datasetMetadata.put(SourcesManager.SOURCE_TYPE, SourcesManager.SPARQL_ENDPOINT);
                        datasetMetadata.put(SourcesManager.SOURCE_NAME,endpointURL);
                        datasetMetadata.put(SourcesManager.SOURCE_DESCRIPTION,endpointURL);
                        datasetMetadata.put(SourcesManager.TYPE_OF_IMPORT,queryString);
                        datasetMetadata.put(SourcesManager.TOTAL_ROWS,result);
                        datasetMetadata.put(SourcesManager.RELATED_FILE_NAME,filename);
                        
                        answerToUser.put("metadata",datasetMetadata);
                        answerToUser.put("data",dataToDisplay);
                     
                        response.setContentType("application/json");
                        response.getWriter().write(answerToUser.toString());
                 
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
              
                
        }
}
