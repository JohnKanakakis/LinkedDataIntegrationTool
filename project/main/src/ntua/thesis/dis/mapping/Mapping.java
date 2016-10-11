package ntua.thesis.dis.mapping;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import ntua.thesis.dis.service.PrefixesManager;
import ntua.thesis.dis.util.SPARQLUtils;

import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.hp.hpl.jena.graph.Node;
import com.hp.hpl.jena.graph.Triple;
import com.hp.hpl.jena.query.QueryParseException;
import com.hp.hpl.jena.rdf.model.ReifiedStatement;
import com.hp.hpl.jena.rdf.model.Statement;
import com.hp.hpl.jena.sparql.core.TriplePath;
import com.hp.hpl.jena.vocabulary.RDF;



public class Mapping {
        
        private ArrayList<String> sourcePatterns;
        private ArrayList<String> targetPatterns;
        private ArrayList<String> transformations;
        private HashMap<String,String> prefixToUriMap;
        private HashMap<String,String> uriToPrefixMap;
        private ArrayList<String> prefixes;
        private ArrayList<String> targetVocabulary = new ArrayList<String>();
        private HashMap<String,String> subjectToSourceVocabularyMap = new HashMap<String,String>();
        private HashMap<String,ArrayList<String>> sourceVocabularyToTargetVocabularyMap = new HashMap<String,ArrayList<String>>();
        private String name;
        private boolean isCustomized;

        static final Logger logger = LoggerFactory.getLogger("Mapping"); 
      
        public Mapping(String name, HashMap<String, String> prefixToUriMap, HashMap<String, String> uriToPrefixMap,boolean isCustomized) throws QueryParseException{
                this.name = name;
                this.isCustomized = isCustomized;
                this.uriToPrefixMap = uriToPrefixMap;
                this.prefixToUriMap = prefixToUriMap;
                prefixes = new ArrayList<String>();
        }

        public ArrayList<String> getSourcePatterns() {
                return sourcePatterns;
        }
        
        public boolean isCustomized(){
                return this.isCustomized;
        }
        
        
        private void parsePattern(String pattern) {
                
                String prefixesString = SPARQLUtils.getPrefixesForSPARQLQuery(this.prefixToUriMap);
                
                String queryString = "";
                String selectString = "select * where{" + pattern + "}";
                queryString+=(prefixesString + selectString);
                logger.info(queryString);
                SPARQLUtils.parseQuery(queryString);
        }
        
        
        
        
        
        public void setSourcePatterns(ArrayList<String> sourcePatterns) {
                this.sourcePatterns = sourcePatterns;
               
                
                for(int i = 0; i < this.sourcePatterns.size();i++){
                        
                        this.parsePattern(this.sourcePatterns.get(i));
                       
                        logger.info("SOURCE PATTERN > "+this.sourcePatterns.get(i));
                        List<Triple> triplesOfPattern = SPARQLUtils.getTriplesOfPattern(this.sourcePatterns.get(i),this.prefixToUriMap);
                        for(int j = 0; j < triplesOfPattern.size();j++){
                                logger.info("TRIPLE  > "+triplesOfPattern.get(j));
                                String subject = triplesOfPattern.get(j).getSubject().toString();
                                
                                
                                Triple triple = triplesOfPattern.get(j);
                                
                                
                                Node predicate = triple.getPredicate();
                                Node object = triple.getObject();
                                
                                if(predicate.matches(RDF.type.asNode())){
                                        if(object.isVariable()){
                                                logger.error("rdf:type with variable as object is not allowed!");
                                                return;
                                        }
                                        this.subjectToSourceVocabularyMap.put(subject, object.toString());
                                }else{
                                        this.subjectToSourceVocabularyMap.put(subject, predicate.toString());
                                }
                        }   
                }
        }
          
      

