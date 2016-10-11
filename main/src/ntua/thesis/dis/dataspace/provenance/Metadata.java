package ntua.thesis.dis.dataspace.provenance;

import java.util.Date;

import ntua.thesis.dis.importing.SourcesManager;
import ntua.thesis.dis.util.ProjectFileUtils;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;


public class Metadata {
        
        private String datasetName;
        private int numberOfRecords;
        private Date acquisitionDate;
        private Date modificationDate;
        private Date publicationDate;
       
        
        private JSONArray linkingMetadata = new JSONArray();
        private JSONObject mappingMetadata = new JSONObject();
        private JSONObject importingMetadata = new JSONObject();
        
        public Metadata(String datasetName) {
                this.datasetName = datasetName;
        }

        public int getNumberOfRecords() {
                return numberOfRecords;
        }
        
        public void setNumberOfRecords(int numberOfRecords) {
                this.numberOfRecords = numberOfRecords;
        }
        
        public Date getAcquisitionDate() {
                return acquisitionDate;
        }
        
        public void setAcquisitionDate(Date acquisitionDate) {
                this.acquisitionDate = acquisitionDate;
        }
        
        public Date getModificationDate() {
                return modificationDate;
        }
        
        public void setModificationDate(Date modificationDate) {
                this.modificationDate = modificationDate;
        }
        
        public Date getPublicationDate() {
                return publicationDate;
        }
        
        public void setPublicationDate(Date publicationDate) {
                this.publicationDate = publicationDate;
        }
        
        public void addImportingMetadata(JSONObject jsonMetadata) {
                this.importingMetadata = jsonMetadata;
        }
        
        public void addLinkingMetadata(JSONObject jsonMetadata) {
                this.linkingMetadata.put(jsonMetadata);
                System.out.println(this.linkingMetadata.toString());
        }

        public void addMappingMetadata(JSONObject jsonMetadata) {
                this.mappingMetadata = jsonMetadata;
        }    
        
        public JSONArray getLinkingMetadata(){
                return this.linkingMetadata;
        }
        
        public JSONObject getMappingMetadata(){
                return this.mappingMetadata;
        }
        
        public JSONObject getImportingMetadata(){
                return this.importingMetadata;
        }

        public JSONObject getGeneralMetadata() {
                JSONObject general = new JSONObject();
                try {
                        general.put("name", this.datasetName);
                        general.put("hasRDFSource",this.hasRDFSource());
                        
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        //e.printStackTrace();
                        return general;
                }
                return general;
        }
        
        public boolean hasRDFSource() {
                
                JSONObject importingMetadata = this.getImportingMetadata();
                String sourceType = "";
                String sourceDescription = "";
                String fileExtension = "";
                boolean hasRDFSource = false;
                try {
                        sourceType = importingMetadata.getString("Source");
                        if(sourceType.equals(SourcesManager.RELATIONAL_DATABASE)){
                                hasRDFSource = false;
                        }else if(sourceType.equals(SourcesManager.SPARQL_ENDPOINT)){
                                hasRDFSource = true;
                        }else{//file source
                                sourceDescription =  importingMetadata.getString("Source Description");
                                fileExtension = ProjectFileUtils.getFileExtension(sourceDescription);
                                if(ProjectFileUtils.isRDFExtension(fileExtension)){
                                        hasRDFSource = true;
                                }else{
                                        hasRDFSource = false;
                                }
                        }
                        return hasRDFSource;
                } catch (JSONException e) {
                        //e.printStackTrace();
                        hasRDFSource = false;
                }
                return hasRDFSource;
        }

        public void set(JSONObject metadata) {
                // TODO Auto-generated method stub
                try {
                        this.importingMetadata = metadata.getJSONObject("importingMetadata");
                        this.mappingMetadata = metadata.getJSONObject("mappingMetadata");
                        this.linkingMetadata = metadata.getJSONArray("linkingMetadata");
                        
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                
        }
}
