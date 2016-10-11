package ntua.thesis.dis.mapping;


import java.io.File;
import java.io.IOException;
import java.util.ArrayList;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map.Entry;


import javax.servlet.http.HttpServletRequest;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.hp.hpl.jena.query.QueryParseException;






import ntua.thesis.dis.dataspace.Dataset;
import ntua.thesis.dis.dataspace.DataspaceManager;
import ntua.thesis.dis.dataspace.DatasetVocabulary;
import ntua.thesis.dis.importing.SourcesManager;
import ntua.thesis.dis.linking.linkGenerator.LinkGenerator;
import ntua.thesis.dis.service.FileManager;
import ntua.thesis.dis.service.PrefixesManager;
import ntua.thesis.dis.service.ServiceManager;
import ntua.thesis.dis.util.SPARQLUtils;


public class SchemaMappingManager {

        long projectId;
        public ServiceManager sm;
        private File tempTasksDir;
        private File datasetsDir;
        /*private SchemaMappingTask currentMappingTask;*/
        private HashMap<String,JSONObject> overallTargetVocabulary = new HashMap<String,JSONObject>();
        private HashMap<String,SchemaMappingTask> datasetNameToTaskMap= new HashMap<String,SchemaMappingTask>();
        private HashMap<String,SchemaMappingTask> taskMap= new HashMap<String,SchemaMappingTask>();
        
        
        public ExternalVocabularyManager vm;
     
        
        public SchemaMappingManager(ServiceManager serviceManager) {
                
                this.sm = serviceManager;
                vm = new ExternalVocabularyManager(this.sm.getFileManager().getVocabulariesDirectory().toString());
                initializeTargetVocabularyManager();
                PrefixesManager.addPrefixesToURIs(vm.getPrefixes());
        }
     
        private void initializeTargetVocabularyManager(){
                /*try {
                     this.addExternalVocabulary("Data Cube Vocabulary", 
                                    "qb","", 
                                    "http://publishing-statistical-data.googlecode.com/svn/trunk/specs/src/main/vocab/cube.ttl");
                     this.addTargetVocabulary("Foaf vocabulary", 
                                    "foaf","", 
                                    "http://xmlns.com/foaf/spec/index.rdf");
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }*/
        }
        
        private SchemaMappingTask getMappingTask(String taskName) throws NullPointerException{
                if(!this.taskMap.containsKey(taskName)){
                        throw new NullPointerException();
                }
                return this.taskMap.get(taskName);
        }
       
        private void storeMappingTask(String taskName,SchemaMappingTask task){
                this.taskMap.put(taskName,task);
        }
        
        
        public List<String> getDatasetNames() {
                DataspaceManager dm = sm.getDataspaceManager();
                List<String> datasetNames = dm.getDatasetNames();
                return datasetNames;
        }

       

        public SchemaMappingTask getRelatedMappingTask(String datasetName) {
                
                return this.datasetNameToTaskMap.get(datasetName);
        }

        public void createMappingTask(String datasetName, String mappingTaskName){
                DataspaceManager dm = sm.getDataspaceManager();
                FileManager fm = this.sm.getFileManager();
                
                Dataset dataset = dm.getDataset(datasetName);
                projectId = dm.getCurrentDataspaceProjectId();
                tempTasksDir = fm.getTempTasksDirectory().toFile();
                datasetsDir = fm.getDatasetsDirectory(projectId);//this.sm.getFileManager().getDatasetsDirectory().toFile();
                //String filename = dm.getDataset(datasetName).getFileName();
                SchemaMappingTask task = new SchemaMappingTask(mappingTaskName);
                
                task.setInputDataset(dataset);
                task.setMappingFileLocation(tempTasksDir.toString()+"\\"+mappingTaskName+".ttl");
                task.setOutputFile(datasetsDir.toString()+"\\"+datasetName+".nt");
                
                datasetNameToTaskMap.put(dataset.getName(), task);
                this.storeMappingTask(mappingTaskName,task);
        }
        
        
        //for testing
        public int addMappingToTask(Mapping mapping,String mappingTaskName){
                SchemaMappingTask task = this.getMappingTask(mappingTaskName);
                task.addPropertyMapping(mapping);
                return 1;
        }
        
