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
import ntua.thesis.dis.util.SPARQLUtils;


public class GetPathInfoCommand extends Command {

        /**
         * 
         */
        private static final long serialVersionUID = 1L;
        
       /* private LinkingManager linkManager;
        
        
        public GetPathInfoCommand(LinkingManager linkingManager) {
                linkManager = linkingManager;
        }*/
        
        public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
            
                LinkingManager lm = getLinkingManager();
                String action = request.getParameter("action");
                JSONObject answerToUser = new JSONObject();
                
                if (action.equals("check-variables")){
                        String restrictTo = request.getParameter("restrictTo");
                        
                        
                        JSONArray variables = lm.getVariablesOfPattern(restrictTo);
                        try {
                                answerToUser.put("variables",variables);
                        } catch (JSONException e) {
                                response.sendError(500);
                                e.printStackTrace();
                        }
                        
                }else if(action.equals("get-properties")){
                        
                        String sourceDatasetName = request.getParameter("sourceDatasetName");
                        String targetDatasetName = request.getParameter("targetDatasetName");
                        String sourceRestrictTo = request.getParameter("sourceRestrictTo");
                        String targetRestrictTo = request.getParameter("targetRestrictTo");
                        String sourceVar = request.getParameter("sourceVar");
                        String targetVar = request.getParameter("targetVar");
                        JSONArray sourceVariables;
                        JSONArray targetVariables;
                        try { 
                                sourceVariables = lm.getPathsFromSPARQLClause(sourceDatasetName,sourceRestrictTo,sourceVar);
                                targetVariables = lm.getPathsFromSPARQLClause(targetDatasetName,targetRestrictTo,targetVar);
                                
                                answerToUser.put("source",sourceVariables).put("target",targetVariables);
                                System.out.println(answerToUser.toString());
                        } catch (JSONException e1) {
                                e1.printStackTrace();
                                response.sendError(500);
                        }
                }
                response.setContentType("application/json");
                response.getWriter().write(answerToUser.toString()); 
        } 
        
        public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
       
                doGet(request,response);         
        } 
}
