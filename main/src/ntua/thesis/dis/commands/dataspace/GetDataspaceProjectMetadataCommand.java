package ntua.thesis.dis.commands.dataspace;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;

import ntua.thesis.dis.commands.Command;


public class GetDataspaceProjectMetadataCommand extends Command{

        /**
         * 
         */
        private static final long serialVersionUID = 1L;
        
        public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                               
                JSONObject metadata = new JSONObject();
                metadata = loadDataspaceMetadata(); 
                System.out.println("metadata for project > "+metadata.toString());
                respondJSON(response,metadata);              
        }
}
