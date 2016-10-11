package ntua.thesis.dis.dataspace;

import java.io.File;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import ntua.thesis.dis.linking.LinkingTask;
import ntua.thesis.dis.mapping.SchemaMappingTask;


public class DataspaceProject {

        private long id;
        private String name;
        private Date lastModified = new Date();
        
        
        //private Dataspace dataspace;
       // private List<Dataset> datasets = new ArrayList<Dataset>();
        private List<LinkingTask> linkingTasks = new ArrayList<LinkingTask>();
        private List<SchemaMappingTask> mappingTasks = new ArrayList<SchemaMappingTask>();
        private List<String> queries = new ArrayList<String>();
        
        
        
        static public long generateID() {
                return System.currentTimeMillis() + Math.round(Math.random() * 1000000000000L);
        }
        
        public void setLastModified(){
                this.lastModified = new Date();
                System.out.println("Dataspace project ID > "+this.id+ "new last modified > "+this.lastModified.toString());
        }
        
        public Date getLastModified(){
                return this.lastModified;
        }
        
        public DataspaceProject(long id){
                this.id = id;
        }
        
        public DataspaceProject(){
                this.id = generateID();
        }
        
        public long getId(){
                return this.id;
        }
        
        public void setName(String name){
                this.name = name;
        }
       
        public String getName() {
                // TODO Auto-generated method stub
                return this.name;
        }
   
}