        public int addMappingToTask(JSONObject mapping_o,String mappingTaskName) throws JSONException{
                
                
                
                SchemaMappingTask task = this.getMappingTask(mappingTaskName);
                
                /*if(!mappingTaskName.equals(this.currentMappingTask.getName())){
                        System.out.println("error in mapping file!");
                }*/
                
                
                //JSONArray sourcePatterns = mappingPair.getJSONArray("sourcePatterns");
                JSONArray targetPatterns = mapping_o.getJSONArray("targetPatterns");
                //System.out.println("sourcePatterns");
                ArrayList<String> sourcePatternsList = new ArrayList<String>();
                ArrayList<String> targetPatternsList = new ArrayList<String>();
                ArrayList<String> transformationList = new ArrayList<String>();
 
                sourcePatternsList.add(mapping_o.getString("sPattern"));

                
                for(int j = 0; j < targetPatterns.length();j++){
                        
                        targetPatternsList.add(targetPatterns.getJSONObject(j).getString("pattern"));
                        if (targetPatterns.getJSONObject(j).has("transformation")){
                                transformationList.add(targetPatterns.getJSONObject(j).getString("transformation")); 
                        }else{
                                transformationList.add(null);
                        }
                        
                        //System.out.print(targetPatterns.getJSONObject(j).toString()+"/");
                }
                boolean isCustomized = mapping_o.getBoolean("isCustomized");
        
                Mapping mapping;
             
                mapping = new Mapping(mapping_o.getString("name"),PrefixesManager.getPrefixToUriMap(),PrefixesManager.getUriToPrefixMap(),isCustomized);
                try{
                        mapping.setSourcePatterns(sourcePatternsList);  
                }catch(QueryParseException e){
                        e.printStackTrace();
                        return -1;
                }
                try{
                        mapping.setTargetPatterns(targetPatternsList);
                }catch(QueryParseException e){
                        e.printStackTrace();
                        return -2;
                }
                mapping.setTransformations(transformationList);
                task.addPropertyMapping(mapping);
                this.taskMap.put(mappingTaskName,task);
                return 1;
        }
        
        public JSONObject executeMappingTask(String mappingTaskName) throws IOException {
                
                SchemaMappingTask task = this.getMappingTask(mappingTaskName);
                /*if(!mappingTaskName.equals(this.currentMappingTask.getName())){
                        System.out.println("error in mapping file!");
                }*/
                //currentMappingTask.setPropertyMappingList(propertyMappingList);
                task.start();
                JSONObject results = task.getMappingResultOverview();
                
                System.out.println(" > OVERVIEW IS " + results.toString());
                return results;
        }        
        
        public JSONObject confirmMappingTask(String mappingTaskName){
                
                DataspaceManager dm = sm.getDataspaceManager();
                SchemaMappingTask task = this.getMappingTask(mappingTaskName);
                
                System.out.println("current "+task.getName());
                if(!task.getName().equals(mappingTaskName)){
                        System.out.println("ERROR IN MAPPING TASK NAMES!!!!!");
                        return new JSONObject();
                }
                String datasetName = task.getInputDataset().getName();
                JSONObject jsonMetadata = new JSONObject();
                
                if(task.confirm() > 0){
                        //dm.addMappingTaskToDataset(datasetName, this.currentMappingTask.getName());
                        dm.addToDataspaceVocabulary(task.getTargetVocabulary());
                        dm.addToDataspace(task.getInputDataset());
                        //dm.addToDataspaceModel(this.currentMappingTask.getOutputModel());
                        
                        try {
                                jsonMetadata.put("name",task.getName());
                                jsonMetadata.put("Successful mappings",task.getNumberOfSuccessfulMappings());
                                jsonMetadata.put("Failed mappings",task.getNumberOfFailedMappings());
                                jsonMetadata.put("Generated statements",task.getGeneratedStatements());
                                dm.addMappingTaskMetadataToDataset(datasetName, jsonMetadata);
                        } catch (JSONException e) {
                                e.printStackTrace();
                        } 
                        //this.oldGeneratorMethod(datasetName);
                      
                        
                        if(! dm.getDataset(datasetName).getMetadata().hasRDFSource()){
                                this.addMappingsToGenerator(task);
                        }
                        
                        
                        
                        /*
                         * HashMap<String,String> mappings =
                         * this.currentMappingTask.getMappingsMap();
                         * 
                         * String recordClass; String cellValueProperty;
                         * recordClass =
                         * dm.getDataset(datasetName).getMetadata()
                         * .getRecordRDFClass(); cellValueProperty =
                         * dm.getDataset
                         * (datasetName).getMetadata().getRecordCellValueRDFProperty
                         * (); //System.out.println(
                         * "HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                         * +recordClass); // System.out.println(
                         * "HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                         * +cellValueProperty); if(recordClass != null &&
                         * cellValueProperty != null){
                         * 
                         * linkGen.addClassTermOfDataset(recordClass,
                         * datasetName);
                         * if(mappings.containsKey(cellValueProperty)){
                         * linkGen.addNotAcceptablePath
                         * (mappings.get(cellValueProperty), datasetName); }
                         * 
                         * 
                         * try {
                         * linkGen.addlinkConditionTermToDataset(recordClass,
                         * datasetName); } catch (JSONException e) { // TODO
                         * Auto-generated catch block e.printStackTrace(); }
                         * Iterator<Entry<String,String>> it =
                         * mappings.entrySet().iterator(); JSONObject mapping_o;
                         * Entry<String,String> entry; while(it.hasNext()){
                         * entry = it.next(); mapping_o = new JSONObject(); try
                         * { mapping_o.put("source",entry.getKey());
                         * mapping_o.put("target",entry.getValue());
                         * mapping_o.put("datasetName",datasetName);
                         * linkGen.addMappingToCatalog(mapping_o);
                         * if(mappings.containsKey(cellValueProperty) &&
                         * !entry.getKey().equals(cellValueProperty) &&
                         * !entry.getKey().equals(recordClass)) {
                         * ArrayList<String> path = new ArrayList<String>();
                         * path.add(entry.getKey());
                         * path.add(cellValueProperty);
                         * linkGen.addPropertyPathOfDataset(path,datasetName); }
                         * 
                         * } catch (JSONException e) { // TODO Auto-generated
                         * catch block e.printStackTrace(); } } }
                         */
                }
                System.out.println(this.overallTargetVocabulary.toString());
                return jsonMetadata;            
        }


