package ntua.thesis.dis.service;

import java.io.File;
import java.io.IOException;
import java.io.Writer;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.HashMap;
import java.util.Map;
import ntua.thesis.dis.util.ProjectFileUtils;
import ntua.thesis.dis.util.SPARQLUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.hp.hpl.jena.rdf.model.Model;






public class FileManager {
        static final Logger logger = LoggerFactory.getLogger("FileManager");
        
        private Path workspaceDir;
        private Path tempDir;
        private Path importedDataDir;
        private Path datasetsDir;
        private Path vocabulariesDir;
        private Path tasksDir;
        private Path outputDirectory;
        private String toolFileName = "DSpace";
        
        
        private Map<Long,String> idToProjectFileMap = new HashMap<Long,String>();
        
        private static FileManager instance = new FileManager();
        
        public static FileManager getInstance(){
                if(instance == null){
                        instance = new FileManager();
                }
                return instance;
        }
        
        
        private FileManager(){
                
        }
        
        public Path getTempDatasetsDirectory() {
                return datasetsDir;
        }

        public void init(){
                String temp = System.getProperty("java.io.tmpdir");
                new File(temp+toolFileName).mkdir();
                new File(temp+toolFileName+"/importedData").mkdir();
                new File(temp+toolFileName+"/datasets").mkdir();
                new File(temp+toolFileName+"/editingTasks").mkdir();
                new File(temp+toolFileName+"/output").mkdir();
                new File(temp+toolFileName+"/vocabularies").mkdir();
                this.tempDir = Paths.get(temp, toolFileName);
                this.importedDataDir = Paths.get(temp,toolFileName, "importedData");
                this.tasksDir = Paths.get(temp,toolFileName, "editingTasks");
                this.outputDirectory = Paths.get(temp,toolFileName, "output");
                this.vocabulariesDir = Paths.get(temp,toolFileName, "vocabularies");
                this.datasetsDir = Paths.get(temp,toolFileName, "datasets");
                System.out.println("tool directory is "+ tempDir.toString());
                System.out.println("vocabulary directory is "+ this.vocabulariesDir.toString());
                
                
                String userHomeDir = System.getProperty("user.home");
                new File(userHomeDir+"\\"+toolFileName).mkdir();
                this.workspaceDir = Paths.get(userHomeDir,toolFileName);
                this.getDataspaceProjects();
        }
        
      
        
        public File writeJSONData(String input,String filename) throws IOException{
                
                File newFile = this.newFile(importedDataDir+"/"+filename);//new File(importedDataDir+"/"+filename);

                Path filePath = newFile.toPath();
                Charset charset = Charset.forName("UTF-8");
                Writer out = Files.newBufferedWriter(filePath, charset,StandardOpenOption.CREATE);
                out.write(input);
                out.close();
                return newFile;
        }
        
        

  
        public int deleteFile(String fileNameToDelete) {
               
               Path path = Paths.get(importedDataDir.toString(),fileNameToDelete);
               if (path == null){
                       return -1;
               }
               File fileToDelete = path.toFile();
               System.out.println(path.toString());
               if (fileToDelete.delete()){
                       return 1;
               }
               return -1;
        }




        public File getFile(String filename) {
                Path path = Paths.get(importedDataDir.toString(),filename);
                return path.toFile();
        }




        public File createFile(String filename) { 
                return this.newFile(importedDataDir+"/"+filename);
        }


        public File getDatasetFile(String filename) {
                int format_pos = filename.lastIndexOf('.');
                filename = filename.substring(0, format_pos);
                return this.newFile(datasetsDir+"/"+filename+".ttl");
                //return new File(datasetsDir+"/"+filename+".ttl");
        }


        public Path getTempTasksDirectory() {
                return tasksDir;
        }


        private File newFile(String fileToString){
                
                boolean bool = this.deleteIfExists(fileToString);
                System.out.println(bool);
                return new File(fileToString);
        }
        
