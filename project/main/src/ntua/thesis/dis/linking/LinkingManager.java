package ntua.thesis.dis.linking;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map.Entry;
import java.util.Set;


import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.QueryFactory;
import com.hp.hpl.jena.query.QuerySolution;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.RDFNode;

import ntua.thesis.dis.dataspace.Dataset;
import ntua.thesis.dis.dataspace.DataspaceManager;
import ntua.thesis.dis.importing.SourcesManager;

import ntua.thesis.dis.linking.linkGenerator.LinkGenerator;
import ntua.thesis.dis.mapping.SchemaMappingManager;
import ntua.thesis.dis.mapping.SchemaMappingTask;
import ntua.thesis.dis.service.PrefixesManager;
import ntua.thesis.dis.service.ServiceManager;
import ntua.thesis.dis.util.SPARQLUtils;


public class LinkingManager {

        static final Logger logger = LoggerFactory.getLogger("LinkingManager");
        public ServiceManager sm;
        
        private FunctionManager functionManager;
        private File tasksDir;
        private File datasetsDir;
        private HashMap<String,LinkingTask> linkingTasksMap = new HashMap<String,LinkingTask>();
        private JSONArray predefinedLinkingTasks;
        private LinkGenerator linkGen;
        
        public LinkingManager(ServiceManager serviceManager){
              
                this.sm = serviceManager;
                tasksDir = sm.getFileManager().getTempTasksDirectory().toFile();
                datasetsDir = sm.getFileManager().getTempDatasetsDirectory().toFile();
                linkGen = LinkGenerator.getInstance();
                try {
                        functionManager = new FunctionManager();
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                
        }
        
        public JSONObject getFunctions() throws JSONException{

                return functionManager.getFunctions();    
        }
        
        public JSONArray createPredefinedLinkingTasks(){
               
                
                this.predefinedLinkingTasks = new JSONArray();
                
                JSONArray links = linkGen.generateLinks();
                
                JSONObject link_o;
                JSONObject sourceLinkInfo;
                JSONObject targetLinkInfo;
                JSONObject linkTaskInfo;
                
               
                
                for(int i = 0; i < links.length();i++){
                        try {
                                link_o = links.getJSONObject(i);
                                if(!this.isUsefulLink(link_o)) continue;
                                
                                sourceLinkInfo = this.getLinkInfo(link_o.getJSONObject("sourceLinkingInfo"));
                                targetLinkInfo = this.getLinkInfo(link_o.getJSONObject("targetLinkingInfo"));
                                
                                System.out.println("SOURCE LINK INFO > "+sourceLinkInfo);
                                System.out.println("TARGET LINK INFO > "+targetLinkInfo);
                                linkTaskInfo = new JSONObject();
                                
                                linkTaskInfo.put("sourceDatasetName",link_o.getJSONObject("sourceLinkingInfo").getString("datasetName"));
                                linkTaskInfo.put("targetDatasetName",link_o.getJSONObject("targetLinkingInfo").getString("datasetName"));
                                
                                linkTaskInfo.put("sourcePropertyPath",sourceLinkInfo.getString("basicPropertyTerm")+"/"+
                                                                      sourceLinkInfo.getString("literalPropertyTerm"));
                                linkTaskInfo.put("targetPropertyPath",targetLinkInfo.getString("basicPropertyTerm")+"/"+
                                                                      targetLinkInfo.getString("literalPropertyTerm"));
                                
                                this.predefinedLinkingTasks.put(linkTaskInfo);
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                }
                return this.predefinedLinkingTasks;
        }
        
        
        private boolean isUsefulLink(JSONObject link_o) {
                
                String sourceDatasetName = "";
                String recordClassTerm = "";
                String datasetClassTerm = "";
                String sourceTerm = "";
                try {
                        sourceTerm = link_o.getJSONObject("sourceLinkingInfo").getString("source");
                        sourceTerm = SPARQLUtils.getPropertyName(sourceTerm);
                        logger.info("sourceTerm > "+sourceTerm);
                        sourceDatasetName = link_o.getJSONObject("sourceLinkingInfo").getString("datasetName");
                        
                        recordClassTerm = SourcesManager.recordRDFClass;//dm.getDataset(sourceDatasetName).getMetadata().getRecordRDFClass();
                        System.out.println("RECORD CLASS TERM > "+recordClassTerm);
                        if(recordClassTerm.equals(sourceTerm)){
                                return false;
                        }
                        datasetClassTerm = SourcesManager.datasetRDFClass;//dm.getDataset(sourceDatasetName).getMetadata().getDatasetRDFClass();
                        System.out.println("DATASET CLASS TERM > "+datasetClassTerm);
                        if(datasetClassTerm.equals(sourceTerm)){
                                return false;
                        }
                       // mappingTask = schMan.getRelatedMappingTask(sourceDatasetName);
                        
                        System.out.println("DATASET > "+sourceDatasetName);
                        /*if(!mappingTask.sourceTermExistsInMappings(recordClassTerm)){
                                return false;
                        }*/
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                
                return true;
        }

        private String getRecordClassTargetMappingTerm(String datasetName){
                
                //DataspaceManager dm = sm.getDatasetManager();
                SchemaMappingManager schMan = sm.schemaMappingManager;
                SchemaMappingTask mappingTask;
                HashMap<String,String> mappingsMap;
                String recordClassTargetMappingTerm = "";
                
                mappingTask = schMan.getRelatedMappingTask(datasetName);
                
                mappingsMap = mappingTask.getMappingsMap();
                recordClassTargetMappingTerm = mappingsMap.get(SourcesManager.recordRDFClass);/*dm.getDataset(datasetName).getMetadata().getRecordRDFClass()*/
                return recordClassTargetMappingTerm;
        }

        
        
        private JSONObject getLinkInfo(JSONObject link_o){
                
                JSONObject info = new JSONObject();
                
                String datasetName;
                String classTerm;
                String basicPropertyTerm;
                String literalPropertyTerm;
                
                try {
                        datasetName = link_o.getString("datasetName");
                        classTerm = this.getRecordClassTargetMappingTerm(datasetName);
                        basicPropertyTerm = link_o.getString("target");
                        literalPropertyTerm = link_o.getJSONArray("children").getJSONObject(0).getString("target");
                        
                        JSONObject term = PrefixesManager.getVocabularyTermUriInJSONFormat(basicPropertyTerm);
                        String prefix = term.getString("prefix");
                        if(prefix.equals(PrefixesManager.UNKNOWN_PREFIX) || prefix == null || prefix.equals("")){
                                info.put("basicPropertyTerm", "<"+basicPropertyTerm+">");
                        }else{
                                info.put("basicPropertyTerm", prefix+":"+term.getString("name")); 
                        }
                        
                        term = PrefixesManager.getVocabularyTermUriInJSONFormat(literalPropertyTerm);
                        prefix = term.getString("prefix");
                        if(prefix.equals(PrefixesManager.UNKNOWN_PREFIX) || prefix == null || prefix.equals("")){
                                info.put("literalPropertyTerm","<"+ literalPropertyTerm+">");
                        }else{
                                info.put("literalPropertyTerm", prefix+":"+term.getString("name")); 
                        }
                        
                        info.put("classTerm",classTerm);
                       
                       
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                return info;
        }
        
        
        
        
        public void createLinkingTask(String sourceDatasetName,String targetDatasetName,
                                      JSONObject userInput){
                
                DataspaceManager dm = sm.getDataspaceManager();
                
                System.out.println(sourceDatasetName);
                Dataset sourceDataset = dm.getDataset(sourceDatasetName);
                Dataset targetDataset = dm.getDataset(targetDatasetName);
                
                
                
                System.out.println(sourceDataset.getFile().toString());
                LinkingTask task = null;
                try {
                        task = new LinkingTask(userInput.getString("linkTaskName"),sourceDataset,targetDataset,userInput);
                        task.setPrefixes(PrefixesManager.getPrefixToUriMap());
                        task.setLinkingFileLocation(this.tasksDir.toString() + "\\" + userInput.getString("linkTaskName") + ".xml");
                        task.setOutputLinksLocation(this.datasetsDir.toString());
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                task.start();
                linkingTasksMap.put(task.getName(),task);
        }
        
        public JSONObject getLinkingTaskResultLinks(String taskName) throws JSONException{
                
                /*if(!taskName.equals(currentLinkingTask.getName())){
                        System.out.println("error!!!!");
                        return new JSONObject();
                }*/
                LinkingTask task = this.linkingTasksMap.get(taskName);
                
                JSONArray acceptedLinks = task.getAcceptedOutputLinks();
                JSONArray linksToVerify = task.getOutputLinksToVerify();
               
                JSONObject taskResults = new JSONObject();
                taskResults.put("acceptedLinks", acceptedLinks);
                taskResults.put("linksToVerify", linksToVerify);
                return taskResults;
        }
        
        /*public void updateResultLinksOfLinkingTask(String linkingTaskName,JSONArray links){
                if(!linkingTaskName.equals(currentLinkingTask.getName())){
                        System.out.println("error!!!!");
                }
                currentLinkingTask.addVerifiedLinksToAccepted(links);
                
        }*/
        
        public JSONObject confirmLinkingTask(String linkingTaskName,JSONArray acceptedLinks){
                
               /* if(!linkingTaskName.equals(currentLinkingTask.getName())){
                        System.out.println("error!!!!");
                        return new JSONObject();
                }*/
                DataspaceManager dm = sm.getDataspaceManager();
                
                LinkingTask task = linkingTasksMap.get(linkingTaskName);
                //currentLinkingTask = task;
                linkingTasksMap.put(task.getName(),task);
                
                
                
                JSONObject jsonMetadata = new JSONObject();
                
                try {
                        jsonMetadata.put("name", task.getName());
                        jsonMetadata.put("linkType", "owl:sameAs");
                        
                        jsonMetadata.put("sourceDataset",task.getSourceDataset().getName());
                        jsonMetadata.put("source SPARQL restriction",task.getSourceRestriction());
                        jsonMetadata.put("source variable",task.getSourceVariable());
                        jsonMetadata.put("source input paths",task.getSourceInputPaths());
                        
                        jsonMetadata.put("targetDataset",task.getTargetDataset().getName());
                        jsonMetadata.put("target SPARQL restriction",task.getTargetRestriction());
                        jsonMetadata.put("target variable",task.getTargetVariable());
                        jsonMetadata.put("target input paths",task.getTargetInputPaths());
                        
                        jsonMetadata.put("generatedLinks",task.getAcceptedOutputLinks().length());
                        
                        dm.addLinkingTaskMetadataToDataset(task.getSourceDataset().getName(),
                                        jsonMetadata);
                        dm.addLinkingTaskMetadataToDataset(task.getTargetDataset().getName(),
                                        jsonMetadata);
                        
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                JSONObject linkTerm_o = new JSONObject();
                try {
                        linkTerm_o = PrefixesManager.getVocabularyTermUriInJSONFormat("http://www.w3.org/2002/07/owl#sameAs");
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                dm.addLinksToDataspace(acceptedLinks,linkTerm_o,task.getSourceDataset().getName()+"-to-"+task.getTargetDataset().getName());
                
                return jsonMetadata;
        }
        
        public Set<Entry<String, LinkingTask>> getLinkingTasks(){
                return this.linkingTasksMap.entrySet();
        }
        
        public JSONArray getPathsFromSPARQLClause(String sourceDatasetName, String sourceRestrictTo,String variable) 
                        throws IOException, JSONException {
                DataspaceManager dm = sm.getDataspaceManager();
                File datasetFile = dm.getDataset(sourceDatasetName).getFile();
                System.out.println("file path from getVariable info sparql is "+datasetFile.toString());
                Model model = SPARQLUtils.readRdfFile(datasetFile);
                //SPARQLPathAnalyzer pathAnalyzer = new SPARQLPathAnalyzer(model,PrefixesManager.getPrefixToUriMap());
                JSONArray pathProperties = this.getPathPropertiesOfVariable(model,sourceRestrictTo,variable);
                for(int i = 0;i < pathProperties.length();i++){
                        JSONArray pathVariableProperties = pathProperties.getJSONObject(i).getJSONArray("properties");
                        for(int j = 0; j < pathVariableProperties.length();j++){
                                JSONObject propertyInfo = PrefixesManager.getVocabularyTermUriInJSONFormat(pathVariableProperties.getString(j)); 
                                pathVariableProperties.put(j,propertyInfo);
                        }
                }
                return pathProperties;
        }

        
        private JSONArray getPathPropertiesOfVariable(Model model,String pattern, String variable) throws IOException{
                
                JSONArray pathProperties = new JSONArray();
                
                String prefixesString = SPARQLUtils.getPrefixesForSPARQLQuery(PrefixesManager.getPrefixToUriMap());
                String customPropertyPathVariable = "custom_path_variable";
                String customObjectVariable = "custom_object";
                
                if(pattern.lastIndexOf('.') != pattern.length()-1){
                        pattern+='.';
                }
                
                String selectString = "SELECT DISTINCT " + "?"+customPropertyPathVariable + " " + "WHERE {" +
                                      pattern + " " + "?"+variable + " " + "?"+customPropertyPathVariable + " " + "?"+customObjectVariable + "}";  
                
                String queryString = prefixesString + selectString;
                System.out.println(queryString);
                Query query = QueryFactory.create(queryString) ;
                QueryExecution qexec = QueryExecutionFactory.create(query, model);
                JSONObject variableInfo = new JSONObject();
                try {
                      variableInfo.put("name", variable);
                      JSONArray properties = new JSONArray();
                      ResultSet results = qexec.execSelect();
                      for ( ; results.hasNext() ; ){  
                            QuerySolution soln = results.nextSolution();
                            RDFNode p = soln.get(customPropertyPathVariable) ;
                            properties.put(p.toString());
                      }
                      variableInfo.put("properties",properties);
                }catch (JSONException e) {
                    e.printStackTrace();
                } finally { 
                        qexec.close();
                }
                pathProperties.put(variableInfo);
                return pathProperties;
        }
        
        
        public JSONArray getVariablesOfPattern(String pattern) {
                
                return SPARQLUtils.getVariablesOfPattern(pattern, PrefixesManager.getPrefixToUriMap());
        }

        public void reset() {
                // TODO Auto-generated method stub
                this.linkGen.reset();
                this.linkingTasksMap.clear();
        }

        
        
        
        /***************** important method to fix!!! *************************************/
        /*public JSONObject getLinkingTaskInfo(String linkingTaskName){
                JSONObject info = new JSONObject();
                LinkingTask linkTask = this.linkingTasks.get(linkingTaskName);
                try {
                        info.put("linkTaskName", linkTask.getName());
                        info.put("sourceDatasetName",linkTask.getSourceDataset().getName());
                        info.put("targetDatasetName",linkTask.getTargetDataset().getName());
                        info.put("generatedLinks",linkTask.getAcceptedOutputLinks().length());
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                return info;
        }*/
        
       /* public JSONObject getRelatedLinkingTaskInfo(String datasetName){
                String linkTaskName = dm.getLinkingTaskName(datasetName);
                return getLinkingTaskInfo(linkTaskName);
        }*/
        
        
       /* public void createLinkingTask(File file1,File file2,JSONObject userInput){
                
                Dataset sourceDataset = dm.getDataset(file1);
                Dataset targetDataset = dm.getDataset(file2);
              
                
                String mappingFileName = null;
                try {
                        mappingFileName = userInput.getString("mappingFileName");
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                currentLinkingTask = new LinkingTask(sourceDataset,targetDataset,userInput);
                currentLinkingTask.setLinkingFileLocation(fm.getTasksDirectory().toString()+"/"+mappingFileName);
                currentLinkingTask.setPrefixes(commonVocabularyPrefixesMap);
                
                currentLinkingTask.start();
        }*/
        
        

      /*  public void createLinkingTask(Dataset dataset1, Dataset dataset2, JSONObject userInput) {
                // TODO Auto-generated method stub
                
        }*/
        
        

        /*public JSONArray getTargetVocabulary() {
                
                JSONArray vocabulary = schMapManager.getTargetVocabulary();
                return vocabulary;
                
                Iterator<Entry<String, String>> it = pm.getTargetVocabulary();
                JSONArray prefixes = new JSONArray();
                JSONObject prefix_o = null;
                while(it.hasNext()){
                        Entry<String, String> prefixEntry = it.next();
                        prefix_o = new JSONObject();
                        try {
                                prefix_o.put("prefix",prefixEntry.getKey());
                                prefix_o.put("uri",prefixEntry.getValue());
                                prefixes.put(prefix_o);
                        } catch (JSONException e) {
                                prefixes.put(prefix_o);
                        }  
                }   
        }*/

        /*public void start() throws IOException, JSONException {
 
                //SchemaMappingManager sm = schMapManager;   
                
                //SourcesManager som = new SourcesManager(service);
                
                TabularToRDFConverter conv = new TabularToRDFConverter();
                
                String fileName = "data.xls";
                File importedDatasetFile = Paths.get("C:/Users/John/Desktop/data",fileName).toFile();
                File exportedFile = Paths.get("C:/Users/John/Desktop/data","output.ttl").toFile();
                
                int format_pos = fileName.lastIndexOf('.');
                
                conv.setDatasetName(fileName.substring(0, format_pos)); 
                conv.setInputFile(importedDatasetFile);
                conv.setOutputFile(exportedFile);
                
                HashMap<String,String> prefixes = new HashMap<String,String>();
                
                prefixes.put("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
                prefixes.put("rdfs", "http://www.w3.org/2000/01/rdf-schema#");
                String prefix = "tab";
                String vocURL = "http://localhost:8080/tab/"+fileName.substring(0, format_pos)+"/TabularDef#";
               
                prefixes.put(prefix,vocURL);
               
                pm.addPrefix(prefix, vocURL);
                
                conv.setDatasetPrefixes(prefixes);
                
                conv.setBaseURI("http://localhost:8080/");
                conv.setCustomizedVocabularyPrefix("tab");
                conv.setRecordClass("tabularRecord");
               
                try {
                   conv.convert();
                   
                } catch (IOException e) {
                   // TODO Auto-generated catch block
                   e.printStackTrace();
                }
                  
                DatasetVocabulary vocabulary = new DatasetVocabulary();
                vocabulary.addClasses(conv.getDatasetClasses());
                vocabulary.addProperties(conv.getDatasetProperties());   
                vocabulary.setPrefixes(prefixes);
                
                vocabulary.print();
                
                
                Dataset dataset = new Dataset("graphName", exportedFile,vocabulary);
                JSONObject importingMetadata = new JSONObject();
                
                importingMetadata.put("Source","file");
                importingMetadata.put("Source Name","myfile.xls");
                importingMetadata.put("Source Description","myfile.xls");
                importingMetadata.put("Type Of Import","file upload");
                importingMetadata.put("Number Of Records",1000);
                System.out.println(importingMetadata.toString());
                dataset.getMetadata().addImportingMetadata(importingMetadata);
                dm.addDataset(dataset);
                
                ArrayList<ClassMapping> classMappingList = new ArrayList<ClassMapping>();
                
                String sourcePattern = "?SUBJ rdf:type tab:dataset";
                String targetPattern = "?SUBJ rdf:type qb:Dataset";
                ClassMapping classMap1 = new ClassMapping(sourcePattern, targetPattern);
                classMappingList.add(classMap1);
                
                sourcePattern = "?SUBJ rdf:type tab:tabularRecord";
                targetPattern = "?SUBJ rdf:type qb:Observation";
                ClassMapping classMap2 = new ClassMapping(sourcePattern, targetPattern);
                classMappingList.add(classMap2);
                
                
                
                ArrayList<Mapping> propertyMappingList = new ArrayList<Mapping>();
                ArrayList<String> sourcePatterns = null;
                ArrayList<String> targetPatterns = null;
                ArrayList<String> transformPatterns = null;
                //ArrayList<String> sourcePatterns = new ArrayList<String>();
                //ArrayList<String> targetPatterns = new ArrayList<String>();
                String sourcePattern = "?SUBJ tab:Date ?o";
                String targetPattern = "?SUBJ dbpedia:date ?o";
                String transformPattern = "";    
                sourcePatterns = getPattern(sourcePattern);
                targetPatterns = getPattern(targetPattern);
                transformPatterns = getPattern(transformPattern);
                Mapping propMap1 = new Mapping("map1",sourcePatterns, targetPatterns,null);
                propertyMappingList.add(propMap1);
                
                sourcePattern = "?SUBJ tab:hasValue ?o";
                targetPattern = "?SUBJ rdfs:label ?o";         
                sourcePatterns = getPattern(sourcePattern);
                targetPatterns = getPattern(targetPattern);
                Mapping propMap2 = new Mapping("map2",sourcePatterns, targetPatterns,null);
                propertyMappingList.add(propMap2);

                
                sourcePattern = "?SUBJ rdf:type tab:dataset";
                targetPattern = "?SUBJ rdf:type qb:dataset";
                transformPattern = "";
                sourcePatterns = getPattern(sourcePattern);
                targetPatterns = getPattern(targetPattern);
                Mapping propMap3 = new Mapping("map3",sourcePatterns, targetPatterns,null);
                propertyMappingList.add(propMap3);
                
                sourcePattern = "?SUBJ rdf:type tab:tabularRecord";
                targetPattern = "?SUBJ rdf:type qb:Observation";
                transformPattern = "";
                sourcePatterns = getPattern(sourcePattern);
                targetPatterns = getPattern(targetPattern);
                Mapping propMap4 = new Mapping("map4",sourcePatterns, targetPatterns,null);
                propertyMappingList.add(propMap4);
                
                
                schMapManager.createMappingTask(dataset.getName(), "testMappingTask");
                
                JSONObject results =  schMapManager.executeMappingTask(propertyMappingList, "testMappingTask");
                System.out.println(results.toString());
                schMapManager.confirmMappingTask("testMappingTask");
                
        }*/
        
        
        /*public ArrayList<String> getPattern(String pattern){
                ArrayList<String> array = new ArrayList<String>();
                array.add(pattern);
                return array;
        }*/

        /*public Collection<String> getDatasets() {
               return dm.getDatasetNames();
        }*/

       
       /* public JSONArray getDatasetsHistory() {
                JSONArray history = dm.getHistoryInfoForLinkingPhase();
                return history;
        }*/


       
}
