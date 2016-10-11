package ntua.thesis.dis.commands;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import ntua.thesis.dis.dataspace.DataspaceManager;
import ntua.thesis.dis.importing.SourcesManager;
import ntua.thesis.dis.linking.LinkingManager;
import ntua.thesis.dis.mapping.SchemaMappingManager;
import ntua.thesis.dis.query.QueryManager;
import ntua.thesis.dis.service.IntegrationServiceServlet;
import ntua.thesis.dis.service.ServiceManager;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;


public abstract class Command extends HttpServlet{

        
        private static final long serialVersionUID = 1L;
        
        protected ServiceManager service = ServiceManager.instance;
        
        protected IntegrationServiceServlet servlet;
        
        public void init(IntegrationServiceServlet servlet) {
            this.servlet = servlet;
        }
        
        public Command() {
            super();
        }
        
        public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
            
        }

        public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
            
        }
        
        public void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                
        }
        
        public void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                
        }
        
        public void respondJSON(HttpServletResponse response,JSONObject o) throws IOException{
                response.setContentType("application/json");
                response.getWriter().write(o.toString());
        }
        
        public void respondJSON(HttpServletResponse response, JSONArray array) throws IOException {
                response.setContentType("application/json");
                response.getWriter().write(array.toString());
        }
        
        
     
        
        public SourcesManager getSourcesManager(){
                return service.sourcesManager;
        }
        
        
        public SchemaMappingManager getMappingsManager(){
                return service.schemaMappingManager;
        }
        
        public LinkingManager getLinkingManager(){
                return service.linkingManager;
        }
        
        
        
        public QueryManager getQueryManager(){
                return service.queryManager;
        }
        
        public DataspaceManager getDataspaceManager(){
                return service.getDataspaceManager();
        }
        
        public boolean loadDataspace(String dataspaceName,long dataspaceId){
                DataspaceManager dm = this.getDataspaceManager();
                boolean loaded = dm.loadDataspaceProject(dataspaceId);
                if(loaded){
                        this.servlet.setCurrentDataspaceId(dataspaceId);
                        return true;
                }else{
                        return false;
                }
        }
        
        public boolean saveDataspace(){
                DataspaceManager dm = this.getDataspaceManager();
                long id = this.servlet.getCurrentDataspaceId();
                return dm.saveDataspaceProject(id);
        }
        
        public long createDataspace(String dataspaceName){
                DataspaceManager dm = this.getDataspaceManager();
                long newDataspaceId =  dm.createDataspaceProject(dataspaceName);
                this.servlet.setCurrentDataspaceId(newDataspaceId);
                return newDataspaceId;
        }
        
        public JSONObject loadDataspaceMetadata(){
                
                DataspaceManager dm = this.getDataspaceManager();
                long id = this.servlet.getCurrentDataspaceId();
                System.out.println("servlet dataspace id > "+id);
                return dm.loadDataspaceProjectMetadata(id);
        }

       
}