        private boolean deleteIfExists(String pathToString){
                
                Path path = Paths.get(pathToString);
                try {
                        return Files.deleteIfExists(path);
                } catch (IOException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                return false;
        }

        public Path getVocabulariesDirectory() {
                return vocabulariesDir;
        }


        public Path getImportedDataDirectory() {
                
                return this.importedDataDir;
        }


        


        public JSONObject loadDataspaceMetadata(long id) {
                
                File projectFile = this.getDataspaceProjectDir(id);
                
                if(projectFile == null) return new JSONObject();
                
                JSONObject metadata = new JSONObject();
                File metadataJSONFile = Paths.get(projectFile.toString(),"metadata.json").toFile();
                if(!metadataJSONFile.exists()){
                        return metadata;
                }
                
                try {
                        metadata = ProjectFileUtils.readProjectMetadata(metadataJSONFile);
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                return metadata;
        }


        public boolean saveDataspaceMetadata(JSONObject metadata, long id) {
                
                File projectFile = this.getDataspaceProjectDir(id);
                File metadataJSONFile = Paths.get(projectFile.toString(),"metadata.json").toFile();
                return ProjectFileUtils.writeJSONMetadata(metadata,metadataJSONFile);
        }

        
        public JSONArray loadWorkspaceMetadata(){
                
                File workspaceJSONMetadataFile = Paths.get(this.workspaceDir.toString(),"dataspaces.json").toFile();
                if(!workspaceJSONMetadataFile.exists()){
                        return new JSONArray();
                }
                try {
                        JSONObject metadata = ProjectFileUtils.readProjectMetadata(workspaceJSONMetadataFile);
                        JSONArray projectsId = metadata.getJSONArray("IDs");
                        return projectsId;
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                        return null;
                }
        }
        
        public boolean saveWorkspaceMetadata(JSONArray projectsIds) {
                
                File workspaceJSONMetadataFile = Paths.get(this.workspaceDir.toString(),"dataspaces.json").toFile();
                JSONObject metadata = new JSONObject();
                try {
                        metadata.put("IDs", projectsIds);
                        return ProjectFileUtils.writeJSONMetadata(metadata, workspaceJSONMetadataFile);
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                        return false;
                }
                
        }
        
        
        
        
        private void getDataspaceProjects(){
                File projectsDir = Paths.get(this.workspaceDir.toString()).toFile();
                
                File[] projectsFiles = projectsDir.listFiles();
                for(int i = 0; i < projectsFiles.length;i++){
                        if(!projectsFiles[i].isDirectory()) continue;
                        String name = projectsFiles[i].getName();
                        long id = Long.parseLong(name.split(".dataspace")[0]);
                        System.out.println("project ID " +id);
                        this.idToProjectFileMap.put(id, projectsFiles[i].toString());
                }
        }
        
        public File writeDatasetToProjectDir(long id, Model model, String filename,String lang) {
                // TODO Auto-generated method stub
                File datasetsDir = this.getDatasetsDirectory(id);
                File datasetFile = new File(datasetsDir,filename);
                try {
                        if(datasetFile.createNewFile()){
                                logger.info("creating dataset file for project with id > "+id + " : "+datasetFile.toString());
                        }else{
                                logger.info("ERROR creating dataset file for project with id > "+id + " : "+datasetFile.toString());
                        }
                } catch (IOException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                        return null;
                }
                if(SPARQLUtils.writeModelToFile(model, datasetFile, lang)>0){
                        return datasetFile;
                }
                return null;
        }


        public File getDatasetsDirectory(long id) {
                File projectDir = this.getDataspaceProjectDir(id);
                return Paths.get(projectDir.toString(),"datasets").toFile();
                
        }


        public File[] getDatasetsOfProject(long id) {
                
                File datasetDir = this.getDatasetsDirectory(id);
                logger.info("dataset dir of project wth id > "+id +" is > "+datasetDir.toString());
                return datasetDir.listFiles();
        }
        
        public File[] getTasksOfProject(long id){
                
                File tasksDir = Paths.get(this.workspaceDir.toString(),"tasks").toFile();
                return tasksDir.listFiles();
        }

        public File getDataspaceProjectDir(long id) {
                // TODO Auto-generated method stub
                String fileString = this.idToProjectFileMap.get(id);
                if(fileString == null){
                        logger.info("Project with Id > "+ id + " not found!");
                        return null;
                }
                return Paths.get(fileString).toFile();
        }
        
        
        public void deleteDataspaceProjectDir(long id) {
                // TODO Auto-generated method stub
                File projectDir = this.getDataspaceProjectDir(id);
                this.deleteDir(projectDir);
        }
        
        private void deleteDir(File dir) {
                for (File file : dir.listFiles()) {
                    if (file.isDirectory()) {
                        deleteDir(file);
                    } else {
                        file.delete();
                    }
                }
                dir.delete();
        }
        
        public File getTasksDirectory(long id) {
                File projectDir = this.getDataspaceProjectDir(id);
                return Paths.get(projectDir.toString(),"tasks").toFile();
        }
        
        public boolean createDataspaceProjectDir(long id) {
                
                String projectDir = this.workspaceDir.toString()+"\\"+ id + ".dataspace";
                new File(projectDir).mkdir();
                logger.info("creating dir for project with id > "+id + " : "+projectDir.toString());
                File datasetsDir = new File(projectDir,"datasets");
                File tasksDir = new File(projectDir,"tasks");
                if(!datasetsDir.exists()){
                        datasetsDir.mkdir();
                }
                if(!tasksDir.exists()){
                        tasksDir.mkdir();
                }
                File metadataFile = new File(projectDir,"metadata.json");
                try {
                        if(metadataFile.createNewFile()){
                                logger.info("creating metadata.json for project with id > "+id + " : "+metadataFile.toString());
                        }else{
                                logger.info("ERROR creating metadata.json for project with id > "+id + " : "+metadataFile.toString());
                        }
                } catch (IOException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                        return false;
                }
                
                this.idToProjectFileMap.put(id, projectDir);
                
                return true;
        }


        


       


        


        
}     

/* public Path writeData(InputStream in,String format) throws IOException{

Path tempFile = Files.createTempFile(null, format);
System.out.format("The temporary file" +
     " has been created: %s%n", tempFile);

int x = 0;
byte[] b = new byte[1024];
OutputStream out = Files.newOutputStream(tempFile, StandardOpenOption.CREATE, StandardOpenOption.APPEND);

while(x!= -1){
       x = in.read(b);
       if (x!=-1){
           out.write(b, 0, Math.min(b.length,x));
           for(int i = 0;i<Math.min(b.length,x);i++){
                   b[i] = 0;
           }     
       }
}
out.close();
return tempFile;
}*/

/* public ArrayList<Path> getNamesOfImportedFiles() {

try {
        DirectoryStream<Path> paths = Files.newDirectoryStream(Paths.get(datasetsDir.toString()));
        
        Iterator<Path> it = paths.iterator();
        
        Path path = null;
        ArrayList<Path> col_paths = new ArrayList<Path>();
        
        while(it.hasNext()){
             path = it.next();
             col_paths.add(path);
        }
        return col_paths;
} catch (IOException e) {
        
        e.printStackTrace();
        return null;
}

}*/

/*public String getFilenameFromFile(File file){
String pathToString = file.toPath().toString();
int filenamePos = pathToString.lastIndexOf('\\') + 1;
String name = pathToString.substring(filenamePos,pathToString.length());
return name;
}*/




/* public File searchForFile(String filename) {

boolean path1 = Files.exists(Paths.get(importedDataDir.toString(),filename));


if (path1){
        return Paths.get(importedDataDir.toString(),filename).toFile();
}
else{
        return Paths.get(datasetsDir.toString(),filename).toFile();
}

}*/