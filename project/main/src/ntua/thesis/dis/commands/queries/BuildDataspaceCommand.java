package ntua.thesis.dis.commands.queries;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.json.JSONException;
import org.json.JSONObject;

import ntua.thesis.dis.commands.Command;
import ntua.thesis.dis.query.QueryManager;


public class BuildDataspaceCommand extends Command{

        /**
         * 
         */
        private static final long serialVersionUID = 1L;

        
        public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                
                QueryManager qm = getQueryManager(); 
                int build = qm.buildDataspace();
                JSONObject o = new JSONObject();
                try {
                        o.put("build",build);
                        respondJSON(response,o);
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        //e.printStackTrace();
                        respondJSON(response,o);
                }
        }
}
