package ntua.thesis.dis.commands.queries;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONException;
import org.json.JSONObject;
import ntua.thesis.dis.commands.Command;
import ntua.thesis.dis.query.QueryManager;


public class SPARQLQueryCommand extends Command{

        /**
         * 
         */
        private static final long serialVersionUID = 1L;

        //save query
        public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                
                /*QueryManager qm = getQueryManager();
                String queryText = request.getParameter("queryText");
                String queryId = request.getParameter("queryId");
                Long id = Long.parseLong(queryId);
                boolean saved = qm.saveQuery(id,queryText);
                JSONObject answer = new JSONObject();
                try {
                        answer.put("saved", saved);
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        //e.printStackTrace();  
                }
                response.setContentType("application/json");
                response.getWriter().write(answer.toString()); */
                
        }

        //load query
        public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                QueryManager qm = getQueryManager();
                String queryId = request.getParameter("queryId");
                long id = Long.parseLong(queryId);
                JSONObject query_o = qm.getQuery(id);
                respondJSON(response,query_o);
        }
        
        //create query
        public void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                QueryManager qm = getQueryManager();
                String queryName = request.getParameter("queryName");
                JSONObject query_o = qm.createQuery(queryName);
                response.setContentType("application/json");
                response.getWriter().write(query_o.toString()); 
        }
}
