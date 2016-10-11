package ntua.thesis.dis.commands.dataspace;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;

import ntua.thesis.dis.commands.Command;
import ntua.thesis.dis.service.ServiceManager;


public class DataspaceProjectCommand extends Command{
        
        
        /**
         * 
         */
        private static final long serialVersionUID = 1L;

        //load/build dataspace
        public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                ServiceManager.resetExternalManagers();
                String dataspaceName = request.getParameter("dataspaceName");
                Long projectId = Long.parseLong(request.getParameter("id"));
                boolean loaded = loadDataspace(dataspaceName,projectId);
                JSONObject answer = new JSONObject();
                try {
                        answer.put("loaded",loaded);
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                respondJSON(response,answer);
                
        }
        //save current dataspace
        public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                
               
                boolean saved = saveDataspace();
                JSONObject answer = new JSONObject();
                try {
                        answer.put("saved",saved);
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                respondJSON(response,answer);
        }
        //create new dataspace
        public void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
               
                ServiceManager.resetExternalManagers();
                String dataspaceName = request.getParameter("dataspaceName");
                long id = createDataspace(dataspaceName);
                System.out.println("NEW PROJECT ID > "+id);
                JSONObject answer = new JSONObject();
                try {
                        answer.put("projectId",id);
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                respondJSON(response,answer);
                
        }
        
        

}
