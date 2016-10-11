package ntua.thesis.dis.commands.queries;

import java.io.IOException;
import java.util.ArrayList;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;

import ntua.thesis.dis.commands.Command;
import ntua.thesis.dis.query.QueryManager;


public class ExecuteSPARQLQueryCommand extends Command{

        /**
         * 
         */
        private static final long serialVersionUID = 1L;
        
        public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                
                QueryManager qm = getQueryManager();
                String queryString = request.getParameter("query");
                String queryId = request.getParameter("queryId");
                Long id = Long.parseLong(queryId);
                System.out.println(queryString);
                JSONArray results = qm.executeQuery(queryString,id);
                
               
                response.setContentType("application/json");
                response.getWriter().write(results.toString()); 
                
        }
}
