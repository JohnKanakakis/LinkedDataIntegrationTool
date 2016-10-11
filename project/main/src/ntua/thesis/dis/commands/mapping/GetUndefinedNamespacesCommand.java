package ntua.thesis.dis.commands.mapping;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import ntua.thesis.dis.commands.Command;
import ntua.thesis.dis.mapping.SchemaMappingManager;
import ntua.thesis.dis.service.PrefixesManager;


public class GetUndefinedNamespacesCommand extends Command {

        /**
         * 
         */
        private static final long serialVersionUID = 1L;
        
        /*private SchemaMappingManager shMapManager;
        
        
        public GetUndefinedNamespacesCommand(SchemaMappingManager schemaMappingManager) {
                shMapManager = schemaMappingManager;
        }*/

        public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        
                SchemaMappingManager sm = getMappingsManager();
                
                List<String> datasetNames= sm.getDatasetNames();
                HashMap<String,Integer> namespaceCardinalityMap = new HashMap<String,Integer>();
                JSONObject vocabulary;
                JSONArray undefinedPrefixes = new JSONArray();
                JSONArray termsArray;
                JSONObject term_o;
                try {
                        
                        for(int i = 0; i < datasetNames.size();i++){
                                System.out.println("NAME > "+datasetNames.get(i));
                                vocabulary = sm.getSourceVocabulary(datasetNames.get(i));
                                
                                System.out.println("VOCABULARY > "+vocabulary.toString());
                                termsArray = vocabulary.getJSONArray("classes");
                                for(int j = 0; j < termsArray.length();j++){
                                        term_o = termsArray.getJSONObject(j);
                                        
                                        if(term_o.getString("prefix").equals(PrefixesManager.UNKNOWN_PREFIX)){
                                                if(!existsInMap(namespaceCardinalityMap,term_o.getString("uri"))){
                                                        undefinedPrefixes.put(term_o); 
                                                        namespaceCardinalityMap.put(term_o.getString("uri"), j);
                                                }
                                                 
                                        }
                                }
                                termsArray = vocabulary.getJSONArray("properties");
                                for(int j = 0; j < termsArray.length();j++){
                                        term_o = termsArray.getJSONObject(j);
                                        if(term_o.getString("prefix").equals(PrefixesManager.UNKNOWN_PREFIX)){
                                                if(!existsInMap(namespaceCardinalityMap,term_o.getString("uri"))){
                                                        undefinedPrefixes.put(term_o); 
                                                        namespaceCardinalityMap.put(term_o.getString("uri"), j);
                                                }
                                        }
                                }
                        }
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                
                respondJSON(response,undefinedPrefixes);
        }
        
        private boolean existsInMap(HashMap<String, Integer> namespaceCardinalityMap, String uri) {
                
                return namespaceCardinalityMap.containsKey(uri);
        }

        public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

                doGet(request, response);
                
        }
        

}
