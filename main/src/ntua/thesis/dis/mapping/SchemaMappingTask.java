package ntua.thesis.dis.mapping;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.hp.hpl.jena.graph.Node;
import com.hp.hpl.jena.graph.Triple;
import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.QueryFactory;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.Property;
import com.hp.hpl.jena.rdf.model.ResIterator;
import de.fuberlin.wiwiss.r2r.FileOrURISource;
import de.fuberlin.wiwiss.r2r.JenaModelOutput;
import de.fuberlin.wiwiss.r2r.JenaModelSource;
import de.fuberlin.wiwiss.r2r.Mapper;
import de.fuberlin.wiwiss.r2r.NTriplesOutput;
import de.fuberlin.wiwiss.r2r.Output;
import de.fuberlin.wiwiss.r2r.Repository;
import de.fuberlin.wiwiss.r2r.Source;
import ntua.thesis.dis.dataspace.Dataset;
import ntua.thesis.dis.dataspace.DatasetVocabulary;
import ntua.thesis.dis.importers.VocabularyExtractor;
import ntua.thesis.dis.service.PrefixesManager;
import ntua.thesis.dis.util.SPARQLUtils;


public class SchemaMappingTask {

        private Dataset inputDataset;
        private MappingFile mappingFile;
        private String mappingFileLocation;
        private String name;
        private ArrayList<Mapping> propertyMappingList;
        private List<String> targetVocabularyList = new ArrayList<String>();
        private HashMap<String,String> targetVocabularyPrefixes = new HashMap<String,String>();
        private HashMap<String,JSONObject> targetVocabulary = new HashMap<String,JSONObject>();
        private String outputFileLocation;
        private Model outputModel;
        static final Logger logger = LoggerFactory.getLogger("Mapping");
        
       /* private HashMap<String,String> prefixesToUriMap = new HashMap<String,String>();*/
        private VocabularyExtractor vocEx;
       
        private JSONObject overview = null;
        private HashMap<String,String> mappingsMap = new HashMap<String,String>();
        
        
        private int numberOfSuccessfullMappings = 0;
        private int numberOfFailedMappings = 0;
        private int totalStatements = 0;
        
        public SchemaMappingTask(String name){
               // pm = prefixesManager;
                vocEx = new VocabularyExtractor();
                propertyMappingList = new ArrayList<Mapping>();
                this.name = name;
                this.outputModel = ModelFactory.createDefaultModel();
               // classMappingList = new ArrayList<ClassMapping>();
        }
        
        public SchemaMappingTask(String taskName,String mappingFileLocation,List<String> targetVocabulary){
                //pm = prefixesManager;
                this.name = taskName;
                this.mappingFileLocation = mappingFileLocation;
                this.targetVocabularyList = targetVocabulary;
                vocEx = new VocabularyExtractor();
                
                this.outputModel = ModelFactory.createDefaultModel();
        }
        
        
        
      /*  public SchemaMappingTask(Dataset inputDataset){
                setInputDataset(inputDataset);
        }*/
        
        
        public Dataset getInputDataset() {
                return inputDataset;
        }

        
        public void setInputDataset(Dataset inputDataset) {
                this.inputDataset = inputDataset;
        }
  
      
      
