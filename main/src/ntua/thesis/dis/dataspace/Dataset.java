package ntua.thesis.dis.dataspace;

import java.io.File;
import java.util.ArrayList;


import ntua.thesis.dis.dataspace.provenance.Metadata;

import org.json.JSONObject;

import com.hp.hpl.jena.rdf.model.Model;



public class Dataset {
        //SET DATASET GRAPH URI!!!! EXAMPLE <http://localhost:8080/name>
       
        private String name;
        private ArrayList<File> files;
        private String graphName;
        private Metadata metadata;
        private ArrayList<DatasetVocabulary> vocabularies; 
        
        
        public Dataset(String datasetName, File file,DatasetVocabulary datasetVoc) {
                this.files = new ArrayList<File>();
                this.files.add(file);
                this.graphName = DataspaceManager.getGraphName(datasetName);
                this.vocabularies = new ArrayList<DatasetVocabulary>();
                this.vocabularies.add(datasetVoc);
                this.name = datasetName;//getFilenameWithNoExtension(file);
                this.metadata = new Metadata(this.name); //initialize system metadata
        }

      

        public Metadata getMetadata() {
                return metadata;
        }

        
        
        
        public File getFile(){
                
                int size = this.files.size();
                if(size == 0){
                        return null;
                }
                return this.files.get(size-1);
        }
        
        
        public File getFile(int version) {
                if (version < 1 || version > 2){
                        return null;
                }
                if(version == 1 && this.files.size() == 0){
                        System.out.println("fatal error");
                        return null;
                }
                else if(version == 2 && this.files.size() == 1){
                        System.out.println("file has no mapping modification");
                        return this.files.get(0);       
                }
                else return this.files.get(version-1);
        }

        public int setFile(File file,int version) {
                
                if (version < 1 || version > 2){
                        return -1;
                }
                this.files.add(version-1, file);
                System.out.println("dataset "+this.name);
                System.out.println("files "+this.files.size());
                for(int i = 0; i < this.files.size();i++){
                        System.out.println(this.files.get(i));
                }
                return 1;
        }
        
        public DatasetVocabulary getVocabulary() {
                int size = this.vocabularies.size();
                return this.vocabularies.get(size-1);
        }
        
        
        public DatasetVocabulary getVocabulary(int version) {
                return this.vocabularies.get(version-1);
        }

        public void setVocabulary(DatasetVocabulary vocabulary,int version) {
                this.vocabularies.add(version-1,vocabulary);
        }

        public String getName() {
                return this.name;
        }
        
       
      
      /*  private String getFilenameWithNoExtension(File file) {
                
                String fileToString = file.toString();
                int filenamePos = fileToString.lastIndexOf('\\') + 1;
                String filenameWithExtension = fileToString.substring(filenamePos,fileToString.length());
                int lastDotPos = filenameWithExtension.lastIndexOf('.');
                String filename = filenameWithExtension.substring(0,lastDotPos);
                System.out.println("dataset name is "+filename);
                return filename;
        }*/

        public String getGraphName() {
                return graphName;
        }

        
}
