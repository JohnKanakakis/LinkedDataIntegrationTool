
package ntua.thesis.dis.importers;


import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import ntua.thesis.dis.util.SPARQLUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.hp.hpl.jena.graph.Node;
import com.hp.hpl.jena.graph.Triple;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.Resource;
import com.hp.hpl.jena.rdf.model.Statement;
import com.hp.hpl.jena.rdf.model.StmtIterator;
import com.hp.hpl.jena.vocabulary.RDF;


public class VocabularyExtractor {

        private Model model = ModelFactory.createDefaultModel();
        private int total_model_statements = 0;
        private ArrayList<String> properties;
        private ArrayList<String> classes;
        private HashMap<String,String> uriToPrefixMap; 
        private HashMap<String, Integer> vocabularyTermToCardinalityMap;
        
        
        public VocabularyExtractor(){
                vocabularyTermToCardinalityMap = new HashMap<String, Integer>();
                properties = new ArrayList<String>();
                classes = new ArrayList<String>();
                uriToPrefixMap = new HashMap<String, String>();
        }
        
        public void extendUriToPrefixMap(HashMap<String,String> uriToPrefixMap){
                this.uriToPrefixMap.putAll(uriToPrefixMap);
        }
        
        public void readData(File file) throws IOException {
                this.createModel(file);
                uriToPrefixMap = (HashMap<String, String>) model.getNsPrefixMap();
                this.readModel();
        }
     
        public void setModel(Model model){
                this.model = model;
                uriToPrefixMap = (HashMap<String, String>) model.getNsPrefixMap();
                this.readModel();
        }
        
        
        private void createModel(File file) throws IOException{
                
                this.reset();
                this.model = SPARQLUtils.readRdfFile(file);
        }
        
        private void reset() {
                
                if(this.model!=null){
                        this.model.removeAll();
                }
                this.vocabularyTermToCardinalityMap.clear();
                this.properties.clear();
                this.classes.clear();
                this.uriToPrefixMap.clear();
                this.total_model_statements = 0;
        }

        
        private void readModel(){

                StmtIterator it = model.listStatements();
                int number_of_statements = 0;
                
                String key;
                Statement statement;
              
                while (it.hasNext()) {
                        statement = it.next();
                        key = statement.getPredicate().toString();
                        if(key.equals(RDF.type.toString())){
                               String rdfClass = statement.getObject().toString();
                               if (!vocabularyTermToCardinalityMap.containsKey(rdfClass)) {
                                       classes.add(rdfClass.toString());
                                       vocabularyTermToCardinalityMap.put(rdfClass, new Integer(1));
                               }else{
                                       vocabularyTermToCardinalityMap.put(rdfClass, vocabularyTermToCardinalityMap.get(rdfClass)+1);
                               }
                        }
                        if (!vocabularyTermToCardinalityMap.containsKey(key)) {
                                properties.add(key);
                                vocabularyTermToCardinalityMap.put(key, new Integer(1));
                        }else{
                                vocabularyTermToCardinalityMap.put(key, vocabularyTermToCardinalityMap.get(key)+1);
                        }
                        number_of_statements++;
                }
                System.out.println("vocabularyMap "+vocabularyTermToCardinalityMap.toString());
                total_model_statements = number_of_statements; 
                
                //this.printData();
        };
        
        
        private void printData(){
                
                StmtIterator it = this.model.listStatements();
                Statement statement = null;
                Node subject = null;
                Node predicate = null;
                Node object = null;
                Triple triple = null;
                while(it.hasNext()){
                        statement = it.next();
                        triple = statement.asTriple();
                        subject = triple.getSubject();
                        predicate = triple.getPredicate();
                        object = triple.getObject();
                        System.out.println(subject.toString() + " " + predicate.toString() + " " + object.toString() );
                }
        }
        
        
        
        /*private void readClasses(){
                
                NodeIterator cl = model.listObjectsOfProperty(RDF.type);

                while (cl.hasNext()) {
                        String rdfClassString = cl.next().toString();
                        
                        classes.add(rdfClassString);
                }  
        };*/

        public JSONArray getRDFClasses() throws JSONException {

                // ExtendedIterator<OntClass> it = ((OntModel)
                // model).listNamedClasses();

                Iterator<String> cl = classes.iterator();

                JSONArray rdfClasses = new JSONArray();

                while (cl.hasNext()) {
                        String rdfClassString = cl.next();
                        
                        JSONObject rdfClass = new JSONObject();
                        rdfClass.put("class", rdfClassString);
                        rdfClasses.put(rdfClass);
                }
                // ExtendedIterator<OntProperty> itp = ((OntModel)
                // model).listAllOntProperties();

                return rdfClasses;
        }

        public JSONArray getRDFProperties() throws JSONException {

                // ExtendedIterator<OntClass> it = ((OntModel)
                // model).listNamedClasses();

                JSONArray rdfProperties = new JSONArray();

                Iterator<String> it = properties.iterator();
                String value;
                while (it.hasNext()) {
                        value = it.next();
                        JSONObject rdfProperty = new JSONObject();
                        rdfProperty.put("property", value);
                        rdfProperties.put(rdfProperty);
                }
     
                return rdfProperties;
        }

        public int getNumberOfStatements() {
               return total_model_statements;
        }
        
        public Map<String,String> getPrefixesMap(){
                return uriToPrefixMap;
        }
        
        public String[] getPropertiesToString(){
                
                String[] propertiesWithPrefix = new String[properties.size()];
                for(int i = 0; i < properties.size();i++){
                        propertiesWithPrefix[i] = properties.get(i);//convertToTermWithPrefix(properties.get(i));
                }
                return propertiesWithPrefix;
        }

        public String[] getClassesToString(){
                
                String[] classesWithPrefix = new String[classes.size()];
                for(int i = 0; i < classes.size();i++){
                        classesWithPrefix[i] = classes.get(i);//convertToTermWithPrefix(classes.get(i));
                }
                return classesWithPrefix;
        }
        
       /* private JSONObject getTermInShort(String termUri) {
                
                Property property = this.model.createProperty(termUri);
                
                String name = property.getLocalName();
                String namespace = property.getNameSpace();
                String prefix = this.uriToPrefixMap.get(namespace);
                
                JSONObject o = new JSONObject();
                try {
                        o.put("prefix", prefix);
                        o.put("uri",namespace);
                        o.put("name",name);
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                
                int pos = 0; 
                if(property.indexOf('#') == -1){
                        pos = property.lastIndexOf('/');
                }
                else{
                        pos = property.lastIndexOf('#');  
                }
                String nsURI = property.substring(0, pos+1);
                String prefix = model.getNsURIPrefix(nsURI);
                String propertyName = property.substring(pos+1,property.length());
                return o;
        }*/
        
        public int getNumberOfStatementsForVocabularyTerm(String term){
                if(this.vocabularyTermToCardinalityMap.get(term) == null){
                        return 0;
                }
                return this.vocabularyTermToCardinalityMap.get(term);
        }

        
        
        public Model getModel() {
                
                return this.model;
        }

        public void readVocabulary(File file) throws IOException {
                this.createModel(file);
                
        }

        
        
       
}