        public ArrayList<Mapping> getPropertyMappingList() {
                return propertyMappingList;
        }

        
        public void setPropertyMappingList(ArrayList<Mapping> propertyMappingList) {
                this.propertyMappingList = propertyMappingList;
                for(int i = 0; i < this.propertyMappingList.size();i++){
                        Mapping propMapp = this.propertyMappingList.get(i);
                        propMapp.setPrefixesMap(PrefixesManager.getPrefixToUriMap());
                        addToTaskTargetVocabulary(propMapp.getTargetVocabulary());       
                }
        }

        
        private void addToTaskTargetVocabulary(ArrayList<String> vocabulary) {
               
                JSONObject term = null;
                String uri = null;
                String termName = null;
                for(int i = 0; i < vocabulary.size(); i++){
                        try {
                                term = PrefixesManager.getVocabularyTermUriInJSONFormat(vocabulary.get(i));
                                uri = term.getString("uri");
                                termName = term.getString("name");
                                this.targetVocabulary.put(vocabulary.get(i),term);
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                       
                }
        }


       /* public ArrayList<ClassMapping> getClassMappingList() {
                return classMappingList;
        }*/

        
       /* public void setClassMappingList(ArrayList<ClassMapping> classMappingList) {
                this.classMappingList = classMappingList;
                for(int i = 0; i < this.classMappingList.size();i++){
                        ClassMapping classMapp = this.classMappingList.get(i);
                        classMapp.setPrefixesMap(pm.getPrefixesMap());
                        addToTaskTargetVocabulary(classMapp.getTargetVocabulary());
                }
                
        }*/

        private void createMappingFile() throws IOException{
                
                mappingFile = new MappingFile(mappingFileLocation);
                //mappingFile.writeClassMappings(this.classMappingList);
                mappingFile.writeMappings(this.propertyMappingList);
                mappingFile.save();
        }
        
        public Model getOutputModel() {
                return this.outputModel;
        }


        public String getMappingFileLocation() {
                return mappingFileLocation;
        }


        public void setMappingFileLocation(String mappingFile) {
                
                this.mappingFileLocation = mappingFile;
        }


        public String getOutputFile() {
                return outputFileLocation;
        }


        public void setOutputFile(String outputFile) {
                
                this.outputFileLocation = outputFile;
        }
      
        public void start() throws IOException{
                
                if(this.targetVocabularyList.size() == 0){
                        this.startWithNoPredefinedMappingFile();
                }else{
                        this.startWithPredefinedMappingFile();
                }
        }
        
        
        private void startWithNoPredefinedMappingFile() throws IOException{
                
                List<String> targetTerms = this.collectTargetVocabularyTerms();
                this.createMappingFile();  
                logger.info("targetTerms");
                for(int i = 0; i < targetTerms.size();i++){
                        logger.info(targetTerms.get(i));
                }
                File datasetFile = inputDataset.getFile();
                logger.info("source = "+datasetFile.toString());
               // logger.info("output = "+outputFileLocation);
                this.startMapper(datasetFile.toString(), targetTerms);
        }
        
        private void startWithPredefinedMappingFile(){
                
                String datasetFileLocation = inputDataset.getFile().toString();
                logger.info(this.targetVocabularyList.get(0));
                this.startMapper(datasetFileLocation, this.targetVocabularyList);
        }
        
        private void startMapper(String datasetFileLocation,List<String> targetTerms){
                
                //Source jenasource = new JenaModelSource();
                Source source = new FileOrURISource("file:"+datasetFileLocation);
                inputDataset.getVocabulary().print();
                logger.info(mappingFileLocation);
                //Path path = Paths.get(outputFileLocation);
                //logger.info(""+Files.deleteIfExists(path));
                
                logger.info("MODEL SIZE BEFORE > "+this.outputModel.size());
                this.outputModel.removeAll();//clear first
                logger.info("MODEL SIZE AFTER > "+this.outputModel.size());
                Output output = new JenaModelOutput(this.outputModel);
                //Output output = new NTriplesOutput(outputFileLocation);
                Repository repos = Repository.createFileOrUriRepository(mappingFileLocation);
                //Mapper.transform(source, output, repos, targetTerms);
                Mapper.transform(source, output, repos, targetTerms);
                //output.close();
                
        }
        
        
        private JSONObject createMappingResultOverview() {
                
               
                JSONObject overview = null;
                try {
                       
                        vocEx.setModel(this.outputModel);
                        
                        JSONArray properties = vocEx.getRDFProperties();
                        JSONArray propertiesRO  = new JSONArray();
                        String propertyURI = null;
                        JSONObject property_o = null;
                        
                        for(int i = 0;i < properties.length();i++){
                                property_o = properties.getJSONObject(i);
                                propertyURI = property_o.getString("property");
                                
                                JSONObject propertyRO_o = new JSONObject();
                                propertyRO_o = PrefixesManager.getVocabularyTermUriInJSONFormat(propertyURI);
                                propertiesRO.put(propertyRO_o);
                        }
                        JSONArray classes = vocEx.getRDFClasses();
                      
                        String classURI = null;
                        JSONObject class_o = null;
                        for(int i = 0;i < classes.length();i++){
                                class_o = classes.getJSONObject(i);
                                classURI = class_o.getString("class");
                                JSONObject classRO_o = new JSONObject();
                                classRO_o = PrefixesManager.getVocabularyTermUriInJSONFormat(classURI);
                                propertiesRO.put(classRO_o);
                        }             
                        
                        
                        
                        JSONArray mappings = new JSONArray();
                        JSONArray couples;
                        JSONObject mapping_o;
                        Mapping propMap;
                        JSONObject mapping_result_o;
                        int triplesNumber = 0;
                        boolean isCorrect = true;
                        System.out.println("property size list is "+this.propertyMappingList.size());
                        for(int i = 0; i < this.propertyMappingList.size();i++){
                                propMap = this.propertyMappingList.get(i);
                                mapping_o = new JSONObject();
                                mapping_o.put("name", propMap.getName());
                                mapping_o.put("sPattern", propMap.getSourcePatterns().get(0));
                                mapping_o.put("isCustomized", propMap.isCustomized());
                                couples = this.getCouplesOfMapping(propMap);
                                
                                if(couples.length() == 0){
                                        mapping_result_o = this.checkMappingResult(propMap);
                                        isCorrect = mapping_result_o.getBoolean("isCorrect");
                                        triplesNumber = mapping_result_o.getInt("triples");
                                }else{
                                        isCorrect = true;
                                        triplesNumber = this.getNumberOfTriples(couples);
                                        
                                }
                                mapping_o.put("isCorrect", isCorrect);
                                mapping_o.put("couples", couples);
                                mapping_o.put("numberOfTriples", triplesNumber);
                                mappings.put(mapping_o);
                                System.out.println("-------------------------------------------------------");
                        }
                        this.totalStatements = vocEx.getNumberOfStatements();
                        overview = new JSONObject();
                        overview.put("statements",this.totalStatements);
                        
                        overview.put("targetVocabulary",propertiesRO);  
                        overview.put("mappings",mappings);
                        logger.info("target vocabulary length is "+propertiesRO.length());
                        this.overview = overview;
                        //System.out.println(overview.toString());
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                return overview;      
        }

        private int getNumberOfTriples(JSONArray couples) {
                // TODO Auto-generated method stub
                JSONObject couple;
                int count = 0;
                for(int i = 0; i < couples.length();i++){
                        try {
                                couple = couples.getJSONObject(i);
                                JSONArray targetTerms = couple.getJSONArray("targetTerms");
                                for(int j = 0; j < targetTerms.length();j++){
                                        count+=Integer.parseInt(targetTerms.getJSONObject(j).getString("num"));
                                }
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                                return -1;
                        }
                        
                }
                return count;
        }

        private JSONObject checkMappingResult(Mapping mapping) {
                
                boolean isCorrect = true;
                int numberOfTriples;
                /*1st way:query*/
                String targetPattern = mapping.getTargetPatterns().get(0);
                String prefixesString = SPARQLUtils.getPrefixesForSPARQLQuery(PrefixesManager.getPrefixToUriMap());
                String queryString = prefixesString + " SELECT * WHERE {" + targetPattern + "}";
   
                Query query = QueryFactory.create(queryString);
                QueryExecution qexec = QueryExecutionFactory.create(query, this.vocEx.getModel()) ;
                ResultSet results = qexec.execSelect();
                JSONArray resultsJSON = SPARQLUtils.getSPARQLQueryResultsInJSON(results);
                if(resultsJSON.length() == 0){
                        isCorrect = false;
                        this.numberOfFailedMappings++;
                }else{
                        this.numberOfSuccessfullMappings++;
                       
                }
                numberOfTriples = resultsJSON.length();
                JSONObject mapping_result_o = new JSONObject();
                try {
                        mapping_result_o.put("isCorrect",isCorrect);
                        mapping_result_o.put("triples",numberOfTriples);
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                
                /*2nd way:check target vocabulary of mapping*/
                
                /*String targetPattern = mapping.getTargetPatterns().get(0);
                String prefixesString = SPARQLUtils.getPrefixesForSPARQLQuery(pm.getPrefixToUriMap());
                String queryString = prefixesString + " SELECT * WHERE {" + targetPattern + "}";
                List<Triple> triples = SPARQLUtils.getTriplesOfQuery(queryString);*/
                
                return mapping_result_o;
        }

        private JSONArray getCouplesOfMapping(Mapping mapping) throws JSONException{
                
                JSONArray couples = new JSONArray();
                ArrayList<String> sourceTerms = mapping.getSourceTerms();
                for(int j = 0; j < sourceTerms.size();j++){
                        logger.info("SOURCE TERM > "+sourceTerms.get(j));
                        JSONObject couple = new JSONObject();
                        couple.put("sourceTerm",sourceTerms.get(j));
                        JSONArray jsonTargetTerms = new JSONArray();
                        ArrayList<String> targetTerms = mapping.getTargetTerms(sourceTerms.get(j));
                        if(targetTerms == null){
                                return couples;
                        }
                        for(int k = 0; k < targetTerms.size();k++){
                                System.out.print(" ----> "+targetTerms.get(k));
                                                       
                                JSONObject target = new JSONObject();
                                target.put("term",targetTerms.get(k));
                                target.put("num",vocEx.getNumberOfStatementsForVocabularyTerm(targetTerms.get(k)));
                                jsonTargetTerms.put(target); 
                                if(vocEx.getNumberOfStatementsForVocabularyTerm(targetTerms.get(k))>0){
                                        System.out.println("success!");
                                        this.numberOfSuccessfullMappings++;                  
                                        this.mappingsMap.put(sourceTerms.get(j),targetTerms.get(k));
                                }else{
                                        System.out.println(" failed");
                                        this.numberOfFailedMappings++;
                                }
                        }  
                        couple.put("targetTerms", jsonTargetTerms);
                        couples.put(couple);
                }   
                return couples;
        }
        
        
       /* public int getNumberOfStatementsOfProperty(String propertyURI){
                int i = 0;
                Property property = outputDatasetModel.getProperty(propertyURI);
                if (property.isProperty()){
                        ResIterator it = outputDatasetModel.listSubjectsWithProperty(property);
                        while (it.hasNext()){
                                i++;
                                it.next();
                        }
                }
                return i;
        }

        public int getNumberOfStatementsOfClass(String classURI){
                int i = 0;
               
                String[] tokens = split(classURI);
                String prefix = null;
                
                
                prefix = pm.getPrefixFromNsURI(tokens[0]);
                
                
                
                StringBuilder queryString = new StringBuilder();
                queryString.append("PREFIX "+ prefix +":"+"<"+tokens[0]+">\n"); 
                queryString.append("PREFIX "+ "rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n");
                queryString.append( "SELECT ?x WHERE {"+
                                    "?x "+ "rdf:type"+ 
                                    " " + prefix + ":"+ tokens[1]+"}");
                                    
                
                //System.out.println(queryString);
                Query query = QueryFactory.create(queryString.toString()) ;
                QueryExecution qexec = QueryExecutionFactory.create(query, outputDatasetModel) ;
                try {
                  ResultSet results = qexec.execSelect() ;
                  for ( ; results.hasNext() ; )
                  {
                    results.nextSolution() ;
                    i++;
                    RDFNode x = soln.get("varName") ;       // Get a result variable by name.
                    Resource r = soln.getResource("VarR") ; // Get a result variable - must be a resource
                    Literal l = soln.getLiteral("VarL") ;   // Get a result variable - must be a literal
                  }
                } finally { qexec.close() ; }
                return i;
        }
        */
        
        
        public JSONObject getMappingResultOverview() {
                if(this.overview == null){
                        return this.createMappingResultOverview();
                }
                return this.overview;//createMappingResultOverview();
                
        }
        
        
        /*private void print(String[] array) {
                for(int i = 0;i<array.length;i++){
                        System.out.println(array[i]);
                }
                
        }*/


       
        private ArrayList<String> collectTargetVocabularyTerms() {
                
                ArrayList<String> targetVocabularyTerms = new ArrayList<String>();
                ArrayList<String> targetPatterns = null;
                for(int i = 0; i < propertyMappingList.size(); i++){
                        targetPatterns = propertyMappingList.get(i).getTargetPatterns();
                        for(int j = 0; j < targetPatterns.size(); j++){
                                
                                //fix me with sparqlUtils.getTriplesOfPattern!!
                                
                                List<Triple> triples = SPARQLUtils.getTriplesOfPattern(targetPatterns.get(j), PrefixesManager.getPrefixToUriMap());
                                
                                for(Triple triple : triples){
                                        Node predicate = triple.getPredicate();
                                        Node object = triple.getObject();
                                        
                                        if(predicate.isURI()){
                                                targetVocabularyTerms.add(predicate.toString());
                                        }
                                        if(!object.isVariable()){
                                                targetVocabularyTerms.add(object.toString());
                                        }
                                }
                               
                                
                        }     
                }
                return targetVocabularyTerms;
          
        }
        
        
        
      
        public int confirm() {
                logger.info(targetVocabularyPrefixes.toString());
                File outputDatasetFile = Paths.get(outputFileLocation).toFile();
                
                
                this.outputModel = vocEx.getModel();
                if(SPARQLUtils.writeModelToFile(this.outputModel,outputDatasetFile,"NT")<0){
                        return -1;
                }
                
                
                String[] classesToString = vocEx.getClassesToString();
                String[] propertiesToString = vocEx.getPropertiesToString();
                
                DatasetVocabulary vocabulary = new DatasetVocabulary();
                vocabulary.setClasses(classesToString);
                vocabulary.setProperties(propertiesToString);
                vocabulary.setPrefixes(targetVocabularyPrefixes);
                inputDataset.setFile(outputDatasetFile,2);
                inputDataset.setVocabulary(vocabulary,2);
               
                
                JSONObject term_o;
                for(int i = 0; i < classesToString.length;i++){
                        try {
                                term_o = PrefixesManager.getVocabularyTermUriInJSONFormat(classesToString[i]);
                                this.targetVocabulary.put(classesToString[i], term_o);
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                }
                for(int i = 0; i < propertiesToString.length;i++){
                        try {
                                term_o = PrefixesManager.getVocabularyTermUriInJSONFormat(propertiesToString[i]);
                                this.targetVocabulary.put(propertiesToString[i], term_o);
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                }
                
                System.out.println(inputDataset.getName());
                
                
                
                //this.outputModel.removeAll();//free model in order to save space in memory
                
                return 1;
        }

        
        public HashMap<String,JSONObject> getTargetVocabulary() {
                
                return this.targetVocabulary;
        }


        public String getName() {
                
                return this.name;
        }


        public int getNumberOfSuccessfulMappings() {
               
                return this.numberOfSuccessfullMappings;
        }


        public int getNumberOfFailedMappings() {
                // TODO Auto-generated method stub
                return this.numberOfFailedMappings;
        }


        public int getGeneratedStatements() {
                // TODO Auto-generated method stub
                return this.totalStatements;
        }

        public HashMap<String, String> getMappingsMap() {
                return this.mappingsMap;
        }

        /*public JSONArray getMappings() {
                
                return null;
        }*/

        public boolean sourceTermExistsInMappings(String sourceTerm) {
                logger.info("MAPPINGS MAP > "+this.mappingsMap.toString());
                return this.mappingsMap.containsKey(sourceTerm);
        }

        public void addPropertyMapping(Mapping mapping) {
               
                this.propertyMappingList.add(mapping);
        }
}








/*JSONArray couples = new JSONArray();
ArrayList<String> sourceTerms = propMap.getSourceTerms();
for(int j = 0; j < sourceTerms.size();j++){
        System.out.print("SOURCE TERM > "+sourceTerms.get(j));
        JSONObject couple = new JSONObject();
        couple.put("sourceTerm",sourceTerms.get(j));
        JSONArray jsonTargetTerms = new JSONArray();
        ArrayList<String> targetTerms = propMap.getTargetTerms(sourceTerms.get(j));
        for(int k = 0; k < targetTerms.size();k++){
                System.out.print(" ----> "+targetTerms.get(k));
                String[] tokens = targetTerms.get(k).split(":");
                
                JSONObject target = new JSONObject();
                target.put("term",targetTerms.get(k));
                target.put("num",vocEx.getNumberOfStatementsForVocabularyTerm(pm.getPrefix(tokens[0])+tokens[1]));
                jsonTargetTerms.put(target);
                
                
                if(vocEx.getNumberOfStatementsForVocabularyTerm(pm.getPrefix(tokens[0])+tokens[1])>0){
                        System.out.println(" success!");
                        this.numberOfSuccessfullMappings++;
                        
                        this.mappingsMap.put(sourceTerms.get(j),targetTerms.get(k));
                }else{
                        System.out.println(" failed");
                        this.numberOfFailedMappings++;
                }
        }  
        couple.put("targetTerms", jsonTargetTerms);
        couples.put(couple);
}*/