        public void setTargetPatterns(ArrayList<String> targetPatterns) {
                this.targetPatterns = targetPatterns;
                
               
                String subject;
                //String object;
                
                for(int i = 0; i < this.targetPatterns.size();i++){
                        this.parsePattern(this.targetPatterns.get(i));
                        logger.info("TARGET PATTERN > "+this.targetPatterns.get(i));
                        List<Triple> triplesOfPattern = SPARQLUtils.getTriplesOfPattern(this.targetPatterns.get(i),this.prefixToUriMap);
                        
                        for(int j = 0; j < triplesOfPattern.size();j++){  
                             System.out.println("TRIPLE  > "+triplesOfPattern.get(j));
                             subject = triplesOfPattern.get(j).getSubject().toString();
                            
                             Triple triple = triplesOfPattern.get(j);
                             
                             ArrayList<String> terms = new ArrayList<String>();
                             Node predicate = triple.getPredicate();
                             Node object = triple.getObject();
                             
                             System.out.println(" predicate > "+predicate.toString() + " is rdf:type > "+predicate.matches(RDF.type.asNode()));
                             System.out.println(" object > "+object.toString() + " is uri > "+object.isURI());
                             if(predicate.matches(RDF.type.asNode())){
                                     if(object.isVariable()){
                                             logger.error("rdf:type with variable as object is not allowed!");
                                             return;
                                     }
                                     terms.add(object.toString());
                                     this.targetVocabulary.add(predicate.toString());
                                     this.targetVocabulary.add(object.toString());
                             }else{
                                     this.targetVocabulary.add(predicate.toString());
                                     /*if(object.isURI()){
                                             this.targetVocabulary.add(object.toString());
                                     }*/
                                     terms.add(predicate.toString());
                             }
                             
                             
                           
                             String sourceVocabularyTerm = this.subjectToSourceVocabularyMap.get(subject);
                             logger.info(sourceVocabularyTerm);
                      
                             if(!this.sourceVocabularyToTargetVocabularyMap.containsKey(sourceVocabularyTerm)){
                                     this.sourceVocabularyToTargetVocabularyMap.put(sourceVocabularyTerm,new ArrayList<String>());
                             }
                             ArrayList<String> list =  this.sourceVocabularyToTargetVocabularyMap.get(sourceVocabularyTerm);
                             for(String term :terms){
                                     list.add(term);
                             }
                             this.sourceVocabularyToTargetVocabularyMap.put(sourceVocabularyTerm, list);
                        }
                }
        }
        
        
        public ArrayList<String> getTargetTerms(String sourceTerm){
                return this.sourceVocabularyToTargetVocabularyMap.get(sourceTerm);
        }
        
        public ArrayList<String> getSourceTerms(){
                Iterator<String> it = this.subjectToSourceVocabularyMap.values().iterator();
                ArrayList<String> sourceTerms = new ArrayList<String>();
                while (it.hasNext()){
                        sourceTerms.add(it.next());
                }
                return sourceTerms;
        };
        
        public ArrayList<String> getTargetVocabulary() {
                return this.targetVocabulary;
        }

        public void setPrefixesMap(HashMap<String, String> globalPrefixesMap) {
                
                this.prefixToUriMap.putAll(globalPrefixesMap);
        }
        
        
        
        public ArrayList<String> getTargetPatterns() {
                return targetPatterns;
        }     
       

        public ArrayList<String> getTransformations() {
                return transformations;
        }

        public void setTransformations(ArrayList<String> transformations) {
                this.transformations = transformations;
        }  
        
       /* private ArrayList<String> getTermsFromTriple(Triple triple) {
                
                
                ArrayList<String> terms = new ArrayList<String>();
                
                Node predicate = triple.getPredicate();
                Node object = triple.getObject();
                String prefix;
                
                terms.add(predicate.toString());
                
                if(!object.isVariable()){
                        
                        terms.add(object.toString());
                }
                return terms;
        }*/

        public HashMap<String, String> getPrefixesWithNsUri() {
                return prefixToUriMap;
        }

        public String getName() {
                // TODO Auto-generated method stub
                return this.name;
        }
        
}