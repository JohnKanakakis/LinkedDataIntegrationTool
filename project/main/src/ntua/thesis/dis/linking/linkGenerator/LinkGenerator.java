package ntua.thesis.dis.linking.linkGenerator;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map.Entry;

import ntua.thesis.dis.mapping.SchemaMappingManager;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class LinkGenerator {

        private static LinkGenerator instance = new LinkGenerator();
        //private SchemaMappingManager sm;
        private HashMap<String,JSONObject> datasetNameToMappingsMap = new HashMap<String,JSONObject>();
        
        private LinkGenerator(){
                
        }

        public static LinkGenerator getInstance() {
              
                return instance;
        }
        
        
        public JSONArray generateLinks(){
                
                //JSONArray datasetMappings1 = this.recordMappingFilter();
                
                //System.out.println(" MAPPINGS 1 > "+datasetMappings1);
                
                Iterator<Entry<String,JSONObject>> it = this.datasetNameToMappingsMap.entrySet().iterator();
                Entry<String,JSONObject> entry;
                JSONArray array = new JSONArray();
                
                while(it.hasNext()){
                        entry = it.next();
                        array.put(entry.getValue());
                }
                
                JSONArray datasetMappings2 = this.literalPropertyMappingFilter(array);
                
                System.out.println(" MAPPINGS 2 > "+datasetMappings2);
                HashMap<String,JSONArray> map = this.findEqualPropertyMappings(datasetMappings2);
                
                System.out.println("MAP > " +map.toString());
                
                JSONArray recommendedLinks = this.getLinks(map);
                
                System.out.println("RECCOMENDED > " +recommendedLinks);
                return recommendedLinks;
        }
        
        
        
        



        public void addDatasetMapping(JSONObject mappingInfo){
                String datasetName = "";
                try {
                        datasetName = mappingInfo.getString("datasetName");
                        this.datasetNameToMappingsMap.put(datasetName, mappingInfo);
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                
        }

        
        /*private JSONArray recordMappingFilter(){
                
                Iterator<Entry<String,JSONObject>> it = this.datasetNameToMappingsMap.entrySet().iterator();                
                
                Entry<String,JSONObject> entry;
                JSONObject datasetMappings;
                String datasetName = "";
                
                JSONArray filterOutput = new JSONArray();
                
                while(it.hasNext()){
                        entry = it.next();
                        datasetName = entry.getKey();
                        datasetMappings = entry.getValue();
                        if(this.hasRecordMapping(datasetMappings)){
                                filterOutput.put(datasetMappings);
                        }
                }
                
                return filterOutput; 
        }*/

        /*private boolean hasRecordMapping(JSONObject datasetMappings) {
                
                if(datasetMappings.has("recordClassMapping")){
                        return true;
                }
                return false;
                try {
                        JSONArray mappings = datasetMappings.getJSONArray("mappings");
                        JSONObject
                        for(int i = 0; i < mappings.length();i++){
                                if(mappings.get(i))
                        }
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
        }
        */
        
        private JSONArray literalPropertyMappingFilter(JSONArray datasetMappingsArray){
                
                JSONArray datasetMappings;
                JSONArray filteredDatasetMappings;
                JSONArray output = new JSONArray();
                JSONObject mappingInfo;
                
                for(int i = 0; i < datasetMappingsArray.length();i++){
                        try {
                                mappingInfo = datasetMappingsArray.getJSONObject(i);
                                datasetMappings = mappingInfo.getJSONArray("mappings");
                                filteredDatasetMappings = new JSONArray();
                                for(int j = 0; j < datasetMappings.length();j++){
                                        if(this.hasLiteralPropertyMapping(datasetMappings.getJSONObject(j))){
                                                filteredDatasetMappings.put(datasetMappings.getJSONObject(j));
                                        }
                                }
                                //mappingInfo.remove("mappings");
                                mappingInfo.put("mappings",filteredDatasetMappings);
                                
                                System.out.println("MAPPING INFO > "+mappingInfo);
                                output.put(mappingInfo);
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                }
                return output;
                
        }

        private boolean hasLiteralPropertyMapping(JSONObject mapping) {
                
               // JSONObject literalMapping;
                
                try {
                        if(mapping.getJSONArray("children").length() != 0){
                                //literalMapping = mapping.getJSONArray("children").getJSONObject(0);  
                                return true;
                        }
                        
                        
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                return false;
        }
        
        
        private HashMap<String,JSONArray> findEqualPropertyMappings(JSONArray datasetMappingsArray){
                
                HashMap<String,JSONArray> targetMappingTermToMappingInfoMap = new HashMap<String,JSONArray>();
                
                JSONArray datasetMappings;
                JSONObject mappingInfo;
                String datasetName = "";
                
                for(int i = 0; i < datasetMappingsArray.length();i++){
                        try {
                                mappingInfo = datasetMappingsArray.getJSONObject(i);
                                datasetMappings = mappingInfo.getJSONArray("mappings");
                                datasetName = mappingInfo.getString("datasetName");
                                for(int j = 0; j < datasetMappings.length();j++){
                                        this.addToMap(datasetName,datasetMappings.getJSONObject(j),targetMappingTermToMappingInfoMap);
                                }
                               
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                }
                
                return targetMappingTermToMappingInfoMap;
        }

        private void addToMap(String datasetName,JSONObject mappingInfo, HashMap<String, JSONArray> map) {
                
                String targetMappingTerm = "";
                JSONArray array;
                try {
                        targetMappingTerm = mappingInfo.getString("target");
                        if(map.containsKey(targetMappingTerm)){
                                array = map.get(targetMappingTerm);
                        }else{
                                array = new JSONArray(); 
                        }
                        mappingInfo.put("datasetName", datasetName);
                        array.put(mappingInfo);
                        map.put(targetMappingTerm, array);
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                
        }
        
        private JSONArray getLinks(HashMap<String, JSONArray> map) {
                
                JSONArray links = new JSONArray();
                JSONObject link_o;
                
                Iterator<Entry<String,JSONArray>> it = map.entrySet().iterator();                
                Entry<String,JSONArray> entry;
                JSONArray datasetMappings;
                String datasetName = "";
                
                while(it.hasNext()){
                        entry = it.next();
                        datasetMappings = entry.getValue();
                        if(datasetMappings.length() > 1){
                                for(int i = 1; i < datasetMappings.length();i++){
                                        link_o = new JSONObject();
                                        try {
                                                link_o.put("sourceLinkingInfo",datasetMappings.get(0));
                                                link_o.put("targetLinkingInfo",datasetMappings.get(i));
                                                links.put(link_o);
                                                
                                        } catch (JSONException e) {
                                                // TODO Auto-generated catch block
                                                e.printStackTrace();
                                        }
                                }
                                
                        }
                }
                
                return links;
        }

        public void reset() {
                // TODO Auto-generated method stub
                this.datasetNameToMappingsMap.clear();
        }







}
