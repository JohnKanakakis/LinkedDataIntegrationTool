package ntua.thesis.dis.dataspace;


import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;


import ntua.thesis.dis.dataspace.provenance.Metadata;
import ntua.thesis.dis.service.FileManager;
import ntua.thesis.dis.service.PrefixesManager;
import ntua.thesis.dis.service.ServiceManager;
import ntua.thesis.dis.util.ProjectFileUtils;
import ntua.thesis.dis.util.SPARQLUtils;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import com.hp.hpl.jena.query.DatasetFactory;
import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.QueryFactory;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.Property;
import com.hp.hpl.jena.rdf.model.Resource;
import com.hp.hpl.jena.rdf.model.Statement;

import com.hp.hpl.jena.util.LocationMapper;


public class DataspaceManager {
        static final Logger logger = LoggerFactory.getLogger("DataspaceManager");
        
        private static DataspaceManager instance = new DataspaceManager();
        
        private HashMap<String,Dataset> datasets = new HashMap<String,Dataset>();
        
        private HashMap<String,JSONObject> dataspaceVocabulary = new HashMap<String,JSONObject>();
       
        
        private HashMap<Long,DataspaceProject> idToDataspaceProjectMap = new HashMap<Long,DataspaceProject>();
        private HashMap<Long,JSONObject> idToDataspaceProjectMetadataMap = new HashMap<Long,JSONObject>();
        private Dataspace dataspace = new Dataspace();
        private DataspaceProject dataspaceProject;
       
        
        private DataspaceManager(){
                
        }
        
        public static DataspaceManager getInstance(){
                return instance;
        }
        
        
        
