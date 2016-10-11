package ntua.thesis.dis.commands.queries;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import ntua.thesis.dis.commands.Command;
import ntua.thesis.dis.query.QueryManager;



public class StopSPARQLQueryExecutionCommand extends Command {
        
        /**
         * 
         */
        private static final long serialVersionUID = 1L;

        public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
               
                QueryManager qm = getQueryManager();
                String queryId = request.getParameter("queryId");
                Long id = Long.parseLong(queryId);
                qm.stopQueryExecution(id);
                System.out.println("query id > "+queryId+ " stop executed!!");
                response.setContentType("application/json");
                response.getWriter().write(new JSONObject().toString()); 
        }

}
