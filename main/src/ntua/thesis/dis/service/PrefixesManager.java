package ntua.thesis.dis.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Set;
import java.util.Map.Entry;

import ntua.thesis.dis.util.SPARQLUtils;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class PrefixesManager {

        private static PrefixesManager instance = new PrefixesManager();
        private static HashMap<String,String> prefixToURIMap = new HashMap<String,String>();
        private static HashMap<String,String> URIToPrefixMap = new HashMap<String,String>();
        public static String UNKNOWN_PREFIX = "unknown";
        
        private PrefixesManager(){
                
        }
        
        public static void init(){
                prefixToURIMap.put("dbpedia", "http://dbpedia.org/ontology/");
                prefixToURIMap.put("foaf", "http://xmlns.com/foaf/0.1/");
                prefixToURIMap.put("qb", "http://purl.org/linked-data/cube#");
                prefixToURIMap.put("rdfs", "http://www.w3.org/2000/01/rdf-schema#");
                prefixToURIMap.put("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
                prefixToURIMap.put("owl", "http://www.w3.org/2002/07/owl#");
                
                URIToPrefixMap.put("http://dbpedia.org/ontology/","dbpedia");
                URIToPrefixMap.put("http://xmlns.com/foaf/0.1/","foaf");
                URIToPrefixMap.put("http://purl.org/linked-data/cube#","qb");
                URIToPrefixMap.put("http://www.w3.org/2000/01/rdf-schema#","rdfs");
                URIToPrefixMap.put("http://www.w3.org/1999/02/22-rdf-syntax-ns#","rdf");
                URIToPrefixMap.put("http://www.w3.org/2002/07/owl#","owl");
        }
        
        public static PrefixesManager getInstance(){
                return instance;
        }
        
        public static HashMap<String,String> getPrefixToUriMap(){
                return prefixToURIMap;
        }
        
        public static HashMap<String,String> getUriToPrefixMap(){
                return URIToPrefixMap;
        }
        
        public static void addPrefix(String prefix,String namespaceUri){
                 
                prefixToURIMap.put(prefix, namespaceUri);
                URIToPrefixMap.put(namespaceUri,prefix);
        }
        
        public static String getPrefix(String prefix){
                return prefixToURIMap.get(prefix);
        }


        public static HashMap<String,String> getPrefixesWithNsURI(ArrayList<String> prefixesWithNoNsURI) {
                
                HashMap<String,String> resultPrefixes = new HashMap<String,String>();
                
                String resultPrefix = null;
                String prefixWithNoNsURI = null;
                for(int i = 0; i < prefixesWithNoNsURI.size();i++){
                        prefixWithNoNsURI = prefixesWithNoNsURI.get(i);
                        resultPrefix = prefixToURIMap.get(prefixWithNoNsURI);
                        if (resultPrefix != null && !resultPrefixes.containsValue(resultPrefix)){
                                resultPrefixes.put(prefixWithNoNsURI,resultPrefix);
                        }
                        if (resultPrefix == null){
                              System.out.println(prefixWithNoNsURI + " PREFIX NOT FOUND ERROR");
                        }
                }
                return resultPrefixes;
        }

        public static String getPrefixFromNsURI(String nsURI) {
                
                Set<Entry<String, String>> set = prefixToURIMap.entrySet(); 
                Iterator<Entry<String, String>> it = set.iterator();
                
                while(it.hasNext()){
                        Entry<String, String> prefixEntry = it.next();
                        if(prefixEntry.getValue().equals(nsURI)){
                            
                            return prefixEntry.getKey();
                        }
                }   
                return null;
        }

       /* public static Iterator<Entry<String, String>> getTargetVocabulary() {
                
                Set<Entry<String, String>> set = prefixToURIMap.entrySet(); 
                Iterator<Entry<String, String>> it = set.iterator();

                return it;
        }*/

        
        public static JSONObject getVocabularyTermInJSONFormat(String term) throws JSONException {
                
                //JSONObject termJSON = new JSONObject();
                String tokens[] = term.split(":");
                String prefix = tokens[0];
                String name = tokens[1];
                String uri = prefixToURIMap.get(prefix);
                if (uri == null){// NEVER HAPPEN!!!!!
                        uri = UNKNOWN_PREFIX;
                }
                return SPARQLUtils.getTermInJSON(prefix, uri, name);
                /*termJSON.put("prefix", tokens[0]);
                termJSON.put("name", tokens[1]);
                termJSON.put("uri", this.prefixToURIMap.get(tokens[0]));
                return termJSON;*/
        }
        
        public static JSONObject getVocabularyTermUriInJSONFormat(String termURI) throws JSONException{
                
                
                String tokens[] = splitURI(termURI);
                String name = tokens[1];
                String uri = tokens[0];
                String prefix = URIToPrefixMap.get(uri);
                if (prefix == null){
                        prefix = UNKNOWN_PREFIX;
                }
                return SPARQLUtils.getTermInJSON(prefix, uri, name);
                /*termJSON.put("uri", tokens[0]);
                termJSON.put("name", tokens[1]);
                termJSON.put("prefix", this.URIToPrefixMap.get(tokens[0]));*/
                //return termJSON;
        }

        private static String[] splitURI(String propertyURI) {//result[0] has the nsURI, result[1] has the propertyName
                
                int pos = 0; 
                if(propertyURI.indexOf('#') == -1){
                        pos = propertyURI.lastIndexOf('/');
                }
                else{
                        pos = propertyURI.lastIndexOf('#');  
                }
                
                String result[] = new String[2];
                result[0] = propertyURI.substring(0, pos+1);
                
                result[1] = propertyURI.substring(pos+1,propertyURI.length());
                return result;
        }

        public static void addPrefixesToURIs(HashMap<String, String> prefixes) {
                
                //prefixToURIMap.putAll(prefixes);
                Iterator<Entry<String,String>> it = prefixes.entrySet().iterator();
                Entry<String,String> entry;
                while(it.hasNext()){
                        entry = it.next();
                        if(prefixToURIMap.containsValue(entry.getValue())){
                                continue;
                        }else if(!prefixToURIMap.containsKey(entry.getKey())){
                                prefixToURIMap.put(entry.getKey(),entry.getValue());
                                URIToPrefixMap.put(entry.getValue(), entry.getKey());
                        }
                        
                }
                System.out.println("after importing state:");
                System.out.println("p -> URI: "+prefixToURIMap.toString());
                System.out.println("URI -> p: "+URIToPrefixMap.toString());
        }

        public static JSONArray enrichVocabularyArrayWithPrefixes(JSONArray vocabularyTermsArray) {
                /*System.out.println("about to be removed = "+ vocabularyTermsArray);*/
                JSONArray enrichedArray = new JSONArray();
                String term;
                JSONObject enrichedTerm;
                for(int i = 0; i < vocabularyTermsArray.length(); i++){
                        try {
                                term = vocabularyTermsArray.getString(i);
                                enrichedTerm = getVocabularyTermUriInJSONFormat(term);
                                System.out.println("term = "+ enrichedTerm);
                                if(enrichedTerm.has("prefix")){
                                        enrichedArray.put(getVocabularyTermUriInJSONFormat(term));
                                }
                                
                        } catch (JSONException e1) {
                                e1.printStackTrace();
                        }
                }
                System.out.println("enriched = "+enrichedArray.toString());
                return enrichedArray;
        }

        public static void addPrefixesToURIs(JSONArray prefixes) {
                // TODO Auto-generated method stub
                JSONObject o;
                for(int i = 0; i < prefixes.length();i++){
                        try {
                                o = prefixes.getJSONObject(i);
                                addPrefix(o.getString("prefix"), o.getString("uri"));
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                }
                System.out.println("added "+prefixes.length() +"  prefixes!!");
        }
        
        public static JSONArray getPrefixes() {
                
                Iterator<Entry<String,String>> it = PrefixesManager.getPrefixToUriMap().entrySet().iterator();
                JSONArray prefixes = new JSONArray();
                JSONObject o;
                Entry<String,String> entry;
                while(it.hasNext()){
                        entry = it.next();
                        o = new JSONObject();
                        try {
                                o.put("prefix", entry.getKey());
                                o.put("uri", entry.getValue());
                                prefixes.put(o);
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                        
                }
                return prefixes;
        }

        public static void clear() {
                // TODO Auto-generated method stub
                prefixToURIMap.clear();
                URIToPrefixMap.clear();
                init();
        }
        
       

      
        
        
}
