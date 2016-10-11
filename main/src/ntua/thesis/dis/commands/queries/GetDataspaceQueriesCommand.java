package ntua.thesis.dis.commands.queries;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;

import ntua.thesis.dis.commands.Command;
import ntua.thesis.dis.query.QueryManager;


public class GetDataspaceQueriesCommand extends Command {

        /**
         * 
         */
        private static final long serialVersionUID = 1L;
        
        public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                
                QueryManager qm = getQueryManager();
                JSONArray queries = qm.loadDataspaceQueries();
                respondJSON(response,queries);
        }
}
