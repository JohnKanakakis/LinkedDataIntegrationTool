package ntua.thesis.dis.commands;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import ntua.thesis.dis.dataspace.DataspaceManager;



public class GetLinkingTasksMetadataCommand extends Command{

       /* ProvenanceManager pm;
        private static final long serialVersionUID = 1L;

        public GetLinkingTasksMetadataCommand(ProvenanceManager provenanceManager) {
               pm = provenanceManager;
        }*/
        
        /**
         * 
         */
        private static final long serialVersionUID = 1L;

        public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                DataspaceManager dm = getDataspaceManager();
                
                JSONArray linkingTasksMetadata = dm.getLinkingTasksMetadata();
                JSONArray responseData = new JSONArray();
                for(int i = 0 ; i < linkingTasksMetadata.length();i++){
                        JSONObject o = new JSONObject();
                        try {
                                o.put("linkType",linkingTasksMetadata.getJSONObject(i).getString("linkType"));
                                o.put("Source Dataset",linkingTasksMetadata.getJSONObject(i).getString("sourceDataset"));
                                o.put("Source SPARQL restriction",linkingTasksMetadata.getJSONObject(i).getString("source SPARQL restriction"));
                                o.put("Source input paths",linkingTasksMetadata.getJSONObject(i).getJSONArray("source input paths"));
                                o.put("Target Dataset",linkingTasksMetadata.getJSONObject(i).getString("targetDataset"));
                                o.put("Target SPARQL restriction",linkingTasksMetadata.getJSONObject(i).getString("target SPARQL restriction"));
                                o.put("Target input paths",linkingTasksMetadata.getJSONObject(i).getJSONArray("target input paths"));
                                
                                responseData.put(o);
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                }
                
                respondJSON(response,responseData);
        }
        
        public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                doGet(request,response);
        }

}
