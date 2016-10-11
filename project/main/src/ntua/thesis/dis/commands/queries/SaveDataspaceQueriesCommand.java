package ntua.thesis.dis.commands.queries;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import ntua.thesis.dis.commands.Command;
import ntua.thesis.dis.query.QueryManager;


public class SaveDataspaceQueriesCommand extends Command {

        /**
         * 
         */
        private static final long serialVersionUID = 1L;

        public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                
                
                String queriesData = request.getParameter("queries");
                JSONArray queries;
                JSONObject answer = new JSONObject();
                boolean saved = false;
                try {
                        queries = new JSONArray(queriesData);
                        QueryManager qm = getQueryManager();
                        saved = qm.saveQueries(queries);
                        answer.put("saved",saved);
                } catch (JSONException e) {
                        
                        e.printStackTrace();
                }
              
                respondJSON(response,answer);
        }
}
