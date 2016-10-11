package ntua.thesis.dis.commands.mapping;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import ntua.thesis.dis.commands.Command;
import ntua.thesis.dis.mapping.Mapping;
import ntua.thesis.dis.mapping.SchemaMappingManager;
import ntua.thesis.dis.service.PrefixesManager;
import ntua.thesis.dis.tests.MappingsTest;
import ntua.thesis.dis.util.SPARQLUtils;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.hp.hpl.jena.graph.Node;
import com.hp.hpl.jena.graph.Triple;
import com.hp.hpl.jena.query.QueryParseException;


public class StartMappingTaskCommand extends Command{

        /**
         * 
         */
        private static final long serialVersionUID = 1L;
      
        public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException,IOException{
                SchemaMappingManager sm = getMappingsManager();
                
                String mappings = request.getParameter("mappings");
                String datasetName = request.getParameter("datasetName");
                String mappingTaskName = request.getParameter("mappingTaskName");
                
                JSONObject mappingResultPreview = new JSONObject();
                JSONObject mappingsInJSON;
                
                sm.createMappingTask(datasetName,mappingTaskName);
                
                try {
                        mappingsInJSON = new JSONObject(mappings);
                        
                        System.out.println(mappingsInJSON.toString());

                        JSONArray propertyMappings = mappingsInJSON.getJSONArray("propertyMappings");
                        
                       
                        for(int i = 0; i < propertyMappings.length();i++){
                            JSONObject mappingPair = propertyMappings.getJSONObject(i);
                            
                            if(mappingPair.getBoolean("isCustomized")){
                                    JSONObject pairBefore = mappingPair;
                                    mappingPair = this.formatCustomizedMappingPair(pairBefore);
                                    if(mappingPair == null){
                                            System.out.println("mapping pair is null!!!!");
                                            JSONObject mappingError = new JSONObject();
                                            mappingError.put("message", "wrong mapping");
                                            mappingError.put("pair", pairBefore);
                                            mappingError.put("wrong_pattern", "target"); 
                                            respondJSON(response,mappingError);
                                            return;
                                    }
                            }
                            int code = sm.addMappingToTask(mappingPair, mappingTaskName);
                            if(code < 0){
                                    
                                    JSONObject mappingError = new JSONObject();
                                    mappingError.put("message", "wrong mapping");
                                    mappingError.put("pair", mappingPair);
                                    System.out.println("CODE > "+code);
                                    if(code == -1){
                                            mappingError.put("wrong_pattern", "source");
                                    }else if(code == -2){
                                            mappingError.put("wrong_pattern", "target");
                                    }
                                    
                                    respondJSON(response,mappingError);
                                    System.out.println("wrong mapping !!!");
                                    return;
                            }
                            
                            
                        }
                        mappingResultPreview = sm.executeMappingTask(mappingTaskName);
                        
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
              
                respondJSON(response,mappingResultPreview);
                
                
                
        }

        private JSONObject formatCustomizedMappingPair(JSONObject pair) {
                // TODO Auto-generated method stub
                
                try {
                        String sPattern = pair.getString("sPattern");
                        String tPattern = pair.getString("tPattern");
                        
                        sPattern = sPattern.replace('\n', ' ').replace('\t', ' ');
                        tPattern = tPattern.replace('\n', ' ').replace('\t', ' ');
                        
                        //String tPatternForR2R = tPattern;
                        
                        //tPattern = this.cleanTargetPatternFromModifications(tPattern);
                        
                        List<Triple> triples = SPARQLUtils.getTriplesOfPattern(tPattern, PrefixesManager.getPrefixToUriMap());
                        JSONArray patterns = new JSONArray();
                        Node subject = null;
                        Node predicate = null;
                        Node object = null;
                                       
                        for(Triple triple :triples){
                                System.out.println("triple > "+triple.toString());
                                JSONObject pattern = new JSONObject();
                                subject = triple.getSubject();
                                predicate = triple.getPredicate();
                                object = triple.getObject();
                                
                                String subjectToString = nodeToString(subject);
                                String predicateToString = nodeToString(predicate);
                                String objectToString = nodeToString(object);

                                System.out.println("subject > "+subjectToString);
                                System.out.println("predicate > "+predicateToString);
                                System.out.println("object > "+objectToString);
                                pattern.put("pattern", subjectToString + " " + predicateToString + " " + objectToString);
                                
                                patterns.put(pattern);
                        }
                        pair.remove("tPattern");
                        pair.put("targetPatterns", patterns);
                        
                        pair.remove("sPattern");
                        pair.put("sPattern",sPattern);
                        return pair;
                } catch (JSONException | QueryParseException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                        return null;
                }
        }

        
        private String cleanTargetPatternFromModifications(String tPattern) {
                // TODO Auto-generated method stub
                String result = tPattern;
                result = result.replaceAll("\"","").replaceAll("<","").replaceAll(">","");
                int firstDatatypeCharPosition = result.indexOf('^');
                result = result.substring(0, firstDatatypeCharPosition-1);
                
                //add case for language!!
                return result;
        }

        private String nodeToString(Node node){
                if(node.isURI()){
                        return  "<" + node.toString() + ">"; 
                }else{
                        return node.toString();
                }
                
        }
        
        public void doGet(HttpServletRequest request,HttpServletResponse response) 
                        throws ServletException,IOException{

                doPost(request, response);        
        }
        
}
