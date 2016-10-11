package ntua.thesis.dis.commands.mapping;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import ntua.thesis.dis.commands.Command;
import ntua.thesis.dis.mapping.SchemaMappingManager;
import org.json.JSONException;
import org.json.JSONObject;




public class SaveMappingTaskCommand extends Command{

        /**
         * 
         */
        private static final long serialVersionUID = 1L;
        
        /*private SchemaMappingManager shMapManager;
        
        
        public SaveMappingTaskCommand(SchemaMappingManager schemaMappingManager) {
                shMapManager = schemaMappingManager;
        }*/

        public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException,IOException{
                
                SchemaMappingManager sm = getMappingsManager();
                JSONObject answerToUser = new JSONObject();
                try {
                        String mappingTaskName = request.getParameter("mappingTaskName");
                        System.out.println(mappingTaskName);
                        JSONObject mappingMetadata = sm.confirmMappingTask(mappingTaskName);
                
                        
                
                
                        answerToUser.put("Task Name", mappingTaskName);
                        
                        //String[] jsonObjectNames = org.json.JSONObject.getNames(mappingMetadata);
                        //System.out.println(mappingMetadata.names().toString());
                       
                        
                        /*for(int i = 0; i < jsonObjectNames.length;i++){
                                System.out.println(jsonObjectNames[i]);
                                properties.put(jsonObjectNames[i],mappingMetadata.get(jsonObjectNames[i]));
                        }*/
                        answerToUser.put("properties",mappingMetadata);
                } catch (JSONException | NullPointerException e) {
                        response.setContentType("application/json");
                        response.getWriter().write(e.toString());   
                        e.printStackTrace();
                }
                
                response.setContentType("application/json");
                response.getWriter().write(answerToUser.toString());   
                
        }

        public void doGet(HttpServletRequest request,HttpServletResponse response) 
                        throws ServletException,IOException{
                
                doPost(request, response);
                
        }
        
        
}



