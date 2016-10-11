package ntua.thesis.dis.commands.dataspace;

import java.io.IOException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import ntua.thesis.dis.commands.Command;
import ntua.thesis.dis.dataspace.DataspaceManager;
import ntua.thesis.dis.query.QueryManager;


public class GetDataspaceVocabularyCommand extends Command{

        

        /**
         * 
         */
        private static final long serialVersionUID = 1L;
        
        
        public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
                DataspaceManager dm = getDataspaceManager();
                JSONArray vocabulary = dm.getDataspaceVocabulary();
                respondJSON(response,vocabulary);
        }

        public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
                
                doGet(request,response);
        }
}
