package ntua.thesis.dis.commands.linking;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import ntua.thesis.dis.commands.Command;
import ntua.thesis.dis.linking.LinkingManager;


public class GetRecommendedLinkingTasksCommand extends Command{

       /* LinkingManager lm;
        public GetRecommendedLinkingTasksCommand(LinkingManager linkingManager) {
                lm = linkingManager;
        }*/

        /**
         * 
         */
        private static final long serialVersionUID = 1L;
        
        public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                LinkingManager lm = getLinkingManager();
                JSONArray linkingTasks = new JSONArray();
                linkingTasks = lm.createPredefinedLinkingTasks();
                respondJSON(response,linkingTasks);    
        }
        
        

        public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                doGet(request,response);
        }

}
