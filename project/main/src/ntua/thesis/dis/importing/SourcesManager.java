package ntua.thesis.dis.importing;

import java.io.File;
import java.io.IOException;
import java.nio.charset.MalformedInputException;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import org.apache.commons.codec.EncoderException;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.jena.riot.RiotException;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;



import de.fuberlin.wiwiss.r2r.FileOrURISource;
import de.fuberlin.wiwiss.r2r.Source;
import ntua.thesis.dis.dataspace.Dataset;
import ntua.thesis.dis.dataspace.DataspaceManager;
import ntua.thesis.dis.dataspace.DatasetVocabulary;
import ntua.thesis.dis.importers.ExcelParser;
import ntua.thesis.dis.importing.converter.Converter;
import ntua.thesis.dis.importing.converter.JSONToRDFConverter;
import ntua.thesis.dis.importing.converter.TabularToRDFConverter;
import ntua.thesis.dis.importing.source.DBConnectionSource;
import ntua.thesis.dis.importing.source.SPARQLEndpointSource;
import ntua.thesis.dis.service.FileManager;
import ntua.thesis.dis.service.PrefixesManager;
import ntua.thesis.dis.service.ServiceManager;
import ntua.thesis.dis.util.ProjectFileUtils;


public class SourcesManager {
        
        public HashMap<String,Path> fileNamesMapAPI = new HashMap<String,Path>();
        
        
        private String importedDataDirectory = "";
        private static final int MAX_UPLOAD_SIZE = 1000000000;
        public final static String SOURCE_TYPE = "source_type";
        public final static String SOURCE_NAME = "source_name";
        public final static String SOURCE_DESCRIPTION = "source_description";
        public final static String TYPE_OF_IMPORT = "type_of_import";
        public final static String TOTAL_ROWS = "rows";
        public final static String RELATED_FILE_NAME = "related_file_name";
        
        public final static String RELATIONAL_DATABASE = "Relational Database";
        public final static String FILE = "File";
        public final static String SPARQL_ENDPOINT = "SPARQL Endpoint";
        
        public final static String datasetRDFClass = "Dataset";
        public final static String recordRDFClass = "Record";
        public final static String recordCellValueRDFProperty = "hasValue";
        
        private ServiceManager sm;
        private int relationalQueriesCounter = 1;
        private int sparqlQueriesCounter = 1;
        
        private HashMap <String,DatasetVocabulary> currentDatasetsVocabularies = new HashMap <String,DatasetVocabulary>();
        
        private HashMap <File,Dataset> importedDatasets = new HashMap <File,Dataset>();
        
        private HashMap <String,DBConnectionSource> dbConnections = new HashMap <String,DBConnectionSource>();
        private HashMap <String,SPARQLEndpointSource> sparqlEndpoints = new HashMap <String,SPARQLEndpointSource>();
        
        
       
        private HashMap <String,Converter> convertorsToRDF = new HashMap <String,Converter>();

        
        
       
        
       

        public SourcesManager(ServiceManager serviceManager) {
               
                sm = serviceManager;
                
                importedDataDirectory = sm.getFileManager().getImportedDataDirectory().toString();
              
                convertorsToRDF.put("json", new JSONToRDFConverter());
                convertorsToRDF.put("xls", new TabularToRDFConverter());
                convertorsToRDF.put("xlsx", new TabularToRDFConverter());
                convertorsToRDF.put("csv", new TabularToRDFConverter());
        }

       
        
        public String createJSONFile(String jsonData,String filename) throws IOException {
                
                File newFile = null;
                System.out.println(jsonData);
                newFile = sm.getFileManager().writeJSONData(jsonData,filename);
                                
                String newfile_name = ProjectFileUtils.getFileExtension(newFile);
                return newfile_name;
        }
        

        public File uploadFile(HttpServletRequest request){
                
                FileManager fm = sm.getFileManager();
                DiskFileItemFactory factory = new DiskFileItemFactory();
                
                factory.setRepository(Paths.get(importedDataDirectory).toFile());
                ServletFileUpload upload = new ServletFileUpload(factory);
                upload.setSizeMax(MAX_UPLOAD_SIZE);
                File file = null;
                try {
                        List<FileItem> items = upload.parseRequest(request);
                        Iterator<FileItem> iter = items.iterator();
                        while (iter.hasNext()) {
                            FileItem item = iter.next();

                            if (!item.isFormField()) {

                                String fileName = item.getName();
                                file = fm.createFile(fileName);
                                try {
                                        item.write(file);
                                } catch (Exception e) {
                                        e.printStackTrace();
                                        return file;
                                }
                            }
                        }   
                } catch (FileUploadException e) {      
                        e.printStackTrace();
                        return file;
                }
                return file;
        }
        
      

