package ntua.thesis.dis.commands.dataspace;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;

import ntua.thesis.dis.commands.Command;
import ntua.thesis.dis.dataspace.DataspaceManager;


public class GetAllDataspaceProjectMetadataCommand extends Command {

        /**
         * 
         */
        private static final long serialVersionUID = 1L;

        
        public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                
                //load dataspaces metadata
                DataspaceManager dm = getDataspaceManager();
                JSONArray metadata = dm.getAllDataspaceProjectMetadata();
                respondJSON(response, metadata);
        }
}
