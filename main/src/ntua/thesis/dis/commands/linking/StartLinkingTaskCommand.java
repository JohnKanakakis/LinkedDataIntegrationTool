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


public class StartLinkingTaskCommand extends Command {

        private static final long serialVersionUID = 1L;
        
        /*private LinkingManager linkManager;
        
        
        public StartLinkingTaskCommand(LinkingManager linkingManager) {
                linkManager = linkingManager;
        }*/
        
        public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                doPost(request,response);
        }

        public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                
                LinkingManager lm = getLinkingManager();
                JSONObject linkSpec;
                JSONObject ruleSpec;
                String sourceDatasetName = request.getParameter("sourceDatasetName");
                String targetDatasetName = request.getParameter("targetDatasetName");
                JSONObject answerToUser = new JSONObject();
                try {
                        ruleSpec = new JSONObject(request.getParameter("ruleSpec"));
                        linkSpec = new JSONObject(ruleSpec.getString("linkSpec"));
                        ruleSpec.put("linkSpec", linkSpec);
                        System.out.println(linkSpec.toString());
                        lm.createLinkingTask(sourceDatasetName, targetDatasetName, ruleSpec);
                        answerToUser = lm.getLinkingTaskResultLinks(ruleSpec.getString("linkTaskName"));
                        respondJSON(response,answerToUser);
                } catch (JSONException | NullPointerException e) {
                       /* response.setStatus(404);
                        response.setContentType("application/text");
                        String message = "Could not load results.Please try again";
                        response.getWriter().write(message);*/
                        e.printStackTrace();
                        respondJSON(response,answerToUser);
                }
                
        }
}
