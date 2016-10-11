package ntua.thesis.dis.commands.linking;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;

import ntua.thesis.dis.commands.Command;
import ntua.thesis.dis.linking.LinkingManager;


public class GetLinksCommand extends Command{

        /**
         * 
         */
        private static final long serialVersionUID = 1L;
        /*private LinkingManager linkManager;
        
        public GetLinksCommand(LinkingManager linkingManager) {
                linkManager = linkingManager;
        }*/
        
        public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                
                LinkingManager lm = getLinkingManager();
                String taskName = request.getParameter("taskName");
                JSONObject links = new JSONObject();
                try {
                        links = lm.getLinkingTaskResultLinks(taskName);
                        respondJSON(response,links);
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                
        }

        public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                doGet(request,response);
        }
}