        public void deleteCurrentFile(String fileNameToDelete) {
                
                System.out.println("file name is "+ fileNameToDelete);
                System.out.println(sm.getFileManager().deleteFile(fileNameToDelete));
        }

        public JSONObject convertToJSON(File newFile) throws NullPointerException {
               
                String extension = ProjectFileUtils.getFileExtension(newFile);
                JSONObject result = null;
                if(extension.equals("xls") || extension.equals("xlsx")){
                        ExcelParser parser = new ExcelParser();
                        result = parser.convertToJSON(newFile);
                }else if (extension.equals("csv")){
                        result = null;
                }
                return result; 
        }
        

        public int createDatasets(JSONArray filesToImport) throws JSONException,RiotException {
               
                System.out.println("we have " + filesToImport.length() +" to import" );
                int result;
                int i;
                for(i = 0; i < filesToImport.length(); i++){             
                        JSONObject fileMetadata = filesToImport.getJSONObject(i);
                        try {
                                result = this.createDataset(fileMetadata);
                        } catch (RiotException| MalformedInputException e) {
                                e.printStackTrace();
                                return i;
                        }
                        if(result < 0){
                                return i;
                        }
                }
                return i;
        }

        private int createDataset(JSONObject fileMetadata) throws JSONException,RiotException,MalformedInputException {
                
                FileManager fm = sm.getFileManager();
                DataspaceManager dm = sm.getDataspaceManager();
                
                String fileName = fileMetadata.getString(RELATED_FILE_NAME);
                String graphName = fileMetadata.getString("graph_name");
                String sourceType = fileMetadata.getString(SOURCE_TYPE);
                String sourceName = fileMetadata.getString(SOURCE_NAME);
                
                DatasetVocabulary datasetVoc = null;
                
                String extension = ProjectFileUtils.getFileExtension(fileName);//fileManager.getFileExtension(fileName);
                System.out.println(extension);
                File importedDatasetFile = null;
                String vocURL = null;
                String prefix = null;
                String recordClass = null;
                String datasetClass = SourcesManager.datasetRDFClass;
                if (needConvertionToRDF(extension)){
                        Converter conv = convertorsToRDF.get(extension);
                        conv.setDatasetClass(datasetClass);
                        System.out.println(conv.getClass().toString());
                        try{
                                File importedSourceFile = fm.getFile(fileName);
                                File datasetFile = fm.getDatasetFile(fileName);
                                conv.setInputFile(importedSourceFile);
                                conv.setOutputFile(datasetFile);
                                
                                
                                HashMap<String,String> prefixes = new HashMap<String,String>();
                                
                                prefixes.put("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
                                prefixes.put("rdfs", "http://www.w3.org/2000/01/rdf-schema#");
                                conv.setBaseURI("http://localhost:8080/");
                                
                                int format_pos = fileName.lastIndexOf('.');
                             
                                //conv.setDatasetName(fileName.substring(0, format_pos));
                                conv.setDatasetName(graphName);
             
                                if (extension.equals("json")){
                                        
                                    switch (sourceType) {
                                            case RELATIONAL_DATABASE:    
                                                    String schema = sourceName.substring(sourceName.lastIndexOf('/')+1);
                                                    prefix = "rdb"+"-"+schema;
                                                    recordClass = SourcesManager.recordRDFClass; 
                                                    vocURL = "http://localhost:8080/rdb/"+schema+"/SchemaDef#";
                                                    break;
                                            case FILE:  
                                                    prefix = "tab"+"-"+fileName.substring(0, format_pos);
                                                    vocURL = "http://localhost:8080/tab/"+fileName.substring(0, format_pos)+
                                                             "/SchemaDef#";
                                                    recordClass = SourcesManager.recordRDFClass; ;
                                                    break;
                                    }
                                }else{
                                        prefix = "tab"+"-"+fileName.substring(0, format_pos);
                                        vocURL = "http://localhost:8080/tab/"+fileName.substring(0, format_pos)+"/SchemaDef#";
                                        recordClass = SourcesManager.recordRDFClass; ;
                                }
                                conv.setRecordClass(recordClass);
                                conv.setCustomizedVocabularyPrefix(prefix);
                                prefixes.put(prefix,vocURL); 
                                conv.setDatasetPrefixes(prefixes); 
                                PrefixesManager.addPrefix(prefix, vocURL);
                                try {
                                        conv.convert();
                                } catch (IOException | EncoderException e) {
                                        e.printStackTrace();
                                        return -1;
                                }
                                datasetVoc = new DatasetVocabulary();
                                
                                String[] classesArray = conv.getRDFClasses();
                                JSONObject term_o;
                                for(int i = 0; i < classesArray.length;i++){
                                        term_o = PrefixesManager.getVocabularyTermInJSONFormat(classesArray[i]);
                                        classesArray[i] = term_o.getString("uri")+term_o.getString("name");
                                }
                                String[] propertiesArray = conv.getRDFProperties();
                               
                                for(int i = 0; i < propertiesArray.length;i++){
                                        term_o = PrefixesManager.getVocabularyTermInJSONFormat(propertiesArray[i]);
                                        propertiesArray[i] = term_o.getString("uri")+term_o.getString("name");
                                }
                                
                                datasetVoc.setClasses(classesArray);
                                datasetVoc.setProperties(propertiesArray);
                                datasetVoc.setPrefixes(prefixes);
                                
                                importedDatasetFile = datasetFile;
                                
                        }catch (NullPointerException e){
                                e.printStackTrace();
                        }
                        
                }else{
                      datasetVoc = getDatasetVocabulary(fileName);
                      PrefixesManager.addPrefixesToURIs(datasetVoc.getPrefixes());
                      importedDatasetFile =  getImportedFileFromFilename(fileName);
                }
                
                datasetVoc.print();
                
                //parse ttl with jena model not with r2r file source!!
               
                Source s = new FileOrURISource("file:"+importedDatasetFile.toString()); 
                
                
                this.addDatasetVocabulary(ProjectFileUtils.getFilename(importedDatasetFile),datasetVoc);/*fileManager.getFilenameFromFile(importedDatasetFile)*/
                
                Dataset dataset = new Dataset(graphName,importedDatasetFile,datasetVoc);
                JSONObject importingMetadata = new JSONObject();
                
                importingMetadata.put("Source",sourceType);
                importingMetadata.put("Source Name",sourceName);
                importingMetadata.put("Source Description",fileMetadata.getString(SOURCE_DESCRIPTION));
                importingMetadata.put("Type Of Import",fileMetadata.getString(TYPE_OF_IMPORT));
                importingMetadata.put("Number Of Records",fileMetadata.getString(TOTAL_ROWS));
                System.out.println(importingMetadata.toString());
                dataset.getMetadata().addImportingMetadata(importingMetadata);
                
                /*if(prefix!=null && recordClass!=null){
                        dataset.getMetadata().setRecordRDFClass(prefix+":"+recordClass); 
                        dataset.getMetadata().setRecordCellValueRDFProperty(prefix+":"+"hasValue");
                        dataset.getMetadata().setDatasetRDFClass(prefix+":"+datasetClass);
                }*/
                
                dm.addDataset(dataset);
                importedDatasets.put(importedDatasetFile, dataset);
                System.out.println("successful dataset");
                return 1;
        }

        private File getImportedFileFromFilename(String fileName) {
                
                return sm.getFileManager().getFile(fileName);
        }

        private boolean needConvertionToRDF(String extension) {
                return (extension.equals("xls")  ||
                        extension.equals("xlsx") || 
                        extension.equals("csv")  || 
                        extension.equals("json")
                       );
        }

        public File getJSONFileForQuery() {
                
                File newFile = sm.getFileManager().createFile("resultSet"+relationalQueriesCounter+".json");
                relationalQueriesCounter++;
                return newFile;
             
        }

        public void addConnection(DBConnectionSource dbc) {

                String key_url = dbc.getConnectionURL();
                dbConnections.put(key_url, dbc);
        }

        public DBConnectionSource getConnection(String url) {
                return dbConnections.get(url);
        }
        
        public void addSparqlEndpoint(SPARQLEndpointSource endpoint) {

                String url = endpoint.getServiceURL();
                sparqlEndpoints.put(url, endpoint);
        }

        public SPARQLEndpointSource getSparqlEndpoint(String url) {
                return sparqlEndpoints.get(url);
        }
        

        public File getFileForSPARQLQuery() {
                
                File file = sm.getFileManager().createFile("sparqlDataset"+sparqlQueriesCounter+".ttl");
                sparqlQueriesCounter++;
                return file;
        }
        
       /* public Collection<Path> getImportedDatasets(){
                
               Collection <Dataset> datasets = importedDatasets.values();
               
               Iterator<Dataset> it =  datasets.iterator();
               
               File file = null;
               ArrayList<Path> paths = new ArrayList<Path>();
               while(it.hasNext()){
                       file = it.next().getFile();
                       paths.add(file.toPath());
               }
               return paths;
        }*/

      /*  public ArrayList<Path> getHelpForImportedDatasets() {
                return sm.getFileManager().getNamesOfImportedFiles();   
        }*/

        public void addDatasetVocabulary(String filename, DatasetVocabulary datasetVoc) {
                currentDatasetsVocabularies.put(filename,datasetVoc);
        }
        
        public DatasetVocabulary getDatasetVocabulary(String filename) {
                return currentDatasetsVocabularies.get(filename);
        }
        
       
        
        
        
        /********* methods for testing **********************/
        
        
        
        public void importFile(String filePath){
                this.fileNamesMapAPI.put(filePath,Paths.get(filePath));
                System.out.println("put");
        };
        
        
        public Dataset convertFile(String filePath){
               
                DataspaceManager dm = sm.getDataspaceManager();
                
                if(this.fileNamesMapAPI.containsKey(filePath)){
                        System.out.println("contained");
                        Dataset dataset;
                        try {
                                dataset = this.createDatasetWithNoMetadata(this.fileNamesMapAPI.get(filePath).toString());
                                dm.addDataset(dataset);
                                return dataset;
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                        
                }
                return null;
        }

        private Dataset createDatasetWithNoMetadata(String filePath) throws JSONException {
                
                String fileName = ProjectFileUtils.getFilename(filePath);//fileManager.getFilenameFromFile(Paths.get(filePath).toFile());
                System.out.println("PATH > "+filePath);
                System.out.println("FILENAME > "+fileName);
                String extension = ProjectFileUtils.getFileExtension(fileName);//fileManager.getFileExtension(fileName);
                Converter conv = convertorsToRDF.get(extension);
                System.out.println(conv.getClass().toString());
                try{
                        File importedSourceFile = Paths.get(filePath).toFile();
                        File datasetFile = sm.getFileManager().getDatasetFile(fileName);
                        conv.setInputFile(importedSourceFile);
                        conv.setOutputFile(datasetFile);
                        
                        
                        HashMap<String,String> prefixes = new HashMap<String,String>();
                        
                        prefixes.put("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
                        prefixes.put("rdfs", "http://www.w3.org/2000/01/rdf-schema#");
                        //prefixes[0] = "@prefix rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>";
                        //prefixes[1] = "@prefix rdfs:<http://www.w3.org/2000/01/rdf-schema#>";
                        conv.setBaseURI("http://localhost:8080/");
                        
                        int format_pos = fileName.lastIndexOf('.');
                     
                        conv.setDatasetName(fileName.substring(0, format_pos));
                        conv.setDatasetClass("Dataset");
                        
                        String vocURL = null;
                        String prefix = null;
                        String recordClass = null;
                        prefix = "tab"+"-"+fileName.substring(0, format_pos);
                        vocURL = "http://localhost:8080/tab/"+fileName.substring(0, format_pos)+"/TabularDef#";
                        conv.setCustomizedVocabularyPrefix(prefix);
                        recordClass = "tabularRecord";
                        conv.setRecordClass(recordClass);
                        prefixes.put(prefix,vocURL);
                        conv.setDatasetPrefixes(prefixes);
                        System.out.println(prefix+"--------"+vocURL);
                        PrefixesManager.addPrefix(prefix, vocURL);
                        try {
                                conv.convert();
                        } catch (IOException | EncoderException | JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
          
                        
                        DatasetVocabulary datasetVoc = new DatasetVocabulary();
                        String[] classesArray = conv.getRDFClasses();
                        JSONObject term_o;
                        for(int i = 0; i < classesArray.length;i++){
                                term_o = PrefixesManager.getVocabularyTermInJSONFormat(classesArray[i]);
                                classesArray[i] = term_o.getString("uri")+term_o.getString("name");
                        }
                        String[] propertiesArray = conv.getRDFProperties();
                       
                        for(int i = 0; i < propertiesArray.length;i++){
                                term_o = PrefixesManager.getVocabularyTermInJSONFormat(propertiesArray[i]);
                                propertiesArray[i] = term_o.getString("uri")+term_o.getString("name");
                        }
                        
                        datasetVoc.setClasses(classesArray);
                        datasetVoc.setProperties(propertiesArray);
                        datasetVoc.setPrefixes(prefixes);
                        
                        datasetVoc.print();
                        
                        //parse ttl with jena model not with r2r file source!!
                        Source s = new FileOrURISource("file:"+datasetFile.toString());
                        
                        //this.addDatasetVocabulary(fileManager.getFilenameFromFile(importedDatasetFile),datasetVoc);
                        String graph_name = ProjectFileUtils.getFilename(datasetFile);//fileManager.getFilenameFromFile(datasetFile);
                        Dataset dataset = new Dataset(graph_name,datasetFile,datasetVoc);
                        JSONObject importingMetadata = new JSONObject();
                        
                        dataset.getMetadata().addImportingMetadata(importingMetadata);
                        return dataset;
                        
                }catch (NullPointerException e){
                        e.printStackTrace();
                }
                return null;      
        }



        public void reset() {
                // TODO Auto-generated method stub
                
                this.currentDatasetsVocabularies.clear();
                this.dbConnections.clear();
                this.importedDatasets.clear();
                this.sparqlEndpoints.clear(); 
        }
         
}