        private void addMappingsToGenerator(SchemaMappingTask task) {
                
                
               
                LinkGenerator linkGen = LinkGenerator.getInstance(); 
                
                String literalProperty = SourcesManager.recordCellValueRDFProperty;//dm.getDataset(datasetName).getMetadata().getRecordCellValueRDFProperty();  
                
                
                JSONArray mappingPairs = new JSONArray();
                try {
                        mappingPairs = task.getMappingResultOverview().getJSONArray("mappings");
                } catch (JSONException e1) {
                        // TODO Auto-generated catch block
                        e1.printStackTrace();
                }
                
                JSONArray mappings = new JSONArray();
                JSONArray couples;
                JSONObject couple;
                JSONObject propertyMap_o_1;
                JSONObject propertyMap_o_2;
                String sourceTerm = "";
                for(int i = 0; i < mappingPairs.length();i++){
                        
                        try {
                                if(mappingPairs.getJSONObject(i).getBoolean("isCustomized")){
                                        continue;
                                }
                                couples = mappingPairs.getJSONObject(i).getJSONArray("couples");
                                propertyMap_o_1 = new JSONObject();
                                propertyMap_o_2 = new JSONObject();
                                for(int j = 0; j < couples.length();j++){
                                        couple = couples.getJSONObject(j);
                                        System.out.println("COUPLE > "+couple);
                                        sourceTerm = couple.getString("sourceTerm");
                                        
                                        if(PrefixesManager.getVocabularyTermUriInJSONFormat(sourceTerm).getString("name").equals(literalProperty)){
                                                propertyMap_o_2.put("source",sourceTerm);
                                                propertyMap_o_2.put("target",couple.getJSONArray("targetTerms").getJSONObject(0).getString("term"));
                                                propertyMap_o_2.put("children",new JSONArray());
                                        }else{                 
                                                propertyMap_o_1.put("source",sourceTerm);
                                                propertyMap_o_1.put("target",couple.getJSONArray("targetTerms").getJSONObject(0).getString("term"));
                                                propertyMap_o_1.put("children",new JSONArray());
                                        }
                                }
                                System.out.println("PROPERTY 1 > "+propertyMap_o_1);
                                System.out.println("PROPERTY 2 > "+propertyMap_o_2);
                                /*if(propertyMap_o_2.length() > 0){
                                       JSONArray children = new JSONArray();
                                       children.put(propertyMap_o_2);
                                       propertyMap_o_1.put("children",children);
                                }*/
                                propertyMap_o_1.getJSONArray("children").put(propertyMap_o_2);
                                mappings.put(propertyMap_o_1);
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                }
                
                JSONObject datasetMappings = new JSONObject();
                String recordClassTerm = SourcesManager.recordRDFClass;//dm.getDataset(datasetName).getMetadata().getRecordRDFClass();
                try {
                        datasetMappings.put("datasetName", task.getInputDataset().getName());
                        datasetMappings.put("mappings", mappings);
                        if(task.sourceTermExistsInMappings(recordClassTerm)){
                                datasetMappings.put("recordClassMapping", recordClassTerm);
                        }
                       
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                linkGen.addDatasetMapping(datasetMappings);
        }


      
        
        public JSONObject getSourceVocabulary(String datasetName) {
                DataspaceManager dm = sm.getDataspaceManager();
                
                DatasetVocabulary vocabulary = dm.getDataset(datasetName).getVocabulary(1);
                String[] classes = vocabulary.getClasses();
                String[] properties = vocabulary.getProperties();
                JSONObject sourceVocabulary = new JSONObject();
                JSONArray jsonClasses = new JSONArray();
                JSONArray jsonProperties = new JSONArray();
                JSONObject term_o;
                for(int i = 0; i < classes.length; i++){
                        
                        System.out.println(classes[i]);
                        try {
                                term_o = PrefixesManager.getVocabularyTermUriInJSONFormat(classes[i]);
                                /*System.out.println(term_o);
                                if(term_o.get("prefix").equals(PrefixesManager.UNKNOWN_PREFIX)){
                                        term_o.put("prefix","unknown");
                                }*/
                                jsonClasses.put(term_o);
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                }
                for(int i = 0; i < properties.length; i++){
                        System.out.println(properties[i]);
                        try {
                                term_o = PrefixesManager.getVocabularyTermUriInJSONFormat(properties[i]);
                               /* System.out.println(term_o);
                                if(term_o.get("prefix").equals(PrefixesManager.UNKNOWN_PREFIX)){
                                        term_o.put("prefix","unknown");
                                }*/
                                jsonProperties.put(term_o);
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                }
                try {
                        sourceVocabulary.put("classes", jsonClasses);
                        sourceVocabulary.put("properties", jsonProperties);
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                return sourceVocabulary;
        }


        public JSONArray getExternalVocabularies() throws JSONException {
                
                Iterator<Entry<String, JSONObject>> it = this.vm.getAllVocabularies().iterator();
                PrefixesManager.addPrefixesToURIs(this.vm.getPrefixes());
                
                Entry<String, JSONObject> entry;
                JSONObject vocabulary;
                JSONArray vocabularies = new JSONArray();
                System.out.println("get target vocabularies >");
                while(it.hasNext()){
                        entry = it.next();
                        vocabulary = entry.getValue();
                        System.out.println("vocabulary= "+vocabulary);
                        vocabularies.put(vocabulary);
                }
                return vocabularies;
        }

      
        public JSONObject addExternalVocabulary(String vocabularyName, String prefix, String nameSpace,String vocabularyURL) throws JSONException {
                
                System.out.println(vocabularyName);
                
                if(!nameSpace.equals("") && !prefix.equals("")){
                        PrefixesManager.addPrefix(prefix, nameSpace);
                }
                JSONObject vocabulary = new JSONObject();
                vocabulary = this.vm.importVocabulary(vocabularyName,vocabularyURL);
                if(vocabulary!=null){
                        PrefixesManager.addPrefixesToURIs(this.vm.getPrefixes());
                        JSONArray vocabularyWithPrefixes;
                        try {
                                vocabularyWithPrefixes = PrefixesManager.enrichVocabularyArrayWithPrefixes(vocabulary.getJSONArray("terms"));
                                vocabulary.remove("terms");
                                vocabulary.put("terms",vocabularyWithPrefixes);
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                }
                return vocabulary;
        }
        
        public JSONObject addExternalVocabulary(HttpServletRequest request) throws JSONException {
                
                String nameSpace = request.getParameter("vocabularyNs");
                String prefix = request.getParameter("prefix");
                
                if(!nameSpace.equals("") && !prefix.equals("")){
                        PrefixesManager.addPrefix(prefix, nameSpace);
                }
                
                JSONObject vocabulary = new JSONObject();
                vocabulary = this.vm.importVocabulary(request);
                if(vocabulary!=null){
                        PrefixesManager.addPrefixesToURIs(this.vm.getPrefixes());
                        JSONArray vocabularyWithPrefixes;
                        try {
                                vocabularyWithPrefixes = PrefixesManager.enrichVocabularyArrayWithPrefixes(vocabulary.getJSONArray("terms"));
                                vocabulary.remove("terms");
                                vocabulary.put("terms",vocabularyWithPrefixes);
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                }
                return vocabulary;
        }

        public void reset() {
                // TODO Auto-generated method stub
                this.datasetNameToTaskMap.clear();
                this.overallTargetVocabulary.clear();
                this.taskMap.clear();
        }
        
        
        
        
        /*private void oldGeneratorMethod(String datasetName){
        
        DataspaceManager dm = sm.getDatasetManager();
        
        HashMap<String,String> mappings = this.currentMappingTask.getMappingsMap();
        
        String recordClass;
        String cellValueProperty;
        recordClass = dm.getDataset(datasetName).getMetadata().getRecordRDFClass();  
        cellValueProperty = dm.getDataset(datasetName).getMetadata().getRecordCellValueRDFProperty();  
        
        if(recordClass != null && cellValueProperty != null){
                
                linkGen.addClassTermOfDataset(recordClass, datasetName);
                if(mappings.containsKey(cellValueProperty)){
                        linkGen.addNotAcceptablePath(mappings.get(cellValueProperty), datasetName);
                }
                
                
                try {
                        linkGen.addlinkConditionTermToDataset(recordClass, datasetName);
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                Iterator<Entry<String,String>> it = mappings.entrySet().iterator();
                JSONObject mapping_o;
                Entry<String,String> entry;
                while(it.hasNext()){
                        entry = it.next();
                        mapping_o = new JSONObject();
                        try {
                                mapping_o.put("source",entry.getKey());
                                mapping_o.put("target",entry.getValue());
                                mapping_o.put("datasetName",datasetName);
                                linkGen.addMappingToCatalog(mapping_o);
                                if(mappings.containsKey(cellValueProperty) && 
                                   !entry.getKey().equals(cellValueProperty) && 
                                   !entry.getKey().equals(recordClass))
                                {
                                        ArrayList<String> path = new ArrayList<String>();
                                        path.add(entry.getKey());
                                        path.add(cellValueProperty);
                                        linkGen.addPropertyPathOfDataset(path,datasetName); 
                                }
                                
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                }
        }
}*/


/* public JSONArray getDatasetsHistory() {
        DataspaceManager dm = sm.getDatasetManager();
        return dm.getHistoryInfoForMappingPhase();
}*/


/*public JSONArray analyzePatternAndQuery(String pattern, int limit) throws IOException {
       
        SPARQLPathAnalyzer analyzer = new SPARQLPathAnalyzer();
        Iterator<String> variablesIt = analyzer.getVariablesOfClause(pattern);
        Iterator<String> prefixesIt = analyzer.getPrefixesOfClause(pattern);
        String prefixes = "";
        String pref = "";
        
        while(prefixesIt.hasNext()){
                pref = prefixesIt.next();
                prefixes += ("PREFIX " + pref + ":" +"<" + pm.getPrefix(pref) + ">" +"\n");
        }
        
        String variables = "";
        ArrayList<String> variablesList = new ArrayList<String>();
        while(variablesIt.hasNext()){
                String var = variablesIt.next();
                variables += ( var + " ");
                variablesList.add(var);
        }
        
        String queryString = prefixes + 
                             "SELECT " + variables + 
                             "WHERE {" + 
                                 pattern + 
                             "}" + 
                             "LIMIT " + limit;
        System.out.println(queryString);
        Query query = QueryFactory.create(queryString);
        
        File file = this.currentMappingTask.getInputDataset().getFile();
        //File file = Paths.get("C:/Users/John/Desktop/data","output.ttl").toFile();
        
        VocabularyExtractor vox = new VocabularyExtractor();
        vox.readData(file);
        Model model = vox.getModel();
        QueryExecution qexec = QueryExecutionFactory.create(query,model) ;
        JSONArray resultsJSONArray = new JSONArray();
        JSONObject result_o;
        String variableValue = "";
  
        try {
                ResultSet results = qexec.execSelect() ;
                for ( ; results.hasNext() ; )
                {
                        QuerySolution soln = results.nextSolution();
                        result_o = new JSONObject();
                        for(int i = 0; i < variablesList.size(); i++){
                                
                                try {  
                                        variableValue = soln.get(variablesList.get(i)).toString();
                                } catch (NullPointerException e) {
                                        variableValue = "";    
                                }
                                try {
                                        result_o.put(variablesList.get(i),variableValue);
                                } catch (JSONException e) {
                                        
                                        e.printStackTrace();
                                }     
                        }
                        resultsJSONArray.put(result_o);
                        RDFNode x = soln.get("varName") ;       // Get a result variable by name.
                    Resource r = soln.getResource("VarR") ; // Get a result variable - must be a resource
                    Literal l = soln.getLiteral("VarL") ;   // Get a result variable - must be a literal
              }
        } finally { 
                qexec.close(); 
        }
        System.out.println(resultsJSONArray.length());
        //System.out.println(resultsJSONArray.toString());
        return resultsJSONArray;
}*/

/*public void executeMap(Dataset dataset,String mappingFilePath,String mappingTaskName, List<String> targetVocabulary) throws IOException {
        
        SchemaMappingTask task = new SchemaMappingTask(mappingTaskName,mappingFilePath,targetVocabulary);
        task.setInputDataset(dataset);
        task.setOutputFile(datasetsDir+"\\"+dataset.getName() +".nt");
        task.start();
        task.confirm();
}*/
        
        
        
        
        
        
        
        
        /*private JSONArray addPrefixesToTargetVocabulary(JSONArr vocabulary) throws JSONException{
                
                JSONObject vocabulary_o = new JSONObject();
                JSONArray terms = pm.enrichVocabularyArrayWithPrefixes(vocabulary.getJSONArray("terms"));
                
                return vocabulary_o;
        }*/
        
        
        /*public void start() {
                
                TabularToRDFConverter conv = new TabularToRDFConverter();
                
                String fileName = "data.xls";
                File importedDatasetFile = Paths.get("C:/Users/John/Desktop/data",fileName).toFile();
                File exportedFile = Paths.get("C:/Users/John/Desktop/data","outputMapping.ttl").toFile();
                
                int format_pos = fileName.lastIndexOf('.');
                
                conv.setDatasetName(fileName.substring(0, format_pos)); 
                conv.setInputFile(importedDatasetFile);
                conv.setOutputFile(exportedFile);
                
                HashMap<String,String> prefixes = new HashMap<String,String>();
                
                prefixes.put("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
                prefixes.put("rdfs", "http://www.w3.org/2000/01/rdf-schema#");
                String prefix = "tab-data";
                String vocURL = "http://localhost:8080/tab/"+fileName.substring(0, format_pos)+"/TabularDef#";
               
                prefixes.put(prefix,vocURL);
               
                pm.addPrefix(prefix, vocURL);
                
                conv.setDatasetPrefixes(prefixes);
                
                conv.setBaseURI("http://localhost:8080/");
                conv.setCustomizedVocabularyPrefix("tab-data");
                conv.setRecordClass("tabularRecord");
               
                try {
                   conv.convert();
                   
                } catch (IOException e) {
                   // TODO Auto-generated catch block
                   e.printStackTrace();
                }
                  
                DatasetVocabulary vocabulary = new DatasetVocabulary();
                vocabulary.setClasses(conv.getDatasetClasses());
                vocabulary.setProperties(conv.getDatasetProperties());   
                vocabulary.setPrefixes(prefixes);
                
                vocabulary.print();
                
                
                Dataset dataset = new Dataset("graphName", exportedFile,vocabulary);
                JSONObject importingMetadata = new JSONObject();
                
                try {
                        importingMetadata.put("Source","file");
                        importingMetadata.put("Source Name","data.xls");
                        importingMetadata.put("Source Description","data.xls");
                        importingMetadata.put("Type Of Import","file upload");
                        importingMetadata.put("Number Of Records",1000);
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                
                System.out.println(importingMetadata.toString());
                dataset.getMetadata().addImportingMetadata(importingMetadata);
                dm.addDataset(dataset);
                
                File file = Paths.get("C:/Users/John/Desktop/data","testRDF.rdf").toFile();
                VocabularyExtractor vocEx = new VocabularyExtractor();
                DatasetVocabulary rdfVocabulary = new DatasetVocabulary();
                try {
                        vocEx.readData(file);
                } catch (IOException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                rdfVocabulary.setClasses(vocEx.getClassesToString());
                rdfVocabulary.setProperties(vocEx.getPropertiesToString());
                rdfVocabulary.setPrefixes((HashMap<String, String>) prefixes);
                Dataset rdfDataset = new Dataset("graphName2",file,rdfVocabulary);
                dm.addDataset(rdfDataset);
                
                
                
        }*/


       


       /* public LinkGenerator getLinkGenerator() {
                // TODO Auto-generated method stub
                return this.linkGen;
        }*/


       /* public LinkGenerator getLinkGenerator() {
                return this.linkGen;
        }   */   
}
