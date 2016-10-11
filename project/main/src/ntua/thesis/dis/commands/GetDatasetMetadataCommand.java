package ntua.thesis.dis.commands;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import ntua.thesis.dis.dataspace.DataspaceManager;
import ntua.thesis.dis.service.ServiceManager;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;


public class GetDatasetMetadataCommand extends Command{

        /**
         * 
         */
        private static final long serialVersionUID = 1L;
        
        /*ProvenanceManager pm;
        public GetDatasetMetadataCommand(ProvenanceManager provenanceManager) {
                pm = provenanceManager;
        }*/



        public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                
                DataspaceManager dm = getDataspaceManager();
                
                String datasetName = request.getParameter("datasetName");
                String metadataCategory = request.getParameter("metadataCategory");
                
                
                JSONArray metadata = new JSONArray();
                JSONArray results = new JSONArray();
                
                
                metadata = dm.getDatasetMetadata(datasetName);
                for(int i = 0; i < metadata.length();i++){
                        try {
                                results.put(selectMetadataCategory(metadata.getJSONObject(i),metadataCategory));
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                }
                respondJSON(response,results);  
        }
        
        

        private JSONObject selectMetadataCategory(JSONObject datasetMetadata,String metadataCategory) {
                
                JSONObject specificMetadata = new JSONObject();
                
                if(metadataCategory.equals("")){
                        specificMetadata = datasetMetadata;
                }else{
                        if(datasetMetadata.has(metadataCategory)){
                                try {
                                        specificMetadata =  datasetMetadata.getJSONObject(metadataCategory);
                                } catch (JSONException e) {
                                        // TODO Auto-generated catch block
                                        e.printStackTrace();
                                }
                        }
                }
                return specificMetadata;
        }



        public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                doGet(request,response);
        }

}