        public JSONArray getAllDataspaceProjectMetadata(){
                FileManager fm = FileManager.getInstance();
                logger.info("clearing memory from projects. unsaved projects are lost! ");
                this.reset();
                /*this.idToDataspaceProjectMetadataMap.clear();
                this.idToDataspaceProjectMap.clear();
                this.dataspaceVocabulary.clear();
                this.datasets.clear();
                this.dataspace.empty();
                this.dataspaceProject = null;*/
                //this.reset();
                PrefixesManager.clear();
                
                
                JSONArray projectIds = fm.loadWorkspaceMetadata();
                long id = 0;
                JSONObject dataspaceMetadata;
                JSONArray allMetadata = new JSONArray();
                for(int i = 0;i < projectIds.length();i++){
                        try {
                                id = Long.parseLong(projectIds.getString(i));
                                dataspaceMetadata = fm.loadDataspaceMetadata(id);
                                logger.info(dataspaceMetadata.toString());
                                if(dataspaceMetadata.length() != 0){
                                        allMetadata.put(dataspaceMetadata.getJSONObject("project"));
                                        this.idToDataspaceProjectMetadataMap.put(id, dataspaceMetadata.getJSONObject("project"));
                                }  
                        } catch (NumberFormatException | JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                }
                logger.info("loaded " + allMetadata.length()+ " projects to memory! ");
                return allMetadata;
        }
        
        public JSONObject loadDataspaceProjectMetadata(long dataspaceId) {
                logger.info("metadata map > "+this.idToDataspaceProjectMetadataMap.toString());
                logger.info("dataspace id > "+dataspaceId);
                return this.idToDataspaceProjectMetadataMap.get(dataspaceId);
        }
        
        private JSONObject createDataspaceProjectMetadata(DataspaceProject project) {
                JSONObject metadata = new JSONObject();
                try {
                        metadata.put("name",project.getName());
                        metadata.put("id",project.getId());
                        metadata.put("last Modified",project.getLastModified().toString());
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                return metadata;
        }
        
        
        public boolean loadDataspaceProject(long id){
                
                HashMap<String,JSONObject> datasetNamesToMetadataMap = new HashMap<String,JSONObject>();
                
               /* 
                if(this.dataspaceProject!=null){//if current project is not null means that this current project is unsaved. so we save it before loading another!
                        long currentDataspaceProjectId = this.dataspaceProject.getId();
                        logger.info("saving current project with id > " + currentDataspaceProjectId + " . . .");
                        if(this.saveDataspaceProject(currentDataspaceProjectId)){
                                *//** clear memory !! **//*
                                this.idToDataspaceMetadataMap.remove(currentDataspaceProjectId);
                                this.idToDataspaceProjectMap.remove(currentDataspaceProjectId);
                                this.datasets.clear();
                                this.dataspace.empty();
                                this.dataspaceProject = null;
                                
                                
                                logger.info("successfull saving. . .");
                        }else{
                                logger.info("unsuccessfull saving. . .");
                                return false;
                        }   
                }*/
                FileManager fm = FileManager.getInstance();
                
                
                
                logger.info("loading project metadata with id > " + id + " . . .");
                
                JSONObject metadata = fm.loadDataspaceMetadata(id);
                JSONArray datasetsMetadata;
                try {
                        datasetsMetadata = metadata.getJSONArray("datasets");
                        for(int i = 0; i < datasetsMetadata.length();i++){
                                String datasetName = datasetsMetadata.getJSONObject(i).getJSONObject("generalMetadata").getString("name");
                                datasetNamesToMetadataMap.put(datasetName, datasetsMetadata.getJSONObject(i));
                        }
                        System.out.println(datasetNamesToMetadataMap.toString());
                } catch (JSONException e1) {
                        // TODO Auto-generated catch block
                        e1.printStackTrace();
                        logger.info("ERROR loading project metadata with id > " + id + " . . .");
                        return false;
                }
                
                logger.info("finish loading project metadata with id > " + id + " . . .");
                
                
                logger.info("loading project with id > " + id + " . . .");
                
                File[] datasetsFiles = fm.getDatasetsOfProject(id);
                if(datasetsFiles.length == 0){
                        logger.info("Project with id > "+id+" has no datasets!!");
                        return false;
                }
                
                this.dataspace.empty(); // empty the dataspace first
                
                for(int i = 0; i < datasetsFiles.length;i++){
                        
                        String datasetName = ProjectFileUtils.getFileNameWithNoExtension(datasetsFiles[i].toString());
                        System.out.println(datasetName);
                        Dataset dataset = new Dataset(datasetName, datasetsFiles[i], new DatasetVocabulary());
                        System.out.println(datasetNamesToMetadataMap.get(datasetName).toString());
                        dataset.getMetadata().set(datasetNamesToMetadataMap.get(datasetName));
                        if ( this.addDataset(dataset) < 0){
                                logger.info("error loading dataset to memory . . .");
                                return false;
                        }
                        /***** !!!!!! VERY IMPORTANT !! CREATE DATASPACE F R O M PROJECT DATASETS AND QUERIES***/
                        
                        if (this.addToDataspace(dataset) < 0){
                                logger.info("error adding dataset to dataspace . . .");
                                return false;
                        }
                }
                try {
                        this.setDataspaceVocabulary(metadata.getJSONArray("vocabulary"));
                        PrefixesManager.addPrefixesToURIs(metadata.getJSONArray("prefixes"));
                        // TODO Auto-generated catch block: load queries!!!
                        JSONArray queries = metadata.getJSONArray("queries");
                        this.dataspace.setSavedQueries(queries);
                } catch (JSONException e1) {
                        // TODO Auto-generated catch block
                        e1.printStackTrace();
                }
                
                logger.info("successful dataspace building . . .");
                
                JSONObject projectMetadata = this.loadDataspaceProjectMetadata(id);
                if(projectMetadata.length() == 0){
                        logger.info("Project with id > "+id+" has no metadata!!");
                        return false;
                }
                
                DataspaceProject project = new DataspaceProject(id);
                try {
                        project.setLastModified();
                        project.setName(projectMetadata.getString("name"));
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                        return false;
                }
                this.dataspaceProject = project;
                
                logger.info("successful loading . . .");
                return true;
        }
        
         
        

        public boolean saveDataspaceProject(long dataspaceId){
                
                FileManager fm = FileManager.getInstance();
                
                
                if(dataspaceId != this.dataspaceProject.getId()){
                        logger.info("FATAL ERROR : input id > "+dataspaceId + " # with current id > "+this.dataspaceProject.getId());
                        return false;
                }
                
                this.dataspaceProject.setLastModified();
                
                /* collect dataspace and project metadata */
                JSONObject allMetadata = new JSONObject();
                JSONArray datasetsMetadata = this.getDatasetMetadata("");
                JSONObject projectMetadata = this.createDataspaceProjectMetadata(this.dataspaceProject);
                JSONArray dataspacePrefixes = PrefixesManager.getPrefixes();
                JSONArray dataspaceVocabulary = this.getDataspaceVocabulary();
                JSONArray dataspaceQueries = this.getDataspaceQueries();  
                try {
                        allMetadata.put("project", projectMetadata);
                        allMetadata.put("datasets", datasetsMetadata);
                        allMetadata.put("prefixes", dataspacePrefixes);
                        allMetadata.put("vocabulary", dataspaceVocabulary);
                        allMetadata.put("queries", dataspaceQueries);
                } catch (JSONException e1) {
                        // TODO Auto-generated catch block
                        e1.printStackTrace();
                        return false;
                }
                fm.saveDataspaceMetadata(allMetadata,dataspaceId);
                
                
                /* collect projects ids and save them*/
                Iterator<JSONObject> it = this.idToDataspaceProjectMetadataMap.values().iterator();
                JSONArray projectsIds = new JSONArray();
                JSONObject o;
                while(it.hasNext()){
                        o = it.next();
                        try {
                                projectsIds.put(o.getString("id"));
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                                return false;
                        }
                }
                if(!fm.saveWorkspaceMetadata(projectsIds)) return false;

                return true;        
        }
        
        public JSONArray getDataspaceQueries() {
                return this.dataspace.getSavedQueries();
        }

        

        public long createDataspaceProject(String dataspaceName) {
                
                DataspaceProject currentProject = new DataspaceProject();
                currentProject.setName(dataspaceName);
                if(this.idToDataspaceProjectMap.containsKey(currentProject.getId())){
                        return -1;
                }
                
                
                JSONObject basicMetadata = this.createDataspaceProjectMetadata(currentProject);
                if(basicMetadata.length() == 0){
                        return -1;
                }
                
                
                FileManager fm = FileManager.getInstance();
                
                if(!fm.createDataspaceProjectDir(currentProject.getId())){
                        return -1;
                }
                
                this.idToDataspaceProjectMap.put(currentProject.getId(),currentProject);
                this.idToDataspaceProjectMetadataMap.put(currentProject.getId(),basicMetadata);
                
                this.dataspaceProject = currentProject;
                return this.dataspaceProject.getId();
        }
        
        public int buildCurrentDataspace(){
                return this.dataspace.build();
        }
        
       
        
        public Dataset getDataset(String datasetName){

                return datasets.get(datasetName);
        }
          
        public int addDataset(Dataset dataset){
                    
                datasets.put(dataset.getName(),dataset);
                return 1;
                  
        }
        
        
 
        
        public List<String> getDatasetNames(){
                
                Collection <Dataset> datasetNamesCollection = datasets.values();
                
                Iterator<Dataset> it =  datasetNamesCollection.iterator();
                
                String name = null;
                List<String> names = new ArrayList<String>();
                while(it.hasNext()){
                        name = it.next().getName();
                        names.add(name);
                }
                return names;
        }

        public void addLinkingTaskMetadataToDataset(String datasetName, JSONObject jsonMetadata) {
                
                Dataset dataset = this.datasets.get(datasetName);
                Metadata metadata = dataset.getMetadata();
                metadata.addLinkingMetadata(jsonMetadata);
        }

        public void addMappingTaskMetadataToDataset(String datasetName, JSONObject jsonMetadata) {
                
                Dataset dataset = this.datasets.get(datasetName);
                Metadata metadata = dataset.getMetadata();
                metadata.addMappingMetadata(jsonMetadata);
        }
            
        private JSONObject createDatasetMetadata(String datasetName) {

                Dataset dataset = this.getDataset(datasetName);
                Metadata datasetMetadata = dataset.getMetadata();
                JSONObject generalMetadata = datasetMetadata.getGeneralMetadata();
                JSONObject importingMetadata = datasetMetadata.getImportingMetadata();
                JSONObject mappingMetadata = datasetMetadata.getMappingMetadata();
                JSONArray linkingMetadata = datasetMetadata.getLinkingMetadata();
                JSONObject datasetMetadata_o = new JSONObject();
                try {
                        datasetMetadata_o.put("importingMetadata",importingMetadata)
                                         .put("mappingMetadata",mappingMetadata)
                                         .put("linkingMetadata",linkingMetadata)
                                         .put("generalMetadata",generalMetadata);
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                return datasetMetadata_o;
        }

        
        public JSONArray getDatasetMetadata(String datasetName) {
                
                
                JSONArray metadataArray = new JSONArray(); 
                
                if(datasetName.equals("")){
                        
                        Iterator<String> it = this.getDatasetNames().iterator();
                        while(it.hasNext()){
                                metadataArray.put(this.createDatasetMetadata(it.next()));
                        }
                }else{
                        metadataArray.put(this.createDatasetMetadata(datasetName));
                }
                
                return metadataArray;
                
         }
         
        
         public JSONArray getLinkingTasksMetadata() {
               
                 HashMap<String,JSONObject> linkingTaskMap = new HashMap<String,JSONObject>();
                 
                 List<String> datasetNames = this.getDatasetNames();
                 String linkTaskName;
                 JSONArray linkingTasksMetadataArray;
                 
                 JSONArray totalLinkingTasks = new JSONArray();
                 for(int i = 0; i < datasetNames.size();i++){
                         try {
                                 linkingTasksMetadataArray = this.getDatasetMetadata(datasetNames.get(i))
                                                                 .getJSONObject(0)
                                                                 .getJSONArray("linkingMetadata");
                                 for(int j = 0; j < linkingTasksMetadataArray.length();j++){
                                         linkTaskName = linkingTasksMetadataArray.getJSONObject(j).getString("name");
                                         if(!linkingTaskMap.containsKey(linkTaskName)){
                                                 linkingTaskMap.put(linkTaskName, linkingTasksMetadataArray.getJSONObject(j));
                                                 totalLinkingTasks.put(linkingTasksMetadataArray.getJSONObject(j));
                                         }
                                 }
                         } catch (JSONException e) {
                                 // TODO Auto-generated catch block
                                 e.printStackTrace();
                         }
                 }
                 
                 return totalLinkingTasks;
         }
        
        
        public void addToDataspaceVocabulary(HashMap<String, JSONObject> targetVocabulary) {
               
                this.dataspaceVocabulary.putAll(targetVocabulary);
                System.out.println("DATASPACE VOCABULARY > "+this.dataspaceVocabulary.toString());
        }
        
        
        
        public int addToDataspace(Dataset dataset) {
                //this.dataspaceProject.addDataset(dataset);
                
                JSONObject datasetInfo = new JSONObject();
                try {
                        datasetInfo.put("graphName", dataset.getGraphName());
                        datasetInfo.put("file", dataset.getFile());
                        
                        this.dataspace.addDataset(datasetInfo);
                        return 1;
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                        return -1;
                }  
        }
        
        
        public int addLinksToDataspace(JSONArray links,JSONObject linkProperty_o,String linksDatasetName){
                
                FileManager fm = FileManager.getInstance();
                
                Model acceptedLinksModel = ModelFactory.createDefaultModel();
                
                String propertyUri = "";
                String propertyName = "";
                String prefix = "";
                try {
                        propertyUri = linkProperty_o.getString("uri");
                        propertyName = linkProperty_o.getString("name");
                        prefix = linkProperty_o.getString("prefix");
                } catch (JSONException e1) {
                        // TODO Auto-generated catch block
                        e1.printStackTrace();
                }
                
                Property linkProperty = acceptedLinksModel.createProperty(propertyUri+propertyName);
               // Property linkProperty = acceptedLinksModel.createProperty("http://www.w3.org/2002/07/owl#sameAs");
                Resource sourceLink;
                Resource targetLink;
                Statement statement;
               
                JSONObject link_o;
                for(int i = 0; i < links.length();i++){
                        try {
                                link_o = links.getJSONObject(i);
                                sourceLink = acceptedLinksModel.createResource(link_o.getString("source"));
                                targetLink = acceptedLinksModel.createResource(link_o.getString("target"));
                                statement = acceptedLinksModel.createStatement(sourceLink,linkProperty,targetLink);
                                acceptedLinksModel.add(statement);
                                
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                }
                
                long id = this.dataspaceProject.getId();
                File file = fm.writeDatasetToProjectDir(id,acceptedLinksModel,linksDatasetName+".nt","NT");
                
                if(file != null){
                        
                        DatasetVocabulary vocabulary = new DatasetVocabulary();
                        String[] properties = new String[1];
                        properties[0] = propertyUri + propertyName;
                        vocabulary.setProperties(properties);
                        vocabulary.setClasses(new String[0]);
                        
                        Dataset linksDataset = new Dataset(linksDatasetName, file, vocabulary);
                        
                        this.dataspaceVocabulary.put(prefix+":"+propertyName, linkProperty_o); 
                        
                        if(this.addDataset(linksDataset) < 0) return -1;
                        
                        return this.addToDataspace(linksDataset);  
                }else{
                        return -1;
                }       
        }

        public JSONArray executeQueryToDataspace(String queryString,long id) {
                JSONArray results = new JSONArray();
                if(this.dataspace == null){
                        return results;
                }
                return this.dataspace.executeQuery(queryString,id);
        }
        
        public void stopQueryExecution(long queryId){
                this.dataspace.stopQueryExecution(queryId);
        }
        
        private void setDataspaceVocabulary(JSONArray vocabulary) {
                // TODO Auto-generated method stub
                JSONObject o;
                
                for(int i = 0; i < vocabulary.length();i++){
                        try {
                                o = vocabulary.getJSONObject(i);
                                this.dataspaceVocabulary.put(o.getString("prefix")+":"+o.getString("name"), o);
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                }
        }

        public JSONArray getDataspaceVocabulary() {
                
                Iterator<JSONObject> it = this.dataspaceVocabulary.values().iterator();
                JSONArray vocabulary = new JSONArray();
                while(it.hasNext()){
                        vocabulary.put(it.next());
                }
                return vocabulary;
        }

        
        
        public static String getGraphName(String datasetName){
                return "http://localhost:8080/DSpace/"+datasetName;
        }

        public long getCurrentDataspaceProjectId() {
                return this.dataspaceProject.getId();
        }

        public JSONArray getNamedGraphs() {
                return this.dataspace.getNamedGraphs();
        }

        
        public boolean saveQueries(Map<Long, JSONObject> queriesMap) {
                // TODO Auto-generated method stub
                Iterator<JSONObject> queries = queriesMap.values().iterator();
                JSONArray array = new JSONArray();
                while(queries.hasNext()){
                        array.put(queries.next());
                }
                this.dataspace.setSavedQueries(array);
                return this.saveDataspaceProject(getCurrentDataspaceProjectId());
        }

        public void reset() {
                // TODO Auto-generated method stub
                FileManager fm = FileManager.getInstance();
                logger.info("reseting dataspace manager . . . ");
                logger.info("Current projects in memory > "+this.idToDataspaceProjectMap.keySet().size());
                JSONArray projectIds = fm.loadWorkspaceMetadata();
                for(int i = 0; i < projectIds.length();i++){
                        try {
                                if(this.idToDataspaceProjectMap.containsKey(projectIds.getLong(i))){
                                        logger.info("removing saved project from memory > "+projectIds.getLong(i));
                                        this.idToDataspaceProjectMap.remove(projectIds.getLong(i));
                                }
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                }
                
               for(Long id : this.idToDataspaceProjectMap.keySet()){
                        logger.info("Deleting unsaved project with id > "+id);
                        fm.deleteDataspaceProjectDir(id);
                        /*if(id != this.dataspaceProject.getId()){
                                fm.deleteProjectDir(id);
                        }*/
                }
               
                this.idToDataspaceProjectMetadataMap.clear();
                this.idToDataspaceProjectMap.clear();
                this.dataspaceVocabulary.clear();
                this.datasets.clear();
                this.dataspace.empty();
                this.dataspaceProject = null;
                //PrefixesManager.clear();    
        }

        

       

       
        
        
        
        
        
        
        /* public JSONArray getHistoryInfoForLinkingPhase() {
        return getHistory();
}
 
public JSONArray getHistoryInfoForMappingPhase() {
        
        return getHistory();
}*/

/*public JSONArray getHistory(){
        Iterator<Entry<String,Dataset>> it = this.datasets.entrySet().iterator();
        JSONArray generalHistory = new JSONArray();
        JSONObject datasetInfo;
        JSONObject datasetMetadata;
        Dataset dataset;
        while(it.hasNext()){
               dataset = it.next().getValue();
               datasetInfo = new JSONObject();
               datasetMetadata = getDatasetMetadata(dataset.getName());
               try {
                       datasetInfo.put("name",dataset.getName());
                       datasetInfo.put("metadata",datasetMetadata);
               } catch (JSONException e) {
                       // TODO Auto-generated catch block
                       e.printStackTrace();
               }
               
               generalHistory.put(datasetInfo);
        }
        return generalHistory;
}*/
}
