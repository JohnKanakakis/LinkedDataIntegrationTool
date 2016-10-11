package ntua.thesis.dis.commands.mapping;

import java.io.IOException;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Set;
import java.util.Map.Entry;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import ntua.thesis.dis.commands.Command;
import ntua.thesis.dis.dataspace.Dataset;
import ntua.thesis.dis.dataspace.DatasetVocabulary;
import ntua.thesis.dis.dataspace.provenance.Metadata;
import ntua.thesis.dis.mapping.SchemaMappingManager;


public class GetDatasetVocabularyCommand extends Command{

        /**
         * 
         */
        private static final long serialVersionUID = 1L;
        
        /*private SchemaMappingManager shMapManager;
        
        
        public GetDatasetVocabularyCommand(SchemaMappingManager schemaMappingManager) {
                shMapManager = schemaMappingManager;
        }*/

        public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        
                SchemaMappingManager sm = getMappingsManager();
                
                String datasetName = request.getParameter("datasetName");
                
              
                JSONObject sourceVocabulary = new JSONObject();
                sourceVocabulary = sm.getSourceVocabulary(datasetName);
                respondJSON(response,sourceVocabulary);
        }
        
        public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

                doGet(request, response);
                
        }

}
