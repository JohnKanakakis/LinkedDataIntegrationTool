package ntua.thesis.dis.commands.queries;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;

import ntua.thesis.dis.commands.Command;
import ntua.thesis.dis.query.QueryManager;



public class RenameSPARQLQueryCommand extends Command {

        /**
         * 
         */
        private static final long serialVersionUID = 1L;
        
        public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                
                QueryManager qm = getQueryManager();
                String newName = request.getParameter("newName");
                String oldName = request.getParameter("oldName");
                String queryId = request.getParameter("queryId");
                long id = Long.parseLong(queryId);
                boolean renamed = qm.renameQuery(id,oldName,newName);
                System.out.println("query id > "+queryId +" old: "+oldName +"  new: "+newName);
                JSONObject answer = new JSONObject();
                try {
                        answer.put("renamed",renamed);
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        //e.printStackTrace();
                }
                respondJSON(response, answer);
        }

}
